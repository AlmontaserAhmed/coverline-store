// Stripe → us. Backup path for order confirmation (in case the customer's browser never makes
// it back to confirm-order) and the only path for events that happen later: refunds and disputes
// raised from the Stripe dashboard or by the card issuer.
import { verifyStripeWebhook, stripeFetch } from "../_lib/stripe.js";
import { finalizeStripeOrder } from "../_lib/order.js";
import { json, kvGet, kvPut } from "../_lib/util.js";
import { sendMail } from "../_lib/agentmail.js";

async function findOrderByPaymentIntent(env, piId){
  const ref = await kvGet(env, "pi:" + piId);
  if(!ref) return null;
  const order = await kvGet(env, "order:" + ref);
  return order ? { ref: ref, order: order } : null;
}

export async function onRequestPost({ request, env }){
  const raw = await request.text();
  const ok = await verifyStripeWebhook(env, request, raw);
  if(!ok) return json({ error: "Bad signature" }, 400);
  let evt; try{ evt = JSON.parse(raw); }catch(e){ return json({ error: "Bad body" }, 400); }
  const type = evt.type || "";
  const obj = (evt.data && evt.data.object) || {};
  const shop = env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to";
  let hit = null, note = "";

  if(type === "checkout.session.completed"){
    const ref = obj.client_reference_id || (obj.metadata && obj.metadata.ref);
    if(ref){
      let session = obj;
      try{
        const r = await stripeFetch(env, "/checkout/sessions/" + encodeURIComponent(obj.id), null, "GET");
        if(r.ok && r.data) session = r.data;
      }catch(e){}
      if(session.payment_status === "paid"){
        const result = await finalizeStripeOrder(env, ref, session);
        if(result.order && !result.alreadyDone) note = "Payment confirmed via webhook";
      }
    }
  } else if(type === "charge.refunded" || type === "charge.dispute.created" || type === "charge.dispute.closed"){
    const piId = obj.payment_intent;
    hit = piId ? await findOrderByPaymentIntent(env, piId) : null;
    if(hit && hit.order){
      const o = hit.order;
      if(type === "charge.refunded"){
        o.status = obj.refunded ? "refunded" : "partially_refunded";
        o.refundedAmount = (obj.amount_refunded || 0) / 100;
        note = "Refunded via Stripe";
      } else if(type === "charge.dispute.created"){
        o.dispute = { id: obj.id, status: obj.status, reason: obj.reason, amount: (obj.amount || 0) / 100, updatedAt: new Date().toISOString() };
        note = "DISPUTE OPENED (" + obj.reason + ") — check the Stripe dashboard";
      } else {
        o.dispute = Object.assign({}, o.dispute, { status: obj.status, updatedAt: new Date().toISOString() });
        note = "Dispute updated: " + obj.status;
      }
      o.events = (o.events || []).concat([{ type: type, at: new Date().toISOString(), id: evt.id }]).slice(-30);
      await kvPut(env, "order:" + hit.ref, o);
    }
  }

  if(hit && note){
    await sendMail(env, shop, "[Stripe] " + note.split(" — ")[0] + " — order " + hit.ref, note + "\n\nOrder " + hit.ref + "\nEvent: " + type + "\nStripe event id: " + evt.id);
  }
  return json({ received: true });
}
