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
  if(!res.ok || data.status !== "COMPLETED" || !cap || cap.status !== "COMPLETED"){
    return json({ error: "Payment was not completed", detail: data && data.details && data.details[0] && data.details[0].issue }, 402);
  }
  // Verify the money that actually landed matches what we priced.
  const paid = parseFloat(cap.amount && cap.amount.value);
  const currency = cap.amount && cap.amount.currency_code;
  const expected = order ? order.total : null;
  const amountOk = currency === "GBP" && (expected == null || Math.abs(paid - expected) < 0.005);

  const record = Object.assign({}, order || { ref: ref, lines: [], total: paid, customer: {} }, {
    status: amountOk ? "paid" : "paid_amount_mismatch",
    paypalOrderId: orderID, paypalCaptureId: cap.id, paidAmount: paid, paidCurrency: currency,
    payerEmail: data.payer && data.payer.email_address, paidAt: new Date().toISOString()
  });

  // Fulfilment — only when we know exactly what was priced and it matched.
  let cj = { placed: false, reason: "skipped" };
  if(order && amountOk) cj = await placeCjOrder(env, record);
  record.cj = cj;
  record.fulfilment = cj.placed ? "cj_placed" : "needs_manual";
  await kvPut(env, "order:" + ref, record);

  // Emails — customer confirmation + shop copy. Both best-effort.
  if(order){
    const text = orderText(record);
    await sendMail(env, record.customer.email, "Your Coverline order " + ref,
      "Hi " + (record.customer.name.split(" ")[0] || "") + ",\n\nPayment received — thank you. Here's what's on its way:\n\n" + text +
      "\n\nUK delivery is usually 7–15 business days. You'll get a tracking link from us as soon as it ships.\nIf anything's wrong, reply to this email — a person reads it.\n\nCoverline");
    await sendMail(env, env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to", "New order " + ref + " — £" + record.total + (cj.placed ? " (CJ placed)" : " — NEEDS MANUAL CJ ORDER"),
      text + "\n\nCustomer email: " + record.customer.email + "\nPayPal capture: " + cap.id + "\nFulfilment: " + (cj.placed ? "CJ order " + cj.cjOrderId : "not placed — " + cj.reason));
  }

  return json({ ok: true, ref: ref, total: record.total, fulfilment: record.fulfilment });
}
