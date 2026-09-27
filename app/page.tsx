import { sectors } from "@/lib/sectors";
import { getLatestItemsForSector } from "@/lib/daily-items";
import { SectorList, type SectorWithPreview } from "@/components/sector-list";

// Preview headlines come from the same append-only `daily items` table as
// the sector/item pages, so the homepage must stay just as fresh.
export const revalidate = 0;

export default async function Home() {
  // `sectors` is already in ranked home-page order (see lib/sectors.ts).
  const sectorsWithPreviews: SectorWithPreview[] = await Promise.all(
    sectors.map(async (sector) => {
      const row = await getLatestItemsForSector(sector.name);
      const topItem = row?.items.find((item) => item.rank === 1);
      return { ...sector, preview: topItem?.headline ?? null };
    })
  );

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  });

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <header className="max-w-[980px] mx-auto text-center mb-6 sm:mb-8">
        <h1 className="neon-heading text-4xl sm:text-5xl font-black tracking-tight">
          Today&apos;s Top Three
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "#d4d4d8" }}>
          The 3 things trending right now in every category. Updated daily.
        </p>
        <p
          className="mt-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#a1a1aa" }}
        >
          {today}
        </p>
      </header>
      <SectorList sectors={sectorsWithPreviews} />
    </main>
  );
}
