// Server-side catalog for the checkout functions. Prices here are what the customer is
// charged — keep in sync with assets/products.js (price field). Never trust a price sent
// by the browser.
//
// cj: CJdropshipping variant ids (vid) per colour+size, for automatic fulfilment. Until a
// variant id is filled in, capture-order marks the order "needs_manual" and emails the shop
// instead of placing a CJ order — nothing is lost, it just isn't automatic yet.
// Pull vids from each locked listing (coverline-sourcing-and-pricing-lock.md) via the CJ
// product/variant query endpoint once the API key exists.
export const CATALOG = {
  legging:   { name: "The Everyday Legging", price: 20, sizes: ["XS","S","M","L","XL"], colors: ["black","nude"],   cj: {} },
  loungeset: { name: "The Petite Set",       price: 30, sizes: ["XS","S","M","L","XL"], colors: ["cream","navy"],   cj: {} },
  tee:       { name: "The Longline Tee",     price: 17, sizes: ["XS","S","M","L","XL"], colors: ["apricot","black"], cj: {} },
  coord:     { name: "The Co-ord Set",       price: 35, sizes: ["XS","S","M","L","XL"], colors: ["black","beige"],  cj: {} },
  short:     { name: "The Everyday Short",   price: 14, sizes: ["XS","S","M","L","XL"], colors: ["maroon","pink"],  cj: {} }
};
// cj example once filled:  cj: { "black:M": "1234567890", "nude:M": "..." }

export function priceOrder(items){
  if(!Array.isArray(items) || !items.length) throw new Error("Empty order");
  let total = 0;
  const lines = items.map(function(it){
    const p = CATALOG[it.productId];
    if(!p) throw new Error("Unknown product " + it.productId);
    if(p.sizes.indexOf(it.size) < 0) throw new Error("Unknown size " + it.size);
    const qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1));
    const color = p.colors.indexOf(it.color) >= 0 ? it.color : p.colors[0];
    total += p.price * qty;
    return { productId: it.productId, name: p.name, size: it.size, color: color, qty: qty, unit: p.price, cjVid: p.cj[color + ":" + it.size] || null };
  });
  return { lines: lines, total: total };
}
