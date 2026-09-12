import { priceOrder } from "../_lib/catalog.js";
import { paypalBase, paypalToken } from "../_lib/paypal.js";
import { json, makeRef, kvPut, clean } from "../_lib/util.js";

export async function onRequestPost({ request, env }){
  let body;
  try{ body = await request.json(); }catch(e){ return json({ error: "Bad request" }, 400); }

  let priced;
  try{ priced = priceOrder(body.items); }catch(e){ return json({ error: e.message }, 400); }

  const c = body.customer || {};
  const customer = {
    name: clean(c.name, 100), email: clean(c.email, 200), address: clean(c.address, 300),
    city: clean(c.city, 100), postcode: clean(c.postcode, 20), phone: clean(c.phone, 40)
  };
  if(!customer.name || !customer.email || !customer.address || !customer.city || !customer.postcode){
    return json({ error: "Missing delivery details" }, 400);
  }

  const ref = makeRef();
  let token;
  try{ token = await paypalToken(env); }catch(e){ return json({ error: "Payments not available right now" }, 503); }

  const res = await fetch(paypalBase(env) + "/v2/checkout/orders", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json", "PayPal-Request-Id": "coverline-" + ref },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: ref,
        custom_id: ref,
        description: "Coverline order " + ref,
        amount: {
          currency_code: "GBP",
          value: priced.total.toFixed(2),
          breakdown: { item_total: { currency_code: "GBP", value: priced.total.toFixed(2) } }
        },
        items: priced.lines.map(function(l){
          return { name: (l.name + " — " + l.color + " / " + l.size).slice(0, 127), quantity: String(l.qty), unit_amount: { currency_code: "GBP", value: l.unit.toFixed(2) }, category: "PHYSICAL_GOODS" };
        }),
        shipping: {
          name: { full_name: customer.name },
          address: { address_line_1: customer.address, admin_area_2: customer.city, postal_code: customer.postcode, country_code: "GB" }
        }
      }],
      payment_source: { paypal: { experience_context: { shipping_preference: "SET_PROVIDED_ADDRESS", user_action: "PAY_NOW", brand_name: "Coverline" } } }
    })
  });
  const data = await res.json().catch(function(){ return {}; });
  if(!res.ok || !data.id) return json({ error: "Could not start payment" }, 502);

  await kvPut(env, "order:" + ref, {
    ref: ref, status: "created", paypalOrderId: data.id, lines: priced.lines, total: priced.total,
    customer: customer, createdAt: new Date().toISOString()
  });
  return json({ id: data.id, ref: ref, total: priced.total });
}
