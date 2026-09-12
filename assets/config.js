// Coverline — public frontend config. Nothing secret lives here.
//
// Payment now runs through Stripe Checkout: the browser never touches Stripe.js or a publishable
// key at all — /api/create-order returns a hosted Stripe payment page URL and the browser just
// redirects there. Whether Stripe actually works is decided server-side by whether
// STRIPE_SECRET_KEY is set in the Cloudflare Pages environment for this deployment, so there's
// nothing to flip here between preview and live — both hosts behave the same way.
(function(){
  window.COVERLINE_CONFIG = {};
})();
