"use client";

import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import ExtremesBarChart from "@/components/charts/ExtremesBarChart";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";

const DECADES = [
  { label: "1985–94", start: 1985, end: 1994 },
  { label: "1995–04", start: 1995, end: 2004 },
  { label: "2005–14", start: 2005, end: 2014 },
  { label: "2015–24", start: 2015, end: 2024 },
];

function sumFor(data: any[], start: number, end: number, key: "extremeHeatDays" | "extremeRainDays") {
  return data.filter(d => d.year >= start && d.year <= end).reduce((s, d) => s + d[key], 0);
}

export default function ExtremesPage() {
  const { selectedCoords, locationLabel } = useCoordinateContext();
  const { data, loading } = useClimateData(selectedCoords?.lat ?? null, selectedCoords?.lng ?? null);

  const heatDays = data ? DECADES.map(d => sumFor(data, d.start, d.end, "extremeHeatDays")) : [];
  const rainDays = data ? DECADES.map(d => sumFor(data, d.start, d.end, "extremeRainDays")) : [];
  const firstHeat = heatDays[0] || 1;
  const lastHeat = heatDays[heatDays.length - 1] || 0;
  const heatPct = Math.round(((lastHeat - firstHeat) / firstHeat) * 100);
  const worstIdx = heatDays.indexOf(Math.max(...heatDays));

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Weather Extremes Tracker</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>Anomaly decade analysis · heat & rain events</div>
        </div>
        <span className="ptag">Per Decade</span>
      </div>

      <div className="panel-grid">
        <div className="panel panel-full">
          <div className="phead">
            <span className="ptitle">Extreme Events Per Decade</span>
            <span className="ptag">{locationLabel || "No selection"}</span>
          </div>
          <div className="pbody">
            {!selectedCoords ? (
              <EmptyState icon="extremes" message="Select a location to see extreme heat and rain day counts per decade." />
            ) : loading ? (
              <SkeletonLoader variant="bar" />
            ) : data ? (
              <>
                <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10, fontFamily: "var(--mono)" }}>
                  Days &gt;35°C heat &nbsp;·&nbsp; Days &gt;50mm rain &nbsp;·&nbsp; {locationLabel} 1985–2024
                </div>
                <ExtremesBarChart heatDays={heatDays} rainDays={rainDays} labels={DECADES.map(d => d.label)} />

                {/* Legend */}
                <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
                    <div className="ext-swatch" style={{ background: "var(--red)", borderColor: "var(--red)" }} />
                    Heat days (&gt;35°C)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
                    <div className="ext-swatch" style={{ background: "var(--blue)", borderColor: "var(--blue)" }} />
                    Rain days (&gt;50mm)
                  </div>
                </div>

                {/* Alert */}
                <div className="ext-alert" style={{ marginTop: 12, fontSize: 12 }}>
                  Extreme heat days up <b>+{heatPct}%</b> since 1985 &nbsp;·&nbsp;
                  Most extreme decade: <b>{DECADES[worstIdx]?.label}</b>
                </div>

                {/* Data table */}
                <div style={{ marginTop: 14 }}>
                  <div className="exp-table">
                    <div className="exp-row hd">
                      <div className="exp-cell">Decade</div>
                      <div className="exp-cell" style={{ color: "var(--red)" }}>Heat Days</div>
                      <div className="exp-cell" style={{ color: "var(--blue)" }}>Rain Days</div>
                      <div className="exp-cell">Δ Heat vs 1985</div>
                    </div>
                    {DECADES.map((d, i) => (
                      <div key={d.label} className="exp-row">
                        <div className="exp-cell">{d.label}</div>
                        <div className="exp-cell" style={{ color: "var(--red)", fontWeight: i === worstIdx ? 700 : undefined }}>{heatDays[i]}</div>
                        <div className="exp-cell">{rainDays[i]}</div>
                        <div className="exp-cell" style={{ color: heatDays[i] > heatDays[0] ? "var(--red)" : "var(--dim)" }}>
                          {i === 0 ? "baseline" : `+${heatDays[i] - heatDays[0]}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
