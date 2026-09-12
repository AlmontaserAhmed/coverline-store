import { json } from "../_lib/util.js";
// Reports which pieces are configured (booleans only — never values). Safe to expose.
export async function onRequestGet({ env }){
  return json({
    stripe: !!env.STRIPE_SECRET_KEY,
    stripeWebhook: !!env.STRIPE_WEBHOOK_SECRET,
    kv: !!env.ORDERS,
    cj: !!(env.CJ_API_KEY && env.CJ_EMAIL),
    agentmail: !!env.AGENTMAIL_API_KEY,
    admin: !!env.ADMIN_TOKEN
  });
}
