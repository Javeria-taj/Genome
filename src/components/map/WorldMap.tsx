"use client";

import { useState, useEffect } from "react";
import { useCoordinateContext } from "@/context/CoordinateContext";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MapPrimitive = dynamic(() => import("./MapPrimitive"), { ssr: false });

export default function WorldMap({ onPinsChange }: { onPinsChange?: (count: number) => void }) {
  const [layer, setLayer] = useState<"street" | "satellite">("street");
  const { selectedCoords, locationLabel } = useCoordinateContext();
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchPins(); }, []);

  const fetchPins = async () => {
    try {
      const res = await axios.get("/api/user/saved-locations");
      setSavedLocations(res.data.locations || []);
      if (onPinsChange) onPinsChange((res.data.locations || []).length);
    } catch { /* unauthenticated or no pins */ }
  };

  const handleSave = async () => {
    if (!selectedCoords) return;
    setIsSaving(true);
    try {
      await axios.post("/api/user/saved-locations", {
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        label: locationLabel || `${selectedCoords.lat.toFixed(2)}, ${selectedCoords.lng.toFixed(2)}`
      });
      toast.success("Pin saved");
      fetchPins();
    } catch { toast.error("Failed to save pin"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/user/saved-locations?id=${id}`);
      fetchPins();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapPrimitive layer={layer} savedLocations={savedLocations} onDeleteSaved={handleDelete} />

      {/* Layer controls — Engineering Blueprint style */}
      <div className="map-ctrls">
        <button
          className={`mc-btn${layer === "street" ? " on" : ""}`}
          onClick={() => setLayer("street")}
        >Street</button>
        <button
          className={`mc-btn${layer === "satellite" ? " on" : ""}`}
          onClick={() => setLayer("satellite")}
        >Satellite</button>
      </div>

      {/* Save Pin button */}
      {selectedCoords && (
        <div style={{ position: "absolute", top: 9, left: 9, zIndex: 400 }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              border: "var(--b1)", background: "var(--paper)", color: "var(--ink)",
              fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase",
              letterSpacing: ".08em", padding: "4px 10px", cursor: "pointer",
              transition: "background .1s", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            ↗ {isSaving ? "Saving..." : "Save Pin"}
          </button>
        </div>
      )}

      {/* Info bar */}
      <div className="map-infobar">
        <span>LAT <b>{selectedCoords ? selectedCoords.lat.toFixed(4) : "––.––––"}</b></span>
        <span>LNG <b>{selectedCoords ? selectedCoords.lng.toFixed(4) : "––.––––"}</b></span>
        {savedLocations.length > 0 && <span>Pins <b>{savedLocations.length}</b></span>}
        <span style={{ marginLeft: "auto", color: "var(--dim2)" }}>Click map to drop pin — scroll to zoom</span>
      </div>
    </div>
  );
}
