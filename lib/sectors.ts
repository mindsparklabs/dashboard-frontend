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
  // Short label shown on the neon placeholder tile when an item has no
  // product image yet (Amazon image access only unlocks after qualifying
  // sales). Keep it to 2-4 characters so it fits a small square.
  monogram: string;
};

// Single source of truth for slug <-> Supabase `sector` column value.
//
// ARRAY ORDER = HOME PAGE ORDER. Sectors are ranked by sales/interest
// potential (2026-09): impulse-buy, affiliate-friendly categories first,
// non-Amazon sectors (AI, Finance) last. Reorder here to re-rank the home
// page - nothing else depends on this order (the n8n video rotation keeps
// its own list).
// The homepage and every /sector/[slug] page import this so the mapping
// never drifts between the two.
//
// Fitness and Sport were merged into one combined sector (2026-09) to
// increase item variety per tile without adding an 8th/9th thin sector.
// The n8n pipeline must be updated to tag items from both its original
// fitness and sport trend sources with this sector's exact `name` below
// going forward - see chat for details, that side isn't in this repo.
export const sectors: Sector[] = [
  { slug: "viral-trending", name: "Viral & Trending", color: "#ff2ecb", amazonEligible: true, monogram: "HOT" },
  { slug: "beauty", name: "Beauty", color: "#ff5c8a", amazonEligible: true, monogram: "GLOW" },
  { slug: "home-kitchen", name: "Home & Kitchen", color: "#4dd9c9", amazonEligible: true, monogram: "HOME" },
  { slug: "tech", name: "Tech", color: "#39d0ff", amazonEligible: true, monogram: "TECH" },
  { slug: "fitness-sport", name: "Fitness / Sport", color: "#39ff88", amazonEligible: true, monogram: "FIT" },
  { slug: "pets", name: "Pets", color: "#c9a876", amazonEligible: true, monogram: "PETS" },
  { slug: "ai", name: "AI", color: "#a86bff", amazonEligible: false, monogram: "AI" },
  { slug: "finance", name: "Finance", color: "#ffd23f", amazonEligible: false, monogram: "FIN" },
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
