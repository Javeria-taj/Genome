"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { useCoordinateContext } from "@/context/CoordinateContext";
import "leaflet/dist/leaflet.css";

// Custom red dot icon (Engineering Blueprint style)
function createDotIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
    html: `<div style="width:9px;height:9px;background:${color};border-radius:50%;border:1.5px solid ${color};box-shadow:0 0 0 6px ${color}22;"></div>`,
  });
}

const primaryIcon = createDotIcon("#e63a2e");
const savedIcon = createDotIcon("#1a6ef5");

function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

interface MapPrimitiveProps {
  layer: "street" | "satellite";
  savedLocations: Array<{ _id: string; lat: number; lng: number; label: string }>;
  onDeleteSaved: (id: string) => void;
}

const TILE_URLS = {
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export default function MapPrimitive({ layer, savedLocations, onDeleteSaved }: MapPrimitiveProps) {
  const { selectedCoords, setSelectedCoords } = useCoordinateContext();

  const handleMapClick = (e: any) => {
    setSelectedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={TILE_URLS[layer]} />
      <ZoomControl position="bottomright" />
      <MapClickHandler onMapClick={handleMapClick} />

      {/* Active pin */}
      {selectedCoords && (
        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={primaryIcon}>
          <Popup>
            <div style={{ fontFamily: "var(--mono,'Space Mono',monospace)", fontSize: 9 }}>
              <b>LAT</b> {selectedCoords.lat.toFixed(4)}<br />
              <b>LNG</b> {selectedCoords.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Saved pins */}
      {savedLocations.map(loc => (
        <Marker key={loc._id} position={[loc.lat, loc.lng]} icon={savedIcon}>
          <Popup>
            <div style={{ fontFamily: "var(--mono,'Space Mono',monospace)", fontSize: 9, minWidth: 120 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {loc.label}
              </div>
              <div style={{ color: "#7a756e", marginBottom: 6 }}>
                {loc.lat.toFixed(4)}° · {loc.lng.toFixed(4)}°
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSaved(loc._id); }}
                style={{ fontSize: 8, border: "1px solid #e63a2e", color: "#e63a2e", background: "transparent", padding: "2px 6px", cursor: "pointer", width: "100%", fontFamily: "inherit", textTransform: "uppercase" }}
              >
                Delete Pin
              </button>
              <button
                onClick={() => setSelectedCoords({ lat: loc.lat, lng: loc.lng })}
                style={{ fontSize: 8, border: "1px solid #0f0e0d", color: "#0f0e0d", background: "transparent", padding: "2px 6px", cursor: "pointer", width: "100%", marginTop: 3, fontFamily: "inherit", textTransform: "uppercase" }}
              >
                Select
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
