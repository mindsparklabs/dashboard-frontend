import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} handles your data.`,
};

// Keep this page in step with reality: update it when the newsletter (or
// anything else that collects personal data) goes live.
const LAST_UPDATED = "27 September 2026";

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
          <strong>Server logs.</strong> Like any website, our hosting
          provider (Vercel) keeps short-lived technical logs, including IP
          addresses, to keep the site secure and running.
        </li>
      </ul>

      <h2>Cookies and affiliate links</h2>
      <p>
        This site doesn&apos;t set its own tracking or advertising cookies.
        Some links go to Amazon through the Amazon Associates programme. When
        you click one, Amazon may set cookies on its own site to record that
        you came from us, so we can earn a commission if you buy something.
        That is covered by{" "}
        <a
          href="https://www.amazon.co.uk/gp/help/customer/display.html?nodeId=201909010"
          target="_blank"
          rel="noopener noreferrer"
        >
          Amazon&apos;s Privacy Notice
        </a>
        .
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
