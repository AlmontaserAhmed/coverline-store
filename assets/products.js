// Coverline — shared product data. Loaded by index.html, product.html and cart.js.
// Edit prices/descriptions here; every page pulls from this one file.
//
// Each product's `colors` array lists only colors actually in stock from the locked supplier
// (see project doc coverline-sourcing-and-pricing-lock.md) — `image` always mirrors colors[0].image
// so index.html/cart.js (which only read `image`) keep working unchanged.
window.COVERLINE_PRODUCTS = [
  {
    id: "tee",
    name: "The Long-Enough Tee",
    tagline: "Long enough to stay down.",
    desc: "A longline tee that covers the waistband of your leggings and stays there when you lift your arms. Loose fit, cut for shorter proportions.",
    longDesc: "Cut longer through the body than a standard tee, so it stays down when you reach up, and loose enough to wear over leggings or under a jacket without bunching at the waist. Most longline tees are drafted for someone around 5'9\", which is why they end up cropped on you. This one is made to the length it says on a shorter frame.",
    fit: "Oversized by design — order your usual size for the intended relaxed fit, or size down for something closer to fitted.",
    priceLabel: "£15",
    price: 15,
    sizes: ["S","M","L","XL","XXL"],
    proof: "Longer in the body. Loose fit.",
    modelNote: "Shown in size S on our house model (5\'6\"). Product images are AI-generated; the size chart is the supplier\'s real garment measurements.",
    care: "Cotton jersey. Machine wash cold, inside out; hang or lay flat to dry. It\'ll soften with washing rather than shrink if you keep it out of the tumble dryer.",
    colors: [
      { key: "apricot", label: "Apricot", hex: "#dcb08c", image: "/assets/product-images/tee-apricot.jpg?v=39", images: ["/assets/product-images/tee-apricot.jpg?v=39", "/assets/product-images/tee-apricot-proof.jpg?v=39", "/assets/product-images/tee-apricot-back.jpg?v=39", "/assets/product-images/tee-apricot-detail.jpg?v=39"] },
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/tee-black.jpg?v=39", images: ["/assets/product-images/tee-black.jpg?v=39", "/assets/product-images/tee-black-proof.jpg?v=39", "/assets/product-images/tee-black-back.jpg?v=39", "/assets/product-images/tee-black-detail.jpg?v=39"] }
    ],
    image: "/assets/product-images/tee-apricot.jpg?v=39",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,260 C 80,210 160,300 300,240 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".55"/><path d="M0,120 C 100,180 200,60 300,130" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "loungeset",
    soldOut: true, // 14 Sep 2026: pulled from sale pending re-sourcing — see coverline-product-accuracy-audit-2026-09-14.md
    name: "The Off-Duty Set",
    tagline: "Zip jacket and jogger, sold together.",
    desc: "A boxy zip jacket and matching jogger. The jogger is cut a few centimetres shorter than a standard one, so it sits on the shoe rather than under it.",
    longDesc: "A zip-up jacket and jogger you can wear together or split up. The jacket is boxy and zips to the collar, so it works over a tee or on its own. The jogger has an elasticated waist and a slightly shorter leg than standard (100 to 103cm outside leg depending on size), so it sits on the shoe instead of pooling on it.",
    fit: "Boxy through the jacket, elasticated waist on the jogger. Outside leg is 100–103cm depending on size — a touch shorter than a standard jogger, which suits a shorter frame; if you're tall for your size it will show ankle. Numbers in the chart below.",
    priceLabel: "£30",
    price: 30,
    sizes: ["S","M","L","XL"],
    proof: "Zips to the collar. Jogger 100 to 103cm outside leg.",
    modelNote: "Shown in size S on our house model (5\'6\"). Product images are AI-generated; the size chart is the supplier\'s real garment measurements.",
    care: "Soft brushed stretch knit. Machine wash cold with similar colours, zip the jacket before washing, hang or lay flat to dry. Skip the tumble dryer.",
    colors: [
      { key: "cream", label: "Cream", hex: "#e6e0d4", image: "/assets/product-images/loungeset-cream.jpg?v=39", images: ["/assets/product-images/loungeset-cream.jpg?v=39", "/assets/product-images/loungeset-cream-proof.jpg?v=39", "/assets/product-images/loungeset-cream-back.jpg?v=39", "/assets/product-images/loungeset-cream-detail.jpg?v=39"] },
      { key: "navy", label: "Navy", hex: "#22283a", image: "/assets/product-images/loungeset-navy.jpg?v=39", images: ["/assets/product-images/loungeset-navy.jpg?v=39", "/assets/product-images/loungeset-navy-proof.jpg?v=39", "/assets/product-images/loungeset-navy-back.jpg?v=39", "/assets/product-images/loungeset-navy-detail.jpg?v=39"] }
    ],
    image: "/assets/product-images/loungeset-cream.jpg?v=39",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,300 C 90,340 220,250 300,300 L300,400 L0,400 Z" fill="var(--accent)" opacity=".4"/><path d="M20,90 C 120,40 200,140 290,80" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "coord",
    name: "The Wide-Leg Set",
    tagline: "Shirt and wide-leg trouser set.",
    desc: "A short-sleeve collared shirt with contrast trim and a matching wide-leg trouser. Loose all over. The trouser is full length, so if you're petite you'll want to cuff it or wear a heel.",
    longDesc: "A boxy collared shirt with a deep V and contrast trim on the neckline, cuffs and hem, with a wide-leg trouser that has a matching stripe down each leg. It's loose everywhere, which is the point. The V is deep, so a tee underneath works for daytime. Linen-look woven polyester that holds its shape and doesn't crease much.",
    fit: "Loose through the top, wide through the leg, elasticated waist. The trouser is full length (105–107cm outside leg) — shorter frames will want a cuff or a heel, and the cuff looks intentional. The supplier's own UK conversion is in the chart below; trust it over your usual letter size.",
    priceLabel: "£30",
    price: 30,
    sizes: ["S","M","L","XL","XXL"],
    proof: "Shirt and trouser. Loose fit, full-length leg.",
    modelNote: "Shown in size S on our house model (5\'6\"), with the Long-Enough Tee in Black underneath. Product images are AI-generated; the size chart is the supplier\'s real garment measurements.",
    care: "Linen-look woven polyester. Machine wash cold on a gentle cycle, hang to dry, cool iron if it needs it. It doesn\'t crease in a bag, which is the point.",
    colors: [
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/coord-black.jpg?v=39", images: ["/assets/product-images/coord-black.jpg?v=39", "/assets/product-images/coord-black-proof.jpg?v=39", "/assets/product-images/coord-black-back.jpg?v=39", "/assets/product-images/coord-black-detail.jpg?v=39"] },
      { key: "oat", label: "Oat", hex: "#d9c9ad", image: "/assets/product-images/coord-oat.jpg?v=39", images: ["/assets/product-images/coord-oat.jpg?v=39", "/assets/product-images/coord-oat-proof.jpg?v=39", "/assets/product-images/coord-oat-back.jpg?v=39", "/assets/product-images/coord-oat-detail.jpg?v=39"] }
    ],
    image: "/assets/product-images/coord-black.jpg?v=39",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,210 C 90,260 190,180 300,230 L300,400 L0,400 Z" fill="var(--accent)" opacity=".45"/><path d="M0,320 C 110,280 190,360 300,310" fill="none" stroke="var(--accent-2)" stroke-width="1"/><path d="M10,80 C 100,120 200,50 290,100" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "legging",
    name: "The Squat-Proof Legging",
    tagline: "Thick, high-waisted, stays up.",
    desc: "A thick seamless knit with a high waistband that stays up when you sit. Runs small, so go one size up from your usual.",
    longDesc: "For the days you live in leggings. The waistband is high and stays up when you sit, and the knit is thick enough that you don't need to think about it when you bend down. Soft enough to sleep in. It's the pair you keep instead of rebuying the cheap ones every few months.",
    fit: "Runs small — it's cut to Asian sizing, so go one up from your usual UK size (a UK 10–12 is an M, 12–14 an L). Only S to L exist in this one. Check the chart below before you pick.",
    priceLabel: "£18",
    price: 18,
    sizes: ["S","M","L"],
    proof: "Thick seamless knit. High waist. Sizes S to L, runs small.",
    modelNote: "Shown in size S on our house model (5\'3\"). Product images are AI-generated; the size chart is the supplier\'s real garment measurements.",
    care: "Seamless stretch knit. Machine wash cold, hang or lay flat to dry. Skip the tumble dryer — it\'s what kills the stretch in every pair you\'ve owned before.",
    colors: [
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/legging-black.jpg?v=39", images: ["/assets/product-images/legging-black.jpg?v=39", "/assets/product-images/legging-black-proof.jpg?v=39", "/assets/product-images/legging-black-back.jpg?v=39", "/assets/product-images/legging-black-detail.jpg?v=46"] },
      { key: "nude", label: "Sand", hex: "#c9a888", image: "/assets/product-images/legging-nude.jpg?v=46", images: ["/assets/product-images/legging-nude.jpg?v=46", "/assets/product-images/legging-nude-proof.jpg?v=46", "/assets/product-images/legging-nude-back.jpg?v=46", "/assets/product-images/legging-nude-detail.jpg?v=46"] }
    ],
    image: "/assets/product-images/legging-black.jpg?v=39",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,240 C 100,300 200,200 300,260 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,150 C 110,90 190,210 300,160" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "short",
    name: "The Stay-Put Short",
    tagline: "Seamless short, longer in the leg.",
    desc: "Seamless and high-waisted, cut a bit longer in the leg than the average gym short so it stays put when you squat.",
    longDesc: "Seamless, so there's no chafing and nothing shows through if you wear them under leggings. The leg is a bit longer than a typical gym short, so it doesn't ride up when you squat, lunge or sit on the floor. £14.",
    fit: "Runs small and sits high on the waist. Go one up from your usual UK size — a UK 8 is an M, a UK 10 an L, a UK 12 an XL. Chart below.",
    priceLabel: "£14",
    price: 14,
    sizes: ["S","M","L","XL"],
    proof: "Seamless. Longer leg than a standard gym short.",
    modelNote: "Shown in size S on our house model (5\'3\"). Product images are AI-generated; the size chart is the supplier\'s real garment measurements.",
    care: "Seamless stretch knit. Machine wash cold, hang or lay flat to dry. Skip the tumble dryer — it\'s what kills the stretch in every pair you\'ve owned before.",
    colors: [
      { key: "maroon", label: "Wine", hex: "#946468", image: "/assets/product-images/short-wine.jpg?v=51", images: ["/assets/product-images/short-wine.jpg?v=51", "/assets/product-images/short-wine-back.jpg?v=51", "/assets/product-images/short-wine-detail.jpg?v=51"] },
      { key: "pink", label: "Blush", hex: "#c59c9d", image: "/assets/product-images/short-blush.jpg?v=51", images: ["/assets/product-images/short-blush.jpg?v=51", "/assets/product-images/short-blush-back.jpg?v=51", "/assets/product-images/short-blush-detail.jpg?v=51"] }
    ],
    image: "/assets/product-images/short-wine.jpg?v=51",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,270 C 100,320 200,240 300,280 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,170 C 100,220 200,120 300,180" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  }
];
