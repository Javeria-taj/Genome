"use client";

import { useState } from "react";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useClimateData } from "@/hooks/useClimateData";
import ExportButton from "@/components/ui/ExportButton";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

const PAGE_SIZE = 10;

export default function ExportPage() {
  const { selectedCoords, selectedLocation, locationLabel } = useCoordinateContext();
  const { data, loading } = useClimateData(selectedCoords?.lat ?? null, selectedCoords?.lng ?? null);
  const [page, setPage] = useState(0);

  const totalPages = data ? Math.ceil(data.length / PAGE_SIZE) : 0;
  const pageData = data ? data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : [];

  const locationDisplayName = selectedLocation?.city
    ? selectedLocation.city + ", " + selectedLocation.country
    : locationLabel || "Selected Location";

  const locationMeta = selectedLocation
    ? {
        city: selectedLocation.city,
        country: selectedLocation.country,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }
    : undefined;

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Data Export</div>
          <div className="ph-sub" style={{ marginTop: 2 }}>CSV download · paginated preview</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <span className="ptag">CSV</span>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel panel-full" style={{ borderBottom: "none" }}>
          <div className="phead"><span className="ptitle">Data Export</span></div>
          <div className="pbody">
            {!selectedCoords ? (
              <div style={{ fontSize: 11, color: "var(--dim)", padding: "20px 0", fontFamily: "var(--mono)" }}>Select a location on the Overview map first.</div>
            ) : loading ? (
              <SkeletonLoader variant="chart" />
            ) : data ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 14, alignItems: "start" }}>
                {/* Preview table */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8, fontFamily: "var(--mono)" }}>
                    Preview — {locationDisplayName} (1985–2024) · {data.length} records
                  </div>
                  <div className="exp-table">
                    <div className="exp-row hd">
                      <div className="exp-cell">Year</div>
                      <div className="exp-cell">City</div>
                      <div className="exp-cell">Avg Temp</div>
                      <div className="exp-cell">Precip mm</div>
                      <div className="exp-cell">Heat Days</div>
                      <div className="exp-cell">Rain Days</div>
                    </div>
                    {pageData.map(row => {
                      const isLatest = row.year === data[data.length - 1].year;
                      return (
                        <div key={row.year} className="exp-row" style={isLatest ? { background: "color-mix(in srgb, var(--red) 5%, transparent)" } : undefined}>
                          <div className="exp-cell" style={isLatest ? { fontWeight: 700 } : undefined}>{row.year}</div>
                          <div className="exp-cell" style={{ fontSize: 11, color: "var(--dim)" }}>{selectedLocation?.city || "—"}</div>
                          <div className="exp-cell" style={isLatest ? { color: "var(--red)", fontWeight: 700 } : undefined}>{row.avgTemp.toFixed(1)}°C</div>
                          <div className="exp-cell">{Math.round(row.totalPrecip).toLocaleString()}</div>
                          <div className="exp-cell" style={row.extremeHeatDays > 30 ? { color: "var(--red)", fontWeight: 700 } : undefined}>{row.extremeHeatDays}</div>
                          <div className="exp-cell">{row.extremeRainDays}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12 }}>
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{ border: "var(--b1)", background: "transparent", color: "var(--ink)", fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px", cursor: page > 0 ? "pointer" : "not-allowed", opacity: page === 0 ? .4 : 1 }}
                      >←</button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          style={{ border: "var(--b1)", background: i === page ? "var(--ink)" : "transparent", color: i === page ? "var(--paper)" : "var(--ink)", fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px", cursor: "pointer", minWidth: 32 }}
                        >{i + 1}</button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        style={{ border: "var(--b1)", background: "transparent", color: "var(--ink)", fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px", cursor: page < totalPages - 1 ? "pointer" : "not-allowed", opacity: page === totalPages - 1 ? .4 : 1 }}
                      >→</button>
                    </div>
                  )}
                </div>

                {/* Export buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <ExportButton
                    data={data}
                    label="Full dataset"
                    filename="full"
                    locationInfo={locationMeta}
                  />
                  <ExportButton
                    data={data.filter(d => d.year >= 1985 && d.year <= 2004)}
                    label="1985–2004"
                    filename="period-a"
                    locationInfo={locationMeta}
                  />
                  <ExportButton
                    data={data.filter(d => d.year >= 2005)}
                    label="2005–2024"
                    filename="period-b"
                    locationInfo={locationMeta}
                  />
                  <ExportButton
                    data={data}
                    label="Comparison"
                    filename="comparison"
                    locationInfo={locationMeta}
                  />
                  <ExportButton
                    data={data.filter(d => d.extremeHeatDays > 0 || d.extremeRainDays > 0)}
                    label="Extremes only"
                    filename="extremes"
                    locationInfo={locationMeta}
                    style={{ borderColor: "var(--red)", color: "var(--red)" }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
