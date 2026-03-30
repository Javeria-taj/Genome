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

  const warmest = data && data.length > 0 ? data.reduce((a, b) => (a.avgTemp > b.avgTemp ? a : b)) : null;
  const wettest = data && data.length > 0 ? data.reduce((a, b) => (a.totalPrecip > b.totalPrecip ? a : b)) : null;
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

  const getAiSynopsis = () => {
    if (!data || data.length < 2) return null;
    const firstDecade = data.slice(0, 10);
    const lastDecade = data.slice(-10);
    const firstAvg = firstDecade.reduce((s, d) => s + d.avgTemp, 0) / firstDecade.length;
    const lastAvg = lastDecade.reduce((s, d) => s + d.avgTemp, 0) / lastDecade.length;
    const diff = (lastAvg - firstAvg).toFixed(2);
    const multiplier = (parseFloat(diff) / 0.8).toFixed(1); // Compared to ~0.8C global avg since 1980s

    if (parseFloat(diff) > 1.2) {
      return `Critical thermal shift: This region has warmed by ${diff}\u00b0C since the 1980s, approximately ${multiplier}x the global average rate.`;
    } else if (parseFloat(diff) > 0.5) {
      return `Significant warming detected: A ${diff}\u00b0C rise in mean temperature suggests steady climatic drift over 40 years.`;
    }
    return `Stable thermal profile: 40-year variance remains within ${diff}\u00b0C, suggesting localized resilience compared to global trends.`;
  };

  const synopsis = getAiSynopsis();


  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Genome Dashboard</div>
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
        <div className="panel panel-full map-wrap" style={{ position: "relative", overflow: "hidden" }}>
          <div className="scanline" />
          <div style={{ position: "absolute", top: 8, right: 12, fontSize: 8, color: "var(--dim)", zIndex: 5, letterSpacing: ".1em", opacity: 0.5 }}>
            [0.1] SCANNING_MAP_SURFACE
          </div>
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
        <div className="panel" style={{ position: "relative", overflow: "hidden" }}>
          <div className="scanline" style={{ animationDuration: '12s', height: '60px' }} />
          <div style={{ position: "absolute", top: 8, right: 12, fontSize: 8, color: "var(--dim)", zIndex: 5, opacity: 0.5 }}>
            TELEMETRY_REF_TR-09
          </div>
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
            ) : data && data.length > 0 ? (
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
        <div className="panel" style={{ position: "relative", overflow: "hidden" }}>
          <div className="scanline" style={{ animationDuration: '15s', animationDelay: '2s' }} />
          <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 8, color: "var(--dim)", zIndex: 5, opacity: 0.5 }}>
            COORD: {selectedCoords ? `${selectedCoords.lat.toFixed(2)}, ${selectedCoords.lng.toFixed(2)}` : "STANDBY"}
          </div>
          <div className="phead">
            <span className="ptitle">Location Summary</span>
            <span className="ptag" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="breathe" style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%' }} />
              Live
            </span>
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
                <div style={{ fontSize: "11px", color: "var(--dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Extreme events tracked across 40 years
                </div>
                
                {synopsis && (
                  <div style={{ 
                    background: "rgba(181, 69, 27, 0.05)", 
                    border: "1px solid var(--accent)", 
                    padding: "10px", 
                    marginBottom: "16px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "var(--ink)",
                    fontFamily: "var(--mono)",
                    position: "relative"
                  }}>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--accent)", marginBottom: "6px", fontWeight: "bold" }}>
                      [ GENOME_INSIGHT_V1.0 ]
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>{synopsis}</div>
                      
                      {/* Climatic Shift Gauge */}
                      <div style={{ width: "80px", textAlign: "center", flexShrink: 0, marginTop: "4px" }}>
                        <div style={{ fontSize: "9px", color: "var(--dim)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.05em" }}>
                          40yr Shift
                        </div>
                        <div style={{ height: "45px", background: "rgba(15,14,13,0.06)", border: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
                          {/* Gauge Scale marks */}
                          {[0, 25, 50, 75, 100].map(m => (
                            <div key={m} style={{ position: "absolute", bottom: `${m}%`, left: 0, width: "4px", height: "1px", background: "var(--ink)", opacity: 0.4 }} />
                          ))}
                          
                          {/* Active Gauge Fill */}
                          <div style={{ 
                            position: "absolute", 
                            bottom: 0, 
                            left: 0, 
                            width: "100%", 
                            height: `${Math.min(100, Math.max(10, (parseFloat((synopsis.match(/-?\d+\.\d+/) || ["0"])[0]) / 2.0) * 100))}%`, 
                            background: "var(--accent)",
                            transition: "height 1s ease-out",
                            opacity: 0.85
                          }}>
                            <div className="breathe" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "white", boxShadow: "0 0 10px white" }} />
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px", color: "var(--accent)" }}>
                          {(synopsis.match(/-?\d+\.\d+/) || ["0"])[0]}°C
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                <div style={{ marginTop: 16, borderTop: "var(--bh)", paddingTop: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Navigation</div>
                  {[
                    { label: "Climate Trends →", href: "/trends" },
                    { label: "Compare Cities →", href: "/compare" },
                    { label: "Decade Delta →", href: "/delta" },
                    { label: "Weather Extremes →", href: "/extremes" },
                  ].map(link => (
                    <Link key={link.href} href={link.href} style={{ display: "block", fontSize: 14, color: "var(--blue)", textDecoration: "none", padding: "8px 0", borderBottom: "var(--bh)" }}>
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
