type Retailer = "amazon";

type Marketplace = {
  /** Key used to pick the stored product ID for this store (amazon_asin_<key>). */
  key: "uk" | "us";
  domain: string;
  tag: string;
};

// Country -> Amazon store. Add a country here (plus its Associates tag, and
// an amazon_asin_<key> lookup in the n8n pipeline) to target a new market.
const AMAZON_MARKETPLACES: Record<string, Marketplace> = {
  US: { key: "us", domain: "amazon.com", tag: "top3todayus-20" },
};

const DEFAULT_MARKETPLACE: Marketplace = {
  key: "uk",
  domain: "amazon.co.uk",
  tag: "top3today-21",
};

export type AmazonProductIds = {
  amazon_asin_uk?: string | null;
  amazon_asin_us?: string | null;
};

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

/**
 * Builds the visitor's Amazon link. If the daily pipeline found the exact
 * product (ASIN) for the visitor's store, link straight to that product page;
 * otherwise fall back to an Amazon search for the item's search term.
 */
export function buildAffiliateLink(
  retailer: Retailer,
  searchTerm: string,
  countryCode?: string | null,
  productIds?: AmazonProductIds
): string {
  switch (retailer) {
    case "amazon": {
      const market =
        (countryCode && AMAZON_MARKETPLACES[countryCode.toUpperCase()]) ||
        DEFAULT_MARKETPLACE;
      const asin =
        market.key === "us"
          ? productIds?.amazon_asin_us
          : productIds?.amazon_asin_uk;
      if (asin && ASIN_PATTERN.test(asin)) {
        return `https://www.${market.domain}/dp/${asin}?tag=${market.tag}`;
      }
      return `https://www.${market.domain}/s?k=${encodeURIComponent(searchTerm)}&tag=${market.tag}`;
    }
    default:
      throw new Error(`Unsupported retailer: ${retailer}`);
  }
}
