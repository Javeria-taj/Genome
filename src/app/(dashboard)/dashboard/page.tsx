"use client";

import dynamic from "next/dynamic";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import ClimateLineChart from "@/components/charts/ClimateLineChart";

const WorldMap = dynamic(() => import("@/components/map/WorldMap"), { ssr: false });

export default function DashboardPage() {
  const { selectedCoords, locationLabel, climateDataA } = useCoordinateContext();
  const { data, loading, error } = useClimateData(
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
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">GeoScience Dashboard</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Overview — 40yr Climate Analysis</div>
        </div>
        <div style={{ fontSize: 8.5, color: "var(--dim)" }}>
          {selectedCoords
            ? `${locationLabel || `${selectedCoords.lat.toFixed(4)}°N, ${selectedCoords.lng.toFixed(4)}°E`} · 1985–2024`
            : "Click map to select location"}
        </div>
      </div>

      <div className="panel-grid">
        {/* MAP — full width */}
        <div className="panel panel-full map-wrap">
          <div className="phead">
            <span className="ptitle">Interactive World Map</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className="ptag">Leaflet.js</span>
              <span className="ptag" style={{ borderColor: "var(--red)", color: "var(--red)" }}>Click to pin</span>
            </div>
          </div>
          {typeof window !== "undefined" ? <WorldMap /> : <SkeletonLoader variant="map" />}
        </div>

        {/* CLIMATE TRENDS */}
        <div className="panel">
          <div className="phead">
            <span className="ptitle">40-Year Climate Trends</span>
            <span className="ptag">Chart.js</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <div style={{ fontSize: 9, color: "var(--dim)", padding: "18px 0" }}>
                Select a location on the map to load climate data.
              </div>
            ) : loading ? (
              <SkeletonLoader variant="chart" />
            ) : error ? (
              <div style={{ border: "1px solid var(--red)", padding: "6px 10px", fontSize: 9, color: "var(--red)" }}>
                API error — check network
              </div>
            ) : data ? (
              <>
                <div style={{ fontSize: 8.5, color: "var(--dim)", marginBottom: 8 }}>
                  {locationLabel || "Selected location"} &nbsp;·&nbsp; 1985–2024 &nbsp;·&nbsp; temp + precipitation
                </div>
                <ClimateLineChart data={data} />
                <div style={{ display: "flex", gap: 14, marginTop: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 14, height: 2, background: "var(--red)" }} />Avg Temp
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 14, height: 1.5, background: "var(--blue)", opacity: .7 }} />Precip
                  </div>
                </div>
                <div className="stat-row">
                  <div className="sc">
                    <span className="sv">{warmest?.avgTemp.toFixed(1)}°</span>
                    <span className="sl">Avg {warmest?.year}</span>
                  </div>
                  <div className="sc">
                    <span className="sv" style={{ color: "var(--red)" }}>{trend ? `+${trend}°` : "..."}</span>
                    <span className="sl">Δ 40yr</span>
                  </div>
                  <div className="sc">
                    <span className="sv">{wettest ? Math.round(wettest.totalPrecip).toLocaleString() : "—"}</span>
                    <span className="sl">mm / yr</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="panel">
          <div className="phead">
            <span className="ptitle">Location Summary</span>
            <span className="ptag">Live</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <div style={{ fontSize: 9, color: "var(--dim)", padding: "18px 0" }}>
                Pin a location on the map to see statistics.
              </div>
            ) : loading ? (
              <SkeletonLoader variant="stat" />
            ) : data ? (
              <>
                <div style={{ fontSize: 8.5, color: "var(--dim)", marginBottom: 8 }}>
                  Extreme events tracked across 40 years
                </div>
                <div className="stat-row">
                  <div className="sc">
                    <span className="sv" style={{ color: "var(--red)" }}>
                      {data.reduce((s, d) => s + d.extremeHeatDays, 0)}
                    </span>
                    <span className="sl">Heat Days</span>
                  </div>
                  <div className="sc">
                    <span className="sv" style={{ color: "var(--blue)" }}>
                      {data.reduce((s, d) => s + d.extremeRainDays, 0)}
                    </span>
                    <span className="sl">Rain Days</span>
                  </div>
                  <div className="sc">
                    <span className="sv">{data.length}</span>
                    <span className="sl">Years</span>
                  </div>
                </div>
                <div style={{ marginTop: 12, borderTop: "var(--bh)", paddingTop: 8 }}>
                  <div style={{ fontSize: 8.5, color: "var(--dim)", marginBottom: 6 }}>Navigation</div>
                  {[
                    { label: "Climate Trends →", href: "/trends" },
                    { label: "Compare Cities →", href: "/compare" },
                    { label: "Decade Delta →", href: "/delta" },
                    { label: "Weather Extremes →", href: "/extremes" },
                  ].map(link => (
                    <a key={link.href} href={link.href} style={{ display: "block", fontSize: 9, color: "var(--blue)", textDecoration: "none", padding: "4px 0", borderBottom: "var(--bh)" }}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
