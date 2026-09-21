export type Sector = {
  slug: string;
  name: string;
  color: string;
};

// Single source of truth for slug <-> Supabase `sector` column value.
// The homepage and every /sector/[slug] page import this so the mapping
// never drifts between the two.
export const sectors: Sector[] = [
  { slug: "viral-trending", name: "Viral & Trending", color: "#ff2ecb" },
  { slug: "beauty", name: "Beauty", color: "#ff5c8a" },
  { slug: "fitness", name: "Fitness", color: "#39ff88" },
  { slug: "tech", name: "Tech", color: "#39d0ff" },
  { slug: "finance", name: "Finance", color: "#ffd23f" },
  { slug: "ai", name: "AI", color: "#a86bff" },
  { slug: "sport", name: "Sport", color: "#ff8a3d" },
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
