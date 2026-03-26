"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { useCoordinateContext } from "@/context/CoordinateContext";
import "leaflet/dist/leaflet.css";

function createDotIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
    html: '<div style="width:9px;height:9px;background:' + color + ';border-radius:50%;border:1.5px solid ' + color + ';box-shadow:0 0 0 6px ' + color + '22;"></div>',
  });
}

const primaryIcon = createDotIcon("var(--accent)");
const savedIcon = createDotIcon("var(--blue)");

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPrimitiveProps {
  layer: "topo" | "street" | "satellite";
  savedLocations: Array<{ _id: string; lat: number; lng: number; label: string; city?: string; country?: string }>;
  onDeleteSaved: (id: string) => void;
  mapCenter?: [number, number];
  mapZoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  isDark: boolean;
}

const TILE_URLS = {
  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

export default function MapPrimitive({ 
  layer, 
  savedLocations, 
  onDeleteSaved, 
  mapCenter, 
  mapZoom, 
  onMapClick,
  isDark
}: MapPrimitiveProps) {
  const { selectedCoords, setSelectedCoords, selectedLocation } = useCoordinateContext();
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.flyTo(mapCenter, mapZoom || 10, { duration: 1.2 });
    }
  }, [mapCenter, mapZoom]);

  const handleMapClick = (lat: number, lng: number) => {
    if (onMapClick) {
      onMapClick(lat, lng);
    } else {
      setSelectedCoords({ lat, lng });
    }
  };

  const cityName = selectedLocation?.city || "";
  const countryName = selectedLocation?.country || "";

  const tileUrl = (isDark && layer !== "satellite") ? TILE_URLS.dark : TILE_URLS[layer];

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
      ref={mapRef as any}
    >
      <TileLayer url={tileUrl} />
      <ZoomControl position="bottomright" />
      <MapClickHandler onMapClick={handleMapClick} />

      {/* Active pin — popup shows city name */}
      {selectedCoords && (
        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={primaryIcon}>
          <Popup className="genome-popup" offset={[0, -8]}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, lineHeight: 1.6, minWidth: 140 }}>
              {cityName ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{cityName}</div>
                  <div style={{ color: "#7a756e" }}>{countryName}</div>
                  <div style={{ color: "#7a756e", fontSize: 10, marginTop: 2 }}>
                    {Math.abs(selectedCoords.lat).toFixed(4)}° {selectedCoords.lat >= 0 ? "N" : "S"} · {Math.abs(selectedCoords.lng).toFixed(4)}° {selectedCoords.lng >= 0 ? "E" : "W"}
                  </div>
                </>
              ) : (
                <>
                  <b>LAT</b> {selectedCoords.lat.toFixed(4)}<br />
                  <b>LNG</b> {selectedCoords.lng.toFixed(4)}
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Saved pins */}
      {savedLocations.map(loc => (
        <Marker key={loc._id} position={[loc.lat, loc.lng]} icon={savedIcon}>
          <Popup className="genome-popup">
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, minWidth: 120 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {loc.city || loc.label}
              </div>
              <div style={{ color: "var(--dim)", marginBottom: 6 }}>
                {loc.country && <span>{loc.country}<br /></span>}
                {loc.lat.toFixed(4)}° · {loc.lng.toFixed(4)}°
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSaved(loc._id); }}
                style={{ fontSize: 8, border: "1px solid var(--accent)", color: "var(--accent)", background: "transparent", padding: "2px 6px", cursor: "pointer", width: "100%", fontFamily: "inherit", textTransform: "uppercase" }}
              >
                Delete Pin
              </button>
              <button
                onClick={() => setSelectedCoords({ lat: loc.lat, lng: loc.lng })}
                style={{ fontSize: 8, border: "1px solid var(--ink)", color: "var(--ink)", background: "transparent", padding: "2px 6px", cursor: "pointer", width: "100%", marginTop: 3, fontFamily: "inherit", textTransform: "uppercase" }}
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
