"use client";

import { useEffect, useState } from "react";
import { useCoordinateContext } from "@/context/CoordinateContext";
import { useTheme } from "@/context/ThemeContext";

export default function Topbar() {
  const { selectedCoords } = useCoordinateContext();
  const { isDark, toggle } = useTheme();
  const [utcClock, setUtcClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, "0");
      const m = now.getUTCMinutes().toString().padStart(2, "0");
      const s = now.getUTCSeconds().toString().padStart(2, "0");
      setUtcClock(`UTC ${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const lat = selectedCoords ? selectedCoords.lat.toFixed(4) : "––.––––";
  const lng = selectedCoords ? selectedCoords.lng.toFixed(4) : "––.––––";

  return (
    <div className="tb no-print">
      {/* Logo */}
      <div className="tb-logo" onClick={() => window.location.href = "/dashboard"}>
        <div className="logo-pip" />
        GeoSense
      </div>

      {/* Coordinates */}
      <div className="tb-coords">
        <span>LAT <b>{lat} {selectedCoords && selectedCoords.lat >= 0 ? "N" : "S"}</b></span>
        <span>LNG <b>{lng} {selectedCoords && selectedCoords.lng >= 0 ? "E" : "W"}</b></span>
        {selectedCoords && <span>ALT <b>—m</b></span>}
      </div>

      {/* Right buttons */}
      <div className="tb-right">
        {/* Dark mode toggle */}
        <button className="tb-btn" onClick={toggle} title="Toggle dark mode">
          {isDark ? "● Dark" : "○ Light"}
        </button>

        {/* API status */}
        <button className="tb-btn" style={{ cursor: "default" }}>
          <div className="status-pip" />
          Open-Meteo Live
        </button>

        {/* UTC Clock */}
        <button className="tb-btn" style={{ cursor: "default", fontVariantNumeric: "tabular-nums" }}>
          {utcClock || "UTC --:--:--"}
        </button>
      </div>
    </div>
  );
}
