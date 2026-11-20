import { supabase } from "@/lib/supabase";
import { buildItemId, type DailyItemsRow } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// RSS feed of the latest daily picks (used by Flipboard, and available to any
// feed reader). One entry per pick (#1-#3) per sector, newest days first.
// Rebuilt at most hourly so each morning's new picks show up without a redeploy.
export const revalidate = 3600;

const DAYS = 3;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const since = new Date(Date.now() - DAYS * 86400000).toISOString();
  const { data } = await supabase
    .from("daily items")
    .select("id, sector, items, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(60);

  const rows = (data ?? []) as DailyItemsRow[];

  // Keep only the newest row per sector per UK day (re-runs can add extras).
  const seen = new Set<string>();
  const entries: string[] = [];
  for (const row of rows) {
    const sector = getSectorByName(row.sector);
    if (!sector || !Array.isArray(row.items)) continue;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(
      new Date(row.created_at)
    );
    const key = `${row.sector}|${day}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const items = [...row.items].sort((a, b) => a.rank - b.rank);
    for (const item of items) {
      if (!item.headline) continue;
      const url = `${SITE_URL}/item/${buildItemId(row.id, item.rank)}`;
      const title = `#${item.rank} in ${sector.name}: ${item.headline}`;
      const parts = [item.description, item.why_it_matters ? `Why it matters: ${item.why_it_matters}` : ""]
        .filter(Boolean)
        .map((p) => `<p>${esc(String(p))}</p>`);
      parts.push(
        `<p><a href="${esc(`${SITE_URL}/sector/${sector.slug}`)}">See today's top 3 in ${esc(sector.name)}</a></p>`
      );
      entries.push(
        [
          "<item>",
          `<title>${esc(title)}</title>`,
          `<link>${esc(url)}</link>`,
          `<guid isPermaLink="true">${esc(url)}</guid>`,
          `<pubDate>${new Date(row.created_at).toUTCString()}</pubDate>`,
          `<category>${esc(sector.name)}</category>`,
          `<description>${esc(item.description || item.headline)}</description>`,
          `<content:encoded><![CDATA[${parts.join("")}]]></content:encoded>`,
          "</item>",
        ].join("")
      );
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${esc(SITE_NAME)}: the 3 things trending right now</title>`,
    `<link>${esc(SITE_URL)}</link>`,
    `<atom:link href="${esc(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>`,
    "<description>The top 3 trending products and stories in every category, refreshed daily.</description>",
    "<language>en</language>",
    `<image><url>${esc(`${SITE_URL}/logo-512.png`)}</url><title>${esc(SITE_NAME)}</title><link>${esc(SITE_URL)}</link></image>`,
    ...entries,
    "</channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
