// PayPal → us. Keeps the order log truthful after the fact: refunds, reversals, denied or
// pending captures, and disputes all land here and update the KV record + email the shop.
import { verifyWebhook } from "../_lib/paypal.js";
import { json, kvGet, kvPut } from "../_lib/util.js";
import { sendMail } from "../_lib/agentmail.js";

async function findOrderByCapture(env, captureId){
  const ref = await kvGet(env, "capture:" + captureId);
  if(!ref) return null;
  const order = await kvGet(env, "order:" + ref);
  return order ? { ref: ref, order: order } : null;
}

export async function onRequestPost({ request, env }){
  const raw = await request.text();
  const ok = await verifyWebhook(env, request, raw);
  if(!ok) return json({ error: "Bad signature" }, 400);
  let evt; try{ evt = JSON.parse(raw); }catch(e){ return json({ error: "Bad body" }, 400); }
  const type = evt.event_type || "";
  const res = evt.resource || {};
  const shop = env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to";
  let hit = null, note = "";

  if(type.indexOf("PAYMENT.CAPTURE.") === 0){
    hit = await findOrderByCapture(env, res.id) || (res.custom_id ? { ref: res.custom_id, order: await kvGet(env, "order:" + res.custom_id) } : null);
    if(hit && hit.order){
      const o = hit.order;
      if(type === "PAYMENT.CAPTURE.COMPLETED" && o.status === "pending"){ o.status = "paid"; note = "Payment cleared (was pending)"; }
      else if(type === "PAYMENT.CAPTURE.DENIED"){ o.status = "denied"; note = "PayPal DENIED the capture — do not ship"; }
      else if(type === "PAYMENT.CAPTURE.PENDING"){ o.status = "pending"; note = "Capture pending: " + (res.status_details && res.status_details.reason); }
      else if(type === "PAYMENT.CAPTURE.REFUNDED"){ o.status = "refunded"; o.refundedAmount = res.amount && res.amount.value; note = "Refunded"; }
      else if(type === "PAYMENT.CAPTURE.REVERSED"){ o.status = "reversed"; note = "REVERSED by PayPal (chargeback/reversal) — check the dispute"; }
      o.events = (o.events || []).concat([{ type: type, at: new Date().toISOString(), id: evt.id }]).slice(-30);
      await kvPut(env, "order:" + hit.ref, o);
    }
  } else if(type.indexOf("CUSTOMER.DISPUTE.") === 0){
    const tx = (res.disputed_transactions || [])[0] || {};
    hit = await findOrderByCapture(env, tx.seller_transaction_id);
    if(hit && hit.order){
      const o = hit.order;
      o.dispute = { id: res.dispute_id, status: res.status, reason: res.reason, stage: res.dispute_life_cycle_stage, amount: res.dispute_amount && res.dispute_amount.value, respondBy: res.seller_response_due_date, updatedAt: new Date().toISOString() };
      o.events = (o.events || []).concat([{ type: type, at: new Date().toISOString(), id: evt.id }]).slice(-30);
      await kvPut(env, "order:" + hit.ref, o);
      note = type === "CUSTOMER.DISPUTE.CREATED"
        ? "DISPUTE OPENED (" + res.reason + "). Respond by " + res.seller_response_due_date + " — evidence: tracking " + (o.tracking ? o.tracking.number : "NONE YET") + ", address " + (o.customer && o.customer.address)
        : "Dispute " + type.replace("CUSTOMER.DISPUTE.", "").toLowerCase() + ": " + res.status;
    }
  }

  if(hit && note){
    await sendMail(env, shop, "[PayPal] " + note.split(" — ")[0] + " — order " + hit.ref, note + "\n\nOrder " + hit.ref + "\nEvent: " + type + "\nPayPal event id: " + evt.id);
  }
  return json({ received: true, matched: !!hit });
}
