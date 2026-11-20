import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Top 3 Today | Trending Products UK",
  description:
    "Today's top 3 trending products across beauty, tech, fitness/sport, finance, AI, home & kitchen and pets - refreshed daily, UK-focused.",
};

// Site-wide Organization structured data, so search engines can link the
// site to its official social profiles.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
