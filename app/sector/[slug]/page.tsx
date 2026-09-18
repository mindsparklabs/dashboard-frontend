import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBySlug, sectors } from "@/lib/sectors";
import { getLatestItemsForSector } from "@/lib/daily-items";

// `daily items` is append-only and a new row can land at any time, so this
// page must never serve a cached snapshot.
export const revalidate = 0;

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sector/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  return {
    title: sector ? `${sector.name} — Today's Top 3` : "Sector not found",
  };
}

export default async function SectorPage({
  params,
}: PageProps<"/sector/[slug]">) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);

  if (!sector) {
    notFound();
  }

  const row = await getLatestItemsForSector(sector.name);
  const items = (row?.items ?? []).slice().sort((a, b) => a.rank - b.rank);

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <div className="max-w-[1400px] mx-auto mb-8">
        <Link
          href="/"
          className="inline-block text-sm font-semibold mb-4 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: sector.color }}
        >
          ← Back to all sectors
        </Link>
        <h1 className="neon-heading text-center text-4xl sm:text-5xl font-black tracking-tight">
          {sector.name}
        </h1>
        {row?.created_at && (
          <p className="text-center text-sm mt-2 opacity-60">
            Updated {new Date(row.created_at).toLocaleString()}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-center opacity-70 mt-16">
          No data yet for {sector.name}. Check back after the next pipeline
          run.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1400px] mx-auto">
          {items.map((item) => (
            <div
              key={item.rank}
              className="rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-3 min-h-[260px]"
              style={{
                border: `1.5px solid ${sector.color}`,
                background: `linear-gradient(160deg, ${sector.color}30, ${sector.color}0a)`,
                boxShadow: `0 0 35px ${sector.color}77, 0 0 80px ${sector.color}33, inset 0 1px 0 ${sector.color}44`,
              }}
            >
              <span
                className="text-sm font-black tracking-widest"
                style={{
                  color: sector.color,
                  textShadow: `0 0 14px ${sector.color}`,
                }}
              >
                #{item.rank}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                {item.headline}
              </h2>
              <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                {item.description}
              </p>
              <span className="mt-auto text-xs font-mono opacity-60">
                search: {item.search_term}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
