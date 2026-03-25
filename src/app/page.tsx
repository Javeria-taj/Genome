import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div style={{ fontFamily: "var(--mono,'Space Mono',monospace)", background: "var(--paper,#f5f0e8)", color: "var(--ink,#0f0e0d)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", border: "var(--b2,1.5px solid #0f0e0d)" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        <div style={{ width: 9, height: 9, background: "#e63a2e", borderRadius: "50%" }} />
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: ".08em" }}>GeoSense</span>
      </div>

      {/* Headline */}
      <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 42, lineHeight: 1.15, letterSpacing: "-.01em", textAlign: "center", marginBottom: 16, maxWidth: 480 }}>
        40 years of<br />climate data,<br />mapped.
      </div>

      <p style={{ fontSize: 9, color: "var(--dim,#7a756e)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 40, textAlign: "center" }}>
        Historical weather analysis · Open-Meteo API · 1985–2024
      </p>

      {/* CTA */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {session ? (
          <Link href="/dashboard" style={{ border: "1.5px solid var(--ink,#0f0e0d)", background: "var(--ink,#0f0e0d)", color: "var(--paper,#f5f0e8)", fontFamily: "inherit", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", padding: "10px 24px", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 13, height: 13, border: "1.5px solid currentColor", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>→</span>
            Open Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" style={{ border: "1.5px solid var(--ink,#0f0e0d)", background: "var(--ink,#0f0e0d)", color: "var(--paper,#f5f0e8)", fontFamily: "inherit", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", padding: "10px 24px", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 13, height: 13, border: "1.5px solid currentColor", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>→</span>
              Sign In
            </Link>
            <Link href="/register" style={{ border: "1px solid var(--ink,#0f0e0d)", background: "transparent", color: "var(--ink,#0f0e0d)", fontFamily: "inherit", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", padding: "10px 24px", textDecoration: "none" }}>
              Create Account
            </Link>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: "1px solid var(--ink,#0f0e0d)", marginTop: 56, maxWidth: 420, width: "100%" }}>
        {[
          { val: "14,600", lbl: "Data Points" },
          { val: "40yr", lbl: "Coverage" },
          { val: "∞", lbl: "Locations" },
        ].map((s, i) => (
          <div key={s.lbl} style={{ padding: "12px 16px", borderRight: i < 2 ? "1px solid var(--ink,#0f0e0d)" : "none", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
            <div style={{ fontSize: 8, color: "var(--dim,#7a756e)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, fontSize: 8, color: "var(--dim,#7a756e)", letterSpacing: ".06em" }}>
        GeoSense v2.0 · Next.js + MongoDB + Open-Meteo
      </div>
    </div>
  );
}
