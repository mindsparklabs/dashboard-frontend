"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SKIMLINKS_SRC } from "@/lib/site";

const STORAGE_KEY = "t3t-cookie-consent"; // "accepted" | "declined"
export const REOPEN_EVENT = "t3t-cookie-settings";

function loadSkimlinks() {
  if (document.querySelector(`script[src="${SKIMLINKS_SRC}"]`)) return;
  const s = document.createElement("script");
  s.src = SKIMLINKS_SRC;
  s.async = true;
  document.body.appendChild(s);
}

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveChoice(value: "accepted" | "declined") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode etc. - choice just won't persist */
  }
}

/**
 * Slim, low-key consent bar. Skimlinks (affiliate link tracking, which sets
 * cookies) only loads after "Accept". Automated browsers (e.g. the daily
 * video recorder) never see the bar and never load Skimlinks, so it can't
 * appear in the social videos.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (navigator.webdriver) return;
    const choice = readChoice();
    if (choice === "accepted") loadSkimlinks();
    else if (!choice) setShow(true);

    const reopen = () => setShow(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  if (!show) return null;

  const choose = (value: "accepted" | "declined") => {
    saveChoice(value);
    if (value === "accepted") loadSkimlinks();
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-[560px] rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs backdrop-blur-xl"
      style={{
        background: "rgba(10,10,16,0.88)",
        border: "1px solid #ffffff1f",
        color: "#a1a1aa",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      }}
    >
      <p className="flex-1 leading-snug">
        We use cookies to track affiliate links.{" "}
        <Link href="/privacy" className="underline hover:text-white">
          More
        </Link>
      </p>
      <button
        type="button"
        onClick={() => choose("declined")}
        className="shrink-0 px-2 py-1 hover:text-white transition-colors"
      >
        Decline
      </button>
      <button
        type="button"
        onClick={() => choose("accepted")}
        className="shrink-0 rounded-full px-3 py-1 font-semibold transition-colors"
        style={{ background: "#ffffff1a", color: "#f4f4f5" }}
      >
        Accept
      </button>
    </div>
  );
}

/** Small footer link that re-opens the consent bar. */
export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      className="font-semibold hover:text-white transition-colors"
    >
      Cookies
    </button>
  );
}
