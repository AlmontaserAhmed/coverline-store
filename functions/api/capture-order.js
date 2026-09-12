import { paypalBase, paypalToken } from "../_lib/paypal.js";
import { json, kvGet, kvPut } from "../_lib/util.js";
import { placeCjOrder } from "../_lib/cj.js";
import { sendMail } from "../_lib/agentmail.js";

function orderText(order){
  const items = order.lines.map(function(l){ return "  - " + l.name + " — " + l.color + ", size " + l.size + " x" + l.qty + " (£" + (l.unit * l.qty) + ")"; }).join("\n");
  return "Order " + order.ref + "\n" + items + "\nTotal paid: £" + order.total.toFixed(2) + "\n\n" +
    "Deliver to:\n" + order.customer.name + "\n" + order.customer.address + "\n" + order.customer.city + ", " + order.customer.postcode;
}

export async function onRequestPost({ request, env }){
  let body;
  try{ body = await request.json(); }catch(e){ return json({ error: "Bad request" }, 400); }
  const ref = String(body.ref || "").toUpperCase().slice(0, 12);
  const orderID = String(body.orderID || "").slice(0, 64);
  if(!ref || !orderID) return json({ error: "Missing order" }, 400);

  const order = await kvGet(env, "order:" + ref);
  if(order && order.paypalOrderId !== orderID) return json({ error: "Order mismatch" }, 400);
  if(order && order.status === "paid") return json({ ok: true, ref: ref, alreadyCaptured: true });

  let token;
  try{ token = await paypalToken(env); }catch(e){ return json({ error: "Payments not available right now" }, 503); }

  const res = await fetch(paypalBase(env) + "/v2/checkout/orders/" + encodeURIComponent(orderID) + "/capture", {
    method: "POST", headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json", "PayPal-Request-Id": "coverline-cap-" + ref }
  });
  const data = await res.json().catch(function(){ return {}; });
  const cap = data && data.purchase_units && data.purchase_units[0] && data.purchase_units[0].payments && data.purchase_units[0].payments.captures && data.purchase_units[0].payments.captures[0];
  if(!res.ok || !cap || (cap.status !== "COMPLETED" && cap.status !== "PENDING")){
    return json({ error: "Payment was not completed", detail: data && data.details && data.details[0] && data.details[0].issue }, 402);
  }
  // PENDING = PayPal took the payment but hasn't cleared it (e.g. eCheck / review). We record it,
  // tell the customer, and DON'T ship until the webhook flips it to COMPLETED.
  const isPending = cap.status === "PENDING";
  // Seller protection: only auto-fulfil when PayPal says the transaction is covered. Anything else
  // gets a human look first — it's the difference between winning and losing an "item not received" case.
  const protection = (cap.seller_protection && cap.seller_protection.status) || "UNKNOWN";
  // Verify the money that actually landed matches what we priced.
  const paid = parseFloat(cap.amount && cap.amount.value);
  const currency = cap.amount && cap.amount.currency_code;
  const expected = order ? order.total : null;
  const amountOk = currency === "GBP" && (expected == null || Math.abs(paid - expected) < 0.005);

  const record = Object.assign({}, order || { ref: ref, lines: [], total: paid, customer: {} }, {
    status: isPending ? "pending" : (amountOk ? "paid" : "paid_amount_mismatch"),
    paypalOrderId: orderID, paypalCaptureId: cap.id, paidAmount: paid, paidCurrency: currency,
    payerEmail: data.payer && data.payer.email_address, payerId: data.payer && data.payer.payer_id,
    payerCountry: data.payer && data.payer.address && data.payer.address.country_code,
    sellerProtection: protection, pendingReason: isPending ? (cap.status_details && cap.status_details.reason) : undefined,
    paidAt: new Date().toISOString()
  });

  // Fulfilment — only when the money is cleared, the amount matched AND PayPal covers the sale.
  let cj = { placed: false, reason: "skipped" };
  const safeToShip = !!order && amountOk && !isPending && protection === "ELIGIBLE";
  if(safeToShip) cj = await placeCjOrder(env, record);
  record.cj = cj;
  record.fulfilment = cj.placed ? "cj_placed" : (safeToShip ? "needs_manual" : (isPending ? "hold_pending_payment" : "needs_review"));
  record.reviewReason = safeToShip ? undefined : (isPending ? "payment pending" : (!amountOk ? "amount mismatch" : "seller protection " + protection));
  await kvPut(env, "order:" + ref, record);
  await kvPut(env, "capture:" + cap.id, ref);

  // Emails — customer confirmation + shop copy. Both best-effort.
  if(order){
    const text = orderText(record);
    await sendMail(env, record.customer.email, "Your Coverline order " + ref,
      "Hi " + (record.customer.name.split(" ")[0] || "") + ",\n\n" + (isPending ? "Your payment is with PayPal and should clear shortly — we'll ship the moment it does. Here's your order:" : "Payment received — thank you. Here's what's on its way:") + "\n\n" + text +
      "\n\nUK delivery is usually 5–10 working days. You'll get a tracking link from us as soon as it ships.\nIf anything's wrong, reply to this email — a person reads it.\n\nCoverline");
    const flag = cj.placed ? " (CJ placed)" : (record.fulfilment === "needs_manual" ? " — NEEDS MANUAL CJ ORDER" : " — HOLD: " + record.reviewReason);
    await sendMail(env, env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to", "New order " + ref + " — £" + record.total + flag,
      text + "\n\nCustomer email: " + record.customer.email + "\nPayPal capture: " + cap.id + "\nSeller protection: " + protection +
      "\nFulfilment: " + (cj.placed ? "CJ order " + cj.cjOrderId : record.fulfilment + " — " + (cj.reason || record.reviewReason)) +
      (record.fulfilment === "needs_review" ? "\n\nDo not ship until you've checked this one in PayPal." : ""));
  }

  return json({ ok: true, ref: ref, total: record.total, fulfilment: record.fulfilment, pending: isPending });
}
