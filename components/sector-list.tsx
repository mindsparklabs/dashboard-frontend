import Link from "next/link";
import type { Sector } from "@/lib/sectors";
import { ItemThumbnail } from "@/components/item-thumbnail";

export type SectorWithPreview = Sector & { preview: string | null };

/**
 * Static home page list: one calm row per sector, in the ranked order from
 * lib/sectors.ts (highest sales/interest potential first). No rotation or
 * layout animation, so nothing shifts under the user's thumb.
 *
 * `data-sector` is the stable hook the daily video recorder (server.js on
 * the sector-reels VM) uses to find and tap a row - don't remove or rename
 * it without updating the recorder.
 */
export function SectorList({ sectors }: { sectors: SectorWithPreview[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[980px] mx-auto">
      {sectors.map((sector) => {
        const c = sector.color;
        return (
          <li key={sector.slug}>
            <Link
              href={`/sector/${sector.slug}`}
              data-sector={sector.slug}
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
                <p
                  className="mt-1 text-sm leading-snug line-clamp-2"
                  style={{ color: "#e4e4e7", opacity: 0.85 }}
                >
                  {sector.preview ?? "Today's picks are on the way."}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="text-2xl font-black shrink-0"
                style={{ color: c }}
              >
                ›
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
