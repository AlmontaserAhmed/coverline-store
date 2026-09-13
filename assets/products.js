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
    tagline: "Stays down when you reach up.",
    desc: "Actually long enough: it stays down when you reach for the top shelf, and goes over leggings without riding up.",
    longDesc: "The tee that ends the reach-up-and-tug-it-down routine. Cut longer through the body so it stays down when you lift your arms, and loose enough to layer over leggings or under a jacket without bunching at the waist. Most \"longline\" tees on the high street are cut for someone half a foot taller than you — this one's actually made to the length it says.",
    fit: "Oversized by design — order your usual size for the intended relaxed fit, or size down for something closer to fitted.",
    priceLabel: "£15",
    price: 15,
    sizes: ["S","M","L","XL","XXL"],
    proof: "Actually long enough. Loose, not clingy.",
    modelNote: "Model is 5'6\" and wears a size S.",
    colors: [
      { key: "apricot", label: "Apricot", hex: "#dcb08c", image: "/assets/product-images/tee-apricot.jpg?v=8", images: ["/assets/product-images/tee-apricot.jpg?v=8", "/assets/product-images/tee-apricot-front.jpg?v=21", "/assets/product-images/tee-apricot-back.jpg?v=21", "/assets/product-images/tee-apricot-detail.jpg?v=21"] },
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/tee-black.jpg?v=8", images: ["/assets/product-images/tee-black.jpg?v=8", "/assets/product-images/tee-black-front.jpg?v=21", "/assets/product-images/tee-black-back.jpg?v=21", "/assets/product-images/tee-black-detail.jpg?v=21"] }
    ],
    image: "/assets/product-images/tee-apricot.jpg?v=8",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,260 C 80,210 160,300 300,240 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".55"/><path d="M0,120 C 100,180 200,60 300,130" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "loungeset",
    name: "The Off-Duty Set",
    tagline: "Dressed in one go.",
    desc: "Boxy zip jacket and matching jogger — zip it up, pull them on, and you're done. No thinking required.",
    longDesc: "A zip jacket and jogger that get you dressed in one move. The jacket is cut boxy and zips right up to the collar, so it works over a tee or on its own; the jogger has an elasticated waist and a full-length leg that sits on the shoe. It just happens to look like you put thought into it, even on the days you very much didn't.",
    fit: "True to size through the body. The jogger is regular length (100–103cm outside leg) — if you're 5'3\" or under it will stack a little at the ankle, which is how a jogger is meant to sit. Chart below.",
    priceLabel: "£30",
    price: 30,
    sizes: ["S","M","L","XL"],
    proof: "Zips to the collar. Boxy jacket, easy jogger.",
    modelNote: "Model is 5'6\" and wears a size S.",
    colors: [
      { key: "cream", label: "Cream", hex: "#e6e0d4", image: "/assets/product-images/loungeset-cream.jpg?v=8", images: ["/assets/product-images/loungeset-cream.jpg?v=8", "/assets/product-images/loungeset-cream-proof.jpg?v=22", "/assets/product-images/loungeset-cream-back.jpg?v=22", "/assets/product-images/loungeset-cream-detail.jpg?v=22"] },
      { key: "navy", label: "Navy", hex: "#22283a", image: "/assets/product-images/loungeset-navy.jpg?v=8", images: ["/assets/product-images/loungeset-navy.jpg?v=8", "/assets/product-images/loungeset-navy-proof.jpg?v=22", "/assets/product-images/loungeset-navy-back.jpg?v=22", "/assets/product-images/loungeset-navy-detail.jpg?v=22"] }
    ],
    image: "/assets/product-images/loungeset-cream.jpg?v=8",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,300 C 90,340 220,250 300,300 L300,400 L0,400 Z" fill="var(--accent)" opacity=".4"/><path d="M20,90 C 120,40 200,140 290,80" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "coord",
    name: "The Wide-Leg Set",
    tagline: "Looks planned. Took four seconds.",
    desc: "A relaxed short-sleeve shirt with contrast trim and a full-length wide-leg trouser, cut loose — brunch to dinner without a change.",
    longDesc: "A boxy, collared short-sleeve shirt with a deep V and a contrast band running the neckline, cuffs and hem, over a full-length wide-leg trouser with a matching stripe down each leg. Loose everywhere on purpose — the wide leg gives you room to sit, walk and get in a car without anything pulling. The V runs deep, so we wear ours over the Long-Enough Tee for daytime and on its own for evenings. Linen-look woven polyester: holds the drape, doesn't crease in your bag.",
    fit: "Loose through the top, wide through the leg, elasticated waist. The trouser is full length (105–107cm outside leg) — shorter frames will want a cuff or a heel, and the cuff looks intentional. The supplier's own UK conversion is in the chart below; trust it over your usual letter size.",
    priceLabel: "£30",
    price: 30,
    sizes: ["S","M","L","XL","XXL"],
    proof: "Contrast-trim shirt + wide-leg trouser. Loose by design.",
    modelNote: "Model is 5'6\" and wears a size S, with the Long-Enough Tee in Black underneath.",
    colors: [
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/coord-black.jpg?v=30", images: ["/assets/product-images/coord-black.jpg?v=30", "/assets/product-images/coord-black-front.jpg?v=30", "/assets/product-images/coord-black-back.jpg?v=30", "/assets/product-images/coord-black-detail.jpg?v=30"] },
      { key: "oat", label: "Oat", hex: "#d9c9ad", image: "/assets/product-images/coord-oat.jpg?v=30", images: ["/assets/product-images/coord-oat.jpg?v=30", "/assets/product-images/coord-oat-front.jpg?v=30", "/assets/product-images/coord-oat-back.jpg?v=30", "/assets/product-images/coord-oat-detail.jpg?v=30"] }
    ],
    image: "/assets/product-images/coord-black.jpg?v=30",
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,210 C 90,260 190,180 300,230 L300,400 L0,400 Z" fill="var(--accent)" opacity=".45"/><path d="M0,320 C 110,280 190,360 300,310" fill="none" stroke="var(--accent-2)" stroke-width="1"/><path d="M10,80 C 100,120 200,50 290,100" fill="none" stroke="var(--accent-2)" stroke-width="1"/>'; }
  },
  {
    id: "legging",
    name: "The Squat-Proof Legging",
    tagline: "Leggings you can bend over in.",
    desc: "Opaque enough to squat in, soft enough to sleep in — no mirror check before you leave the house.",
    longDesc: "For the days you basically live in leggings — school run, gym, the floor at pickup, the sofa afterwards. High waistband that actually stays put when you sit, fabric thick enough that bending down in daylight isn't a whole calculation. If you've already bought the £12 pair twice, this is meant to be the one you don't have to replace.",
    fit: "Runs small — it's cut to Asian sizing, so go one up from your usual UK size (a UK 10–12 is an M, 12–14 an L). Only S to L exist in this one. Check the chart below before you pick.",
    priceLabel: "£18",
    price: 18,
    sizes: ["S","M","L"],
    proof: "Squat-tested. Not sheer. High waist that stays put.",
    modelNote: "Model is 5'3\" and wears a size S.",
    colors: [
      { key: "black", label: "Black", hex: "#25272a", image: "/assets/product-images/legging-black.jpg?v=25", images: ["/assets/product-images/legging-black.jpg?v=25", "/assets/product-images/legging-black-proof.jpg?v=24", "/assets/product-images/legging-black-back.jpg?v=25", "/assets/product-images/legging-black-detail.jpg?v=25"] },
      { key: "nude", label: "Sand", hex: "#c9a888", image: "/assets/product-images/legging-nude.jpg?v=24", images: ["/assets/product-images/legging-nude.jpg?v=24", "/assets/product-images/legging-nude-proof.jpg?v=24", "/assets/product-images/legging-nude-back.jpg?v=29", "/assets/product-images/legging-nude-detail.jpg?v=29"] }
    ],
    image: "/assets/product-images/legging-black.jpg?v=25",
    colorPhotosMatch: false, // 12 Sep 2026: nude/black photos are two separate shoots, not pixel-matched like tee/co-ord's colourway swaps — homepage hover-preview disabled for this product, see style.css .mismatched-photos
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,240 C 100,300 200,200 300,260 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,150 C 110,90 190,210 300,160" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  },
  {
    id: "short",
    name: "The Stay-Put Short",
    tagline: "Shorts that stay where you put them.",
    desc: "Seamless, opaque, squat-tested — the gym short you don't have to pull back down between sets.",
    longDesc: "Seamless, so there's no chafing and no lines showing through leggings underneath. Cut with a bit more length than the usual gym short, so squatting, lunging or sitting on the floor doesn't need a second hand to sort them out afterwards. At £14 they're an easy add if you're already checking out.",
    fit: "Runs small and sits high on the waist. Go one up from your usual UK size — a UK 8 is an M, a UK 10 an L, a UK 12 an XL. Chart below.",
    priceLabel: "£14",
    price: 14,
    sizes: ["S","M","L","XL"],
    proof: "Passes the squat test. Longer than the usual gym short.",
    modelNote: "Model is 5'3\" and wears a size S.",
    colors: [
      { key: "maroon", label: "Wine", hex: "#532d2e", image: "/assets/product-images/short-maroon.jpg?v=21", images: ["/assets/product-images/short-maroon.jpg?v=21", "/assets/product-images/short-maroon-back.jpg?v=21", "/assets/product-images/short-maroon-detail.jpg?v=21"] },
      { key: "pink", label: "Blush", hex: "#dcb9b6", image: "/assets/product-images/short-pink.jpg?v=21", images: ["/assets/product-images/short-pink.jpg?v=21", "/assets/product-images/short-pink-detail.jpg?v=21", "/assets/product-images/short-pink-back.jpg?v=21"] }
    ],
    image: "/assets/product-images/short-maroon.jpg?v=21",
    colorPhotosMatch: false, // 12 Sep 2026: maroon/pink photos are two separate shoots, not pixel-matched like tee/co-ord's colourway swaps — homepage hover-preview disabled for this product, see style.css .mismatched-photos
    swatch: function(){ return '<rect width="300" height="400" fill="var(--paper-raised)"/><path d="M0,270 C 100,320 200,240 300,280 L300,400 L0,400 Z" fill="var(--accent-2)" opacity=".5"/><path d="M0,170 C 100,220 200,120 300,180" fill="none" stroke="var(--accent)" stroke-width="1"/>'; }
  }
];
