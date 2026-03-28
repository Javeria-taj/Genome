"use client";

import { useEffect, useRef, useState } from "react";

interface HeatGaugeProps {
  delta: number;
  previousDelta?: number;
}

function getColor(d: number) {
  if (d < 1.0) return "var(--dim)";
  if (d < 2.0) return "#e6a020";
  return "var(--red)";
}

const DECADE_LABELS = ["1980s", "1990s", "2000s", "2010s"];
const DECADE_HEIGHTS = [30, 50, 68, 88];

export default function HeatGauge({ delta, previousDelta = 0 }: HeatGaugeProps) {
  const [displayDelta, setDisplayDelta] = useState(previousDelta);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = previousDelta;
    const end = delta;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeInOutQuart
      const eased = progress < 0.5 
        ? 8 * progress ** 4 
        : 1 - (-2 * progress + 2) ** 4 / 2;
      setDisplayDelta(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [delta, previousDelta]);

  const fillPct = Math.min((displayDelta / 4) * 100, 100);
  const sign = displayDelta >= 0 ? "+" : "";
  const color = getColor(displayDelta);

  return (
    <div>
      {/* Main SVG Gauge */}
      <div style={{ position: "relative", width: "100%", maxWidth: "200px", margin: "0 auto", height: 75, marginBottom: 12 }}>
        <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="var(--paper2)" strokeWidth="10" strokeLinecap="square" />
          <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke={color} strokeWidth="10" strokeLinecap="square"
                strokeDasharray={Math.PI * 40}
                strokeDashoffset={Math.PI * 40 * (1 - fillPct / 100)}
                style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.4s" }} />
          {/* Tick marks */}
          <line x1="50" y1="5" x2="50" y2="0" stroke="var(--dim)" strokeWidth="1" />
          <line x1="10" y1="45" x2="4" y2="45" stroke="var(--dim)" strokeWidth="1" />
          <line x1="90" y1="45" x2="96" y2="45" stroke="var(--dim)" strokeWidth="1" />
        </svg>
        <div style={{ position: "absolute", bottom: -8, left: 0, right: 0, textAlign: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          {sign}{displayDelta.toFixed(1)}°
        </div>
      </div>
      <div className="gauge-scale" style={{ maxWidth: "200px", margin: "0 auto 12px" }}>
        <span>0°C</span><span>2°C</span><span>4°C+</span>
      </div>

      {/* Decade mini-bars */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {DECADE_LABELS.map((lbl, i) => {
          const col = i < 2 ? "var(--dim)" : i === 2 ? "color-mix(in srgb, var(--red) 50%, var(--dim))" : "var(--red)";
          return (
            <div key={lbl} style={{ textAlign: "center", flex: 1 }}>
              <div className="gm-bar">
                <div className="gm-fill" style={{ height: `${DECADE_HEIGHTS[i]}%`, background: col }} />
              </div>
              <div className="gm-lbl">{lbl}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
