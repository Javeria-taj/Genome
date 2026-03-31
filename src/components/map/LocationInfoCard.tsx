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
    <div className="fade-in location-info-card" style={{
      borderBottom: "1.5px solid var(--ink)",
      borderTop: "none",
      background: "var(--paper)",
      animation: "slideDown 0.25s ease-out",
      display: "flex",
      overflowX: "auto",
      width: "100%",
      msOverflowStyle: "none", // Hide scrollbar for IE/Edge
      scrollbarWidth: "none",  // Hide scrollbar for Firefox
    }}>
      <style>{`
        .location-info-card::-webkit-scrollbar { display: none; }
        @keyframes breathAlert {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(200,50,50,0)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(200,50,50,0.4)); }
        }
        .breath-alert {
          animation: breathAlert 2.5s ease-in-out infinite;
          display: inline-block;
          transform-origin: left center;
        }
        .lic-section {
          flex: 1 0 160px;
          border-right: 1px solid var(--ink);
          padding: 10px 16px;
        }
        .lic-section:last-child {
          border-right: none;
        }
      `}</style>

      {/* City + Country */}
      <div className="lic-section" style={{ minWidth: "160px" }}>
        <div className="lic-label">Location</div>
        <div className="lic-city" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {selectedLocation.city}{selectedLocation.state ? `, ${selectedLocation.state}` : ""}
        </div>
        <div className="lic-country">{selectedLocation.country} · {selectedLocation.countryCode}</div>
      </div>

      {/* Air Quality */}
      <div className="lic-section">
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

      {/* Current Temp */}
      <div className="lic-section">
        <div className="lic-label">Current Temp</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div className="lic-aqi-val" style={{ color: 'var(--accent)' }}>
            {selectedLocation.currentTemp !== null ? `${selectedLocation.currentTemp.toFixed(1)}°C` : "—"}
          </div>
          <div className="lic-aqi-label" style={{ color: 'var(--dim)' }}>
            Real-time
          </div>
        </div>
      </div>

      {/* Local Time */}
      <div className="lic-section">
        <div className="lic-label">Local Time</div>
        <div className="lic-time">{localTime || "—:—"}</div>
        <div className="lic-timezone" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tz}
        </div>
      </div>

      {/* Coordinates */}
      <div className="lic-section">
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
