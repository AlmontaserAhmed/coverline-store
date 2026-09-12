// Admin endpoints are protected by an ADMIN_TOKEN secret (Cloudflare dashboard).
// Until it's set they refuse everything, so nothing is exposed by default.
import { json } from "./util.js";
export function requireAdmin(request, env){
  if(!env.ADMIN_TOKEN) return json({ error: "Admin not configured" }, 503);
  const h = request.headers.get("Authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
  if(!tok || tok !== env.ADMIN_TOKEN) return json({ error: "Unauthorized" }, 401);
  return null;
}
