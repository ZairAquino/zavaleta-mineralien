/* Contenido editable de la web (galería, ferias, textos, fotos, contacto).
   GET  → lo lee la web pública (si no hay nada guardado devuelve {} y la web usa js/data.js)
   PUT  → lo guarda el administrador (requiere sesión) */
import { put, head, BlobNotFoundError } from "@vercel/blob";
import { isAdmin, sameOrigin, json, unauthorized } from "./_lib/auth.js";

const PREFIX = process.env.CONTENT_PREFIX || "";
const PATH = `${PREFIX}content.json`;
const MAX_BYTES = 1_000_000;

async function readContent() {
  try {
    const meta = await head(PATH);
    // ?v= con la fecha de subida: siempre se descarga la última versión, no una copia en caché
    const r = await fetch(`${meta.url}?v=${new Date(meta.uploadedAt).getTime()}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`blob ${r.status}`);
    return await r.json();
  } catch (e) {
    if (e instanceof BlobNotFoundError) return {};
    throw e;
  }
}

export async function GET(request) {
  const fresh = new URL(request.url).searchParams.has("fresh") && isAdmin(request);
  try {
    const data = await readContent();
    return json(data, 200, {
      // la web pública: caché corta en el CDN de Vercel; el panel siempre lo pide fresco
      "cache-control": fresh ? "no-store" : "public, max-age=0, s-maxage=15, stale-while-revalidate=300"
    });
  } catch (e) {
    console.error("content GET", e);
    return json({ error: "storage_unavailable" }, 503);
  }
}

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export async function PUT(request) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!isAdmin(request)) return unauthorized();
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "too_large" }, 413);
  let data;
  try { data = JSON.parse(text); } catch { return json({ error: "bad_json" }, 400); }
  if (!isObj(data) || !Array.isArray(data.gallery) || !Array.isArray(data.events) || !isObj(data.config)) {
    return json({ error: "bad_shape" }, 400);
  }
  data.updatedAt = new Date().toISOString();
  const body = JSON.stringify(data);
  try {
    await put(PATH, body, {
      access: "public", contentType: "application/json; charset=utf-8",
      addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60
    });
    // copia de seguridad de cada versión guardada
    await put(`${PREFIX}backups/${data.updatedAt.replace(/[:.]/g, "-")}.json`, body, {
      access: "public", contentType: "application/json; charset=utf-8", addRandomSuffix: true
    });
  } catch (e) {
    console.error("content PUT", e);
    return json({ error: "storage_unavailable" }, 503);
  }
  return json({ ok: true, updatedAt: data.updatedAt });
}
