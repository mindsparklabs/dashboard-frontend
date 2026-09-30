import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} handles your data.`,
};

// Keep this page in step with reality: update it when the newsletter (or
// anything else that collects personal data) goes live.
const LAST_UPDATED = "28 September 2026";

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy">
      <p className="text-sm opacity-70">Last updated: {LAST_UPDATED}</p>

      <p>
        {SITE_NAME} is run by a UK-based sole trader. This page explains what
        information is used when you visit the site and your rights under UK
        data protection law (UK GDPR and the Data Protection Act 2018).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>No accounts, no sign-ups.</strong> You can use the whole
          site without giving us your name or email address.
        </li>
        <li>
          <strong>Anonymous usage statistics.</strong> We use Vercel Web
          Analytics to count page views. It does not use cookies and does not
          identify you personally.
        </li>
        <li>
          <strong>Your approximate country.</strong> Our hosting provider
          tells us which country a visit comes from so we can send you to the
          right Amazon store (for example amazon.co.uk or amazon.com). We
          don&apos;t store this against you.
        </li>
        <li>
          <strong>Anonymous click counts.</strong> When you tap a buy or read
          button we count which item was clicked and the country it came
          from, so we know which picks are useful. Nothing that identifies
          you (such as your IP address) is stored with it.
        </li>
        <li>
          <strong>Server logs.</strong> Like any website, our hosting
          provider (Vercel) keeps short-lived technical logs, including IP
          addresses, to keep the site secure and running.
        </li>
      </ul>

      <h2>Cookies and affiliate links</h2>
      <p>
        Some links on this site are affiliate links: if you buy something
        after clicking one, we may earn a small commission at no extra cost to
        you.
      </p>
      <ul>
        <li>
          <strong>Amazon.</strong> Links to Amazon go through the Amazon
          Associates programme. Amazon may set cookies on its own site to
          record that you came from us. See{" "}
          <a
            href="https://www.amazon.co.uk/gp/help/customer/display.html?nodeId=201909010"
            target="_blank"
            rel="noopener noreferrer"
          >
            Amazon&apos;s Privacy Notice
          </a>
          .
        </li>
        <li>
          <strong>Other retailers (Skimlinks).</strong> Only if you click
          &quot;Accept&quot; on our cookie notice, we load Skimlinks, which uses
          cookies to track clicks on links to other shops so we can be paid a
          commission. If you click &quot;Decline&quot;, it isn&apos;t loaded.
          See{" "}
          <a
            href="https://skimlinks.com/privacy-policies/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Skimlinks&apos; privacy policy
          </a>
          .
        </li>
      </ul>
      <p>
        You can change your choice at any time using the &quot;Cookies&quot;
        link at the bottom of every page.
      </p>
      <p>
        Other outbound links (for example to news sources) take you to
        third-party sites with their own privacy policies.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to ask what personal data we hold about you and to
        have it corrected or deleted. In practice we hold almost none. If
        you&apos;re unhappy with how your data is handled, you can complain to
        the{" "}
        <a
          href="https://ico.org.uk/make-a-complaint/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Information Commissioner&apos;s Office (ICO)
        </a>
        .
      </p>

      {CONTACT_EMAIL && (
        <>
          <h2>Contact</h2>
          <p>
            For any privacy question, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </>
      )}
    </InfoPage>
  );
}
