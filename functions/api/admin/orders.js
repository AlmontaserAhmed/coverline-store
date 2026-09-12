// GET /api/admin/orders (header: Authorization: Bearer <ADMIN_TOKEN>) → every order record (newest first). Your copy of the books,
// independent of PayPal. Also /api/admin/orders?ref=XXXX for one.
import { requireAdmin } from "../../_lib/admin.js";
import { json, kvGet } from "../../_lib/util.js";
export async function onRequestGet({ request, env }){
  const denied = requireAdmin(request, env); if(denied) return denied;
  if(!env.ORDERS) return json({ error: "KV not bound" }, 503);
  const ref = new URL(request.url).searchParams.get("ref");
  if(ref) return json({ order: await kvGet(env, "order:" + ref.toUpperCase()) });
  const out = []; let cursor;
  do{
    const page = await env.ORDERS.list({ prefix: "order:", cursor: cursor, limit: 1000 });
    for(const k of page.keys){ const o = await kvGet(env, k.name); if(o) out.push(o); }
    cursor = page.list_complete ? null : page.cursor;
  }while(cursor);
  out.sort(function(a, b){ return (b.createdAt || "").localeCompare(a.createdAt || ""); });
  return json({ count: out.length, orders: out });
}
