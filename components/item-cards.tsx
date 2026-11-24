import Link from "next/link";
import type { Sector } from "@/lib/sectors";
import { buildItemId, type DailyItemsRow } from "@/lib/daily-items";
import { getItemCta } from "@/lib/item-cta";
import { AMAZON_DISCLOSURE } from "@/lib/site";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { ShareButton } from "@/components/share-button";
import { TrendStat } from "@/components/trend-stat";

/**
 * The three neon item cards used by /sector/<slug> and its daily archive
 * pages. Each card is a `main article` - the video recorder scrolls to
 * exactly these, so keep one <article> per item and nothing else as an
 * <article> on these pages.
 */
export function ItemCards({
  row,
  sector,
  from,
}: {
  row: DailyItemsRow;
  sector: Sector;
  /** Click-stats tag for /go links. */
  from: string;
}) {
  const items = (row.items ?? []).slice().sort((a, b) => a.rank - b.rank);
  const color = sector.color;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1400px] mx-auto">
        {items.map((item) => {
          const itemId = buildItemId(row.id, item.rank);
          const itemHref = `/item/${itemId}`;
          // Country only changes the outbound href, and the button always
          // goes via /go (which geo-routes itself), so no request headers
          // are needed here - that keeps these pages cacheable.
          const cta = getItemCta(item, sector, null);

          return (
            // The card is a plain container, not one big link: the
            // headline link is stretched over the whole card (::after)
            // so tapping anywhere opens the item page, while the buy
            // button sits above that layer and goes straight out.
            <article
              key={item.rank}
              className="relative rounded-3xl backdrop-blur-xl p-5 sm:p-6 flex flex-col gap-3 transition-transform hover:scale-[1.02]"
              style={{
                border: `1.5px solid ${color}`,
                background: `linear-gradient(160deg, ${color}30, ${color}0a)`,
                boxShadow: `0 0 35px ${color}77, 0 0 80px ${color}33, inset 0 1px 0 ${color}44`,
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
                    #{item.rank}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold leading-tight">
                    <Link
                      href={itemHref}
                      className="after:absolute after:inset-0 after:z-[1] after:rounded-3xl focus-visible:outline-none"
                    >
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

              <div className="mt-auto flex items-center gap-3">
                <a
                  href={`/go/${itemId}?from=${from}`}
                  target="_blank"
                  rel={cta.rel}
                  className="relative z-10 flex-1 sm:flex-none inline-flex items-center justify-center rounded-full font-extrabold text-base px-6 py-2.5 transition-transform hover:scale-[1.04]"
                  style={{
                    background: color,
                    color: "#05050a",
                    boxShadow: `0 0 22px ${color}88`,
                  }}
                >
                  {cta.label} →
                </a>
                <ShareButton path={itemHref} title={item.headline} color={color} />
              </div>
            </article>
          );
        })}
      </div>

      {sector.amazonEligible && (
        <p className="text-center text-xs mt-6 opacity-60 max-w-[1400px] mx-auto">
          {AMAZON_DISCLOSURE}
        </p>
      )}
    </>
  );
}
