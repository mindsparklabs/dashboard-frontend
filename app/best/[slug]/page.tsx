import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug, sectors } from "@/lib/sectors";
import { SITE_NAME } from "@/lib/site";
import {
  compareWeeks,
  currentWeek,
  formatWeekOf,
  getWeekIndex,
  weeklyTitle,
} from "@/lib/weekly";

// Hub listing every week for one sector. A new week appears once its first
// daily run lands, so refresh hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) return { title: `Not found | ${SITE_NAME}` };

  const title = `${weeklyTitle(sector)} – Weekly Archive`;
  const description = `Every week's most consistent ${sector.name} trends in the UK, ranked by how many days they held a top 3 spot.`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/best/${sector.slug}` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: `/best/${sector.slug}`,
      title,
      description,
    },
  };
}

export default async function SectorWeeksPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) notFound();

  const weeks = await getWeekIndex(sector.name);
  const now = currentWeek();
  const color = sector.color;

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <div className="max-w-[720px] mx-auto">
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
          <Link href="/best" className="opacity-70 hover:opacity-100 transition-opacity">
            Every category →
          </Link>
        </nav>

        <h1 className="neon-heading text-center text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          {weeklyTitle(sector)}
        </h1>
        <p className="text-center mt-3 text-sm sm:text-base" style={{ color: "#d4d4d8" }}>
          The week-by-week archive: the picks that held the top 3 most often.
        </p>

        {weeks.length === 0 ? (
          <p className="text-center opacity-70 mt-12">No weeks yet - check back soon.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {weeks.map((entry) => {
              const live = compareWeeks(entry.week, now) === 0;
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/best/${sector.slug}/${entry.slug}`}
                    className="flex items-center justify-between gap-4 rounded-2xl p-4 backdrop-blur-xl transition-transform hover:scale-[1.02]"
                    style={{
                      border: `1px solid ${color}77`,
                      background: `linear-gradient(160deg, ${color}26, ${color}08)`,
                      boxShadow: `0 0 18px ${color}33, inset 0 1px 0 ${color}33`,
                    }}
                  >
                    <span className="text-lg font-extrabold">
                      Week of {formatWeekOf(entry.week)}
                    </span>
                    <span
                      className="text-xs font-black uppercase tracking-widest shrink-0"
                      style={{ color }}
                    >
                      {live ? "This week · live" : "›"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
