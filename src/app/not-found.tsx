import Link from "next/link";
import MiniEarth from "@/components/ui/MiniEarth";

export default function NotFound() {
  return (
    <div style={{
      background: "var(--paper, #f5f0e8)", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Space Mono, monospace", color: "var(--ink, #0f0e0d)",
      padding: "40px",
    }}>
      <div style={{ position: "relative", width: "200px", height: "200px",
                    marginBottom: "32px", opacity: 0.4 }}>
        <MiniEarth pins={[]} />
      </div>
      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em",
                    color: "var(--accent, #b5451b)", marginBottom: "8px" }}>
        404 — Coordinates not found
      </div>
      <h1 style={{ fontFamily: "Instrument Serif", fontStyle: "italic",
                   fontSize: "36px", marginBottom: "12px", textAlign: "center", margin: "0 0 12px" }}>
        This location doesn&apos;t exist.
      </h1>
      <p style={{ fontSize: "11.5px", color: "var(--dim, #7a756e)", marginBottom: "28px",
                  textAlign: "center", lineHeight: 1.75, maxWidth: "320px", margin: "0 0 28px" }}>
        The page you&apos;re looking for has drifted off the map.
        Try heading back to the dashboard.
      </p>
      <Link href="/dashboard" style={{
        background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
        fontFamily: "Space Mono", fontSize: "10.5px", textTransform: "uppercase",
        letterSpacing: "0.1em", padding: "11px 20px", textDecoration: "none",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        → Return to Dashboard
      </Link>
    </div>
  );
}
