import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById, ukDayKey } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";
import { getItemCta } from "@/lib/item-cta";
import { AMAZON_DISCLOSURE } from "@/lib/site";
import { ItemThumbnail } from "@/components/item-thumbnail";
import { TrendStat } from "@/components/trend-stat";
import { ExploreLinks } from "@/components/explore-links";
import {
  breadcrumbJsonLd,
  jsonLdHtml,
  longDateFromKey,
  metaDescription,
  sectorSeo,
  shortDate,
  SITE_NAME,
} from "@/lib/seo";

// An item's id points at one saved row + rank, so its content never changes
// after it is written. Cache for an hour; no request headers are read (the
// buy button goes via /go, which geo-routes), so this stays cacheable.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/item/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItemById(id).catch(() => null);
  if (!item) return { title: "Item not found" };

  const sector = getSectorByName(item.sector);
  const noun = sector ? sectorSeo(sector).noun : "products";
  const title = `${item.headline} – #${item.rank} trending ${noun}, ${shortDate(item.created_at)}`;
  const description = metaDescription(
    [item.description, item.why_it_matters].filter(Boolean).join(" ")
  );
  const path = `/item/${id}`;
  const image = `/pin/${id}.png`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: SITE_NAME, url: path, title: item.headline, description, images: [image] },
    twitter: { card: "summary_large_image", title: item.headline, description, images: [image] },
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

  const sector = getSectorByName(item.sector);
  const accentColor = sector?.color ?? "#39d0ff";
  // Button choice (Amazon / source / search fallback) lives in
  // lib/item-cta.ts so this page and the sector page cards always agree.
  const cta = getItemCta(item, sector, null);
  const dayKey = ukDayKey(item.created_at);
  const jsonLd = breadcrumbJsonLd([
    { name: SITE_NAME, path: "/" },
    ...(sector
      ? [
          { name: sector.name, path: `/sector/${sector.slug}` },
          { name: longDateFromKey(dayKey), path: `/sector/${sector.slug}/${dayKey}` },
        ]
      : []),
    { name: item.headline, path: `/item/${item.id}` },
  ]);

  return (
    <main className="ambient-bg min-h-screen w-screen px-3 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="max-w-[900px] mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-sm font-semibold mb-6 opacity-70 flex flex-wrap gap-x-2"
          style={{ color: accentColor }}
        >
          <Link href="/" className="hover:opacity-100">Home</Link>
          {sector && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/sector/${sector.slug}`} className="hover:opacity-100">{sector.name}</Link>
              <span aria-hidden>/</span>
              <Link href={`/sector/${sector.slug}/${dayKey}`} className="hover:opacity-100">{longDateFromKey(dayKey)}</Link>
            </>
          )}
        </nav>

        <div
          className="rounded-3xl backdrop-blur-xl p-6 sm:p-10 flex flex-col gap-5"
          style={{
            border: `1.5px solid ${accentColor}`,
            background: `linear-gradient(160deg, ${accentColor}30, ${accentColor}0a)`,
            boxShadow: `0 0 35px ${accentColor}77, 0 0 80px ${accentColor}33, inset 0 1px 0 ${accentColor}44`,
          }}
        >
          <div className="flex items-center gap-4">
            <ItemThumbnail
              imageUrl={item.image_url}
              alt={item.headline}
              color={accentColor}
              monogram={sector?.monogram ?? "T3"}
              className="size-20 sm:size-24"
            />
            <span
              className="text-sm font-black tracking-widest"
              style={{ color: accentColor, textShadow: `0 0 14px ${accentColor}` }}
            >
              #{item.rank} · {item.sector}
            </span>
          </div>

          <h1 className="neon-heading text-3xl sm:text-4xl font-black leading-tight">
            {item.headline}
          </h1>

          <TrendStat stat={item.trend_stat} color={accentColor} />

          <p
            className="text-base sm:text-lg opacity-80 leading-relaxed"
            style={{ color: "#f5f5f7" }}
          >
            {item.description}
          </p>

          {item.why_it_matters && (
            <p
              className="text-base leading-snug rounded-xl px-4 py-3"
              style={{
                color: "#f5f5f7",
                background: `${accentColor}14`,
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <span
                className="block text-xs font-black tracking-widest uppercase mb-1"
                style={{ color: accentColor }}
              >
                Why it matters
              </span>
              {item.why_it_matters}
            </p>
          )}

          <a
            href={`/go/${item.id}?from=item`}
            target="_blank"
            rel={cta.rel}
            className="inline-flex items-center justify-center rounded-full font-extrabold text-base sm:text-lg px-8 py-3 mt-2 self-start transition-transform hover:scale-[1.03]"
            style={{
              background: accentColor,
              color: "#05050a",
              boxShadow: `0 0 25px ${accentColor}88`,
            }}
          >
            {cta.label} →
          </a>

          {cta.isAffiliate && (
            <p className="text-xs opacity-60" style={{ color: "#f5f5f7" }}>
              {AMAZON_DISCLOSURE}
            </p>
          )}
        </div>

        {sector && (
          <p className="text-center text-sm mt-6 opacity-70" style={{ color: "#f5f5f7" }}>
            Picked #{item.rank} on{" "}
            <Link
              href={`/sector/${sector.slug}/${dayKey}`}
              className="underline hover:opacity-100"
            >
              {longDateFromKey(dayKey)}
            </Link>
          </p>
        )}

        {item.siblings && item.siblings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold mb-3" style={{ color: accentColor }}>
              Also trending{sector ? ` in ${sector.name}` : ""} that day
            </h2>
            <ul className="flex flex-col gap-2" style={{ color: "#f5f5f7" }}>
              {item.siblings.map((s) => (
                <li key={s.id}>
                  <Link href={`/item/${s.id}`} className="hover:underline">
                    #{s.rank} {s.headline}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ExploreLinks currentSlug={sector?.slug} />
      </div>
    </main>
  );
}