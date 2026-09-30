import Link from "next/link";
import { FOOTER_DISCLOSURE, SITE_NAME } from "@/lib/site";
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
      <p className="max-w-[900px] mx-auto">{FOOTER_DISCLOSURE}</p>
      <nav className="mt-3 flex items-center justify-center gap-5 font-semibold">
        <Link href="/best" className="hover:text-white transition-colors">
          Weekly best
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
