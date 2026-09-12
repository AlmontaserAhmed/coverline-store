// POST /api/admin/refund {ref, amount?, note?} → refunds via Stripe's API (full unless amount
// given) and records it. Refunding promptly yourself is far cheaper than letting it become a
// dispute.
import { requireAdmin } from "../../_lib/admin.js";
import { stripeFetch } from "../../_lib/stripe.js";
import { json, kvGet, kvPut, clean } from "../../_lib/util.js";
export async function onRequestPost({ request, env }){
  const denied = requireAdmin(request, env); if(denied) return denied;
  let b; try{ b = await request.json(); }catch(e){ return json({ error: "Bad request" }, 400); }
  const ref = clean(b.ref, 12).toUpperCase();
  const order = await kvGet(env, "order:" + ref);
  if(!order || !order.stripePaymentIntentId) return json({ error: "Order not found or not paid" }, 404);
  const params = { payment_intent: order.stripePaymentIntentId };
  if(b.amount) params.amount = Math.round(Number(b.amount) * 100);
  if(b.note) params.metadata = { note: clean(b.note, 255) };
  const r = await stripeFetch(env, "/refunds", params);
  if(!r.ok) return json({ error: "Refund failed", detail: r.data }, 502);
  order.refunds = (order.refunds || []).concat([{ id: r.data.id, amount: b.amount ? Number(b.amount) : order.paidAmount, at: new Date().toISOString(), status: r.data.status }]);
  order.status = b.amount && Number(b.amount) < order.paidAmount ? "partially_refunded" : "refunded";
  await kvPut(env, "order:" + ref, order);
  return json({ ok: true, ref: ref, refund: r.data.id, status: r.data.status });
}
