"use client";

import dynamic from "next/dynamic";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import ClimateLineChart from "@/components/charts/ClimateLineChart";

const WorldMap = dynamic(() => import("@/components/map/WorldMap"), { ssr: false });

export default function TrendsPage() {
  const { selectedCoords, locationLabel } = useCoordinateContext();
  const { data, loading, error, refetch } = useClimateData(
    selectedCoords?.lat ?? null,
    selectedCoords?.lng ?? null,
  );

  const warmest = data?.reduce((a, b) => (a.avgTemp > b.avgTemp ? a : b));
  const wettest = data?.reduce((a, b) => (a.totalPrecip > b.totalPrecip ? a : b));
  const trend = data && data.length >= 2
    ? (data[data.length - 1].avgTemp - data[0].avgTemp).toFixed(1)
    : null;

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">40-Year Climate Trends</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Temperature & Precipitation · 1985–2024</div>
        </div>
        <div style={{ fontSize: 8.5, color: "var(--dim)" }}>
          {selectedCoords ? `${locationLabel || "Selected Location"} · Open-Meteo` : "Select a location on the map below"}
        </div>
      </div>

      <div className="panel-grid">
        {/* Map */}
        <div className="panel panel-full" style={{ height: 240 }}>
          <div className="phead">
            <span className="ptitle">Location Select</span>
            <span className="ptag" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Click to pin</span>
          </div>
          <div style={{ height: "calc(100% - 33px)", position: "relative" }}>
            <WorldMap />
          </div>
        </div>

        {/* Chart */}
        <div className="panel panel-full">
          <div className="phead">
            <span className="ptitle">Temperature & Precipitation Chart</span>
            <span className="ptag">Chart.js · Dual Axis</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <div style={{ fontSize: 9, color: "var(--dim)", padding: "18px 0" }}>Select a location above to load 40-year data.</div>
            ) : loading ? (
              <SkeletonLoader variant="chart" />
            ) : error ? (
              <div style={{ border: "1px solid var(--accent)", padding: "6px 10px", fontSize: 9, color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>API error — check network or rate limit</span>
                <button onClick={refetch} style={{ border: "var(--b1)", background: "transparent", color: "var(--ink)", fontSize: 9, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--mono)" }}>Retry</button>
              </div>
            ) : data ? (
              <>
                <div style={{ fontSize: 8.5, color: "var(--dim)", marginBottom: 8 }}>
                  {locationLabel || "Selected location"} &nbsp;·&nbsp; 1985–2024
                </div>
                <div style={{ height: 180, position: "relative" }}>
                  <ClimateLineChart data={data} />
                </div>
                <div style={{ display: "flex", gap: 14, margin: "8px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 14, height: 2, background: "var(--accent)" }} />Avg Temp
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 14, height: 1.5, background: "var(--blue)", opacity: .7 }} />Precip (dashed)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 14, height: 1, background: "var(--accent)", opacity: .4 }} />Trend line
                  </div>
                </div>
                {warmest && wettest && trend && (
                  <div style={{ fontSize: 8.5, color: "var(--dim)", borderTop: "var(--bh)", paddingTop: 6 }}>
                    Warmest Year: <b style={{ color: "var(--ink)" }}>{warmest.year} ({warmest.avgTemp.toFixed(1)}°C)</b>
                    &nbsp;·&nbsp; Most Rain: <b style={{ color: "var(--ink)" }}>{wettest.year} ({Math.round(wettest.totalPrecip)}mm)</b>
                    &nbsp;·&nbsp; Trend: <b style={{ color: "var(--accent)" }}>+{trend}°C</b>
                  </div>
                )}
                <div className="stat-row" style={{ marginTop: 12 }}>
                  <div className="sc"><span className="sv">{warmest?.avgTemp.toFixed(1)}°</span><span className="sl">Peak Avg</span></div>
                  <div className="sc"><span className="sv" style={{ color: "var(--accent)" }}>+{trend}°</span><span className="sl">Δ 40yr</span></div>
                  <div className="sc"><span className="sv">{wettest ? Math.round(wettest.totalPrecip).toLocaleString() : "—"}</span><span className="sl">Peak mm</span></div>
                  <div className="sc"><span className="sv">{data.reduce((s,d) => s + d.extremeHeatDays, 0)}</span><span className="sl">Heat Days</span></div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
