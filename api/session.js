import { isAdmin, configured, json } from "./_lib/auth.js";

export function GET(request) {
  return json({ admin: isAdmin(request), configured: configured(), storage: !!process.env.BLOB_READ_WRITE_TOKEN });
}
