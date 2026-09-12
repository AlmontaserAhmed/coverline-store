export function paypalBase(env){
  return (env.PAYPAL_ENV || "sandbox") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}
export async function paypalToken(env){
  if(!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new Error("PayPal not configured");
  const res = await fetch(paypalBase(env) + "/v1/oauth2/token", {
    method: "POST",
    headers: { "Authorization": "Basic " + btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_CLIENT_SECRET), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  if(!res.ok) throw new Error("PayPal auth failed " + res.status);
  return (await res.json()).access_token;
}
export async function paypalFetch(env, path, init){
  const token = await paypalToken(env);
  const headers = Object.assign({ "Authorization": "Bearer " + token, "Content-Type": "application/json" }, (init && init.headers) || {});
  const res = await fetch(paypalBase(env) + path, Object.assign({}, init, { headers: headers }));
  const data = await res.json().catch(function(){ return {}; });
  return { ok: res.ok, status: res.status, data: data };
}
// Verifies a webhook really came from PayPal. Needs PAYPAL_WEBHOOK_ID (the id PayPal assigns
// to the webhook you register on the app). Returns true/false, never throws.
export async function verifyWebhook(env, request, rawBody){
  if(!env.PAYPAL_WEBHOOK_ID) return false;
  try{
    const h = function(n){ return request.headers.get(n) || ""; };
    const r = await paypalFetch(env, "/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: h("paypal-auth-algo"), cert_url: h("paypal-cert-url"), transmission_id: h("paypal-transmission-id"),
        transmission_sig: h("paypal-transmission-sig"), transmission_time: h("paypal-transmission-time"),
        webhook_id: env.PAYPAL_WEBHOOK_ID, webhook_event: JSON.parse(rawBody)
      })
    });
    return !!(r.ok && r.data && r.data.verification_status === "SUCCESS");
  }catch(e){ return false; }
}
