import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug, sectors } from "@/lib/sectors";
import {
  buildItemId,
  getDailyRows,
  getLatestItemsForSector,
  ukDayKey,
} from "@/lib/daily-items";
import { weekOf, weekSlug } from "@/lib/weekly";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  jsonLdHtml,
  metaDescription,
  sectorSeo,
  shortDate,
  SITE_NAME,
} from "@/lib/seo";
import { ItemCards } from "@/components/item-cards";
import { SectorAbout } from "@/components/sector-about";
import { ExploreLinks } from "@/components/explore-links";

// `daily items` is append-only and a new row lands each morning. A 5-minute
// cache keeps pages fast for visitors and crawlers while still showing new
// picks within minutes of the pipeline run.
export const revalidate = 300;

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sector/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) return { title: "Sector not found" };

  const seo = sectorSeo(sector);
  const row = await getLatestItemsForSector(sector.name).catch(() => null);
  const items = (row?.items ?? []).slice().sort((a, b) => a.rank - b.rank);
  const date = row ? shortDate(row.created_at) : null;

  const title = `Top 3 ${seo.keyword} Today${date ? ` (${date})` : ""}`;
  const description = metaDescription(
    items.length
      ? `Today's top 3 ${seo.noun}: ${items.map((i) => i.headline).join(", ")}. Updated every morning.`
      : seo.intro
  );
  const path = `/sector/${sector.slug}`;
  const image = row && items[0] ? `/pin/${buildItemId(row.id, items[0].rank)}.png` : "/logo-512.png";

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SectorPage({
  params,
}: PageProps<"/sector/[slug]">) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);

  if (!sector) {
    notFound();
  }

  const [row, recentRows] = await Promise.all([
    getLatestItemsForSector(sector.name),
    getDailyRows(30, sector.name).catch(() => []),
  ]);
  const items = (row?.items ?? []).slice().sort((a, b) => a.rank - b.rank);
  const seo = sectorSeo(sector);
  const path = `/sector/${sector.slug}`;

  const jsonLd = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: sector.name, path },
    ]),
    ...(row && items.length
      ? [
          itemListJsonLd(
            `Top 3 ${seo.keyword} Today`,
            path,
            items.map((item) => ({
              name: item.headline,
              path: `/item/${buildItemId(row.id, item.rank)}`,
            }))
          ),
        ]
      : []),
  ];

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="max-w-[1400px] mx-auto mb-8">
        <Link
          href="/"
          className="inline-block text-sm font-semibold mb-4 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: sector.color }}
        >
          ← Back to all sectors
        </Link>
        <h1 className="neon-heading text-center text-4xl sm:text-5xl font-black tracking-tight">
          {sector.name}
        </h1>
        {row?.created_at && (
          <p className="text-center text-sm mt-2 opacity-60">
            Today&apos;s top 3 {seo.noun} · Updated {shortDate(row.created_at)}
          </p>
        )}
        {/* Link text must not contain a sector name - the video recorder
            matches links loosely by sector name. Sits outside `article`. */}
        {row?.created_at && (
          <p className="text-center mt-3">
            <Link
              href={`/best/${sector.slug}/${weekSlug(weekOf(row.created_at))}`}
              className="inline-block rounded-full px-4 py-1.5 text-sm font-bold transition-opacity opacity-80 hover:opacity-100"
              style={{ color: sector.color, border: `1px solid ${sector.color}77` }}
            >
              This week&apos;s best →
            </Link>
          </p>
        )}
      </div>

      {!row || items.length === 0 ? (
        <p className="text-center opacity-70 mt-16">
          No data yet for {sector.name}. Check back after the next pipeline
          run.
        </p>
      ) : (
        <ItemCards row={row} sector={sector} from="sector" />
      )}

      <SectorAbout
        sector={sector}
        previousDays={recentRows.map((r) => ukDayKey(r.created_at))}
        currentDay={row ? ukDayKey(row.created_at) : undefined}
        weeklyHref={null}
      />
      {/* No sector names here: the video recorder taps this page. */}
      <ExploreLinks showSectors={false} />
    </main>
  );
}

