"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Static A4 print report page
export default function PrintPage() {
  const location = "Selected Location";
  const dateRange = "1985–2024";
  const generatedAt = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      fontFamily: "'Space Mono', monospace",
      background: "white",
      color: "#0f0e0d",
      maxWidth: "210mm",
      margin: "0 auto",
      padding: "0",
    }}>
      {/* Print button — hidden on print */}
      <div className="no-print" style={{
        position: "fixed", top: 16, right: 16, display: "flex", gap: 8, zIndex: 999
      }}>
        <button
          onClick={() => window.print()}
          style={{
            border: "1.5px solid #0f0e0d", background: "#0f0e0d", color: "#f5f0e8",
            fontFamily: "inherit", fontSize: 10, textTransform: "uppercase",
            letterSpacing: ".12em", padding: "8px 16px", cursor: "pointer"
          }}
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            border: "1px solid #0f0e0d", background: "transparent", color: "#0f0e0d",
            fontFamily: "inherit", fontSize: 10, padding: "8px 16px", cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>

      {/* A4 Report */}
      <div style={{ padding: "18mm 16mm", minHeight: "297mm" }}>

        {/* Header */}
        <div style={{ borderBottom: "1.5px solid #0f0e0d", paddingBottom: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, background: "#e63a2e", borderRadius: "50%" }} />
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".1em" }}>Genome</span>
            </div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 24, lineHeight: 1.2 }}>
              Climate Telemetry Report
            </div>
            <div style={{ fontSize: 9, color: "#7a756e", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>
              {location} · {dateRange} · Open-Meteo Historical Weather API
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: "#7a756e" }}>
            <div>Generated: {generatedAt}</div>
            <div style={{ marginTop: 2 }}>Genome v3.0</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid #0f0e0d", marginBottom: 24 }}>
          {[
            { val: "28.4°C", lbl: "Avg Temp 2024" },
            { val: "1,842mm", lbl: "Peak Precipitation" },
            { val: "+2.1°C", lbl: "40yr Trend" },
            { val: "88", lbl: "Heat Days (2015–24)" },
          ].map((s, i) => (
            <div key={s.lbl} style={{
              padding: "10px 12px",
              borderRight: i < 3 ? "1px solid #0f0e0d" : "none",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontSize: 8, color: "#7a756e", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Section: 40yr Temperature Overview */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, borderBottom: "1px solid #0f0e0d", paddingBottom: 5, marginBottom: 12 }}>
            40-Year Temperature Overview
          </div>
          <div style={{ fontSize: 8.5, color: "#7a756e", marginBottom: 8 }}>
            Continuous warming trend detected across the 1985–2024 period. Linear regression slope: +0.053°C/yr.
          </div>
          {/* Chart placeholder for print */}
          <div style={{ border: "1px solid #0f0e0d", height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#7a756e", fontSize: 9, background: "#ede8dc" }}>
            Chart.js canvas will render here when viewed in browser
          </div>
        </div>

        {/* Section: Decade Delta */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, borderBottom: "1px solid #0f0e0d", paddingBottom: 5, marginBottom: 12 }}>
            Decade Delta Analysis
          </div>
          {/* Gauge bar SVG representation */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, border: "1.5px solid #0f0e0d", height: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "38%", background: "#e63a2e" }} />
              <div style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 16, color: "#f5f0e8", mixBlendMode: "difference" }}>
                +1.5°C
              </div>
            </div>
            <div style={{ fontSize: 8.5, color: "#7a756e" }}>1980s → 2010s</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#7a756e" }}>
            <span>0°C</span><span>1°C</span><span>2°C</span><span>3°C</span><span>4°C</span>
          </div>
        </div>

        {/* Section: Extremes Table */}
        <div className="page-break" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, borderBottom: "1px solid #0f0e0d", paddingBottom: 5, marginBottom: 12 }}>
            Extreme Weather Events — Per Decade
          </div>
          <div style={{ border: "1px solid #0f0e0d", fontSize: 8.5 }}>
            <div style={{ display: "flex", background: "rgba(15,14,13,0.07)", fontWeight: 700 }}>
              {["Decade", "Heat Days (>35°C)", "Rain Days (>50mm)", "Δ Heat vs 1985"].map((h, i) => (
                <div key={h} style={{ flex: 1, padding: "5px 8px", borderRight: i < 3 ? "0.5px solid rgba(15,14,13,0.18)" : "none" }}>{h}</div>
              ))}
            </div>
            {[
              ["1985–94", "42", "28", "baseline"],
              ["1995–04", "58", "36", "+16"],
              ["2005–14", "74", "48", "+32"],
              ["2015–24", "88", "62", "+46"],
            ].map((row, ri) => (
              <div key={ri} style={{ display: "flex", borderTop: "0.5px solid rgba(15,14,13,0.18)" }}>
                {row.map((cell, ci) => (
                  <div key={ci} style={{
                    flex: 1, padding: "4px 8px",
                    borderRight: ci < 3 ? "0.5px solid rgba(15,14,13,0.18)" : "none",
                    color: (ci === 3 && cell !== "baseline") ? "#e63a2e" : undefined,
                    fontWeight: ri === 3 && ci === 1 ? 700 : undefined,
                  }}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="form-footer" style={{ borderTop: "1.5px solid #0f0e0d", marginTop: 20, paddingTop: 14 }}>
          <span>&copy; 2026 Genome &middot; Built by Javeria Taj</span>
        </div>
      </div>
    </div>
  );
}
