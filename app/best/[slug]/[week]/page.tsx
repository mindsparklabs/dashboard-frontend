import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug } from "@/lib/sectors";
import { getItemCta } from "@/lib/item-cta";
import { AMAZON_DISCLOSURE, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  compareWeeks,
  currentWeek,
  formatWeekOf,
  getWeekIndex,
  getWeeklyItems,
  parseWeekSlug,
  weeklyTitle,
} from "@/lib/weekly";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { TrendStat } from "@/components/trend-stat";

// Weekly archive page. The current week keeps filling up as the daily
// pipeline runs, so rebuild at most hourly; past weeks' data never changes.
export const revalidate = 3600;

// No weeks are built at deploy time - each is rendered on first visit, then
// cached (ISR).
export function generateStaticParams() {
  return [];
}

type Params = { slug: string; week: string };

async function load(params: Promise<Params>) {
  const { slug, week: weekParam } = await params;
  const sector = getSectorBySlug(slug);
  const week = parseWeekSlug(weekParam);
  if (!sector || !week || compareWeeks(week, currentWeek()) > 0) return null;

  const result = await getWeeklyItems(sector.name, week);
  if (result.items.length === 0) return null;

  const title = `${weeklyTitle(sector)} – Week of ${formatWeekOf(week)}`;
  return { sector, week, weekParam, title, ...result };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const data = await load(params);
  if (!data) return { title: `Week not found | ${SITE_NAME}` };

  const { sector, week, weekParam, title, items } = data;
  const noun = sector.amazonEligible ? "products" : "stories";
  const description =
    `The ${items.length} ${sector.name} ${noun} trending hardest in the UK in the week of ${formatWeekOf(week)}, ` +
    `ranked by how many days each held a top 3 spot. Top pick: ${items[0].headline}.`;
  const path = `/best/${sector.slug}/${weekParam}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: path,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function WeeklyBestPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const data = await load(params);
  if (!data) notFound();

  const { sector, week, weekParam, title, items, days } = data;
  const color = sector.color;
  const isLive = compareWeeks(week, currentWeek()) === 0;

  // Previous / next weeks that actually have data, for the nav links.
  const index = await getWeekIndex(sector.name);
  const position = index.findIndex((entry) => entry.slug === weekParam);
  const newer = position > 0 ? index[position - 1] : null;
  const older = position >= 0 ? index[position + 1] ?? null : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url: `${SITE_URL}/best/${sector.slug}/${weekParam}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.headline,
      url: `${SITE_URL}/item/${item.id}`,
    })),
  };

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-[900px] mx-auto mb-8">
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold mb-4"
          style={{ color }}
        >
          <Link
            href={`/sector/${sector.slug}`}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            ← Today&apos;s top 3
          </Link>
          <Link
            href={`/best/${sector.slug}`}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            All weeks →
          </Link>
        </nav>

        <h1 className="neon-heading text-center text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          {weeklyTitle(sector)}
        </h1>
        <p
          className="text-center mt-2 text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#a1a1aa" }}
        >
          Week of {formatWeekOf(week)}
          {isLive && (
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-[11px] align-middle"
              style={{ background: color, color: "#05050a" }}
            >
              Live
            </span>
          )}
        </p>
        <p
          className="text-center mt-3 text-sm sm:text-base max-w-[640px] mx-auto"
          style={{ color: "#d4d4d8" }}
        >
          {isLive
            ? `The ${sector.name} picks holding the top 3 most often so far this week (${days} ${days === 1 ? "day" : "days"} in). Updated as each day's picks land.`
            : `Every ${sector.name} pick that made our daily top 3 this week, ranked by how many days it held its spot.`}
        </p>
      </div>

      <ol className="flex flex-col gap-5 max-w-[900px] mx-auto">
        {items.map((item, i) => {
          const cta = getItemCta(item, sector, null);
          const itemHref = `/item/${item.id}`;
          return (
            <li
              key={item.id}
              className="relative rounded-3xl backdrop-blur-xl p-5 sm:p-6 flex flex-col gap-3"
              style={{
                border: `1.5px solid ${color}`,
                background: `linear-gradient(160deg, ${color}30, ${color}0a)`,
                boxShadow: `0 0 35px ${color}55, 0 0 80px ${color}22, inset 0 1px 0 ${color}44`,
              }}
            >
              <div className="flex items-start gap-4">
                <ItemThumbnail
                  imageUrl={item.image_url}
                  alt={item.headline}
                  color={color}
                  monogram={sector.monogram}
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <span
                    className="text-sm font-black tracking-widest"
                    style={{ color, textShadow: `0 0 14px ${color}` }}
                  >
                    #{i + 1}
                    <span className="ml-2 font-semibold tracking-normal text-xs text-white/70">
                      Top 3 on {item.daysInTop3}{" "}
                      {item.daysInTop3 === 1 ? "day" : "days"} · best #{item.bestRank}
                    </span>
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold leading-tight">
                    <Link href={itemHref} className="hover:underline">
                      {item.headline}
                    </Link>
                  </h2>
                </div>
              </div>

              <TrendStat stat={item.trend_stat} color={color} />

              <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                {item.description}
              </p>

              {item.why_it_matters && (
                <p
                  className="text-sm leading-snug rounded-xl px-3 py-2"
                  style={{
                    background: `${color}14`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <span
                    className="block text-[11px] font-black tracking-widest uppercase mb-0.5"
                    style={{ color }}
                  >
                    Why it matters
                  </span>
                  {item.why_it_matters}
                </p>
              )}

              <div className="mt-1">
                <a
                  href={`/go/${item.id}?from=week`}
                  target="_blank"
                  rel={cta.rel}
                  className="inline-flex items-center justify-center rounded-full font-extrabold text-base px-6 py-2.5 transition-transform hover:scale-[1.04]"
                  style={{
                    background: color,
                    color: "#05050a",
                    boxShadow: `0 0 22px ${color}88`,
                  }}
                >
                  {cta.label} →
                </a>
              </div>
            </li>
          );
        })}
      </ol>

      <nav
        className="max-w-[900px] mx-auto mt-8 flex items-center justify-between gap-3 text-sm font-semibold"
        style={{ color }}
      >
        {older ? (
          <Link
            href={`/best/${sector.slug}/${older.slug}`}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            ← Week of {formatWeekOf(older.week)}
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            href={`/best/${sector.slug}/${newer.slug}`}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            Week of {formatWeekOf(newer.week)} →
          </Link>
        )}
      </nav>

      {sector.amazonEligible && (
        <p className="text-center text-xs mt-6 opacity-60 max-w-[900px] mx-auto">
          {AMAZON_DISCLOSURE}
        </p>
      )}
    </main>
  );
}
