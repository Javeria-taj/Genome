"use client";

import { useState } from "react";
import { useClimateData } from "@/hooks/useClimateData";
import ComparisonChart from "@/components/charts/ComparisonChart";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import CitySearchInput from "@/components/ui/CitySearchInput";

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

  const { data: dataA, loading: loadingA } = useClimateData(coordsA?.lat ?? null, coordsA?.lng ?? null);
  const { data: dataB, loading: loadingB } = useClimateData(coordsB?.lat ?? null, coordsB?.lng ?? null);

  const rateA = dataA ? calcWarmingRate(dataA) : 0;
  const rateB = dataB ? calcWarmingRate(dataB) : 0;
  const fasterLabel = rateA > rateB ? labelA : labelB;
  const slowerLabel = rateA > rateB ? labelB : labelA;
  const ratio = rateB !== 0 && rateA !== 0 ? (Math.max(rateA, rateB) / Math.min(rateA, rateB)).toFixed(1) : null;

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
                <div style={{ fontSize: 8.5, color: "var(--red)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5, fontWeight: 700 }}>City A</div>
                <CitySearchInput
                  onSelect={(city, lat, lng) => { setCoordsA({ lat, lng }); setLabelA(city); }}
                  placeholder="Search City A..."
                />
              </div>
              <div>
                <div style={{ fontSize: 8.5, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5, fontWeight: 700 }}>City B</div>
                <CitySearchInput
                  onSelect={(city, lat, lng) => { setCoordsB({ lat, lng }); setLabelB(city); }}
                  placeholder="Search City B..."
                />
              </div>
            </div>
          </div>
        </div>

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
                <ComparisonChart dataA={dataA} dataB={dataB} labelA={labelA} labelB={labelB} />
                <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 16, height: 2, background: "var(--red)" }} />{labelA} (A) — +{(rateA * 40).toFixed(1)}°C
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "var(--dim)" }}>
                    <div style={{ width: 16, height: 2, background: "var(--blue)", opacity: .7 }} />{labelB} (B) — +{(rateB * 40).toFixed(1)}°C
                  </div>
                </div>
                {ratio && (
                  <div className="warming-badge" style={{ marginTop: 9 }}>
                    <b>{fasterLabel}</b> warming <b>{ratio}× faster</b> than {slowerLabel} over 40yr
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 9, color: "var(--dim)", padding: "18px 0" }}>Search and select both cities to compare their climate data.</div>
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
                  <div className="exp-cell" style={{ color: "var(--red)" }}>{labelA} Avg °C</div>
                  <div className="exp-cell" style={{ color: "var(--blue)" }}>{labelB} Avg °C</div>
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
