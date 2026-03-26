"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import ClimateLineChart from "@/components/charts/ClimateLineChart";

const WorldMap = dynamic(() => import("@/components/map/WorldMap"), { ssr: false });

export default function DashboardPage() {
  const { selectedCoords, locationLabel, climateDataA, selectedLocation } = useCoordinateContext();
  const { data, loading, error } = useClimateData(
    selectedCoords?.lat ?? null,
    selectedCoords?.lng ?? null,
  );

  const warmest = data?.reduce((a, b) => (a.avgTemp > b.avgTemp ? a : b));
  const wettest = data?.reduce((a, b) => (a.totalPrecip > b.totalPrecip ? a : b));
  const trend = data && data.length >= 2
    ? (data[data.length - 1].avgTemp - data[0].avgTemp).toFixed(1)
    : null;

  const makeSparkline = (values: number[], width: number, height: number) => {
    const min = Math.min(...values);
    const max = Math.max(...values) || 1;
    const range = max - min || 1;
    const stepX = width / (values.length - 1 || 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  };

  const heatPath = data ? makeSparkline(data.map(d => d.extremeHeatDays), 100, 20) : "";
  const rainPath = data ? makeSparkline(data.map(d => d.extremeRainDays), 100, 20) : "";

  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">GeoScience Dashboard</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Overview — 40yr Climate Analysis</div>
        </div>
        <div style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em", fontFamily: "var(--mono)" }}>
          {selectedLocation
            ? selectedLocation.city + ", " + selectedLocation.country + "  ·  " +
            Math.abs(selectedLocation.lat).toFixed(4) + "°" + (selectedLocation.lat >= 0 ? "N" : "S") + ", " +
            Math.abs(selectedLocation.lng).toFixed(4) + "°" + (selectedLocation.lng >= 0 ? "E" : "W") + "  ·  1985–2024"
            : selectedCoords
              ? selectedCoords.lat.toFixed(4) + "°N, " + selectedCoords.lng.toFixed(4) + "°E  ·  1985–2024"
              : "1985–2024"}
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
          <WorldMap />
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
                  <div className="sc" style={{ position: "relative", overflow: "hidden" }}>
                    {/* Heat wave animation */}
                    <style>{`
                      @keyframes heatWave {
                        0%   { d: path("M0 15 Q12 8 25 15 Q37 22 50 15 Q62 8 75 15 Q87 22 100 15"); }
                        50%  { d: path("M0 15 Q12 22 25 15 Q37 8 50 15 Q62 22 75 15 Q87 8 100 15"); }
                        100% { d: path("M0 15 Q12 8 25 15 Q37 22 50 15 Q62 8 75 15 Q87 22 100 15"); }
                      }
                      @keyframes heatPulse {
                        0%, 100% { opacity: 0.18; transform: scaleY(1); }
                        50%       { opacity: 0.32; transform: scaleY(1.12); }
                      }
                      @keyframes heatGlow {
                        0%, 100% { text-shadow: 0 0 0px rgba(249,115,22,0); }
                        50%       { text-shadow: 0 0 12px rgba(249,115,22,0.55); }
                      }
                      .heat-num { animation: heatGlow 2s ease-in-out infinite; }
                    `}</style>
                    {/* Animated heat waves behind the card */}
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none"
                      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", opacity: 1, pointerEvents: "none" }}>
                      <path d="M0 22 Q12 14 25 22 Q37 30 50 22 Q62 14 75 22 Q87 30 100 22"
                        fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"
                        style={{ animation: "heatPulse 2s ease-in-out infinite", transformOrigin: "50% 100%" }} />
                      <path d="M0 26 Q12 18 25 26 Q37 34 50 26 Q62 18 75 26 Q87 34 100 26"
                        fill="none" stroke="#f97316" strokeWidth="1" strokeLinecap="round"
                        style={{ animation: "heatPulse 2.4s ease-in-out infinite 0.4s", transformOrigin: "50% 100%", opacity: 0.55 }} />
                      {/* Radial heat glow at bottom */}
                      <ellipse cx="50" cy="30" rx="40" ry="10" fill="rgba(249,115,22,0.08)"
                        style={{ animation: "heatPulse 2s ease-in-out infinite" }} />
                    </svg>
                    <span className="sv heat-num" style={{ color: "#f97316", position: "relative" }}>
                      {data.reduce((s, d) => s + d.extremeHeatDays, 0)}
                    </span>
                    <span className="sl" style={{ position: "relative" }}>Heat Days</span>
                  </div>
                  <div className="sc" style={{ position: "relative", overflow: "hidden" }}>
                    <svg viewBox="0 -5 100 30" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40px", opacity: 0.15, pointerEvents: "none" }} preserveAspectRatio="none">
                      <path d={rainPath} fill="none" stroke="var(--blue)" strokeWidth="2" className="sparkline-path" />
                    </svg>
                    <span className="sv" style={{ color: "var(--blue)", position: "relative" }}>
                      {data.reduce((s, d) => s + d.extremeRainDays, 0)}
                    </span>
                    <span className="sl" style={{ position: "relative" }}>Rain Days</span>
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
                    <Link key={link.href} href={link.href} style={{ display: "block", fontSize: 9, color: "var(--blue)", textDecoration: "none", padding: "4px 0", borderBottom: "var(--bh)" }}>
                      {link.label}
                    </Link>
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
