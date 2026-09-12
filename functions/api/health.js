import { json } from "../_lib/util.js";
// Reports which pieces are configured (booleans only — never values). Safe to expose.
export async function onRequestGet({ env }){
  return json({
    paypal: !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET),
    paypalEnv: env.PAYPAL_ENV || "sandbox",
    kv: !!env.ORDERS,
    cj: !!(env.CJ_API_KEY && env.CJ_EMAIL),
    agentmail: !!env.AGENTMAIL_API_KEY
  });
}
