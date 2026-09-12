export function json(data, status){
  return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
export function makeRef(){
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).toUpperCase().slice(-8);
}
export async function kvGet(env, key){
  if(!env.ORDERS) return null;
  try{ return await env.ORDERS.get(key, "json"); }catch(e){ return null; }
}
export async function kvPut(env, key, value){
  if(!env.ORDERS) return false;
  try{ await env.ORDERS.put(key, JSON.stringify(value)); return true; }catch(e){ return false; }
}
export function clean(s, max){ return String(s == null ? "" : s).replace(/[\r\n\t]+/g, " ").trim().slice(0, max || 200); }
