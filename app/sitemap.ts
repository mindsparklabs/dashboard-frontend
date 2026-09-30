import type { MetadataRoute } from "next";
import { sectors, getSectorByName } from "@/lib/sectors";
import { SITE_URL } from "@/lib/site";
import { getWeekIndex } from "@/lib/weekly";

// Rebuilt at most hourly so new weeks show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const weeks = await getWeekIndex().catch(() => []);

  const weekEntries: MetadataRoute.Sitemap = weeks.flatMap((entry) => {
    const sector = getSectorByName(entry.sector);
    if (!sector) return [];
    return [
      {
        url: `${SITE_URL}/best/${sector.slug}/${entry.slug}`,
        lastModified: new Date(entry.lastModified),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
  });

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/best`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...sectors.map((sector) => ({
      url: `${SITE_URL}/sector/${sector.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...sectors.map((sector) => ({
      url: `${SITE_URL}/best/${sector.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...weekEntries,
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
