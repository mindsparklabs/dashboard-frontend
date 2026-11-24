import Link from "next/link";
import type { Sector } from "@/lib/sectors";
import type { WeeklyItem } from "@/lib/weekly";
import { getItemCta } from "@/lib/item-cta";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { TrendStat } from "@/components/trend-stat";

/** Ranked gift cards for /gifts and /gifts/<slug>. */
export function GiftList({
  sector,
  items,
  headingLevel = "h3",
}: {
  sector: Sector;
  items: WeeklyItem[];
  headingLevel?: "h2" | "h3";
}) {
  const color = sector.color;
  const Heading = headingLevel;

  return (
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
                <Heading className="text-lg sm:text-xl font-extrabold leading-tight">
                  <Link href={`/item/${item.id}`} className="hover:underline">
                    {item.headline}
                  </Link>
                </Heading>
              </div>
            </div>

            <TrendStat stat={item.trend_stat} color={color} />

            <p className="text-sm sm:text-base opacity-80 leading-relaxed line-clamp-3">
              {item.description}
            </p>

            <div>
              <a
                href={`/go/${item.id}?from=gifts`}
                target="_blank"
                rel={cta.rel}
                className="inline-flex items-center justify-center rounded-full font-extrabold text-base px-6 py-2.5 transition-transform hover:scale-[1.04]"
                style={{ background: color, color: "#05050a", boxShadow: `0 0 22px ${color}88` }}
              >
                Check today&apos;s price →
              </a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
