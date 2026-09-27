"use client";

import { useState } from "react";

type Props = {
  /** Site-relative path to share, e.g. /item/209_1 */
  path: string;
  title: string;
  color: string;
};

/**
 * Share / forward an item. On phones this opens the native share sheet
 * (WhatsApp, Messages, Instagram etc.); on desktop, or anywhere the Web Share
 * API isn't available, it copies the link and briefly shows "Copied".
 */
export function ShareButton({ path, title, color }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const siteUrl = window.location.origin;
    const url = `${siteUrl}${path}`;
    const title_ = `${title} | Top 3 Today`;
    // Every share also plugs the dashboard itself, so a forwarded item can
    // bring the recipient back for the other categories, not just this one.
    const siteLine = `See today's top 3 in every category: ${siteUrl}`;
    const text = `${title}\n\n${siteLine}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: title_, text, url });
        return;
      } catch (err) {
        // User closed the share sheet - nothing to do.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${title}\n${url}\n\n${siteLine}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copied" : `Share: ${title}`}
      className="relative z-10 shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full font-bold text-sm h-11 min-w-11 px-3 transition-transform hover:scale-[1.06]"
      style={{
        border: `1.5px solid ${color}`,
        color,
        background: `${color}14`,
        boxShadow: `0 0 14px ${color}44`,
      }}
    >
      {copied ? (
        "Copied"
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="M7 8l5-5 5 5" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
      )}
    </button>
  );
}
