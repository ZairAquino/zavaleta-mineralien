/* Sesión del administrador: una cookie firmada (HMAC) que dura 14 días.
   Usuario: ADMIN_USER (por defecto "zavaleta3").
   La contraseña vive solo en la variable de entorno ADMIN_PASSWORD de Vercel.
   Si cambias la contraseña, todas las sesiones abiertas se cierran solas. */
import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const COOKIE = "zm_admin";
const MAX_AGE = 60 * 60 * 24 * 14;

const password = () => process.env.ADMIN_PASSWORD || "";
const username = () => (process.env.ADMIN_USER || "zavaleta3").trim().toLowerCase();
const secret = () => createHash("sha256").update(`${password()}::${process.env.ADMIN_SECRET || "zavaleta"}`).digest();
const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a, b) {
  const x = createHash("sha256").update(String(a)).digest();
  const y = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(x, y);
}

export const configured = () => password().length >= 8;
export const checkLogin = (user, pass) => {
  const okUser = safeEqual(String(user || "").trim().toLowerCase(), username());
  const okPass = safeEqual(pass, password());
  return configured() && okUser && okPass;
};

export function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${exp}.${sign(String(exp))}`;
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export function isAdmin(request) {
  if (!configured()) return false;
  const raw = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !sig || +exp < Date.now() / 1000) return false;
  return safeEqual(sig, sign(exp));
}

/* Las peticiones que cambian algo deben venir de la propia web (protección CSRF extra). */
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

export const unauthorized = () => json({ error: "unauthorized" }, 401);
