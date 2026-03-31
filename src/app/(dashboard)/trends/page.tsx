"use client";

import dynamic from "next/dynamic";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import ClimateLineChart from "@/components/charts/ClimateLineChart";
import EmptyState from "@/components/ui/EmptyState";

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
        <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: "12px", textAlign: "right" }}>
          {selectedCoords ? `${locationLabel || "Selected Location"} · Open-Meteo` : "Select a location on the map below"}
        </div>
      </div>

      <div className="panel-grid">
        {/* Map */}
        <div className="panel panel-full map-wrap">
          <div className="phead">
            <span className="ptitle">Location Select</span>
            <span className="ptag" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Click to pin</span>
          </div>
          <WorldMap />
        </div>

        {/* Chart */}
        <div className="panel panel-full">
          <div className="phead">
            <span className="ptitle">Temperature & Precipitation Chart</span>
            <span className="ptag">Chart.js · Dual Axis</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <EmptyState
                icon="chart"
                message="Select a location on the map, then fetch data to see 40 years of climate trends."
              />
            ) : loading ? (
              <SkeletonLoader variant="chart" />
            ) : error ? (
              <div style={{ border: "1px solid var(--accent)", padding: "8px 12px", fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>API error — check network or rate limit</span>
                <button onClick={refetch} style={{ border: "var(--b1)", background: "transparent", color: "var(--ink)", fontSize: 10, padding: "3px 10px", cursor: "pointer", fontFamily: "var(--mono)" }}>Retry</button>
              </div>
            ) : data ? (
              <>
                <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10, fontFamily: "var(--mono)" }}>
                  {locationLabel || "Selected location"} &nbsp;·&nbsp; 1985–2024
                </div>
                <div>
                  <ClimateLineChart data={data} />
                </div>

                {warmest && wettest && trend && (
                  <div style={{ fontSize: 11, color: "var(--dim)", borderTop: "var(--bh)", paddingTop: 8, marginTop: 4, fontFamily: "var(--mono)" }}>
                    Warmest Year: <b style={{ color: "var(--ink)" }}>{warmest.year} ({warmest.avgTemp.toFixed(1)}°C)</b>
                    &nbsp;·&nbsp; Most Rain: <b style={{ color: "var(--ink)" }}>{wettest.year} ({Math.round(wettest.totalPrecip)}mm)</b>
                    &nbsp;·&nbsp; Trend: <b style={{ color: "var(--accent)" }}>+{trend}°C</b>
                  </div>
                )}
                <div className="stat-row" style={{ marginTop: 12 }}>
                  <div className="sc"><span className="sv">{warmest?.avgTemp.toFixed(1)}°</span><span className="sl">Peak Avg</span></div>
                  <div className="sc"><span className="sv" style={{ color: "var(--accent)" }}>+{trend}°</span><span className="sl">Δ 40yr</span></div>
                  <div className="sc"><span className="sv">{wettest ? Math.round(wettest.totalPrecip).toLocaleString() : "—"}</span><span className="sl">Peak mm</span></div>
                  <div className="sc"><span className="sv">{data.reduce((s, d) => s + d.extremeHeatDays, 0)}</span><span className="sl">Heat Days</span></div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
