import { checkPassword, configured, sessionCookie, sameOrigin, json } from "./_lib/auth.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!configured()) return json({ error: "not_configured" }, 503);
  let body = {};
  try { body = await request.json(); } catch { /* vacío */ }
  if (!checkPassword(body.password || "")) {
    await wait(900); // frena los intentos de adivinar la contraseña
    return json({ error: "wrong_password" }, 401);
  }
  return json({ ok: true }, 200, { "set-cookie": sessionCookie() });
}
