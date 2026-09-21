import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";
import { buildAffiliateLink } from "@/lib/affiliate";

// Items live inside an append-only `daily items` row that can be superseded
// at any time, so never serve a cached snapshot of this page either.
export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/item/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItemById(id);
  return {
    title: item ? item.headline : "Item not found",
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

  const sector = getSectorByName(item.sector);
  const accentColor = sector?.color ?? "#39d0ff";
  const affiliateHref = buildAffiliateLink("amazon", item.search_term);

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
          <span
            className="text-sm font-black tracking-widest"
            style={{ color: accentColor, textShadow: `0 0 14px ${accentColor}` }}
          >
            #{item.rank} · {item.sector}
          </span>

          <h1 className="neon-heading text-3xl sm:text-4xl font-black leading-tight">
            {item.headline}
          </h1>

          <p className="text-base sm:text-lg opacity-80 leading-relaxed">
            {item.description}
          </p>

          <a
            href={affiliateHref}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-flex items-center justify-center rounded-full font-extrabold text-base sm:text-lg px-8 py-3 mt-2 self-start transition-transform hover:scale-[1.03]"
            style={{
              background: accentColor,
              color: "#05050a",
              boxShadow: `0 0 25px ${accentColor}88`,
            }}
          >
            View on Amazon →
          </a>

          <span className="text-xs font-mono opacity-50">
            search: {item.search_term}
          </span>
        </div>
      </div>
    </main>
  );
}
