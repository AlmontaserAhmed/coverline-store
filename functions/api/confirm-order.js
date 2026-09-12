// POST /api/confirm-order {ref, sessionId} — called by the browser the instant it lands back on
// success_url from Stripe Checkout, so the customer gets an on-screen receipt immediately rather
// than waiting on the webhook. Re-verifies the payment against Stripe itself (never trusts the
// client), then delegates to the same finalisation the webhook uses, so whichever fires first wins
// and the other is a no-op.
import { stripeFetch } from "../_lib/stripe.js";
import { finalizeStripeOrder } from "../_lib/order.js";
import { json, kvGet } from "../_lib/util.js";

export async function onRequestPost({ request, env }){
  let body;
  try{ body = await request.json(); }catch(e){ return json({ error: "Bad request" }, 400); }
  const ref = String(body.ref || "").toUpperCase().slice(0, 12);
  const sessionId = String(body.sessionId || "").slice(0, 128);
  if(!ref || !sessionId) return json({ error: "Missing order" }, 400);

  const order = await kvGet(env, "order:" + ref);
  if(!order) return json({ error: "Order not found" }, 404);
  if(order.stripeSessionId !== sessionId) return json({ error: "Order mismatch" }, 400);
  if(order.status === "paid"){
    return json({ ok: true, ref: ref, total: order.total, customer: order.customer, alreadyCaptured: true });
  }

  let session;
  try{
    const r = await stripeFetch(env, "/checkout/sessions/" + encodeURIComponent(sessionId), null, "GET");
    if(!r.ok || !r.data || !r.data.id) return json({ error: "Could not verify payment" }, 502);
    session = r.data;
  }catch(e){ return json({ error: "Payments not available right now" }, 503); }

  if(session.payment_status !== "paid") return json({ error: "Payment was not completed" }, 402);

  const result = await finalizeStripeOrder(env, ref, session);
  if(!result.order) return json({ error: "Order not found" }, 404);
  return json({ ok: true, ref: ref, total: result.order.total, customer: result.order.customer, fulfilment: result.order.fulfilment });
}
