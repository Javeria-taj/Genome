"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useTheme } from "@/context/ThemeContext";
import { useSystemHealth } from "@/hooks/useSystemHealth";

export default function Topbar() {
  const { selectedCoords, selectedLocation } = useCoordinateContext();
  const { isDark, toggle } = useTheme();
  const health = useSystemHealth();
  const [utcClock, setUtcClock] = useState("");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (selectedCoords) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(timer);
    }
  }, [selectedCoords]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, "0");
      const m = now.getUTCMinutes().toString().padStart(2, "0");
      const s = now.getUTCSeconds().toString().padStart(2, "0");
      setUtcClock("UTC " + h + ":" + m + ":" + s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="tb no-print">
      {/* Logo */}
      <Link href="/dashboard" className="tb-logo" style={{ textDecoration: "none", color: "inherit" }}>
        <svg width="18" height="18" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <defs>
            <radialGradient id="fg" cx="35%" cy="32%" r="60%">
              <stop offset="0%" stopColor="#2c8fb5"/>
              <stop offset="70%" stopColor="#0e4d68"/>
              <stop offset="100%" stopColor="#072d3f"/>
            </radialGradient>
            <clipPath id="fc"><circle cx="16" cy="16" r="11" transform="rotate(-23.5,16,16)"/></clipPath>
          </defs>
          <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(200,160,60,0.38)" strokeWidth="1.2" strokeDasharray="5 3" transform="rotate(-20,16,16)"/>
          <circle cx="16" cy="16" r="11" fill="url(#fg)" transform="rotate(-23.5,16,16)"/>
          <g clipPath="url(#fc)" stroke="none" fill="rgba(52,130,78,0.72)">
            <ellipse cx="12" cy="13" rx="4" ry="3" transform="rotate(-10,12,13)"/>
            <ellipse cx="20" cy="18" rx="3.5" ry="4" transform="rotate(8,20,18)"/>
            <ellipse cx="10" cy="20" rx="2.2" ry="2"/>
          </g>
          <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.3)" strokeWidth="2.5" transform="rotate(-23.5,16,16)"/>
          <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.08)" strokeWidth="5" transform="rotate(-23.5,16,16)"/>
          <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(212,168,60,0.9)" strokeWidth="1.8" strokeDasharray="5 3" transform="rotate(-20,16,16)" clipPath="url(#fc)"/>
        </svg>
        Genome
      </Link>

      {/* Mobile hamburger — visible only below 768px */}
      <button
        className="hamburger-btn mobile-only"
        onClick={() => window.dispatchEvent(new Event('sidebar-toggle'))}
        title="Toggle navigation"
      >
        <div className="hamburger-icon">
          <span /><span /><span />
        </div>
      </button>

      {/* Coordinates / Location display */}
      <style>{`
        @keyframes flashGreen {
          0% { color: #2ecc71; text-shadow: 0 0 8px rgba(46,204,113,0.5); }
          100% { color: inherit; text-shadow: none; }
        }
        .flash-coord span { animation: flashGreen 0.6s ease-out; }
      `}</style>
      <div className={`tb-coords ${flash ? "flash-coord" : ""}`}>
        {selectedLocation ? (
          <>
            <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: "11px" }}>
              {selectedLocation.displayName}
            </span>
            <span style={{ color: "var(--dim)", margin: "0 4px" }}>·</span>
            <span>LAT <b>{Math.abs(selectedLocation.lat).toFixed(4)}° {selectedLocation.lat >= 0 ? "N" : "S"}</b></span>
            <span>LNG <b>{Math.abs(selectedLocation.lng).toFixed(4)}° {selectedLocation.lng >= 0 ? "E" : "W"}</b></span>
          </>
        ) : selectedCoords ? (
          <>
            <span>LAT <b>{Math.abs(selectedCoords.lat).toFixed(4)}° {selectedCoords.lat >= 0 ? "N" : "S"}</b></span>
            <span>LNG <b>{Math.abs(selectedCoords.lng).toFixed(4)}° {selectedCoords.lng >= 0 ? "E" : "W"}</b></span>
          </>
        ) : (
          <span style={{ color: "var(--dim)", fontStyle: "italic", fontSize: "10px" }}>
            Click map to select location
          </span>
        )}
      </div>

      {/* Right buttons */}
      <div className="tb-right">
        {/* Dark mode toggle */}
        <button className="tb-btn" onClick={toggle} title="Toggle dark mode">
          {isDark ? "● Dark" : "○ Light"}
        </button>

        {/* API status */}
        <button className="tb-btn" style={{ cursor: "default", display: "flex", gap: "6px" }} title="System Health Monitoring">
          <div className="status-pip" style={{
            background: health.status === 'operational' ? '#2ecc71' : 
                        health.status === 'unstable' ? '#e74c3c' : '#f1c40f',
            boxShadow: health.status === 'operational' ? '0 0 6px #2ecc71' : 'none',
            animation: health.status === 'checking' ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{ fontSize: '10px' }}>
            {health.status === 'operational' ? `System: Healthy (${health.latency})` : 
             health.status === 'unstable' ? 'System: Unstable' : 'Checking Health...'}
          </span>
        </button>

        {/* UTC Clock */}
        <button className="tb-btn" style={{ cursor: "default", fontVariantNumeric: "tabular-nums" }}>
          {utcClock || "UTC --:--:--"}
        </button>
      </div>
    </div>
  );
}
