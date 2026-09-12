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
