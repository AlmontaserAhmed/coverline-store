// Coverline — size charts, one entry per product id (matches products.js ids).
// Loaded on product.html. If a product has no entry (or an empty rows array) the
// "Size chart" accordion simply doesn't render, so nothing is ever invented.
//
// Every number below is copied from the locked supplier's own size table on CJdropshipping
// (pulled 12 Sep 2026 — see project doc coverline-sourcing-and-pricing-lock.md for the links).
// These are garment measurements, not body measurements. Supplier sizing runs small versus
// UK high-street sizing; the note on each chart says so.
window.COVERLINE_SIZE_CHARTS = {
  legging: {
    unit: "cm",
    columns: ["Size", "Waist (relaxed, flat)", "Hip (relaxed, flat)", "Length"],
    rows: [
      ["S", "25", "34", "83"],
      ["M", "27", "36", "85"],
      ["L", "29", "38", "87"]
    ],
    note: "Measured flat and unstretched — the fabric stretches a lot, that's the point. If you're normally a UK 10–12, go M; UK 12–14, go L. Supplier tolerance ±1cm."
  },
  tee: {
    unit: "cm",
    columns: ["Size", "Length", "Chest", "Shoulder", "Sleeve", "Fits height"],
    rows: [
      ["S",   "71.5", "111", "52", "19.5", "160–170"],
      ["M",   "74",   "116", "54", "20.5", "165–175"],
      ["L",   "76.5", "121", "56", "21.5", "170–180"],
      ["XL",  "79",   "126", "58", "22.5", "175–185"],
      ["XXL", "81.5", "131", "60", "23.5", "180–190"]
    ],
    note: "Cut oversized. The length column is what makes it longline — an S already hits mid-thigh on a 5'3\" frame. Order your usual size for the intended look; size down for closer to a regular tee. Tolerance ±1–3cm."
  },
  short: {
    unit: "cm",
    columns: ["Size", "Waist (relaxed)", "Hip (relaxed)", "Length"],
    rows: [
      ["S",  "62", "67", "32"],
      ["M",  "64", "70", "34"],
      ["L",  "66", "73", "36"],
      ["XL", "68", "76", "38"]
    ],
    note: "Relaxed measurements — seamless fabric stretches well beyond these. Runs small: UK 8 → M, UK 10 → L, UK 12 → XL. Tolerance ±1–2cm."
  },
  loungeset: {
    unit: "cm",
    columns: ["Size", "Jacket chest", "Jacket length", "Sleeve", "Trouser length", "Hip", "Waist (relaxed)"],
    rows: [
      ["S",  "106", "71", "52", "100", "113", "64"],
      ["M",  "110", "72", "53", "101", "117", "68"],
      ["L",  "114", "73", "54", "102", "121", "72"],
      ["XL", "118", "74", "55", "103", "125", "76"]
    ],
    note: "The jacket is boxy; the jogger has an elasticated waist. Trouser length is the full outside leg. Tolerance ±1–3cm."
  },
  coord: {
    unit: "cm",
    columns: ["Size", "UK", "Top length", "Top chest", "Trouser length", "Trouser waist (relaxed)"],
    rows: [
      ["S",   "8–10",  "68", "108", "105", "68"],
      ["M",   "12–14", "69", "118", "105", "74"],
      ["L",   "16",    "70", "126", "106", "78"],
      ["XL",  "18",    "71", "132", "107", "84"],
      ["XXL", "20",    "72", "142", "107", "94"]
    ],
    note: "Loose fit through the top by design. The UK column is the supplier's own conversion. Tolerance ±2–3cm."
  }
};
