// Site-wide constants used by the footer, About and Privacy pages.

export const SITE_NAME = "Top 3 Today";

// Canonical origin (the live site redirects to www). Used for canonical
// URLs, social previews, structured data and the sitemap.
export const SITE_URL = "https://www.top3today.com";

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

// Contact address shown on the Privacy and About pages (Cloudflare Email
// Routing forwards it to the business Gmail). Set to "" to hide it.
export const CONTACT_EMAIL = "hello@top3today.com";

// Outbound click logging (see app/go/[id]/route.ts). Clicks are posted to an
// n8n webhook that stores them for the Monday stats email. The key only stops
// random junk being written to the stats; it isn't protecting anything
// sensitive. Set CLICK_LOG_URL to "" to switch logging off.
export const CLICK_LOG_URL =
  "https://mindsparklabs.app.n8n.cloud/webhook/t3t-click";
export const CLICK_LOG_KEY = "03f29ae8da82a243df2482b3";

// Official social profiles. Used for the footer "Follow us" links and the
// Organization structured data (sameAs). Add Reddit here once the profile has
// some history.
export const SOCIAL_LINKS = [
  { label: "Bluesky", href: "https://bsky.app/profile/top3today.com" },
  { label: "X", href: "https://x.com/Top3TodayHQ" },
] as const;
