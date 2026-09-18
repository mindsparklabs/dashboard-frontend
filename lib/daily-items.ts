import { supabase } from "@/lib/supabase";

export type DailyItem = {
  rank: number;
  headline: string;
  description: string;
  search_term: string;
};

export type DailyItemsRow = {
  sector: string;
  items: DailyItem[];
  created_at: string;
};

/**
 * `daily items` is append-only: every pipeline run inserts a new row per
 * sector rather than updating one in place. Callers only ever want today's
 * snapshot, so this always takes the single most recent row for the given
 * sector (by created_at) and never the full history.
 */
export async function getLatestItemsForSector(
  sectorName: string
): Promise<DailyItemsRow | null> {
  const { data, error } = await supabase
    .from("daily items")
    .select("sector, items, created_at")
    .eq("sector", sectorName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch latest "daily items" row for sector "${sectorName}": ${error.message}`
    );
  }

  return data as DailyItemsRow | null;
}
