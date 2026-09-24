import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
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
  // Some sectors (AI, Finance) have no Amazon-eligible products - this is
  // a per-sector flag in lib/sectors.ts, not a hardcoded sector check here,
  // so adding another non-Amazon sector later is a one-line config change.
  const showAmazonLink = sector?.amazonEligible ?? true;
  const affiliateHref = showAmazonLink
    ? buildAffiliateLink("amazon", item.search_term, countryCode)
    : null;
  // Non-Amazon-eligible sectors should link back to the original article via
  // item.source, but the n8n pipeline doesn't populate that field for every
  // sector yet (e.g. Finance items currently have no source URL at all). Fall
  // back to a generic search on the headline so the page never ends up with
  // no call-to-action while that data gap gets filled in on the n8n side.
  const sourceHref = !showAmazonLink ? item.source ?? null : null;
  const searchFallbackHref =
    !showAmazonLink && !sourceHref
      ? `https://www.google.com/search?q=${encodeURIComponent(item.headline)}`
      : null;

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

          <p
            className="text-base sm:text-lg opacity-80 leading-relaxed"
            style={{ color: "#f5f5f7" }}
          >
            {item.description}
          </p>

          {affiliateHref ? (
            
           <a href={affiliateHref}
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
          ) : sourceHref ? (
            
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center rounded-full font-extrabold text-base sm:text-lg px-8 py-3 mt-2 self-start transition-transform hover:scale-[1.03]"
              style={{
                background: accentColor,
                color: "#05050a",
                boxShadow: `0 0 25px ${accentColor}88`,
              }}
            >
              Read the source →
            </a>
          ) : (
            searchFallbackHref && (
              
                href={searchFallbackHref}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center rounded-full font-extrabold text-base sm:text-lg px-8 py-3 mt-2 self-start transition-transform hover:scale-[1.03]"
                style={{
                  background: accentColor,
                  color: "#05050a",
                  boxShadow: `0 0 25px ${accentColor}88`,
                }}
              >
                Search for more →
              </a>
            )
          )}
        </div>
      </div>
    </main>
  );
}