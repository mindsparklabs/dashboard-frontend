import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug, sectors } from "@/lib/sectors";
import { getRecentTopItems } from "@/lib/weekly";
import { AMAZON_DISCLOSURE, SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdHtml, sectorSeo } from "@/lib/seo";
import { GiftList } from "@/components/gift-list";

// Per-sector Christmas gift guide: up to 10 of the sector's most persistent
// picks from the last 30 days. Shopping sectors only.
export const revalidate = 3600;
export const dynamicParams = false;

const WINDOW_DAYS = 30;
const LIMIT = 10;

export function generateStaticParams() {
  return sectors.filter((s) => s.amazonEligible).map((s) => ({ slug: s.slug }));
}

function titleFor(slug: string) {
  const sector = getSectorBySlug(slug);
  if (!sector || !sector.amazonEligible) return null;
  const seo = sectorSeo(sector);
  return {
    sector,
    seo,
    title: `${seo.giftKeyword} 2026: Trending Christmas Gifts`,
    description: `The ${seo.noun} people actually want this Christmas, ranked by how many days each held a spot in our daily top 3 over the last month.`,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/gifts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = titleFor(slug);
  if (!t) return { title: "Not found" };
  const path = `/gifts/${slug}`;
  return {
    title: `${t.title} | ${SITE_NAME}`,
    description: t.description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: SITE_NAME, url: path, title: t.title, description: t.description },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export default async function SectorGiftsPage({
  params,
}: PageProps<"/gifts/[slug]">) {
  const { slug } = await params;
  const t = titleFor(slug);
  if (!t) notFound();

  const { sector, seo } = t;
  const items = await getRecentTopItems(sector.name, WINDOW_DAYS, LIMIT).catch(() => []);
  const path = `/gifts/${slug}`;

  const jsonLd = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: "Christmas gift ideas", path: "/gifts" },
      { name: seo.giftKeyword, path },
    ]),
    itemListJsonLd(t.title, path, items.map((i) => ({ name: i.headline, path: `/item/${i.id}` }))),
  ];

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <header className="max-w-[900px] mx-auto text-center mb-8">
        <Link href="/gifts" className="text-sm font-semibold opacity-70 hover:opacity-100" style={{ color: sector.color }}>
          ← All gift ideas
        </Link>
        <p className="mt-5 text-xs sm:text-sm font-black uppercase tracking-[0.35em]" style={{ color: "#a1a1aa" }}>
          Christmas 2026
        </p>
        <h1 className="neon-heading mt-2 text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          {seo.giftKeyword}
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-[620px] mx-auto" style={{ color: "#d4d4d8" }}>
          {t.description}
        </p>
      </header>

      <div className="max-w-[900px] mx-auto">
        {items.length ? (
          <GiftList sector={sector} items={items} headingLevel="h2" />
        ) : (
          <p className="text-center text-white/70">Gift picks are on the way - check back shortly.</p>
        )}
        <p className="text-center mt-8">
          <Link
            href={`/sector/${sector.slug}`}
            className="inline-flex rounded-full px-6 py-2.5 font-extrabold"
            style={{ background: sector.color, color: "#05050a", boxShadow: `0 0 22px ${sector.color}88` }}
          >
            See today&apos;s top 3 →
          </Link>
        </p>
        <p className="text-center text-xs mt-8 opacity-60">{AMAZON_DISCLOSURE}</p>
      </div>
    </main>
  );
}
