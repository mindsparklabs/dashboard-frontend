import type { Sector } from "@/lib/sectors";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Search wording per sector: the phrase people actually type, plus a short
// honest intro shown under the picks. Keep claims factual - no invented
// numbers, reviews or deals.
type SectorSeo = {
  /** "Trending Beauty Products" - used in titles and headings. */
  keyword: string;
  /** Lower-case noun for sentences: "beauty products". */
  noun: string;
  intro: string;
  /** Gift-guide heading wording. */
  giftKeyword: string;
};

const SECTOR_SEO: Record<string, SectorSeo> = {
  "viral-trending": {
    keyword: "Viral Trending Products",
    noun: "viral products",
    giftKeyword: "Viral Gift Ideas",
    intro:
      "The products blowing up on TikTok, Instagram and Reddit right now. We scan what's selling and getting shared every morning and pick the three with the most momentum, so you see what's going viral before everyone else does.",
  },
  beauty: {
    keyword: "Trending Beauty Products",
    noun: "beauty products",
    giftKeyword: "Beauty Gift Ideas",
    intro:
      "Today's most talked-about skincare, makeup and haircare. Every morning we check what's trending across TikTok, beauty communities and bestseller charts, then pick the top three beauty products worth knowing about.",
  },
  "home-kitchen": {
    keyword: "Trending Home & Kitchen Products",
    noun: "home and kitchen products",
    giftKeyword: "Home & Kitchen Gift Ideas",
    intro:
      "The kitchen gadgets, home upgrades and cleaning finds everyone is buying right now. Picked fresh every morning from what's trending on social media and in bestseller charts.",
  },
  tech: {
    keyword: "Trending Tech Gadgets",
    noun: "tech gadgets",
    giftKeyword: "Tech Gift Ideas",
    intro:
      "The gadgets, accessories and tech people are buzzing about today. We track launches, viral finds and bestseller movement every morning and pick the three trending hardest.",
  },
  "fitness-sport": {
    keyword: "Trending Fitness & Sport Products",
    noun: "fitness and sport products",
    giftKeyword: "Fitness Gift Ideas",
    intro:
      "Today's top workout gear, recovery tools and sports kit. Picked every morning from what's trending with athletes, gym-goers and fitness creators.",
  },
  pets: {
    keyword: "Trending Pet Products",
    noun: "pet products",
    giftKeyword: "Gifts for Pets & Pet Lovers",
    intro:
      "The toys, treats and gadgets pet owners are loving right now. Every morning we check what's trending in pet communities and bestseller charts and pick the top three for dogs, cats and more.",
  },
  ai: {
    keyword: "Trending AI Tools & News",
    noun: "AI tools",
    giftKeyword: "AI Picks",
    intro:
      "The AI tools, launches and stories everyone is talking about today. Picked every morning from tech news, product launches and what's trending online, with a one-line take on why each one matters.",
  },
  finance: {
    keyword: "Trending Money & Finance News",
    noun: "money stories",
    giftKeyword: "Finance Picks",
    intro:
      "Today's top money stories, from savings rates to investing trends. Picked every morning with a one-line take on why each one matters. For information only - not financial advice.",
  },
};

export function sectorSeo(sector: Sector): SectorSeo {
  return (
    SECTOR_SEO[sector.slug] ?? {
      keyword: `Trending ${sector.name}`,
      noun: sector.name.toLowerCase(),
      giftKeyword: `${sector.name} Gift Ideas`,
      intro: `Today's top 3 trending ${sector.name.toLowerCase()} picks, refreshed every morning.`,
    }
  );
}

/** "24 Nov 2026" in UK time. */
export function shortDate(input: string | Date): string {
  return new Date(input).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/** "Tuesday 24 November 2026" in UK time - for UK date keys (YYYY-MM-DD). */
export function longDateFromKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Safe JSON-LD script body (escapes "<" so text can't close the tag). */
export function jsonLdHtml(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function itemListJsonLd(
  name: string,
  path: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE_URL}${path}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Trims text to a meta-description length on a word boundary. */
export function metaDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-512.png`;
export { SITE_NAME };
