"use client";

import Link from "next/link";
import { useState } from "react";
import ClimateLineChart from "@/components/charts/ClimateLineChart";
import { DEMO_LOCATION, DEMO_CLIMATE_DATA } from "@/lib/demoData";

export default function DemoPage() {
  const [tab, setTab] = useState<"trends" | "stats">("trends");

  const warmest = DEMO_CLIMATE_DATA.reduce((a, b) => (a.avgTemp > b.avgTemp ? a : b));
  const wettest = DEMO_CLIMATE_DATA.reduce((a, b) => (a.totalPrecip > b.totalPrecip ? a : b));
  const firstYear = DEMO_CLIMATE_DATA[0];
  const lastYear = DEMO_CLIMATE_DATA[DEMO_CLIMATE_DATA.length - 1];
  const tempTrend = (lastYear.avgTemp - firstYear.avgTemp).toFixed(1);

  return (
    <div style={{ background: "var(--paper, #f5f0e8)", minHeight: "100vh", fontFamily: "Space Mono, monospace", color: "var(--ink, #0f0e0d)" }}>

      {/* Demo Mode Banner */}
      <div style={{
        background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
        padding: "10px 20px", fontSize: "11px", fontFamily: "Space Mono",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1.5px solid var(--ink, #0f0e0d)",
        flexWrap: "wrap", gap: "8px",
      }}>
        <span>
          <b>Demo Mode</b> · Pre-loaded with Mumbai, India · 1985–2024
          {" · "}<span style={{ color: "rgba(237,232,220,0.5)" }}>Read-only — no account required</span>
        </span>
        <Link href="/register" style={{ color: "#b5451b", textDecoration: "underline",
                                        fontFamily: "Space Mono", fontSize: "10.5px" }}>
          Create free account to use your own locations →
        </Link>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1.5px solid var(--ink, #0f0e0d)", padding: "0 24px" }}>
        <Link href="/" style={{ padding: "12px 16px", fontSize: "10px", textTransform: "uppercase",
          letterSpacing: "0.1em", fontFamily: "Space Mono", textDecoration: "none",
          color: "var(--ink, #0f0e0d)", borderRight: "1px solid rgba(15,14,13,0.1)" }}>
          ← Genome
        </Link>
        {(["trends", "stats"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 16px", fontSize: "10px", textTransform: "uppercase",
            letterSpacing: "0.1em", fontFamily: "Space Mono", background: "none", border: "none",
            cursor: "pointer", color: tab === t ? "var(--ink, #0f0e0d)" : "var(--dim, #7a756e)",
            borderBottom: tab === t ? "2px solid var(--ink, #0f0e0d)" : "2px solid transparent",
            marginBottom: "-1.5px",
          }}>
            {t === "trends" ? "Climate Trends" : "Quick Stats"}
          </button>
        ))}
      </div>

      {/* Page header */}
      <div style={{ padding: "24px 32px", borderBottom: "1.5px solid var(--ink, #0f0e0d)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "18px", fontFamily: "Instrument Serif", fontStyle: "italic" }}>
            {DEMO_LOCATION.city}, {DEMO_LOCATION.country}
          </div>
          <div style={{ fontSize: "10px", color: "var(--dim, #7a756e)", marginTop: "4px" }}>
            {DEMO_LOCATION.lat.toFixed(4)}°N · {DEMO_LOCATION.lng.toFixed(4)}°E · {DEMO_LOCATION.timezone}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <Link href="/login" style={{
            padding: "8px 16px", background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
            fontFamily: "Space Mono", fontSize: "10px", textTransform: "uppercase",
            letterSpacing: "0.1em", textDecoration: "none",
          }}>
            Sign In
          </Link>
          <Link href="/register" style={{
            padding: "8px 16px", border: "1px solid var(--ink, #0f0e0d)", color: "var(--ink, #0f0e0d)",
            fontFamily: "Space Mono", fontSize: "10px", textTransform: "uppercase",
            letterSpacing: "0.1em", textDecoration: "none",
          }}>
            Register Free
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "24px 32px" }}>
        {tab === "trends" && (
          <div>
            <div style={{ marginBottom: "16px", fontSize: "11px", color: "var(--dim, #7a756e)" }}>
              Mumbai, IN · 1985–2024 · Temperature & Precipitation
            </div>
            <ClimateLineChart data={DEMO_CLIMATE_DATA} />
          </div>
        )}

        {tab === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1.5px solid var(--ink, #0f0e0d)" }}>
            {[
              { val: `${warmest.avgTemp.toFixed(1)}°C`, label: `Warmest year (${warmest.year})`, color: "#b5451b" },
              { val: `+${tempTrend}°C`, label: "40-year warming", color: "#b5451b" },
              { val: `${Math.round(wettest.totalPrecip).toLocaleString()}mm`, label: `Wettest year (${wettest.year})`, color: undefined },
              { val: `${DEMO_CLIMATE_DATA.reduce((s, d) => s + d.extremeHeatDays, 0)}`, label: "Total extreme heat days", color: undefined },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "20px 18px",
                borderRight: i < 3 ? "1px solid var(--ink, #0f0e0d)" : "none",
              }}>
                <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: "28px",
                               color: s.color || "var(--ink, #0f0e0d)", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em",
                               color: "var(--dim, #7a756e)", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick stats always visible */}
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid rgba(15,14,13,0.15)",
                      fontSize: "10.5px", color: "var(--dim, #7a756e)", lineHeight: 1.7 }}>
          This is a demo with pre-loaded Mumbai data. Sign in or register to select any location on Earth,
          compare cities, calculate decade deltas, and export raw CSV data.
        </div>
      </div>
    </div>
  );
}
