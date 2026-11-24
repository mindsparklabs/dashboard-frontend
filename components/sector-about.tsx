import Link from "next/link";
import type { Sector } from "@/lib/sectors";
import { sectorSeo, longDateFromKey } from "@/lib/seo";

/**
 * Text block under the item cards on /sector/<slug> pages: a short intro,
 * links to previous days' picks, and the weekly / gift-guide pages.
 *
 * Link text here must never contain a sector name - the video recorder
 * matches links loosely by sector name (see components/site-footer.tsx).
 * Dates and generic labels only. Nothing in here is an <article>.
 */
export function SectorAbout({
  sector,
  previousDays,
  weeklyHref,
  currentDay,
}: {
  sector: Sector;
  /** UK date keys ("YYYY-MM-DD") with an archive page, newest first. */
  previousDays: string[];
  weeklyHref: string | null;
  /** Date key of the page being shown, excluded from the list. */
  currentDay?: string;
}) {
  const seo = sectorSeo(sector);
  const color = sector.color;
  const days = previousDays.filter((d) => d !== currentDay).slice(0, 14);

  return (
    <section
      className="max-w-[900px] mx-auto mt-12 flex flex-col gap-6 text-sm sm:text-base"
      style={{ color: "#d4d4d8" }}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color }}>
          About these {seo.noun}
        </h2>
        <p className="leading-relaxed">{seo.intro}</p>
        <p className="leading-relaxed mt-2 opacity-80">
          Picks are refreshed every morning from what's trending worldwide. Ranks
          reflect how strongly each trend is moving today, not paid placement.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {weeklyHref && (
          <Link
            href={weeklyHref}
            className="rounded-full px-4 py-1.5 text-sm font-bold opacity-80 hover:opacity-100"
            style={{ color, border: `1px solid ${color}77` }}
          >
            This week&apos;s best →
          </Link>
        )}
        {sector.amazonEligible && (
          <Link
            href={`/gifts/${sector.slug}`}
            className="rounded-full px-4 py-1.5 text-sm font-bold opacity-80 hover:opacity-100"
            style={{ color, border: `1px solid ${color}77` }}
          >
            Gift ideas →
          </Link>
        )}
      </div>

      {days.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold mb-2" style={{ color }}>
            Previous days
          </h2>
          <ul className="flex flex-wrap gap-2">
            {days.map((day) => (
              <li key={day}>
                <Link
                  href={`/sector/${sector.slug}/${day}`}
                  className="inline-block rounded-full px-3 py-1 text-xs sm:text-sm opacity-75 hover:opacity-100"
                  style={{ border: "1px solid #ffffff33" }}
                >
                  {longDateFromKey(day)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
