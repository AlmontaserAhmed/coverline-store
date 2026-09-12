// Coverline — public frontend config. Nothing secret lives here.
// paypalClientId: the PayPal app's Client ID (public by design). Leave empty to keep the
// old PayPal.me link checkout; set it (sandbox id first, live id later) to switch the
// checkout to embedded PayPal buttons backed by /api/create-order and /api/capture-order.
window.COVERLINE_CONFIG = {
  paypalClientId: "",
  paypalEnv: "sandbox"   // "sandbox" | "live" — must match PAYPAL_ENV on the server
};
