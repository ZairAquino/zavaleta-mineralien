/* Subida de fotos desde el panel. El navegador ya las reduce (máx. 1600 px) antes de enviarlas. */
import { put } from "@vercel/blob";
import { isAdmin, sameOrigin, json, unauthorized } from "./_lib/auth.js";

const PREFIX = process.env.CONTENT_PREFIX || "";
const TYPES = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_BYTES = 4_000_000;

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!isAdmin(request)) return unauthorized();
  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  const ext = TYPES[type];
  if (!ext) return json({ error: "bad_type" }, 415);
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length) return json({ error: "empty" }, 400);
  if (buf.length > MAX_BYTES) return json({ error: "too_large" }, 413);

  const name = (new URL(request.url).searchParams.get("name") || "foto")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "foto";
  try {
    const blob = await put(`${PREFIX}uploads/${name}.${ext}`, buf, {
      access: "public", contentType: type, addRandomSuffix: true
    });
    return json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("upload", e);
    return json({ error: "storage_unavailable" }, 503);
  }
}
