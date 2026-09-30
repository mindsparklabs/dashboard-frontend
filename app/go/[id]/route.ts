import { NextResponse, after, type NextRequest } from "next/server";
import { getItemById } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";
import { getItemCta } from "@/lib/item-cta";
import { CLICK_LOG_KEY, CLICK_LOG_URL } from "@/lib/site";

// Outbound click redirect: /go/<rowId>_<rank>?from=sector|item
//
// Every buy / read button points here instead of straight at Amazon or the
// source, so we can count clicks for the weekly stats email. The target is
// worked out server-side from the item id (never taken from the URL), so
// this can't be abused as an open redirect. The click is logged to n8n in
// the background (after the response is sent), so the visitor isn't slowed
// down and a logging failure never blocks the redirect.
export const dynamic = "force-dynamic";

const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|monitor/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await getItemById(id).catch(() => null);

  if (!item) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const sector = getSectorByName(item.sector);
  const country = request.headers.get("x-vercel-ip-country");
  const cta = getItemCta(item, sector, country);
  const target = new URL(cta.href, request.url);

  const userAgent = request.headers.get("user-agent") ?? "";
  if (CLICK_LOG_URL && !BOT_UA.test(userAgent)) {
    const from = request.nextUrl.searchParams.get("from") ?? "";
    after(async () => {
      try {
        await fetch(CLICK_LOG_URL, {
          method: "POST",
          headers: { "content-type": "application/json", "x-t3t-key": CLICK_LOG_KEY },
          body: JSON.stringify({
            item_id: id,
            sector: item.sector,
            rank: item.rank,
            name: item.search_term || item.headline,
            cta: cta.label,
            country: country ?? "",
            from: from.slice(0, 20),
          }),
          signal: AbortSignal.timeout(4000),
        });
      } catch {
        // Stats only - never let logging affect the visitor.
      }
    });
  }

  const response = NextResponse.redirect(target, 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
