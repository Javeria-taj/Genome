"use client";

import { useState } from "react";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import HeatGauge from "@/components/charts/HeatGauge";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

const DECADE_OPTIONS = [
  { label: "1980–1990", start: 1985, end: 1990 },
  { label: "1990–2000", start: 1990, end: 2000 },
  { label: "2000–2010", start: 2000, end: 2010 },
  { label: "2010–2020", start: 2010, end: 2020 },
];

function avgTemp(data: any[], start: number, end: number) {
  const slice = data.filter(d => d.year >= start && d.year <= end);
  if (!slice.length) return 0;
  return slice.reduce((s, d) => s + d.avgTemp, 0) / slice.length;
}
function totalPrecip(data: any[], start: number, end: number) {
  const slice = data.filter(d => d.year >= start && d.year <= end);
  return slice.reduce((s, d) => s + d.totalPrecip, 0) / Math.max(slice.length, 1);
}
function extremeDays(data: any[], start: number, end: number) {
  const slice = data.filter(d => d.year >= start && d.year <= end);
  return slice.reduce((s, d) => s + d.extremeHeatDays, 0);
}

export default function DeltaPage() {
  const { selectedCoords, locationLabel } = useCoordinateContext();
  const { data, loading } = useClimateData(selectedCoords?.lat ?? null, selectedCoords?.lng ?? null);

  const [decadeA, setDecadeA] = useState(0);
  const [decadeB, setDecadeB] = useState(3);
  const [prevDelta, setPrevDelta] = useState(0);
  const [currentDelta, setCurrentDelta] = useState(1.5);

  const handleRecalc = () => {
    if (!data) return;
    const dA = DECADE_OPTIONS[decadeA];
    const dB = DECADE_OPTIONS[decadeB];
    const tA = avgTemp(data, dA.start, dA.end);
    const tB = avgTemp(data, dB.start, dB.end);
    setPrevDelta(currentDelta);
    setCurrentDelta(parseFloat((tB - tA).toFixed(2)));
  };

  const precipDelta = data
    ? (totalPrecip(data, DECADE_OPTIONS[decadeB].start, DECADE_OPTIONS[decadeB].end) -
       totalPrecip(data, DECADE_OPTIONS[decadeA].start, DECADE_OPTIONS[decadeA].end)).toFixed(0)
    : "—";
  const extremeDelta = data
    ? extremeDays(data, DECADE_OPTIONS[decadeB].start, DECADE_OPTIONS[decadeB].end) -
      extremeDays(data, DECADE_OPTIONS[decadeA].start, DECADE_OPTIONS[decadeA].end)
    : null;

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Decade Delta Calculator</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Inter-decade temperature shift analysis</div>
        </div>
        <span className="ptag" style={{ borderColor: "var(--red)", color: "var(--red)" }}>Heat Gauge</span>
      </div>

      <div className="panel-grid">
        <div className="panel panel-full">
          <div className="phead">
            <span className="ptitle">Delta Configuration</span>
            <span className="ptag">{locationLabel || "No location selected"}</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <div style={{ fontSize: 9, color: "var(--dim)", padding: "18px 0" }}>Select a location on the Overview map first.</div>
            ) : loading ? (
              <SkeletonLoader variant="chart" />
            ) : data ? (
              <>
                {/* Decade selectors */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
                  <select
                    className="d-sel"
                    value={decadeA}
                    onChange={e => setDecadeA(parseInt(e.target.value))}
                  >
                    {DECADE_OPTIONS.map((d, i) => (
                      <option key={d.label} value={i}>{d.label}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 11, color: "var(--dim)", flexShrink: 0 }}>→</span>
                  <select
                    className="d-sel"
                    value={decadeB}
                    onChange={e => setDecadeB(parseInt(e.target.value))}
                  >
                    {DECADE_OPTIONS.map((d, i) => (
                      <option key={d.label} value={i}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Heat gauge */}
                <HeatGauge delta={currentDelta} previousDelta={prevDelta} />

                {/* Meta */}
                <div style={{ marginTop: 10, fontSize: 8.5, color: "var(--dim)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>Precip Δ <b style={{ color: "var(--ink)" }}>{parseFloat(precipDelta) >= 0 ? "+" : ""}{precipDelta}mm</b></span>
                  {extremeDelta !== null && <span>Extreme days Δ <b style={{ color: "var(--ink)" }}>{extremeDelta >= 0 ? "+" : ""}{extremeDelta}</b></span>}
                  <span>Trend <b style={{ color: currentDelta > 1.5 ? "var(--red)" : "var(--dim)" }}>{currentDelta > 1.5 ? "Accelerating" : "Stable"}</b></span>
                </div>

                <button className="btn-calc" onClick={handleRecalc}>
                  Recalculate Delta →
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
