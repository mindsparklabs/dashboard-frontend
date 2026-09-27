import type { DailyItem } from "@/lib/daily-items";
import type { Sector } from "@/lib/sectors";
import { buildAffiliateLink } from "@/lib/affiliate";

export type ItemCta = {
  href: string;
  label: string;
  rel: string;
  /** True for Amazon affiliate links - drives the disclosure line. */
  isAffiliate: boolean;
};

/**
 * The single call-to-action for an item, shared by the sector page cards and
 * the item page so both always agree on which button to show:
 *  - Amazon-eligible sectors -> "View on Amazon" (geo-routed UK/US tag).
 *  - AI / Finance (amazonEligible: false) -> "Read source" via item.source.
 *  - Non-Amazon item with no source yet -> "Search for more" Google fallback,
 *    so a card never ends up without a button.
 */
export function getItemCta(
  item: Pick<DailyItem, "headline" | "search_term" | "source">,
  sector: Sector | undefined,
  countryCode: string | null
): ItemCta {
  const amazonEligible = sector?.amazonEligible ?? true;

  if (amazonEligible && item.search_term) {
    return {
      href: buildAffiliateLink("amazon", item.search_term, countryCode),
      label: "View on Amazon",
      rel: "noopener noreferrer nofollow sponsored",
      isAffiliate: true,
    };
  }

  if (item.source) {
    return {
      href: item.source,
      label: "Read source",
      rel: "noopener noreferrer nofollow",
      isAffiliate: false,
    };
  }

  return {
    href: `https://www.google.com/search?q=${encodeURIComponent(item.headline)}`,
    label: "Search for more",
    rel: "noopener noreferrer nofollow",
    isAffiliate: false,
  };
}
