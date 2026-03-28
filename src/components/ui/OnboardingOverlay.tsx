"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "01 — Pin a location",
    body: "Click anywhere on the world map below. Genome will instantly show you the city name, air quality, and local time.",
    target: "map",
    arrow: "down",
  },
  {
    title: "02 — Explore 40 years of data",
    body: "After pinning a location, navigate to Climate Trends in the sidebar. Your 40-year temperature and precipitation profile loads automatically.",
    target: "trends",
    arrow: "right",
  },
  {
    title: "03 — Explore and compare",
    body: "Use the sidebar to compare two cities, calculate decade temperature rise, track extreme events, and export your data as CSV.",
    target: "sidebar",
    arrow: "left",
  },
];

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("genome-onboarding-complete");
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("genome-onboarding-complete", "1");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      <style>{`
        @keyframes onboardFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cardPopIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Dim overlay */}
      <div style={{
        position: "fixed", inset: 0, background: "rgba(9,9,15,0.65)",
        zIndex: 40, pointerEvents: "none",
        animation: "onboardFadeIn 0.25s ease-out",
      }}/>

      {/* Floating card — positioned near bottom-center */}
      <div style={{
        position: "fixed",
        bottom: "80px", left: "50%", transform: "translateX(-50%)",
        zIndex: 50,
        background: "var(--paper, #f5f0e8)",
        border: "1.5px solid var(--ink, #0f0e0d)",
        padding: "20px 24px",
        width: "min(360px, calc(100vw - 32px))",
        boxShadow: "6px 6px 0 rgba(15,14,13,0.2)",
        animation: "cardPopIn 0.22s ease-out",
        fontFamily: "Space Mono, monospace",
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: "3px",
              background: i <= step ? "var(--ink, #0f0e0d)" : "rgba(15,14,13,0.15)",
              transition: "background 0.2s",
            }}/>
          ))}
        </div>

        <div style={{ fontSize: "10px", textTransform: "uppercase",
                      letterSpacing: "0.12em", color: "var(--accent, #b5451b)", marginBottom: "6px" }}>
          {current.title}
        </div>
        <p style={{ fontSize: "11.5px", lineHeight: 1.75,
                    color: "var(--ink, #0f0e0d)", marginBottom: "16px", margin: "0 0 16px" }}>
          {current.body}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={dismiss} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "Space Mono", fontSize: "10px", color: "var(--dim, #7a756e)",
            textDecoration: "underline",
          }}>
            Skip tour
          </button>

          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : dismiss()}
            style={{
              background: "var(--ink, #0f0e0d)", color: "var(--paper, #f5f0e8)",
              border: "none", fontFamily: "Space Mono", fontSize: "10.5px",
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "8px 16px", cursor: "pointer",
            }}>
            {step < STEPS.length - 1 ? "Next →" : "Start exploring →"}
          </button>
        </div>
      </div>
    </>
  );
}
