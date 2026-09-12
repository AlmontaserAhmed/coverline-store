// Sends via AgentMail's API from the shop inbox. No-op (returns false) when not configured.
export async function sendMail(env, to, subject, text){
  if(!env.AGENTMAIL_API_KEY) return false;
  const inbox = env.AGENTMAIL_INBOX || "coverlineshop@agentmail.to";
  try{
    const res = await fetch("https://api.agentmail.to/v0/inboxes/" + encodeURIComponent(inbox) + "/messages/send", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.AGENTMAIL_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ to: Array.isArray(to) ? to : [to], subject: subject, text: text })
    });
    return res.ok;
  }catch(e){ return false; }
}
