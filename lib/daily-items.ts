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
  // One-line "why it matters" hook written by the curation step. Optional:
  // older rows (and any run where the model skips it) simply won't have it,
  // and the UI hides the line rather than showing an empty box.
  why_it_matters?: string | null;
  // Short real figure showing the scale of the trend ("413k sold on TikTok
  // Shop UK"). Only stored when its numbers appear in the scan sources.
  trend_stat?: string | null;
  // Product image URL. Only populated once Amazon image access is available
  // (PA-API / Creators API); until then the UI shows a sector-coloured
  // monogram placeholder instead.
  image_url?: string | null;
  // Exact Amazon product IDs found by the n8n pipeline (UK / US stores).
  // When present, the buy button links straight to the product page.
  amazon_asin_uk?: string | null;
  amazon_asin_us?: string | null;
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
  /** The other picks from the same day and sector (only set by getItemById), for "also trending" links. */
  siblings?: { id: string; rank: number; headline: string }[];
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

const UK_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** UK calendar date ("YYYY-MM-DD") of a timestamp. */
export function ukDayKey(input: string | Date): string {
  return UK_DAY.format(typeof input === "string" ? new Date(input) : input);
}

/**
 * Latest row per UK day for one sector (or all sectors), newest first,
 * covering the last `days` days. Powers the daily archive pages, their
 * "Previous days" links and the sitemap. Read-only; no pipeline cost.
 */
export async function getDailyRows(
  days: number,
  sectorName?: string
): Promise<DailyItemsRow[]> {
  const since = new Date(Date.now() - (days + 1) * 86_400_000).toISOString();
  let query = supabase
    .from("daily items")
    .select("id, sector, items, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (sectorName) query = query.eq("sector", sectorName);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch daily rows: ${error.message}`);
  }

  // Descending order: the first row seen per sector+day is that day's latest.
  const seen = new Set<string>();
  const rows: DailyItemsRow[] = [];
  for (const row of (data ?? []) as DailyItemsRow[]) {
    const key = `${row.sector}|${ukDayKey(row.created_at)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows;
}

/** One sector's final row for a UK day ("YYYY-MM-DD"), or null. */
export async function getSectorRowForDay(
  sectorName: string,
  dayKey: string
): Promise<DailyItemsRow | null> {
  const [y, m, d] = dayKey.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d) - 86_400_000).toISOString();
  const end = new Date(Date.UTC(y, m - 1, d) + 2 * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("daily items")
    .select("id, sector, items, created_at")
    .eq("sector", sectorName)
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch "${sectorName}" for ${dayKey}: ${error.message}`);
  }
  const row = ((data ?? []) as DailyItemsRow[]).find(
    (r) => ukDayKey(r.created_at) === dayKey
  );
  return row ?? null;
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
    siblings: row.items
      .filter((entry) => entry.rank !== parsed.rank)
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => ({ id: buildItemId(row.id, entry.rank), rank: entry.rank, headline: entry.headline })),
  };
}
