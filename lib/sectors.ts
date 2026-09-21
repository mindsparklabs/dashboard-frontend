export type Sector = {
  slug: string;
  name: string;
  color: string;
  // Some sectors have no Amazon-eligible products (e.g. AI, Finance are
  // mostly services/apps, not physical goods). The item page uses this to
  // decide whether to show the Amazon affiliate button or a link back to
  // the original source article instead - flip this per sector rather
  // than special-casing sector slugs in page code.
  amazonEligible: boolean;
};

// Single source of truth for slug <-> Supabase `sector` column value.
// The homepage and every /sector/[slug] page import this so the mapping
// never drifts between the two.
//
// Fitness and Sport were merged into one combined sector (2026-09) to
// increase item variety per tile without adding an 8th/9th thin sector.
// The n8n pipeline must be updated to tag items from both its original
// fitness and sport trend sources with this sector's exact `name` below
// going forward - see chat for details, that side isn't in this repo.
export const sectors: Sector[] = [
  { slug: "viral-trending", name: "Viral & Trending", color: "#ff2ecb", amazonEligible: true },
  { slug: "beauty", name: "Beauty", color: "#ff5c8a", amazonEligible: true },
  { slug: "fitness-sport", name: "Fitness / Sport", color: "#39ff88", amazonEligible: true },
  { slug: "tech", name: "Tech", color: "#39d0ff", amazonEligible: true },
  { slug: "finance", name: "Finance", color: "#ffd23f", amazonEligible: false },
  { slug: "ai", name: "AI", color: "#a86bff", amazonEligible: false },
  { slug: "home-kitchen", name: "Home & Kitchen", color: "#4dd9c9", amazonEligible: true },
  { slug: "pets", name: "Pets", color: "#c9a876", amazonEligible: true },
];

export function getSectorBySlug(slug: string): Sector | undefined {
  return sectors.find((sector) => sector.slug === slug);
}

// Reverse lookup: the Supabase `sector` column stores the display name, so
// pages that only have that (e.g. an item fetched by id) use this to theme
// themselves and link back to the right /sector/[slug].
export function getSectorByName(name: string): Sector | undefined {
  return sectors.find((sector) => sector.name === name);
}
