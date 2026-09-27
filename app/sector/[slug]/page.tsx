import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getSectorBySlug, sectors } from "@/lib/sectors";
import { buildItemId, getLatestItemsForSector } from "@/lib/daily-items";
import { getItemCta } from "@/lib/item-cta";
import { AMAZON_DISCLOSURE } from "@/lib/site";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { ShareButton } from "@/components/share-button";

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
    title: sector ? `${sector.name} | Top 3 Today` : "Sector not found",
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
  // Same geo header the item page uses, so UK visitors get amazon.co.uk and
  // US visitors get amazon.com straight from the sector page.
  const countryCode = (await headers()).get("x-vercel-ip-country");
  const color = sector.color;

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
            Updated{" "}
            {new Date(row.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-center opacity-70 mt-16">
          No data yet for {sector.name}. Check back after the next pipeline
          run.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1400px] mx-auto">
            {items.map((item) => {
              const itemHref = row
                ? `/item/${buildItemId(row.id, item.rank)}`
                : "#";
              const cta = getItemCta(item, sector, countryCode);

              return (
                // The card is a plain container, not one big link: the
                // headline link is stretched over the whole card (::after)
                // so tapping anywhere opens the item page, while the buy
                // button sits above that layer and goes straight out.
                // Nesting an <a> inside a <Link> would be invalid HTML.
                <article
                  key={item.rank}
                  className="relative rounded-3xl backdrop-blur-xl p-5 sm:p-6 flex flex-col gap-3 transition-transform hover:scale-[1.02]"
                  style={{
                    border: `1.5px solid ${color}`,
                    background: `linear-gradient(160deg, ${color}30, ${color}0a)`,
                    boxShadow: `0 0 35px ${color}77, 0 0 80px ${color}33, inset 0 1px 0 ${color}44`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <ItemThumbnail
                      imageUrl={item.image_url}
                      alt={item.headline}
                      color={color}
                      monogram={sector.monogram}
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className="text-sm font-black tracking-widest"
                        style={{ color, textShadow: `0 0 14px ${color}` }}
                      >
                        #{item.rank}
                      </span>
                      <h2 className="text-lg sm:text-2xl font-extrabold leading-tight">
                        <Link
                          href={itemHref}
                          className="after:absolute after:inset-0 after:z-[1] after:rounded-3xl focus-visible:outline-none"
                        >
                          {item.headline}
                        </Link>
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                    {item.description}
                  </p>

                  {item.why_it_matters && (
                    <p
                      className="text-sm leading-snug rounded-xl px-3 py-2"
                      style={{
                        background: `${color}14`,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <span
                        className="block text-[11px] font-black tracking-widest uppercase mb-0.5"
                        style={{ color }}
                      >
                        Why it matters
                      </span>
                      {item.why_it_matters}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-3">
                    <a
                      href={cta.href}
                      target="_blank"
                      rel={cta.rel}
                      className="relative z-10 flex-1 sm:flex-none inline-flex items-center justify-center rounded-full font-extrabold text-base px-6 py-2.5 transition-transform hover:scale-[1.04]"
                      style={{
                        background: color,
                        color: "#05050a",
                        boxShadow: `0 0 22px ${color}88`,
                      }}
                    >
                      {cta.label} →
                    </a>
                    <ShareButton path={itemHref} title={item.headline} color={color} />
                  </div>
                </article>
              );
            })}
          </div>

          {sector.amazonEligible && (
            <p className="text-center text-xs mt-6 opacity-60 max-w-[1400px] mx-auto">
              {AMAZON_DISCLOSURE}
            </p>
          )}
        </>
      )}
    </main>
  );
}
