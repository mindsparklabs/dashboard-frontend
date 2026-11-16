import type { Metadata } from "next";
import Link from "next/link";
import { sectors } from "@/lib/sectors";
import { getItemCta } from "@/lib/item-cta";
import { getRecentTopItems, type WeeklyItem } from "@/lib/weekly";
import {
  BLACK_FRIDAY_START_ISO,
  blackFridayPhase,
} from "@/lib/seasonal";
import { AMAZON_DISCLOSURE, SITE_NAME, SITE_URL } from "@/lib/site";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { TrendStat } from "@/components/trend-stat";
import { Countdown } from "@/components/countdown";

// Black Friday hub: each shopping sector's most persistent picks from the
// last two weeks of daily top 3s. Reads the existing `daily items` table only
// (no extra pipeline runs). We don't have live prices, so the page never
// claims a discount - the button sends people to check the current price.
export const revalidate = 3600;

const WINDOW_DAYS = 14;
const PER_SECTOR = 3;
const TITLE = "Black Friday 2026: The Most-Wanted Trending Products";
const DESCRIPTION =
  "The products everyone actually wants this Black Friday, ranked by how long they've held a daily top 3 spot. Beauty, tech, home, fitness, pets and viral hits - check the Black Friday price before they sell out.";

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/black-friday" },
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    url: "/black-friday",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const HERO = "#ff2ecb";

export default async function BlackFridayPage() {
  const shopping = sectors.filter((s) => s.amazonEligible);
  const sections = (
    await Promise.all(
      shopping.map(async (sector) => ({
        sector,
        items: await getRecentTopItems(sector.name, WINDOW_DAYS, PER_SECTOR).catch(
          () => [] as WeeklyItem[]
        ),
      }))
    )
  ).filter((s) => s.items.length > 0);

  const phase = blackFridayPhase();
  const headline =
    phase === "cyber-monday"
      ? "Cyber Monday is live"
      : phase === "black-friday"
        ? "Black Friday is live"
        : phase === "after"
          ? "Still trending after Black Friday"
          : "Black Friday starts in";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    url: `${SITE_URL}/black-friday`,
    numberOfItems: sections.reduce((n, s) => n + s.items.length, 0),
    itemListElement: sections.flatMap((s) => s.items).map((item, i) => ({
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

      <header className="max-w-[900px] mx-auto text-center mb-8">
        <Link
          href="/"
          className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: HERO }}
        >
          ← Today&apos;s top 3
        </Link>
        <p
          className="mt-5 text-xs sm:text-sm font-black uppercase tracking-[0.35em]"
          style={{ color: "#a1a1aa" }}
        >
          Black Friday 2026
        </p>
        <h1 className="neon-heading mt-2 text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
          The Most-Wanted Products
        </h1>
        <p
          className="mt-3 text-sm sm:text-base max-w-[620px] mx-auto"
          style={{ color: "#d4d4d8" }}
        >
          Not random deals - the things people actually want. Ranked by how long
          each one has held a spot in our daily top 3 over the last two weeks.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          {phase === "before" ? (
            <>
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">
                {headline}
              </p>
              <Countdown
                target={BLACK_FRIDAY_START_ISO}
                liveText="Black Friday is live"
                color={HERO}
              />
            </>
          ) : (
            <p
              className="text-2xl sm:text-3xl font-black"
              style={{ color: HERO, textShadow: `0 0 18px ${HERO}` }}
            >
              {headline}
            </p>
          )}
          <p className="text-xs sm:text-sm font-semibold text-white/60">
            Black Friday · Fri 27 Nov &nbsp;|&nbsp; Cyber Monday · Mon 30 Nov
          </p>
        </div>

        <nav className="mt-6 flex flex-wrap justify-center gap-2">
          {sections.map(({ sector }) => (
            <a
              key={sector.slug}
              href={`#${sector.slug}`}
              className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-bold transition-transform hover:scale-[1.05]"
              style={{
                color: sector.color,
                border: `1px solid ${sector.color}88`,
                background: `${sector.color}14`,
              }}
            >
              {sector.name}
            </a>
          ))}
        </nav>
      </header>

      <div className="max-w-[900px] mx-auto flex flex-col gap-10">
        {sections.map(({ sector, items }) => {
          const color = sector.color;
          return (
            <section key={sector.slug} id={sector.slug} className="scroll-mt-6">
              <div className="flex items-end justify-between gap-3 mb-4">
                <h2
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color, textShadow: `0 0 16px ${color}88` }}
                >
                  {sector.name}
                </h2>
                <Link
                  href={`/sector/${sector.slug}`}
                  className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  Today&apos;s top 3 →
                </Link>
              </div>

              <ol className="flex flex-col gap-4">
                {items.map((item, i) => {
                  const cta = getItemCta(item, sector, null);
                  return (
                    <li
                      key={item.id}
                      className="rounded-3xl backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3"
                      style={{
                        border: `1.5px solid ${color}`,
                        background: `linear-gradient(160deg, ${color}2a, ${color}08)`,
                        boxShadow: `0 0 28px ${color}44, inset 0 1px 0 ${color}44`,
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
                              In our top 3 on {item.daysInTop3}{" "}
                              {item.daysInTop3 === 1 ? "day" : "days"}
                            </span>
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold leading-tight">
                            <Link href={`/item/${item.id}`} className="hover:underline">
                              {item.headline}
                            </Link>
                          </h3>
                        </div>
                      </div>

                      <TrendStat stat={item.trend_stat} color={color} />

                      <p className="text-sm sm:text-base opacity-80 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>

                      <div>
                        <a
                          href={`/go/${item.id}?from=bf`}
                          target="_blank"
                          rel={cta.rel}
                          className="inline-flex items-center justify-center rounded-full font-extrabold text-base px-6 py-2.5 transition-transform hover:scale-[1.04]"
                          style={{
                            background: color,
                            color: "#05050a",
                            boxShadow: `0 0 22px ${color}88`,
                          }}
                        >
                          Check Black Friday price →
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        {sections.length === 0 && (
          <p className="text-center text-white/70">
            This week&apos;s picks are on the way - check back shortly.
          </p>
        )}
      </div>

      <div className="max-w-[900px] mx-auto mt-10 text-center flex flex-col gap-3">
        <Link
          href="/"
          className="mx-auto inline-flex rounded-full px-6 py-2.5 font-extrabold transition-transform hover:scale-[1.04]"
          style={{ background: HERO, color: "#05050a", boxShadow: `0 0 22px ${HERO}88` }}
        >
          See today&apos;s top 3 in every category →
        </Link>
        <p className="text-xs opacity-60">
          Prices change constantly over Black Friday - always check the final
          price before you buy. {AMAZON_DISCLOSURE}
        </p>
      </div>
    </main>
  );
}
