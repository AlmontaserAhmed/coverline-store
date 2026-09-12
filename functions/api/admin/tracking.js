// POST /api/admin/tracking {ref, carrier, number} → stores tracking on the order and emails the
// customer the tracking details. (Stripe, unlike PayPal, has no API to proactively attach
// tracking to a charge — if a dispute is opened later, this record is what you paste into the
// evidence fields in the Stripe dashboard to win an "item not received" case.)
import { requireAdmin } from "../../_lib/admin.js";
import { json, kvGet, kvPut, clean } from "../../_lib/util.js";
import { sendMail } from "../../_lib/agentmail.js";
export async function onRequestPost({ request, env }){
  const denied = requireAdmin(request, env); if(denied) return denied;
  let b; try{ b = await request.json(); }catch(e){ return json({ error: "Bad request" }, 400); }
  const ref = clean(b.ref, 12).toUpperCase(), number = clean(b.number, 60), carrier = clean(b.carrier || "OTHER", 40).toUpperCase();
  if(!ref || !number) return json({ error: "ref and number required" }, 400);
  const order = await kvGet(env, "order:" + ref);
  if(!order || !order.stripePaymentIntentId) return json({ error: "Order not found or not paid" }, 404);
  order.tracking = { number: number, carrier: carrier, addedAt: new Date().toISOString() };
  if(order.fulfilment !== "cj_placed") order.fulfilment = "shipped_manual";
  order.shippedAt = order.shippedAt || new Date().toISOString();
  await kvPut(env, "order:" + ref, order);
  if(order.customer && order.customer.email){
    await sendMail(env, order.customer.email, "Your Coverline order " + ref + " is on its way",
      "Hi " + ((order.customer.name || "").split(" ")[0]) + ",\n\nIt's shipped. Tracking number: " + number + (carrier !== "OTHER" ? " (" + carrier + ")" : "") +
      "\n\nUK delivery is usually 5–10 working days from now. If the tracking hasn't moved after 20 business days, reply to this and we'll chase it or send a replacement.\n\nCoverline");
  }
  return json({ ok: true, ref: ref });
}
