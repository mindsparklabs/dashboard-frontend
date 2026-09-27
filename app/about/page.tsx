import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { AMAZON_DISCLOSURE, CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description:
    "Top 3 Today picks the three things trending right now in every category, refreshed every day.",
};

export default function AboutPage() {
  return (
    <InfoPage title="About">
      <p>
        {SITE_NAME} cuts through the noise. Every day we scan what&apos;s
        trending across the web and pick the top three hits in each
        category, from beauty and tech to AI, finance, home and pets.
      </p>
      <p>
        No endless feeds, no scrolling for an hour. Just three things per
        category worth knowing about today, with a short summary and a quick
        way to find out more.
      </p>

      <h2>How the picks are made</h2>
      <p>
        Trends are gathered and ranked automatically each day using web
        sources and AI-assisted curation, then published to the site. Picks
        are based on what&apos;s gaining attention, not on who pays: brands
        can&apos;t buy a spot in the top three.
      </p>

      <h2>How the site is funded</h2>
      <p>
        Some links go to Amazon. If you buy something after clicking one, we
        may earn a small commission at no extra cost to you. {AMAZON_DISCLOSURE}
      </p>

      {CONTACT_EMAIL && (
        <>
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </>
      )}
    </InfoPage>
  );
}
