import { sectors } from "@/lib/sectors";
import { getLatestItemsForSector } from "@/lib/daily-items";
import { SectorGrid, type SectorWithPreview } from "@/components/sector-grid";

// Preview headlines come from the same append-only `daily items` table as
// the sector/item pages, so the homepage must stay just as fresh.
export const revalidate = 0;

export default async function Home() {
  const sectorsWithPreviews: SectorWithPreview[] = await Promise.all(
    sectors.map(async (sector) => {
      const row = await getLatestItemsForSector(sector.name);
      const topItem = row?.items.find((item) => item.rank === 1);
      return { ...sector, preview: topItem?.headline ?? null };
    })
  );

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <h1 className="neon-heading text-center text-4xl sm:text-5xl font-black mb-8 tracking-tight">
        Today&apos;s Top Three
      </h1>
      <SectorGrid sectors={sectorsWithPreviews} />
    </main>
  );
}
