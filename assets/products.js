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
    tagline: "The leggings that actually feel this good.",
    desc: "Squat-proof, buttery-soft, and genuinely opaque — the leggings that don't need a mirror check first.",
    longDesc: "Built for the days you live in leggings — the school run, the gym, the sofa. A high, comfortable waistband that stays put, and fabric with enough structure that you're not doing a mirror check before you leave the house.",
    fit: "True to size. If you're between two sizes, size up for a more relaxed, less compressive fit through the waist.",
    priceLabel: "£16 – £24",
    price: 20,
    sizes: ["XS","S","M","L","XL"],
    proof: "Squat-proof. Non-sheer.",
    colors: [
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/legging-black.jpg" },
      { key: "nude", label: "Nude", hex: "#c9a888", image: "/assets/product-images/legging-nude.jpg" }
    ],
    image: "/assets/product-images/legging-black.jpg",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,240 C 100,300 200,200 300,260 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,150 C 110,90 190,210 300,160" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "loungeset",
    name: "The Petite Set",
    tagline: "Looks like effort, isn't.",
    desc: "A matching zip jacket and jogger, cut for petite proportions — looks like effort, isn't.",
    longDesc: "A jacket-and-jogger set that does the outfit-planning for you. Cut with shorter proportions in mind — sleeves and inseam that don't need rolling up — so it reads pulled-together on a no-effort day.",
    fit: "Runs true to size through the body; petite-friendly length. If you're above average height for your size, the jogger will sit slightly shorter than a standard-length pair.",
    priceLabel: "£24 – £35",
    price: 30,
    sizes: ["XS","S","M","L","XL"],
    proof: "Petite-proportioned. Matching set.",
    colors: [
      { key: "cream", label: "Cream", hex: "#efe7da", image: "/assets/product-images/loungeset-cream.jpg" },
      { key: "navy", label: "Navy", hex: "#22283a", image: "/assets/product-images/loungeset-navy.jpg" }
    ],
    image: "/assets/product-images/loungeset-cream.jpg",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,300 C 90,340 220,250 300,300 L300,400 L0,400 Z" fill="var(--accent)" opacity=".4"/><path d="M20,90 C 120,40 200,140 290,80" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "tee",
    name: "The Longline Tee",
    tagline: "Made for ease. Worn with confidence.",
    desc: "Long enough to actually cover, soft enough to live in — layers over anything.",
    longDesc: "The one tee that solves the too-short-when-you-reach-up problem. Long enough to stay tucked in, loose enough to layer over leggings or under a jacket without pulling or riding up.",
    fit: "Oversized by design — order your usual size for the intended relaxed fit, or size down for something closer to fitted.",
    priceLabel: "£14 – £19",
    price: 17,
    sizes: ["XS","S","M","L","XL"],
    proof: "Actually long enough.",
    colors: [
      { key: "apricot", label: "Apricot", hex: "#dcb08c", image: "/assets/product-images/tee-apricot.jpg" },
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/tee-black.jpg" }
    ],
    image: "/assets/product-images/tee-apricot.jpg",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,260 C 80,210 160,300 300,240 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".55"/><path d="M0,120 C 100,180 200,60 300,130" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "coord",
    name: "The Co-ord Set",
    tagline: "The set that does the styling for you.",
    desc: "A fitted top and wide-leg trouser, cut to move together — the set that does the styling for you.",
    longDesc: "A fitted top paired with a wide-leg trouser cut to move with you, not against you — the kind of two-piece that reads as a whole outfit the second it's on, no styling required.",
    fit: "Top runs fitted, true to size. Trouser is designed with a wide leg and relaxed waist — if you prefer more room through the hip, size up.",
    priceLabel: "£28 – £42",
    price: 35,
    sizes: ["XS","S","M","L","XL"],
    proof: "Two pieces, one outfit.",
    colors: [
      { key: "black", label: "Black", hex: "#1a1a1a", image: "/assets/product-images/coord-black.jpg" },
      { key: "beige", label: "Beige", hex: "#d8cdbb", image: "/assets/product-images/coord-beige.jpg" }
    ],
    image: "/assets/product-images/coord-black.jpg",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,210 C 90,260 190,180 300,230 L300,400 L0,400 Z" fill="var(--accent)" opacity=".45"/><path d="M0,320 C 110,280 190,360 300,310" fill="none" stroke="var(--accent-2)" stroke-width="1"/><path d="M10,80 C 100,120 200,50 290,100" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "short",
    name: "The Everyday Short",
    tagline: "Finally, shorts that don't ride up mid-workout.",
    desc: "Seamless, opaque, and squat-tested — the gym short that passes the bend-over check.",
    longDesc: "Seamless construction so there's no chafing and no visible lines, with enough length and coverage that bending, squatting, or sitting on the floor at pickup doesn't require a second thought.",
    fit: "True to size, with a bit of stretch. Runs slightly higher-waisted than typical gym shorts.",
    priceLabel: "£12 – £17",
    price: 14,
    sizes: ["XS","S","M","L","XL"],
    proof: "Passes the squat test.",
    colors: [
      { key: "maroon", label: "Maroon", hex: "#5b2430", image: "/assets/product-images/short-maroon.jpg" },
      { key: "pink", label: "Pink", hex: "#e3a9b0", image: "/assets/product-images/short-pink.jpg" }
    ],
    image: "/assets/product-images/short-maroon.jpg",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,270 C 100,320 200,240 300,280 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,170 C 100,220 200,120 300,180" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  }
];
