// Coverline — public frontend config. Nothing secret lives here (PayPal client ids are public).
//
// The live domain keeps the existing PayPal.me checkout until a LIVE client id is set below
// (needs the PayPal account upgraded to Business — sandbox apps can't take real money).
// Any other host (the *.pages.dev preview URL) runs the embedded checkout against the
// sandbox app, so the whole flow can be tested with fake money without touching customers.
(function(){
  var h = window.location.hostname;
  var isLive = h === "coverlineshop.com" || h === "www.coverlineshop.com";
  window.COVERLINE_CONFIG = isLive
    ? { paypalClientId: "", paypalEnv: "live" }
    : { paypalClientId: "BAAKTEy_BseOu-hi25LABo4THawRsqjfERuy5DB3HEYD9WDCCwAgiuOcGwiUUAQ2c47Jay9ZpmpNdtwbWc", paypalEnv: "sandbox" };
})();
