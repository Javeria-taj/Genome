"use client";

import { useState } from "react";
import { useClimateData } from "@/hooks/useClimateData";
import ComparisonChart from "@/components/charts/ComparisonChart";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import CitySearchInput from "@/components/ui/CitySearchInput";
import EmptyState from "@/components/ui/EmptyState";

const DECADE_RANGES = [
  { label: "1985–94", start: 1985, end: 1994 },
  { label: "1995–04", start: 1995, end: 2004 },
  { label: "2005–14", start: 2005, end: 2014 },
  { label: "2015–24", start: 2015, end: 2024 },
];

function decadeAvg(data: any[], start: number, end: number) {
  const slice = data.filter(d => d.year >= start && d.year <= end);
  if (!slice.length) return null;
  return (slice.reduce((s, d) => s + d.avgTemp, 0) / slice.length).toFixed(1);
}

function calcWarmingRate(data: any[]) {
  if (data.length < 2) return 0;
  const n = data.length;
  const sumX = data.reduce((s, _, i) => s + i, 0);
  const sumY = data.reduce((s, d) => s + d.avgTemp, 0);
  const sumXY = data.reduce((s, d, i) => s + i * d.avgTemp, 0);
  const sumX2 = data.reduce((s, _, i) => s + i * i, 0);
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

export default function ComparePage() {
  const [coordsA, setCoordsA] = useState<{ lat: number; lng: number } | null>(null);
  const [coordsB, setCoordsB] = useState<{ lat: number; lng: number } | null>(null);
  const [labelA, setLabelA] = useState("City A");
  const [labelB, setLabelB] = useState("City B");
  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");

  const { data: dataA, loading: loadingA } = useClimateData(coordsA?.lat ?? null, coordsA?.lng ?? null);
  const { data: dataB, loading: loadingB } = useClimateData(coordsB?.lat ?? null, coordsB?.lng ?? null);

  const rateA = dataA ? calcWarmingRate(dataA) : 0;
  const rateB = dataB ? calcWarmingRate(dataB) : 0;
  const fasterLabel = rateA > rateB ? labelA : labelB;
  const slowerLabel = rateA > rateB ? labelB : labelA;
  const ratio = rateB !== 0 && rateA !== 0 ? (Math.max(rateA, rateB) / Math.min(rateA, rateB)).toFixed(1) : null;

  // Parse city name from label (label comes from CitySearchInput as "City, Region, Country")
  const parseCityName = (label: string) => label.split(",")[0].trim();
  const cityAName = parseCityName(labelA);
  const cityBName = parseCityName(labelB);

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Compare Cities</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Side-by-side 40yr climate comparison</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <span className="ptag" style={{ color: "var(--red)", borderColor: "var(--red)" }}>City A</span>
          <span className="ptag" style={{ color: "var(--blue)", borderColor: "var(--blue)" }}>City B</span>
        </div>
      </div>

      <div className="panel-grid">
        {/* Search inputs */}
        <div className="panel panel-full">
          <div className="phead"><span className="ptitle">Location Selection</span></div>
          <div className="pbody">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--red)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, fontWeight: 700, fontFamily: "var(--mono)" }}>City A</div>
                <CitySearchInput
                  onSelect={(city, lat, lng) => {
                    setCoordsA({ lat, lng });
                    setLabelA(city);
                    // Extract country from label (last part after last comma)
                    const parts = city.split(",");
                    setCountryA(parts[parts.length - 1]?.trim() || "");
                  }}
                  placeholder="Search City A..."
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, fontWeight: 700, fontFamily: "var(--mono)" }}>City B</div>
                <CitySearchInput
                  onSelect={(city, lat, lng) => {
                    setCoordsB({ lat, lng });
                    setLabelB(city);
                    const parts = city.split(",");
                    setCountryB(parts[parts.length - 1]?.trim() || "");
                  }}
                  placeholder="Search City B..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* City name header card — shown when at least one city is selected */}
        {(coordsA || coordsB) && (
          <div className="panel panel-full" style={{ padding: 0 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 0, border: "none",
            }}>
              <div style={{
                padding: "10px 14px", borderRight: "1px solid var(--ink)",
                borderLeft: "4px solid var(--red)",
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--paper)",
              }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontFamily: "var(--mono)" }}>City A</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--mono)" }}>
                    {cityAName !== "City A" ? cityAName : "Select a city"}
                  </div>
                  {countryA && <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>{countryA}</div>}
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ width: "28px", height: "3px", background: "var(--red)", marginBottom: "3px" }} />
                  <div style={{ fontSize: "9px", color: "var(--dim)" }}>Temp Line</div>
                </div>
              </div>

              <div style={{
                padding: "10px 14px",
                borderLeft: "4px solid var(--blue)",
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--paper)",
              }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontFamily: "var(--mono)" }}>City B</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--mono)" }}>
                    {cityBName !== "City B" ? cityBName : "Select a city"}
                  </div>
                  {countryB && <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>{countryB}</div>}
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{
                    width: "28px", height: "2px", background: "var(--blue)", marginBottom: "3px",
                    backgroundImage: "repeating-linear-gradient(90deg, var(--blue) 0, var(--blue) 5px, transparent 5px, transparent 8px)",
                  }} />
                  <div style={{ fontSize: "9px", color: "var(--dim)" }}>Temp Line</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        <div className="panel panel-full">
          <div className="phead">
            <span className="ptitle">Temperature Comparison</span>
            <span className="ptag">Chart.js · 40yr</span>
          </div>
          <div className="pbody">
            {loadingA || loadingB ? (
              <SkeletonLoader variant="chart" />
            ) : dataA && dataB ? (
              <>
                <ComparisonChart dataA={dataA} dataB={dataB} labelA={cityAName} labelB={cityBName} />
                <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
                    <div style={{ width: 18, height: 2, background: "var(--red)" }} />
                    {cityAName} — +{(rateA * 40).toFixed(1)}°C
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
                    <div style={{ width: 18, height: 2, background: "var(--blue)", opacity: .7 }} />
                    {cityBName} — +{(rateB * 40).toFixed(1)}°C
                  </div>
                </div>
                {ratio && (
                  <div className="warming-badge" style={{ marginTop: 9 }}>
                    <b style={{ color: "var(--accent)" }}>{fasterLabel}</b> warming{" "}
                    <b style={{ color: "var(--accent)" }}>{ratio}× faster</b> than{" "}
                    <b style={{ color: "var(--blue)" }}>{slowerLabel}</b> over 40yr
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon="compare" message="Search and select two cities to overlay their 40-year climate profiles." />
            )}
          </div>
        </div>

        {/* Decade comparison table */}
        {dataA && dataB && (
          <div className="panel panel-full">
            <div className="phead"><span className="ptitle">Decade Averages</span></div>
            <div className="pbody">
              <div className="exp-table">
                <div className="exp-row hd">
                  <div className="exp-cell">Decade</div>
                  <div className="exp-cell" style={{ color: "var(--red)" }}>{cityAName} Avg °C</div>
                  <div className="exp-cell" style={{ color: "var(--blue)" }}>{cityBName} Avg °C</div>
                  <div className="exp-cell">Δ</div>
                </div>
                {DECADE_RANGES.map(d => {
                  const a = decadeAvg(dataA, d.start, d.end);
                  const b = decadeAvg(dataB, d.start, d.end);
                  const delta = a && b ? (parseFloat(a) - parseFloat(b)).toFixed(1) : "—";
                  return (
                    <div key={d.label} className="exp-row">
                      <div className="exp-cell">{d.label}</div>
                      <div className="exp-cell">{a ?? "—"}°C</div>
                      <div className="exp-cell">{b ?? "—"}°C</div>
                      <div className="exp-cell" style={{ color: parseFloat(delta) > 0 ? "var(--red)" : "var(--blue)" }}>
                        {parseFloat(delta) > 0 ? "+" : ""}{delta}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
