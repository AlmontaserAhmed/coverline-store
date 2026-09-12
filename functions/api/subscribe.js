import { json, clean, kvGet, kvPut } from "../_lib/util.js";
import { sendMail } from "../_lib/agentmail.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "bad_request" }, 400); }

  const email = clean(body && body.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 400);

  const key = "newsletter:" + email;
  const existing = await kvGet(env, key);
  if (!existing) {
    await kvPut(env, key, { email: email, subscribedAt: new Date().toISOString() });
    // Best-effort shop-side notice; no-op until AGENTMAIL_API_KEY is set.
    sendMail(env, env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to",
      "New drop-list signup",
      "New signup: " + email).catch(function(){});
  }
  return json({ ok: true });
}
