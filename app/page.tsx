import { sectors } from "@/lib/sectors";
import { getLatestItemsForSector } from "@/lib/daily-items";
import Link from "next/link";
import { SectorList, type SectorWithPreview } from "@/components/sector-list";
import type { Metadata } from "next";
import { showBlackFridayBanner } from "@/lib/seasonal";
import { itemListJsonLd, jsonLdHtml } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Preview headlines come from the append-only `daily items` table. A
// 5-minute cache keeps the page fast while new picks still show within
// minutes of the morning run.
export const revalidate = 300;

const TITLE = "Top 3 Today | Today's Trending Products, Picked Daily";
const DESCRIPTION =
  "The 3 products trending hardest right now in beauty, tech, home & kitchen, fitness, pets, AI, finance and viral finds. Fresh picks every morning.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/", title: TITLE, description: DESCRIPTION },
};

// Plain-text FAQ under the list. Link text in this file must never contain
// a sector name (the video recorder matches links by sector name).
const FAQ = [
  {
    q: "What is Top 3 Today?",
    a: "A daily shortlist of the three things trending hardest in each category - beauty, tech, home and kitchen, fitness and sport, pets, AI, finance and viral finds. Instead of scrolling for an hour, you get the products and stories with real momentum today in one place.",
  },
  {
    q: "How are the picks chosen?",
    a: "Every morning we scan social media, bestseller charts, communities and the news for what's gaining momentum, then rank the top three in each category. Where a trend has a real figure behind it - like units sold or views - we show it. Picks are never paid placements.",
  },
  {
    q: "How often is it updated?",
    a: "Every day. New picks land every morning, and previous days stay available on each category page so you can see how trends move.",
  },
  {
    q: "Where can I use it?",
    a: "Anywhere. Picks are chosen from what's trending worldwide, and shopping links take you to the right Amazon store for where you are.",
  },
  {
    q: "How does the site make money?",
    a: "Some links are affiliate links, so we may earn a small commission if you buy - at no extra cost to you. It never changes which products we pick.",
  },
];

export default async function Home() {
  // `sectors` is already in ranked home-page order (see lib/sectors.ts).
  const sectorsWithPreviews: SectorWithPreview[] = await Promise.all(
    sectors.map(async (sector) => {
      const row = await getLatestItemsForSector(sector.name);
      const topItem = row?.items.find((item) => item.rank === 1);
      return { ...sector, preview: topItem?.headline ?? null };
    })
  );

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    itemListJsonLd(
      "Today's top 3 trending products by category",
      "/",
      sectors.map((s) => ({ name: s.name, path: `/sector/${s.slug}` }))
    ),
  ];

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <header className="max-w-[980px] mx-auto text-center mb-6 sm:mb-8">
        <h1 className="neon-heading text-4xl sm:text-5xl font-black tracking-tight">
          Today&apos;s Top Three
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "#d4d4d8" }}>
          The 3 things trending right now in every category. Updated daily.
        </p>
        <p
          className="mt-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#a1a1aa" }}
        >
          {today}
        </p>
      </header>
      {/* Seasonal banner. Keep its text free of sector names - see the
          recorder note in components/site-footer.tsx. */}
      {showBlackFridayBanner() && (
        <Link
          href="/black-friday"
          className="block max-w-[980px] mx-auto mb-4 sm:mb-6 rounded-2xl px-4 py-3 text-center font-extrabold text-sm sm:text-base transition-transform hover:scale-[1.01]"
          style={{
            border: "1px solid #ff2ecb",
            background: "linear-gradient(90deg, #ff2ecb33, #a86bff22, #39d0ff33)",
            boxShadow: "0 0 24px #ff2ecb55",
          }}
        >
          🖤 Black Friday 2026: the most-wanted products →
        </Link>
      )}
      <SectorList sectors={sectorsWithPreviews} />

      <section
        className="max-w-[900px] mx-auto mt-14 flex flex-col gap-6 text-sm sm:text-base"
        style={{ color: "#d4d4d8" }}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2 text-white">
            Today&apos;s trending products, in one place
          </h2>
          <p className="leading-relaxed">
            Top 3 Today picks the three products and stories trending hardest
            right now in every category, refreshed every morning. Tap a category
            above to see today&apos;s picks, why each one is taking off, and
            where to find it.
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/best"
              className="rounded-full px-4 py-1.5 text-sm font-bold opacity-80 hover:opacity-100"
              style={{ border: "1px solid #ffffff44" }}
            >
              Best of the week →
            </Link>
            <Link
              href="/gifts"
              className="rounded-full px-4 py-1.5 text-sm font-bold opacity-80 hover:opacity-100"
              style={{ border: "1px solid #ffffff44" }}
            >
              Christmas gift ideas →
            </Link>
          </p>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3 text-white">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-bold text-white">{q}</h3>
                <p className="leading-relaxed mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
