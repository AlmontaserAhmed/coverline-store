import { priceOrder } from "../_lib/catalog.js";
import { stripeFetch } from "../_lib/stripe.js";
import { json, makeRef, kvPut, clean } from "../_lib/util.js";

function safeReturnPath(p){
  p = clean(p, 200);
  if(!p || p.charAt(0) !== "/" || p.indexOf("//") === 0 || p.indexOf(":") > -1) return "/";
  return p.split("?")[0].split("#")[0];
}

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
  // Reject obviously-malformed emails ourselves rather than letting Stripe's stricter check
  // reject them later — that used to surface to the customer as "payment not available", which
  // is confusing when the real issue is just a typo'd email.
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)){
    return json({ error: "Please enter a valid email address" }, 400);
  }

  const ref = makeRef();
  const origin = new URL(request.url).origin;
  const returnPath = safeReturnPath(body.returnPath);
  const sep = function(p){ return p.indexOf("?") > -1 ? "&" : "?"; };
  const successUrl = origin + returnPath + sep(returnPath) + "stripe_ref=" + ref + "&session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl = origin + returnPath + sep(returnPath) + "stripe_cancelled=" + ref;

  let session;
  try{
    const r = await stripeFetch(env, "/checkout/sessions", {
      mode: "payment",
      customer_email: customer.email,
      client_reference_id: ref,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { ref: ref },
      payment_intent_data: { metadata: { ref: ref } },
      line_items: priced.lines.map(function(l){
        return {
          quantity: l.qty,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(l.unit * 100),
            product_data: { name: (l.name + " — " + l.color + " / " + l.size).slice(0, 127) }
          }
        };
      })
    });
    if(!r.ok || !r.data || !r.data.id || !r.data.url){
      console.error("Stripe create-order failed", r.status, r.data);
      return json({ error: "Could not start payment" }, 502);
    }
    session = r.data;
  }catch(e){
    // Logged (not exposed to the browser) so the real cause shows up in `wrangler pages dev`'s
    // terminal output instead of just "not available" on the customer's screen.
    console.error("Stripe create-order exception", e && e.stack || e);
    return json({ error: "Payments not available right now" }, 503);
  }

  await kvPut(env, "order:" + ref, {
    ref: ref, status: "created", stripeSessionId: session.id, lines: priced.lines, total: priced.total,
    customer: customer, createdAt: new Date().toISOString()
  });
  return json({ ref: ref, url: session.url, total: priced.total });
}
