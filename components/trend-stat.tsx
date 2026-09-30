/**
 * Small "how big is this trend" pill, e.g. "413k sold on TikTok Shop UK".
 * The pipeline only keeps a stat whose numbers appear in its sources, and
 * the pill is hidden when there isn't one.
 *
 * Styling: white text on a dark pill so it stays readable on every sector
 * card (sector-coloured text was hard to read on the pink Viral/Beauty cards);
 * the sector colour lives in the border, soft glow and arrow icon.
 */
export function TrendStat({ stat, color }: { stat?: string | null; color: string }) {
  if (!stat) return null;
  return (
    <p
      className="relative self-start inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold leading-tight text-white"
      style={{
        background: "rgba(5,5,10,0.6)",
        border: `1px solid ${color}99`,
        boxShadow: `0 0 14px ${color}33`,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </svg>
      {stat}
    </p>
  );
}
