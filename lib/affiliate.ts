type Retailer = "amazon";

export function buildAffiliateLink(
  retailer: Retailer,
  searchTerm: string
): string {
  switch (retailer) {
    case "amazon":
      return `https://www.amazon.co.uk/s?k=${encodeURIComponent(searchTerm)}&tag=top3today-21`;
    default:
      throw new Error(`Unsupported retailer: ${retailer}`);
  }
}
