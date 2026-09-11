// Coverline — size charts, one entry per product id (matches products.js ids).
// Loaded on product.html. If a product has no entry (or an empty rows array) the
// "Size chart" accordion simply doesn't render, so nothing is ever invented.
//
// Format:
//   legging: {
//     unit: "cm",
//     columns: ["Size", "Waist", "Hip", "Inside leg"],
//     rows: [ ["XS", "60-64", "84-88", "68"], ... ],
//     note: "Measured flat, then doubled. Fabric stretches ~10cm beyond these."
//   }
// Fill each from the locked supplier listing's own size table
// (see project doc coverline-sourcing-and-pricing-lock.md for the 5 CJ links).
window.COVERLINE_SIZE_CHARTS = {
  legging:   { unit: "cm", columns: ["Size", "Waist", "Hip", "Inside leg"], rows: [], note: "" },
  loungeset: { unit: "cm", columns: ["Size", "Bust", "Waist", "Inside leg", "Sleeve"], rows: [], note: "" },
  tee:       { unit: "cm", columns: ["Size", "Chest", "Length", "Sleeve"], rows: [], note: "" },
  coord:     { unit: "cm", columns: ["Size", "Bust", "Waist", "Hip", "Trouser length"], rows: [], note: "" },
  short:     { unit: "cm", columns: ["Size", "Waist", "Hip", "Inseam"], rows: [], note: "" }
};
