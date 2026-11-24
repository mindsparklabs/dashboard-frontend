import type { MetadataRoute } from "next";
import { sectors, getSectorByName } from "@/lib/sectors";
import { SITE_URL } from "@/lib/site";
import { getWeekIndex } from "@/lib/weekly";
import { buildItemId, getDailyRows, ukDayKey } from "@/lib/daily-items";

// Rebuilt at most hourly so new weeks show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [weeks, rows] = await Promise.all([
    getWeekIndex().catch(() => []),
    getDailyRows(60).catch(() => []),
  ]);

  // Daily archive pages (/sector/<slug>/<date>) and every item page from the
  // last 60 days - the permanent, indexable record of each day's picks.
  const dailyEntries: MetadataRoute.Sitemap = rows.flatMap((row) => {
    const sector = getSectorByName(row.sector);
    if (!sector) return [];
    const lastModified = new Date(row.created_at);
    return [
      {
        url: `${SITE_URL}/sector/${sector.slug}/${ukDayKey(row.created_at)}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
      ...(row.items ?? []).map((item) => ({
        url: `${SITE_URL}/item/${buildItemId(row.id, item.rank)}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      })),
    ];
  });

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
    { url: `${SITE_URL}/black-friday`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
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
    { url: `${SITE_URL}/gifts`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...sectors
      .filter((sector) => sector.amazonEligible)
      .map((sector) => ({
        url: `${SITE_URL}/gifts/${sector.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ...weekEntries,
    ...dailyEntries,
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
