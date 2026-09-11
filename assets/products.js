// Coverline — shared product data. Loaded by index.html, product.html and cart.js.
// Edit prices/descriptions here; every page pulls from this one file.
//
// Each product's `colors` array lists only colors actually in stock from the locked supplier
// (see project doc coverline-sourcing-and-pricing-lock.md) — `image` always mirrors colors[0].image
// so index.html/cart.js (which only read `image`) keep working unchanged.
window.COVERLINE_PRODUCTS = [
  {
    id: "legging",
    name: "The Everyday Legging",
    tagline: "Leggings you can bend over in.",
    desc: "Opaque enough to squat in, soft enough to sleep in — no mirror check before you leave the house.",
    longDesc: "For the days you basically live in leggings — school run, gym, the floor at pickup, the sofa afterwards. High waistband that actually stays put when you sit, fabric thick enough that bending down in daylight isn't a whole calculation. If you've already bought the £12 pair twice, this is meant to be the one you don't have to replace.",
    fit: "True to size. If you're between two sizes, size up for a more relaxed, less compressive fit through the waist.",
    priceLabel: "£16 – £24",
    price: 20,
    sizes: ["XS","S","M","L","XL"],
    proof: "Squat-tested. Not sheer. High waist that stays put.",
    colors: [
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/legging-black.jpg?v=2" },
      { key: "nude", label: "Nude", hex: "#c9a888", image: "/assets/product-images/legging-nude.jpg?v=2" }
    ],
    image: "/assets/product-images/legging-black.jpg?v=2",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,240 C 100,300 200,200 300,260 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,150 C 110,90 190,210 300,160" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "loungeset",
    name: "The Petite Set",
    tagline: "The set you stop rolling up.",
    desc: "Zip jacket and jogger cut for shorter proportions, so the sleeves and hems land where they should instead of needing three rolls.",
    longDesc: "A jacket-and-jogger set that gets you dressed in one go. Cut for shorter proportions, so the sleeves stop at your wrist and the jogger stops at your ankle without a single roll-up. It just happens to look like you put thought into it, even on the days you very much didn't.",
    fit: "Runs true to size through the body; petite-friendly length. If you're above average height for your size, the jogger will sit slightly shorter than a standard-length pair.",
    priceLabel: "£24 – £35",
    price: 30,
    sizes: ["XS","S","M","L","XL"],
    proof: "Cut shorter in the sleeve and leg. Nothing to roll up.",
    colors: [
      { key: "cream", label: "Cream", hex: "#efe7da", image: "/assets/product-images/loungeset-cream.jpg?v=2" },
      { key: "navy", label: "Navy", hex: "#22283a", image: "/assets/product-images/loungeset-navy.jpg?v=2" }
    ],
    image: "/assets/product-images/loungeset-cream.jpg?v=2",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,300 C 90,340 220,250 300,300 L300,400 L0,400 Z" fill="var(--accent)" opacity=".4"/><path d="M20,90 C 120,40 200,140 290,80" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "tee",
    name: "The Longline Tee",
    tagline: "Stays down when you reach up.",
    desc: "Long enough to stay down when you reach for the top shelf, loose enough to go over leggings without riding up.",
    longDesc: "The tee that ends the reach-up-and-tug-it-down routine. Cut longer through the body so it stays down when you lift your arms, and loose enough to layer over leggings or under a jacket without bunching at the waist. Most \"longline\" tees on the high street are cut for someone half a foot taller than you — this one's actually made to the length it says.",
    fit: "Oversized by design — order your usual size for the intended relaxed fit, or size down for something closer to fitted.",
    priceLabel: "£14 – £19",
    price: 17,
    sizes: ["XS","S","M","L","XL"],
    proof: "Actually long enough. Loose, not clingy.",
    colors: [
      { key: "apricot", label: "Apricot", hex: "#dcb08c", image: "/assets/product-images/tee-apricot.jpg?v=2" },
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/tee-black.jpg?v=2" }
    ],
    image: "/assets/product-images/tee-apricot.jpg?v=2",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,260 C 80,210 160,300 300,240 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".55"/><path d="M0,120 C 100,180 200,60 300,130" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "coord",
    name: "The Co-ord Set",
    tagline: "One outfit. Zero decisions.",
    desc: "Fitted top, wide-leg trouser, made to go together — so the outfit is done the second it's on.",
    longDesc: "A fitted top and a wide-leg trouser made for each other, so there's nothing to match and nothing to think about. The wide leg gives you room to sit, walk and get in a car without anything pulling. Works for brunch, works for the office — and honestly, we'd wear the top on its own with jeans too.",
    fit: "Top runs fitted, true to size. Trouser is designed with a wide leg and relaxed waist — if you prefer more room through the hip, size up.",
    priceLabel: "£28 – £42",
    price: 35,
    sizes: ["XS","S","M","L","XL"],
    proof: "Two pieces, one outfit. Wide leg, easy waist.",
    colors: [
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/coord-black.jpg?v=2" },
      { key: "beige", label: "Beige", hex: "#d8cdbb", image: "/assets/product-images/coord-beige.jpg?v=2" }
    ],
    image: "/assets/product-images/coord-black.jpg?v=2",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,210 C 90,260 190,180 300,230 L300,400 L0,400 Z" fill="var(--accent)" opacity=".45"/><path d="M0,320 C 110,280 190,360 300,310" fill="none" stroke="var(--accent-2)" stroke-width="1"/><path d="M10,80 C 100,120 200,50 290,100" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "short",
    name: "The Everyday Short",
    tagline: "Shorts that stay where you put them.",
    desc: "Seamless, opaque, squat-tested — the gym short you don't have to pull back down between sets.",
    longDesc: "Seamless, so there's no chafing and no lines showing through leggings underneath. Cut with a bit more length than the usual gym short, so squatting, lunging or sitting on the floor doesn't need a second hand to sort them out afterwards. At £14 they're an easy add if you're already checking out.",
    fit: "True to size, with a bit of stretch. Runs slightly higher-waisted than typical gym shorts.",
    priceLabel: "£12 – £17",
    price: 14,
    sizes: ["XS","S","M","L","XL"],
    proof: "Passes the squat test. Longer than the usual gym short.",
    colors: [
      { key: "maroon", label: "Maroon", hex: "#5b2430", image: "/assets/product-images/short-maroon.jpg?v=2" },
      { key: "pink", label: "Pink", hex: "#c79a9d", image: "/assets/product-images/short-pink.jpg?v=5" }
    ],
    image: "/assets/product-images/short-maroon.jpg?v=2",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,270 C 100,320 200,240 300,280 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,170 C 100,220 200,120 300,180" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  }
];
