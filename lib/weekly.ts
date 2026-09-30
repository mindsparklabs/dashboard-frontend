import { cache } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildItemId,
  type DailyItem,
  type DailyItemsRow,
} from "@/lib/daily-items";
import type { Sector } from "@/lib/sectors";

// Weekly archive helpers for /best/<sector>/<yyyy-wNN>.
//
// Weeks are ISO weeks (Monday-Sunday) on UK local dates, so an item saved at
// 00:30 BST on a Monday belongs to that Monday, not the Sunday before in UTC.
// Everything here reads the existing append-only `daily items` table - no
// extra pipeline runs or API calls.

const UK_TZ = "Europe/London";
const DAY_MS = 86_400_000;
const PAGE_SIZE = 1000;
export const WEEKLY_ITEM_LIMIT = 10;

export type WeekKey = { year: number; week: number };

const ukDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: UK_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** UK local calendar date ("YYYY-MM-DD") of a timestamp. */
export function ukDateKey(input: string | Date): string {
  return ukDateFormat.format(typeof input === "string" ? new Date(input) : input);
}

function dateKeyToUtc(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(key: string, days: number): string {
  return new Date(dateKeyToUtc(key).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function isoWeekOfDateKey(key: string): WeekKey {
  const d = dateKeyToUtc(key);
  const weekday = d.getUTCDay() || 7;
  // The Thursday of this week decides which year the ISO week belongs to.
  d.setUTCDate(d.getUTCDate() + 4 - weekday);
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7);
  return { year, week };
}

export function weekOf(timestamp: string | Date): WeekKey {
  return isoWeekOfDateKey(ukDateKey(timestamp));
}

export function currentWeek(): WeekKey {
  return weekOf(new Date());
}

export function weekSlug({ year, week }: WeekKey): string {
  return `${year}-w${String(week).padStart(2, "0")}`;
}

/** Monday of an ISO week as "YYYY-MM-DD". */
export function weekMonday({ year, week }: WeekKey): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const weekday = jan4.getUTCDay() || 7;
  jan4.setUTCDate(jan4.getUTCDate() - (weekday - 1) + (week - 1) * 7);
  return jan4.toISOString().slice(0, 10);
}

/** Parses "2026-w40". Returns null for anything malformed or not a real week. */
export function parseWeekSlug(slug: string): WeekKey | null {
  const match = /^(\d{4})-w(\d{2})$/.exec(slug);
  if (!match) return null;
  const week = { year: Number(match[1]), week: Number(match[2]) };
  if (week.week < 1 || week.week > 53) return null;
  // Round-trip check rejects e.g. week 53 in a 52-week year.
  if (weekSlug(isoWeekOfDateKey(weekMonday(week))) !== slug) return null;
  return week;
}

export function compareWeeks(a: WeekKey, b: WeekKey): number {
  return a.year - b.year || a.week - b.week;
}

/** "28 Sep 2026" - the Monday the week starts on. */
export function formatWeekOf(week: WeekKey): string {
  return dateKeyToUtc(weekMonday(week)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Best Trending Home & Kitchen UK" / "Best Viral Trends UK". */
export function weeklyTitle(sector: Sector): string {
  return sector.slug === "viral-trending"
    ? "Best Viral Trends UK"
    : `Best Trending ${sector.name} UK`;
}

export type WeeklyItem = DailyItem & {
  /** Latest occurrence's item id - used for /item and /go links. */
  id: string;
  daysInTop3: number;
  bestRank: number;
  lastSeen: string;
};

export type WeeklyResult = {
  items: WeeklyItem[];
  days: number;
  lastUpdated: string | null;
};

function mergeKey(item: DailyItem): string {
  return (item.search_term || item.headline || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * One sector's week: the latest run of each UK day, merged by search term,
 * ranked by days in the top 3, then best rank, then most recent.
 */
export const getWeeklyItems = cache(
  async (sectorName: string, week: WeekKey): Promise<WeeklyResult> => {
    const monday = weekMonday(week);
    const slug = weekSlug(week);

    // Pad the UTC range by a day either side, then filter on UK dates.
    const { data, error } = await supabase
      .from("daily items")
      .select("id, sector, items, created_at")
      .eq("sector", sectorName)
      .gte("created_at", dateKeyToUtc(addDays(monday, -1)).toISOString())
      .lt("created_at", dateKeyToUtc(addDays(monday, 8)).toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch weekly "daily items" for "${sectorName}" ${slug}: ${error.message}`
      );
    }

    // Latest row per UK day (rows are ascending, so later ones overwrite).
    const byDay = new Map<string, DailyItemsRow>();
    for (const row of (data ?? []) as DailyItemsRow[]) {
      if (weekSlug(weekOf(row.created_at)) !== slug) continue;
      byDay.set(ukDateKey(row.created_at), row);
    }

    const merged = new Map<string, WeeklyItem>();
    for (const row of byDay.values()) {
      for (const item of row.items ?? []) {
        const key = mergeKey(item);
        if (!key) continue;
        const previous = merged.get(key);
        merged.set(key, {
          // Newest copy wins for the text, so the page shows the freshest
          // description and stat for a repeat pick.
          ...item,
          id: buildItemId(row.id, item.rank),
          daysInTop3: (previous?.daysInTop3 ?? 0) + 1,
          bestRank: Math.min(previous?.bestRank ?? item.rank, item.rank),
          lastSeen: row.created_at,
        });
      }
    }

    const items = [...merged.values()]
      .sort(
        (a, b) =>
          b.daysInTop3 - a.daysInTop3 ||
          a.bestRank - b.bestRank ||
          b.lastSeen.localeCompare(a.lastSeen)
      )
      .slice(0, WEEKLY_ITEM_LIMIT);

    const rows = [...byDay.values()];
    return {
      items,
      days: rows.length,
      lastUpdated: rows.length ? rows[rows.length - 1].created_at : null,
    };
  }
);

export type WeekIndexEntry = {
  sector: string;
  week: WeekKey;
  slug: string;
  /** Newest row in that week - used as the sitemap lastModified. */
  lastModified: string;
};

/**
 * Every (sector, week) that has data, newest week first. Reads only the
 * sector and timestamp columns, paging past Supabase's 1000-row cap.
 */
export const getWeekIndex = cache(
  async (sectorName?: string): Promise<WeekIndexEntry[]> => {
    const latest = new Map<string, WeekIndexEntry>();

    for (let from = 0; ; from += PAGE_SIZE) {
      let query = supabase
        .from("daily items")
        .select("sector, created_at")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (sectorName) query = query.eq("sector", sectorName);

      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch week index: ${error.message}`);
      }

      for (const row of (data ?? []) as { sector: string; created_at: string }[]) {
        const week = weekOf(row.created_at);
        const slug = weekSlug(week);
        const key = `${row.sector}|${slug}`;
        // Descending order: the first row seen per week is its newest.
        if (!latest.has(key)) {
          latest.set(key, {
            sector: row.sector,
            week,
            slug,
            lastModified: row.created_at,
          });
        }
      }

      if (!data || data.length < PAGE_SIZE) break;
    }

    return [...latest.values()].sort((a, b) => compareWeeks(b.week, a.week));
  }
);
