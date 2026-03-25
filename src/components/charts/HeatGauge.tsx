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
  const rafRef = useRef<number>();

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
      {/* Main gauge */}
      <div style={{ marginBottom: 4 }}>
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{ width: `${fillPct}%`, background: color, transition: "width .6s cubic-bezier(.4,0,.2,1), background .4s" }}
          >
            <div className="gauge-label">
              {sign}{displayDelta.toFixed(1)}°C
            </div>
          </div>
          {/* Segment dividers */}
          <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex: 1, borderRight: i < 3 ? "1.5px solid var(--paper)" : "none", opacity: .4 }} />
            ))}
          </div>
        </div>
        <div className="gauge-scale">
          <span>0°C</span><span>1°C</span><span>2°C</span><span>3°C</span><span>4°C</span>
        </div>
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
