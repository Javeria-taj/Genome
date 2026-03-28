"use client";

import { useEffect, useState } from "react";
import { useCoordinateContext } from "@/context/CoordinateContext";

export default function LocationInfoCard() {
  const { selectedLocation, locationLoading, selectedCoords } = useCoordinateContext();
  const [localTime, setLocalTime] = useState("");

  // Update local time every minute
  useEffect(() => {
    if (!selectedLocation?.timezone) return;

    const update = () => {
      try {
        const str = new Intl.DateTimeFormat("en-US", {
          timeZone: selectedLocation.timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setLocalTime(str);
      } catch {
        setLocalTime(new Date().toISOString().substring(11, 16));
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [selectedLocation?.timezone]);

  if (locationLoading) {
    return (
      <div style={{
        height: 72, background: "var(--paper)",
        borderLeft: "1.5px solid var(--ink)", borderRight: "1.5px solid var(--ink)", borderBottom: "1.5px solid var(--ink)", borderTop: "none",
        display: "flex", alignItems: "center", padding: "0 16px",
        overflow: "hidden", position: "relative",
      }}>
        <div className="skeleton-shimmer" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(15,14,13,0.06) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }} />
        <span style={{ fontSize: 9, color: "var(--dim)", fontFamily: "Space Mono" }}>Loading location…</span>
      </div>
    );
  }

  if (!selectedLocation || !selectedCoords) return null;

  const tz = selectedLocation.timezone.replace(/_/g, " ");

  return (
    <div className="fade-in" style={{
      display: "grid",
      gridTemplateColumns: "1.5fr 2fr 1fr 1.5fr",
      borderBottom: "1.5px solid var(--ink)",
      borderTop: "none",
      background: "var(--paper)",
      animation: "slideDown 0.25s ease-out",
    }}>
      {/* City + Country */}
      <div style={{ borderRight: "1px solid var(--ink)", padding: "10px 16px" }}>
        <div className="lic-label">Location</div>
        <div className="lic-city">{selectedLocation.city}</div>
        <div className="lic-country">{selectedLocation.country} · {selectedLocation.countryCode}</div>
      </div>

      {/* AQI */}
      <style>{`
        @keyframes breathAlert {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(200,50,50,0)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(200,50,50,0.4)); }
        }
        .breath-alert {
          animation: breathAlert 2.5s ease-in-out infinite;
          display: inline-block;
          transform-origin: left center;
        }
      `}</style>
      <div style={{ borderRight: "1px solid var(--ink)", padding: "10px 16px" }}>
        <div className="lic-label">Air Quality</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div className={`lic-aqi-val ${selectedLocation.aqi && selectedLocation.aqi > 80 ? 'breath-alert' : ''}`} style={{ color: selectedLocation.aqiColor }}>
            {selectedLocation.aqi !== null ? selectedLocation.aqi : "—"}
          </div>
          <div className={`lic-aqi-label ${selectedLocation.aqi && selectedLocation.aqi > 80 ? 'breath-alert' : ''}`} style={{ color: selectedLocation.aqiColor }}>
            {selectedLocation.aqiLabel}
          </div>
        </div>
      </div>

      {/* Local Time */}
      <div style={{ borderRight: "1px solid var(--ink)", padding: "10px 16px" }}>
        <div className="lic-label">Local Time</div>
        <div className="lic-time">{localTime || "—:—"}</div>
        <div className="lic-timezone">{tz}</div>
      </div>

      {/* Coordinates */}
      <div style={{ padding: "10px 16px" }}>
        <div className="lic-label">Coordinates</div>
        <div className="lic-coord">
          {Math.abs(selectedCoords.lat).toFixed(4)}° {selectedCoords.lat >= 0 ? "N" : "S"}
        </div>
        <div className="lic-coord">
          {Math.abs(selectedCoords.lng).toFixed(4)}° {selectedCoords.lng >= 0 ? "E" : "W"}
        </div>
      </div>
    </div>
  );
}
