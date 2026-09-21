import { supabase } from "@/lib/supabase";

export type DailyItem = {
  rank: number;
  headline: string;
  description: string;
  search_term: string;
  // URL of the original trend source article. Not selected specially -
  // it's part of the same `items` jsonb blob as everything else above -
  // just typed here so pages can use it. Assumed field name; if the n8n
  // pipeline actually writes a different key, this is a one-line fix.
  source?: string;
};

export type DailyItemsRow = {
  id: string | number;
  sector: string;
  items: DailyItem[];
  created_at: string;
};

export type ItemWithContext = DailyItem & {
  /** Opaque id for /item/[id] routing: `${rowId}_${rank}`. */
  id: string;
  rowId: string | number;
  sector: string;
  created_at: string;
};

const ITEM_ID_SEPARATOR = "_";

/**
 * Items don't carry their own id in `daily items.items` (jsonb) — only
 * `rank` within the row. Build a routable id from the row's real primary
 * key plus the item's rank, and reverse it in getItemById().
 */
export function buildItemId(rowId: string | number, rank: number): string {
  return `${rowId}${ITEM_ID_SEPARATOR}${rank}`;
}

function parseItemId(
  id: string
): { rowId: string; rank: number } | null {
  const separatorIndex = id.lastIndexOf(ITEM_ID_SEPARATOR);
  if (separatorIndex === -1) return null;

  const rowId = id.slice(0, separatorIndex);
  const rank = Number(id.slice(separatorIndex + 1));
  if (!rowId || Number.isNaN(rank)) return null;

  return { rowId, rank };
}

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
    .select("id, sector, items, created_at")
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

/**
 * Looks up a single item by the composite id built with buildItemId().
 * Fetches the row it lives in by primary key, then picks out the matching
 * rank from that row's `items` array. Returns null if the id is malformed,
 * the row doesn't exist, or the row no longer contains that rank.
 */
export async function getItemById(
  id: string
): Promise<ItemWithContext | null> {
  const parsed = parseItemId(id);
  if (!parsed) return null;

  const { data, error } = await supabase
    .from("daily items")
    .select("id, sector, items, created_at")
    .eq("id", parsed.rowId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch "daily items" row "${parsed.rowId}": ${error.message}`
    );
  }
  if (!data) return null;

  const row = data as DailyItemsRow;
  const item = row.items.find((entry) => entry.rank === parsed.rank);
  if (!item) return null;

  return {
    ...item,
    id,
    rowId: row.id,
    sector: row.sector,
    created_at: row.created_at,
  };
}
