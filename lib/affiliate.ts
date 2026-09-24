type Retailer = "amazon";

const AMAZON_MARKETPLACES: Record<string, { domain: string; tag: string }> = {
  US: { domain: "amazon.com", tag: "top3todayus-20" },
};

const DEFAULT_MARKETPLACE = { domain: "amazon.co.uk", tag: "top3today-21" };

export function buildAffiliateLink(
  retailer: Retailer,
  searchTerm: string,
  countryCode?: string | null
): string {
  switch (retailer) {
    case "amazon": {
      const market =
        (countryCode && AMAZON_MARKETPLACES[countryCode.toUpperCase()]) ||
        DEFAULT_MARKETPLACE;
      return `https://www.${market.domain}/s?k=${encodeURIComponent(searchTerm)}&tag=${market.tag}`;
    }
    default:
      throw new Error(`Unsupported retailer: ${retailer}`);
  }
}