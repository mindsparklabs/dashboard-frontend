import { ImageResponse } from "next/og";
import { getItemById } from "@/lib/daily-items";
import { getSectorByName } from "@/lib/sectors";

// Pinterest pin image for one pick: /pin/<rowId>_<rank>.png (1000x1500).
// Drawn on demand from the stored pick, in the site's neon style. Picks never
// change once saved, so the image is cached for a long time.
export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: raw } = await params;
  const id = raw.replace(/\.png$/i, "");
  const item = await getItemById(id).catch(() => null);
  if (!item) {
    return new Response("Not found", { status: 404 });
  }

  const sector = getSectorByName(item.sector);
  const color = sector?.color ?? "#ff2ecb";
  const sectorName = (sector?.name ?? item.sector).toUpperCase();
  const headline = item.headline.length > 90 ? item.headline.slice(0, 87) + "…" : item.headline;
  const why = item.why_it_matters ?? "";
  const stat = item.trend_stat ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "90px 80px",
          backgroundColor: "#07050b",
          backgroundImage: `radial-gradient(circle at 50% 30%, ${color}55 0%, #1a0716 45%, #07050b 85%)`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              letterSpacing: 8,
              color: "#ffd6ee",
              fontWeight: 700,
            }}
          >
            TOP 3 TODAY
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: 3,
              color,
            }}
          >
            {`TRENDING IN ${sectorName}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 220,
              fontWeight: 900,
              lineHeight: 1,
              color,
              textShadow: `0 0 40px ${color}`,
            }}
          >
            {`#${item.rank}`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.12,
            }}
          >
            {headline}
          </div>
          {stat ? (
            <div style={{ display: "flex", marginTop: 40 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  padding: "14px 30px",
                  borderRadius: 999,
                  border: `3px solid ${color}`,
                  color: "#ffffff",
                  background: "#ffffff12",
                }}
              >
                {stat}
              </div>
            </div>
          ) : null}
          {why ? (
            <div
              style={{
                display: "flex",
                marginTop: 40,
                fontSize: 42,
                lineHeight: 1.3,
                color: "#e4e4e7",
              }}
            >
              {why}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `3px solid ${color}88`,
            paddingTop: 36,
          }}
        >
          <div style={{ display: "flex", fontSize: 36, color: "#d4d4d8" }}>
            See today's top 3
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#ff8fd6" }}>
            top3today.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    }
  );
}
