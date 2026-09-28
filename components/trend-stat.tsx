/**
 * Small "how big is this trend" pill, e.g. "413k sold on TikTok Shop UK".
 * The pipeline only keeps a stat whose numbers appear in its sources, and
 * the pill is hidden when there isn't one.
 */
export function TrendStat({ stat, color }: { stat?: string | null; color: string }) {
  if (!stat) return null;
  return (
    <p
      className="relative self-start inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ color, background: `${color}1a`, border: `1px solid ${color}55` }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </svg>
      {stat}
    </p>
  );
}
