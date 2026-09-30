import type { Metadata } from "next";
import Link from "next/link";
import { sectors } from "@/lib/sectors";
import { SITE_NAME } from "@/lib/site";
import { formatWeekOf, getWeekIndex } from "@/lib/weekly";
import { ItemThumbnail } from "@/components/item-thumbnail";

export const revalidate = 3600;

const title = "Best Trending Products UK – Weekly Top Picks";
const description =
  "Each week's most consistent UK trends across beauty, tech, home & kitchen, fitness/sport, pets, AI, finance and viral picks - ranked by days in the daily top 3.";

export const metadata: Metadata = {
  title: `${title} | ${SITE_NAME}`,
  description,
  alternates: { canonical: "/best" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: "/best",
    title,
    description,
  },
};

// Deliberately no data-sector attributes here: that hook belongs to the
// home page tiles the video recorder taps.
export default async function BestIndexPage() {
  const index = await getWeekIndex();

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <header className="max-w-[980px] mx-auto text-center mb-6 sm:mb-8">
        <h1 className="neon-heading text-3xl sm:text-5xl font-black tracking-tight">
          Best of the Week
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "#d4d4d8" }}>
          The trends that held the top 3 most often, week by week, in every
          category.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[980px] mx-auto">
        {sectors.map((sector) => {
          const c = sector.color;
          const latest = index.find((entry) => entry.sector === sector.name);
          return (
            <li key={sector.slug}>
              <Link
                href={latest ? `/best/${sector.slug}/${latest.slug}` : `/best/${sector.slug}`}
                className="h-full flex items-center gap-4 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  border: `1px solid ${c}77`,
                  background: `linear-gradient(160deg, ${c}26, ${c}08)`,
                  boxShadow: `0 0 18px ${c}33, inset 0 1px 0 ${c}33`,
                }}
              >
                <ItemThumbnail
                  alt=""
                  color={c}
                  monogram={sector.monogram}
                  className="size-14 sm:size-16"
                />
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-lg sm:text-xl font-extrabold leading-tight"
                    style={{ color: c, textShadow: `0 0 12px ${c}88` }}
                  >
                    {sector.name}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "#e4e4e7", opacity: 0.85 }}>
                    {latest ? `Week of ${formatWeekOf(latest.week)}` : "First week on the way"}
                  </p>
                </div>
                <span aria-hidden="true" className="text-2xl font-black shrink-0" style={{ color: c }}>
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
