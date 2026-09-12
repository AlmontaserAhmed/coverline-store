// Shared "payment confirmed" finalisation. Used by both the client-triggered confirm-order
// endpoint (fires the instant the customer lands back from Stripe Checkout, for a fast on-screen
// receipt) and the Stripe webhook (the source of truth if the redirect never happens — closed
// tab, flaky connection, etc). Idempotent: safe to call twice for the same order/session.
import { kvGet, kvPut } from "./util.js";
import { placeCjOrder } from "./cj.js";
import { sendMail } from "./agentmail.js";

function orderText(order){
  const items = order.lines.map(function(l){ return "  - " + l.name + " — " + l.color + ", size " + l.size + " x" + l.qty + " (£" + (l.unit * l.qty) + ")"; }).join("\n");
  return "Order " + order.ref + "\n" + items + "\nTotal paid: £" + order.total.toFixed(2) + "\n\n" +
    "Deliver to:\n" + order.customer.name + "\n" + order.customer.address + "\n" + order.customer.city + ", " + order.customer.postcode;
}

// session: a Stripe Checkout Session object with payment_status already checked by the caller.
export async function finalizeStripeOrder(env, ref, session){
  const order = await kvGet(env, "order:" + ref);
  if(!order) return { order: null, alreadyDone: false };
  if(order.status === "paid") return { order: order, alreadyDone: true };

  const paid = (session.amount_total || 0) / 100;
  const currency = (session.currency || "").toUpperCase();
  const amountOk = currency === "GBP" && Math.abs(paid - order.total) < 0.005;
  const paymentOk = session.payment_status === "paid";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent && session.payment_intent.id) || order.stripePaymentIntentId;

  const record = Object.assign({}, order, {
    status: paymentOk && amountOk ? "paid" : "paid_amount_mismatch",
    stripeSessionId: session.id, stripePaymentIntentId: paymentIntentId,
    paidAmount: paid, paidCurrency: currency,
    payerEmail: (session.customer_details && session.customer_details.email) || order.customer.email,
    paidAt: new Date().toISOString()
  });

  // Fulfilment — only once the money is confirmed paid and matches what we priced. Stripe
  // Checkout captures immediately (unlike PayPal's separate authorize/capture step), so there's
  // no "pending" state to wait out here.
  let cj = { placed: false, reason: "skipped" };
  const safeToShip = paymentOk && amountOk;
  if(safeToShip) cj = await placeCjOrder(env, record);
  record.cj = cj;
  record.fulfilment = cj.placed ? "cj_placed" : (safeToShip ? "needs_manual" : "needs_review");
  record.reviewReason = safeToShip ? undefined : "amount/payment mismatch";
  await kvPut(env, "order:" + ref, record);
  if(paymentIntentId) await kvPut(env, "pi:" + paymentIntentId, ref);

  const text = orderText(record);
  await sendMail(env, record.customer.email, "Your Coverline order " + ref,
    "Hi " + (record.customer.name.split(" ")[0] || "") + ",\n\nPayment received — thank you. Here's what's on its way:\n\n" + text +
    "\n\nUK delivery is usually 5–10 working days. You'll get a tracking link from us as soon as it ships.\nIf anything's wrong, reply to this email — a person reads it.\n\nCoverline");
  const flag = cj.placed ? " (CJ placed)" : (record.fulfilment === "needs_manual" ? " — NEEDS MANUAL CJ ORDER" : " — HOLD: " + record.reviewReason);
  await sendMail(env, env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to", "New order " + ref + " — £" + record.total + flag,
    text + "\n\nCustomer email: " + record.customer.email + "\nStripe payment intent: " + paymentIntentId +
    "\nFulfilment: " + (cj.placed ? "CJ order " + cj.cjOrderId : record.fulfilment + " — " + (cj.reason || record.reviewReason)) +
    (record.fulfilment === "needs_review" ? "\n\nDo not ship until you've checked this one in Stripe." : ""));

  return { order: record, alreadyDone: false };
}
