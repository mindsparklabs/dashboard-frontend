"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { label: "days", value: Math.floor(s / 86400) },
    { label: "hrs", value: Math.floor((s % 86400) / 3600) },
    { label: "mins", value: Math.floor((s % 3600) / 60) },
    { label: "secs", value: s % 60 },
  ];
}

/**
 * Live countdown to `target`. Renders dashes until mounted so the server
 * HTML and the first client render match (no hydration mismatch), then ticks
 * every second. Shows `liveText` once the target has passed.
 */
export function Countdown({
  target,
  liveText,
  color = "#ff2ecb",
}: {
  target: string;
  liveText: string;
  color?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = now === null ? null : new Date(target).getTime() - now;

  if (remaining !== null && remaining <= 0) {
    return (
      <p
        className="text-2xl sm:text-3xl font-black tracking-wide"
        style={{ color, textShadow: `0 0 18px ${color}` }}
      >
        {liveText}
      </p>
    );
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" aria-live="off">
      {parts(remaining ?? 0).map(({ label, value }) => (
        <div
          key={label}
          className="w-16 sm:w-20 rounded-2xl py-2 text-center backdrop-blur-xl"
          style={{
            border: `1px solid ${color}88`,
            background: `linear-gradient(160deg, ${color}26, ${color}08)`,
            boxShadow: `0 0 18px ${color}44`,
          }}
        >
          <div className="text-2xl sm:text-3xl font-black tabular-nums">
            {remaining === null ? "–" : String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
