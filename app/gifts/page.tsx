import type { Metadata } from "next";
import Link from "next/link";
import { sectors } from "@/lib/sectors";
import { getRecentTopItems, type WeeklyItem } from "@/lib/weekly";
import { AMAZON_DISCLOSURE, SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdHtml, sectorSeo } from "@/lib/seo";
import { GiftList } from "@/components/gift-list";

// Christmas gift hub: each shopping sector's most persistent picks from the
// last 30 days of daily top 3s. Reads `daily items` only - no pipeline cost.
// No prices or discounts are claimed (we don't have live prices).
export const revalidate = 3600;

const WINDOW_DAYS = 30;
const PER_SECTOR = 3;
const TITLE = "Christmas Gift Ideas 2026: The Most-Wanted Trending Gifts";
const DESCRIPTION =
  "Gift ideas people actually want this Christmas, ranked by how long each one has held a daily top 3 spot. Beauty, tech, home, fitness, pets and viral hits.";

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/gifts" },
  openGraph: { type: "article", siteName: SITE_NAME, url: "/gifts", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const HERO = "#ff5c8a";

export default async function GiftsPage() {
  const sections = (
    await Promise.all(
      sectors
        .filter((s) => s.amazonEligible)
        .map(async (sector) => ({
          sector,
          items: await getRecentTopItems(sector.name, WINDOW_DAYS, PER_SECTOR).catch(
            () => [] as WeeklyItem[]
          ),
        }))
    )
  ).filter((s) => s.items.length > 0);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: "Christmas gift ideas", path: "/gifts" },
    ]),
    itemListJsonLd(
      TITLE,
      "/gifts",
      sections.flatMap((s) => s.items).map((item) => ({ name: item.headline, path: `/item/${item.id}` }))
    ),
  ];

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />

      <header className="max-w-[900px] mx-auto text-center mb-8">
        <Link href="/" className="text-sm font-semibold opacity-70 hover:opacity-100" style={{ color: HERO }}>
          ← Today&apos;s top 3
        </Link>
        <p className="mt-5 text-xs sm:text-sm font-black uppercase tracking-[0.35em]" style={{ color: "#a1a1aa" }}>
          Christmas 2026
        </p>
        <h1 className="neon-heading mt-2 text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
          Trending Gift Ideas
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-[620px] mx-auto" style={{ color: "#d4d4d8" }}>
          Skip the generic gift lists. These are the things people actually want
          right now, ranked by how many days each one held a spot in our daily
          top 3 over the last month.
        </p>
        <nav className="mt-6 flex flex-wrap justify-center gap-2">
          {sections.map(({ sector }) => (
            <a
              key={sector.slug}
              href={`#${sector.slug}`}
              className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-bold"
              style={{ color: sector.color, border: `1px solid ${sector.color}88`, background: `${sector.color}14` }}
            >
              {sector.name}
            </a>
          ))}
        </nav>
      </header>

      <div className="max-w-[900px] mx-auto flex flex-col gap-10">
        {sections.map(({ sector, items }) => (
          <section key={sector.slug} id={sector.slug} className="scroll-mt-6">
            <div className="flex items-end justify-between gap-3 mb-4">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: sector.color, textShadow: `0 0 16px ${sector.color}88` }}>
                {sectorSeo(sector).giftKeyword}
              </h2>
              <Link href={`/gifts/${sector.slug}`} className="text-sm font-semibold opacity-70 hover:opacity-100" style={{ color: sector.color }}>
                See more →
              </Link>
            </div>
            <GiftList sector={sector} items={items} />
          </section>
        ))}
        {sections.length === 0 && (
          <p className="text-center text-white/70">Gift picks are on the way - check back shortly.</p>
        )}
      </div>

      <p className="text-center text-xs mt-10 opacity-60 max-w-[900px] mx-auto">{AMAZON_DISCLOSURE}</p>
    </main>
  );
}
