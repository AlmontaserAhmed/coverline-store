// CJdropshipping Open API — places the fulfilment order after a verified Stripe payment.
// Returns { placed: true, cjOrderId } or { placed: false, reason }. Never throws.
async function cjToken(env){
  if(!env.CJ_API_KEY || !env.CJ_EMAIL) return null;
  const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.CJ_EMAIL, password: env.CJ_API_KEY })
  });
  const data = await res.json().catch(function(){ return {}; });
  return data && data.data && data.data.accessToken ? data.data.accessToken : null;
}

export async function placeCjOrder(env, order){
  try{
    const missing = order.lines.filter(function(l){ return !l.cjVid; });
    if(missing.length) return { placed: false, reason: "no CJ variant id for: " + missing.map(function(l){ return l.productId + " " + l.color + " " + l.size; }).join(", ") };
    const token = await cjToken(env);
    if(!token) return { placed: false, reason: "CJ not configured" };
    const body = {
      orderNumber: "COVERLINE-" + order.ref,
      shippingZip: order.customer.postcode,
      shippingCountryCode: "GB",
      shippingCountry: "United Kingdom",
      shippingProvince: order.customer.city,
      shippingCity: order.customer.city,
      shippingAddress: order.customer.address,
      shippingCustomerName: order.customer.name,
      shippingPhone: order.customer.phone || "",
      remark: "Coverline order " + order.ref,
      fromCountryCode: env.CJ_FROM_COUNTRY || "CN",
      logisticName: env.CJ_LOGISTIC || "CJPacket Ordinary",
      products: order.lines.map(function(l){ return { vid: l.cjVid, quantity: l.qty }; })
    };
    const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2", {
      method: "POST", headers: { "Content-Type": "application/json", "CJ-Access-Token": token }, body: JSON.stringify(body)
    });
    const data = await res.json().catch(function(){ return {}; });
    if(data && data.result && data.data) return { placed: true, cjOrderId: data.data.orderId || data.data };
    return { placed: false, reason: "CJ error: " + (data && (data.message || data.msg) || res.status) };
  }catch(e){ return { placed: false, reason: "CJ exception: " + (e && e.message) }; }
}
