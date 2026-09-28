// Site-wide constants used by the footer, About and Privacy pages.

export const SITE_NAME = "Top 3 Today";

// Required wording for Amazon Associates - keep verbatim.
export const AMAZON_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

// Footer line: general affiliate note + the Amazon wording, kept to one line.
export const FOOTER_DISCLOSURE =
  "Some links earn us a commission. " + AMAZON_DISCLOSURE;

// Skimlinks publisher script (affiliate tracking for non-Amazon retailers).
// Only loaded after the visitor accepts cookies - see components/cookie-consent.tsx.
export const SKIMLINKS_SRC =
  "https://s.skimresources.com/js/310062X1798444.skimlinks.js";

// Contact address shown on the Privacy and About pages. Leave empty to hide
// the contact line until a business inbox exists; set it to e.g.
// "hello@top3today.com" once that mailbox is live.
export const CONTACT_EMAIL = "";
