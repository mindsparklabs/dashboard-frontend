import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";
import { getItemCta } from "@/lib/item-cta";
import { AMAZON_DISCLOSURE } from "@/lib/site";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { TrendStat } from "@/components/trend-stat";

// Items live inside an append-only `daily items` row that can be superseded
// at any time, so never serve a cached snapshot of this page either.
export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/item/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItemById(id);
  return {
    title: item ? `${item.headline} | Top 3 Today` : "Item not found",
  };
}

export default async function ItemPage({
  params,
}: PageProps<"/item/[id]">) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  const headersList = await headers();
  const countryCode = headersList.get("x-vercel-ip-country");
  const sector = getSectorByName(item.sector);
  const accentColor = sector?.color ?? "#39d0ff";
  // Button choice (Amazon / source / search fallback) lives in
  // lib/item-cta.ts so this page and the sector page cards always agree.
  const cta = getItemCta(item, sector, countryCode);

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <div className="max-w-[900px] mx-auto">
        <Link
          href={sector ? `/sector/${sector.slug}` : "/"}
          className="inline-block text-sm font-semibold mb-6 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: accentColor }}
        >
          ← Back to {sector ? sector.name : "all sectors"}
        </Link>

        <div
          className="rounded-3xl backdrop-blur-xl p-6 sm:p-10 flex flex-col gap-5"
          style={{
            border: `1.5px solid ${accentColor}`,
            background: `linear-gradient(160deg, ${accentColor}30, ${accentColor}0a)`,
            boxShadow: `0 0 35px ${accentColor}77, 0 0 80px ${accentColor}33, inset 0 1px 0 ${accentColor}44`,
          }}
        >
          <div className="flex items-center gap-4">
            <ItemThumbnail
              imageUrl={item.image_url}
              alt={item.headline}
              color={accentColor}
              monogram={sector?.monogram ?? "T3"}
              className="size-20 sm:size-24"
            />
            <span
              className="text-sm font-black tracking-widest"
              style={{ color: accentColor, textShadow: `0 0 14px ${accentColor}` }}
            >
              #{item.rank} · {item.sector}
            </span>
          </div>

          <h1 className="neon-heading text-3xl sm:text-4xl font-black leading-tight">
            {item.headline}
          </h1>

          <TrendStat stat={item.trend_stat} color={accentColor} />

          <p
            className="text-base sm:text-lg opacity-80 leading-relaxed"
            style={{ color: "#f5f5f7" }}
          >
            {item.description}
          </p>

          {item.why_it_matters && (
            <p
              className="text-base leading-snug rounded-xl px-4 py-3"
              style={{
                color: "#f5f5f7",
                background: `${accentColor}14`,
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <span
                className="block text-xs font-black tracking-widest uppercase mb-1"
                style={{ color: accentColor }}
              >
                Why it matters
              </span>
              {item.why_it_matters}
            </p>
          )}

          <a
            href={cta.href}
            target="_blank"
            rel={cta.rel}
            className="inline-flex items-center justify-center rounded-full font-extrabold text-base sm:text-lg px-8 py-3 mt-2 self-start transition-transform hover:scale-[1.03]"
            style={{
              background: accentColor,
              color: "#05050a",
              boxShadow: `0 0 25px ${accentColor}88`,
            }}
          >
            {cta.label} →
          </a>

          {cta.isAffiliate && (
            <p className="text-xs opacity-60" style={{ color: "#f5f5f7" }}>
              {AMAZON_DISCLOSURE}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}