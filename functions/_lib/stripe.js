// Stripe REST helpers. Cloudflare Pages Functions run on the edge (no Node, no npm "stripe"
// package) so we talk to Stripe's HTTP API directly with fetch — same pattern the old PayPal
// helpers used. Stripe's API takes application/x-www-form-urlencoded with bracket notation for
// nested objects/arrays (e.g. line_items[0][quantity]=2), not JSON — flatten() builds that shape
// from a normal JS object so callers never have to hand-write bracket keys.
const STRIPE_API = "https://api.stripe.com/v1";

function flatten(value, prefix, out){
  if(value === undefined || value === null) return out;
  if(Array.isArray(value)){
    value.forEach(function(v, i){ flatten(v, prefix + "[" + i + "]", out); });
  } else if(typeof value === "object" && !(value instanceof Date)){
    Object.keys(value).forEach(function(k){
      flatten(value[k], prefix ? prefix + "[" + k + "]" : k, out);
    });
  } else {
    out.push(encodeURIComponent(prefix) + "=" + encodeURIComponent(String(value)));
  }
  return out;
}
function toFormBody(params){ return flatten(params, "", []).join("&"); }

// method defaults to GET when there are no params, POST otherwise. Pass "GET" explicitly to
// read an object (e.g. retrieving a Checkout Session) — params are appended as a query string.
export async function stripeFetch(env, path, params, method){
  if(!env.STRIPE_SECRET_KEY) throw new Error("Stripe not configured");
  method = method || (params ? "POST" : "GET");
  var url = STRIPE_API + path;
  var init = {
    method: method,
    headers: { "Authorization": "Bearer " + env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" }
  };
  if(params && method === "GET") url += "?" + toFormBody(params);
  else if(params) init.body = toFormBody(params);
  const res = await fetch(url, init);
  const data = await res.json().catch(function(){ return {}; });
  return { ok: res.ok, status: res.status, data: data };
}

// Verifies the Stripe-Signature header on a webhook request. rawBody must be the untouched
// request body text (read with request.text() before any JSON parsing). Cloudflare Workers have
// no Node "crypto" module, so this implements Stripe's documented HMAC-SHA256 scheme with the
// Web Crypto API directly. Needs STRIPE_WEBHOOK_SECRET (from the webhook's settings in Stripe).
export async function verifyStripeWebhook(env, request, rawBody){
  if(!env.STRIPE_WEBHOOK_SECRET) return false;
  try{
    const sigHeader = request.headers.get("stripe-signature") || "";
    const parts = {};
    sigHeader.split(",").forEach(function(kv){
      var i = kv.indexOf("=");
      if(i > -1) parts[kv.slice(0, i)] = kv.slice(i + 1);
    });
    if(!parts.t || !parts.v1) return false;
    const signedPayload = parts.t + "." + rawBody;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
    const expected = Array.from(new Uint8Array(sigBuf)).map(function(b){ return b.toString(16).padStart(2, "0"); }).join("");
    if(expected.length !== parts.v1.length) return false;
    let diff = 0;
    for(let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
    if(diff !== 0) return false;
    const age = Math.abs(Date.now() / 1000 - Number(parts.t));
    return age < 300; // reject replayed/stale events (5 min tolerance)
  }catch(e){ return false; }
}
