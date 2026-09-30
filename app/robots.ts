import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Outbound affiliate redirects - nothing to index, and keeps bot
      // traffic out of the click stats.
      disallow: "/go/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
