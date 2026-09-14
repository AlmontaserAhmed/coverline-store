// Server-side catalog for the checkout functions. Prices here are what the customer is
// charged — keep in sync with assets/products.js (price field). Never trust a price sent
// by the browser.
//
// NAMES AND COLOUR KEYS MUST MATCH assets/products.js. Level-10 site review, 13 Sep 2026: this
// file still carried the pre-overhaul names ("The Petite Set", "The Co-ord Set"…) and the retired
// "beige" colour key — so a Wide-Leg Set ordered in Oat was silently re-priced as Black and every
// Stripe line item / confirmation email showed the old product name. Keys below are the `key`
// values from products.js; labels are what the customer sees on Stripe and in emails.
//
// cj: CJdropshipping variant ids (vid) per colour+size, for automatic fulfilment. Until a
// variant id is filled in, capture-order marks the order "needs_manual" and emails the shop
// instead of placing a CJ order — nothing is lost, it just isn't automatic yet.
// Pull vids from each locked listing (coverline-sourcing-and-pricing-lock.md) via the CJ
// product/variant query endpoint once the API key exists.
export const CATALOG = {
  tee:       { name: "The Long-Enough Tee",     price: 15, sizes: ["S","M","L","XL","XXL"], colors: { apricot: "Apricot", black: "Black" }, cj: {} },
  loungeset: { name: "The Off-Duty Set",        price: 30, sizes: ["XS","S","M","L","XL","2XL","3XL"], colors: { cream: "Cream", charcoal: "Charcoal" }, cj: {} },
  coord:     { name: "The Wide-Leg Set",        price: 30, sizes: ["S","M","L","XL","XXL"], colors: { black: "Black", oat: "Oat" },         cj: {} },
  legging:   { name: "The Squat-Proof Legging", price: 18, sizes: ["S","M","L"],            colors: { black: "Black", nude: "Sand" },       cj: {} },
  short:     { name: "The Stay-Put Short",      price: 14, sizes: ["S","M","L","XL"],       colors: { maroon: "Wine", pink: "Blush" },      cj: {} }
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
    // A colour we don't sell is a bug in the browser, not something to guess at — refuse
    // rather than quietly shipping the first colour in the list.
    if(!it.color || !p.colors[it.color]) throw new Error("Please pick a colour for " + p.name);
    const color = it.color;
    total += p.price * qty;
    return {
      productId: it.productId, name: p.name, size: it.size,
      color: color, colorLabel: p.colors[color],
      qty: qty, unit: p.price, cjVid: p.cj[color + ":" + it.size] || null
    };
  });
  return { lines: lines, total: total };
}
