import Link from "next/link";
import FaviconSVG from "@/components/auth/FaviconSVG";

export const metadata = {
  title: "About — Genome",
  description: "Genome is a 40-year climate analytics dashboard built with Next.js, Leaflet, Chart.js, and Open-Meteo.",
};

export default function AboutPage() {
  return (
    <div style={{ background: "var(--paper, #f5f0e8)", minHeight: "100vh", fontFamily: "Space Mono, monospace" }}>

      {/* Simple nav */}
      <nav style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "14px 32px", borderBottom: "1.5px solid var(--ink, #0f0e0d)",
        background: "var(--paper, #f5f0e8)",
      }}>
        <FaviconSVG size={16} />
        <Link href="/" style={{ textDecoration: "none", color: "var(--ink, #0f0e0d)",
                                 fontFamily: "Space Mono", fontSize: "12px", fontWeight: 700 }}>
          Genome
        </Link>
        <span style={{ color: "var(--dim, #7a756e)", margin: "0 8px" }}>·</span>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--dim, #7a756e)",
                                          fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 32px", color: "var(--ink, #0f0e0d)" }}>

        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em",
                      color: "var(--dim, #7a756e)", marginBottom: "8px" }}>
          About the project
        </div>
        <h1 style={{ fontFamily: "Instrument Serif", fontStyle: "italic",
                     fontSize: "40px", lineHeight: 1.1, marginBottom: "24px", margin: "0 0 24px" }}>
          40 years in 36 hours.
        </h1>

        <p style={{ fontSize: "12px", lineHeight: 1.85, color: "var(--dim, #7a756e)", marginBottom: "20px" }}>
          Genome was built as a geospatial climate analytics dashboard.
          The goal: make 40 years of global weather data accessible, visual, and actionable
          for anyone — without a data science background.
        </p>

        <p style={{ fontSize: "12px", lineHeight: 1.85, color: "var(--dim, #7a756e)", marginBottom: "32px" }}>
          All climate data comes from the{" "}
          <a href="https://open-meteo.com" target="_blank"
             style={{ color: "var(--ink, #0f0e0d)", textDecoration: "underline" }}>
            Open-Meteo Historical Weather API
          </a>{" "}
          — a free, open-source weather archive with daily resolution from 1940 to present.
        </p>

        <div style={{ border: "1.5px solid var(--ink, #0f0e0d)", marginBottom: "32px" }}>
          <div style={{ background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
                        padding: "8px 16px", fontSize: "9.5px", textTransform: "uppercase",
                        letterSpacing: "0.12em" }}>
            Tech Stack
          </div>
          {[
            ["Framework",   "Next.js 14 (App Router)"],
            ["Language",    "TypeScript"],
            ["Database",    "MongoDB (Mongoose)"],
            ["Auth",        "NextAuth v5"],
            ["Maps",        "Leaflet.js + React Leaflet"],
            ["Charts",      "Chart.js + react-chartjs-2"],
            ["Climate API", "Open-Meteo Historical Weather API"],
            ["Geocoding",   "Nominatim (OpenStreetMap) + Photon"],
            ["Hosting",     "Vercel"],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", padding: "9px 16px",
              borderBottom: "1px solid rgba(15,14,13,0.1)",
              fontSize: "11px",
            }}>
              <span style={{ color: "var(--dim, #7a756e)" }}>{k}</span>
              <span style={{ color: "var(--ink, #0f0e0d)", fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* ── ROADMAP SECTION ── */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em",
                        color: "var(--dim, #7a756e)", marginBottom: "20px" }}>
            ROADMAP
          </div>

          {[
            { t: "Multi-Location Comparison", s: "Complete", d: "comparison across two cities simultaneously." },
            { t: "Decade-Level Deltas", s: "Complete", d: "measure 10-year shifts in temperature/rain." },
            { t: "Mobile Navigation", s: "Complete", d: "custom bottom bar for handheld devices." },
            { t: "Extreme Weather Tracking", s: "Complete", d: "daily resolution count for heat/rainfall spikes." },
            { t: "CSV Export Service", s: "Planned", d: "one-click export for all 40 years of local data." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "18px 0", borderBottom: i === 4 ? "none" : "1px solid rgba(15,14,13,0.08)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px", letterSpacing: "0.02em" }}>
                {item.t}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--dim, #7a756e)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--dim2, #a09890)" }}>{item.s} —</span> {item.d}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(15,14,13,0.08)", height: "1px" }} />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "40px" }}>
          <a href="https://github.com/Javeria-taj" target="_blank" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
            fontFamily: "Space Mono", fontSize: "11px", textTransform: "uppercase",
            letterSpacing: "0.1em", padding: "12px 24px", textDecoration: "none",
            minWidth: "200px"
          }}>
            VIEW ON GITHUB →
          </a>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--ink, #0f0e0d)", color: "var(--ink, #0f0e0d)",
            fontFamily: "Space Mono", fontSize: "11px", textTransform: "uppercase",
            letterSpacing: "0.1em", padding: "12px 24px", textDecoration: "none",
            minWidth: "200px"
          }}>
            OPEN DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  );
}
