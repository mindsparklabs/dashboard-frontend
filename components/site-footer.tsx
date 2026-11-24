import Link from "next/link";
import { FOOTER_DISCLOSURE, SITE_NAME, SOCIAL_LINKS } from "@/lib/site";
import { CookieSettingsLink } from "@/components/cookie-consent";

// NOTE: the daily video recorder finds home-page tiles with a loose,
// case-insensitive link-name match on the sector name (e.g. "AI"). Keep
// footer link text free of sector names/substrings ("Weekly best", "About"
// and "Privacy" are safe) so the recorder can never tap a footer link by mistake.
export function SiteFooter() {
  return (
    <footer
      className="w-full px-4 py-8 text-center text-xs sm:text-sm"
      style={{
        background: "#05050a",
        borderTop: "1px solid #ffffff14",
        color: "#a1a1aa",
      }}
    >
      <div className="mb-6">
        <p
          className="text-sm sm:text-base font-extrabold uppercase tracking-widest"
          style={{ color: "#ededed" }}
        >
          Follow us for daily top 3s
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="me noopener noreferrer"
              className="rounded-full px-5 py-2 text-sm sm:text-base font-bold transition-transform hover:scale-105"
              style={{
                color: s.color,
                border: `1.5px solid ${s.color}`,
                boxShadow: `0 0 12px ${s.color}55`,
                background: "#ffffff08",
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <p className="max-w-[900px] mx-auto">{FOOTER_DISCLOSURE}</p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold">
        <Link href="/best" className="hover:text-white transition-colors">
          Weekly best
        </Link>
        <Link href="/gifts" className="hover:text-white transition-colors">
          Gift ideas
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">
          About
        </Link>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy
        </Link>
        <CookieSettingsLink />
      </nav>
      <p className="mt-3 opacity-60">
        © {new Date().getFullYear()} {SITE_NAME}
      </p>
    </footer>
  );
}
