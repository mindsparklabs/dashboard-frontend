import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug } from "@/lib/sectors";
import {
  buildItemId,
  getDailyRows,
  getSectorRowForDay,
  ukDayKey,
} from "@/lib/daily-items";
import { weekOf, weekSlug } from "@/lib/weekly";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  jsonLdHtml,
  longDateFromKey,
  metaDescription,
  sectorSeo,
  SITE_NAME,
} from "@/lib/seo";
import { ItemCards } from "@/components/item-cards";
import { SectorAbout } from "@/components/sector-about";

// Permanent daily archive: /sector/<slug>/<YYYY-MM-DD> (UK date). A past
// day's picks never change, so these are cached for an hour. Today's date
// also works (it fills in once the morning run lands).
export const revalidate = 3600;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function load(slug: string, date: string) {
  const sector = getSectorBySlug(slug);
  if (!sector || !DATE_RE.test(date)) return null;
  const row = await getSectorRowForDay(sector.name, date).catch(() => null);
  if (!row || !row.items?.length) return null;
  return { sector, row };
}

export async function generateMetadata({
  params,
}: PageProps<"/sector/[slug]/[date]">): Promise<Metadata> {
  const { slug, date } = await params;
  const data = await load(slug, date);
  if (!data) return { title: "Not found" };

  const { sector, row } = data;
  const seo = sectorSeo(sector);
  const items = row.items.slice().sort((a, b) => a.rank - b.rank);
  const day = longDateFromKey(date);
  const title = `Top 3 ${seo.keyword} – ${day}`;
  const description = metaDescription(
    `The top 3 ${seo.noun} on ${day}: ${items.map((i) => i.headline).join(", ")}.`
  );
  const path = `/sector/${sector.slug}/${date}`;
  const image = `/pin/${buildItemId(row.id, items[0].rank)}.png`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: SITE_NAME, url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SectorDayPage({
  params,
}: PageProps<"/sector/[slug]/[date]">) {
  const { slug, date } = await params;
  const data = await load(slug, date);
  if (!data) notFound();

  const { sector, row } = data;
  const seo = sectorSeo(sector);
  const items = row.items.slice().sort((a, b) => a.rank - b.rank);
  const recentRows = await getDailyRows(30, sector.name).catch(() => []);
  const path = `/sector/${sector.slug}/${date}`;
  const day = longDateFromKey(date);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: sector.name, path: `/sector/${sector.slug}` },
      { name: day, path },
    ]),
    itemListJsonLd(
      `Top 3 ${seo.keyword} – ${day}`,
      path,
      items.map((item) => ({
        name: item.headline,
        path: `/item/${buildItemId(row.id, item.rank)}`,
      }))
    ),
  ];

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="max-w-[1400px] mx-auto mb-8 text-center">
        <Link
          href={`/sector/${sector.slug}`}
          className="inline-block text-sm font-semibold mb-4 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: sector.color }}
        >
          ← Today&apos;s top 3
        </Link>
        <h1 className="neon-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Top 3 {seo.keyword}
        </h1>
        <p className="text-sm sm:text-base mt-2 opacity-70">{day}</p>
      </div>

      <ItemCards row={row} sector={sector} from="archive" />

      <SectorAbout
        sector={sector}
        previousDays={recentRows.map((r) => ukDayKey(r.created_at))}
        currentDay={date}
        weeklyHref={`/best/${sector.slug}/${weekSlug(weekOf(row.created_at))}`}
      />
    </main>
  );
}
