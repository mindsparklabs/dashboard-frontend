import Link from "next/link";
import { sectors } from "@/lib/sectors";

// Internal links at the foot of inner pages, so no page is a dead end for
// visitors or search engines: home, the other sectors, weekly best, gifts.
//
// NEVER render this with sectors on the home page or on /sector/[slug]: the
// daily video recorder matches links there by sector name (see the note in
// components/site-footer.tsx). Pass showSectors={false} on recorder pages.
export function ExploreLinks({
  currentSlug,
  showSectors = true,
}: {
  currentSlug?: string;
  showSectors?: boolean;
}) {
  const others = showSectors ? sectors.filter((s) => s.slug !== currentSlug) : [];
  return (
    <nav
      aria-label="Explore Top 3 Today"
      className="max-w-[900px] mx-auto mt-10 text-center text-sm"
      style={{ color: "#a1a1aa" }}
    >
      <p className="font-extrabold uppercase tracking-widest mb-3" style={{ color: "#ededed" }}>
        Explore more
      </p>
      {others.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={`/sector/${s.slug}`}
              className="font-semibold hover:opacity-100 opacity-80"
              style={{ color: s.color }}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-semibold">
        <Link href="/" className="hover:text-white">Today&apos;s top 3s</Link>
        <Link href="/best" className="hover:text-white">Weekly best</Link>
        <Link href="/gifts" className="hover:text-white">Gift ideas</Link>
      </div>
    </nav>
  );
}
