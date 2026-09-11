// Coverline — real customer reviews only. Never add a review that a real customer
// didn't actually send (brand rule: no invented reviews, no invented quotes).
//
// Reviews arrive by email via /review.html (the link in the post-delivery email).
// To publish one, add an entry here. The product page shows the section only when
// at least one review exists for that product.
//
// Format:
//   { product: "tee", name: "Amira", size: "M", height: "5'2\"",
//     quote: "Finally one that stays down when I reach up.", date: "2026-09" }
// `name` should be first name only (or initials) unless the customer said otherwise.
// `height` and `size` are optional but they're the most useful part for the next buyer.
window.COVERLINE_REVIEWS = [];
