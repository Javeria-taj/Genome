"use client";

import { useState, useEffect, useRef } from "react";
import { useCoordinateContext, LocationInfo } from "@/context/CoordinateContext";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import LocationInfoCard from "./LocationInfoCard";
import { useTheme } from "@/context/ThemeContext";

const MapPrimitive = dynamic(() => import("./MapPrimitive"), { ssr: false });

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    country?: string;
    country_code?: string;
  };
}

// ─── Geocoding helpers ────────────────────────────────────────────────────────

const getAQIInfo = (v: number): { label: string; color: string } => {
  if (v <= 20) return { label: "Good", color: "#2ecc71" };
  if (v <= 40) return { label: "Fair", color: "#f39c12" };
  if (v <= 60) return { label: "Moderate", color: "#e67e22" };
  if (v <= 80) return { label: "Poor", color: "var(--accent)" };
  return { label: "Very Poor", color: "#8b1a1a" };
};
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!text) return <span></span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  );
};

// ─── Module-level AQI cache (1h TTL) ────────────────────────────────────────
// Keyed by lat/lng rounded to 2dp (~1km precision). Prevents repeat AQI calls
// when the user clicks the same area multiple times or re-selects a city.
const AQI_CACHE = new Map<string, { result: any; ts: number }>();
const AQI_CACHE_TTL = 30 * 60 * 1000;

const WEATHER_CACHE = new Map<string, { result: number | null; ts: number }>();
const WEATHER_CACHE_TTL = 15 * 60 * 1000; // 15 mins for current weather // 1 hour

// ─── Search cache (1h TTL) ───────────────────────────────────────────────────
const GEO_SEARCH_CACHE = new Map<string, { results: any[]; ts: number }>();
const GEO_SEARCH_CACHE_TTL = 60 * 60 * 1000;

async function _fetchAQIRaw(lat: number, lng: number) {
  const res = await fetch(
    "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat + "&longitude=" + lng + "&hourly=european_aqi&timezone=auto&forecast_days=1"
  );
  const data = await res.json();
  const values: number[] = data.hourly?.european_aqi || [];
  const aqi = values.filter((v) => v !== null).slice(-1)[0] ?? 0;
  return { aqi, ...getAQIInfo(aqi), timezone: data.timezone || "UTC" };
}

const fetchAQI = async (lat: number, lng: number) => {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = AQI_CACHE.get(key);
  if (cached && Date.now() - cached.ts < AQI_CACHE_TTL) return cached.result;
  try {
    const result = await _fetchAQIRaw(lat, lng);
    AQI_CACHE.set(key, { result, ts: Date.now() });
    return result;
  } catch {
    return { aqi: null, label: "Unknown", color: "var(--dim)", timezone: "UTC" };
  }
};

async function _fetchWeatherRaw(lat: number, lng: number): Promise<number | null> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
  );
  const data = await res.json();
  return data.current_weather?.temperature ?? null;
}

const fetchWeather = async (lat: number, lng: number) => {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = WEATHER_CACHE.get(key);
  if (cached && Date.now() - cached.ts < WEATHER_CACHE_TTL) return cached.result;
  try {
    const result = await _fetchWeatherRaw(lat, lng);
    WEATHER_CACHE.set(key, { result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
};

const reverseGeocode = async (lat: number, lng: number): Promise<Omit<LocationInfo, "aqi" | "aqiLabel" | "aqiColor">> => {
  const res = await fetch(
    "https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lng + "&format=json&zoom=10&extratags=1",
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  const addr = data.address || {};

  // Exhaustive fallback for city/region name
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.suburb ||
    addr.hamlet ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.city_district ||
    addr.county ||
    addr.state_district ||
    addr.state ||
    `Point ${lat.toFixed(2)}, ${lng.toFixed(2)}`;

  const state = addr.state || addr.province || addr.region || addr.state_district || "";
  const country = addr.country || "";
  const countryCode = (addr.country_code || "").toUpperCase();
  const displayName = city + (state ? ", " + state : "") + ", " + countryCode;
  const timezone = data.extratags?.timezone || "UTC";
  return { city, state, country, countryCode, displayName, timezone, lat, lng, currentTemp: null };
};

async function loadLocationInfo(lat: number, lng: number): Promise<LocationInfo> {
  const [geo, aqiData, currentTemp] = await Promise.all([
    reverseGeocode(lat, lng),
    fetchAQI(lat, lng),
    fetchWeather(lat, lng),
  ]);
  return {
    ...geo,
    timezone: aqiData.timezone || geo.timezone,
    aqi: aqiData.aqi,
    aqiLabel: aqiData.label,
    aqiColor: aqiData.color,
    currentTemp,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorldMap({ onPinsChange }: { onPinsChange?: (count: number) => void }) {
  const [layer, setLayer] = useState<"topo" | "street" | "satellite">("topo");
  const {
    selectedCoords, setSelectedCoords,
    locationLabel, setLocationLabel,
    selectedLocation, setSelectedLocation,
    setLocationLoading,
  } = useCoordinateContext();

  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : undefined
  );
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // ── Search autocomplete state ──
  const [query, setQuery] = useState(locationLabel || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [pulsePin, setPulsePin] = useState(false);

  useEffect(() => { fetchPins(); }, []);

  useEffect(() => {
    if (locationLabel) {
      setQuery(locationLabel);
    }
  }, [locationLabel]);

  const fetchPins = async () => {
    try {
      const res = await axios.get("/api/user/saved-locations");
      setSavedLocations(res.data.locations || []);
      if (onPinsChange) onPinsChange((res.data.locations || []).length);
    } catch { /* unauthenticated or no pins */ }
  };

  useEffect(() => { fetchPins(); }, []);

  // Re-center map and load info when coords change (e.g. from Sidebar)
  useEffect(() => {
    if (selectedCoords) {
      setMapCenter([selectedCoords.lat, selectedCoords.lng]);
      handleLoadLocation(selectedCoords.lat, selectedCoords.lng);
    }
  }, [selectedCoords]);

  // ── Load location info after coord change ──
  const handleLoadLocation = async (lat: number, lng: number) => {
    setLocationLoading(true);
    setPulsePin(true);
    setTimeout(() => setPulsePin(false), 800);
    try {
      const info = await loadLocationInfo(lat, lng);
      setSelectedLocation(info);
      setLocationLabel(info.displayName);
    } catch {
      setSelectedLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  // Called from MapPrimitive on map click
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });

  };

  // ── Save pin ──
  const handleSave = async () => {
    if (!selectedCoords || !selectedLocation) return;
    setIsSaving(true);
    try {
      await axios.post("/api/user/saved-locations", {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        label: selectedLocation.displayName,
        city: selectedLocation.city,
        country: selectedLocation.country,
        countryCode: selectedLocation.countryCode,
        timezone: selectedLocation.timezone,
      });
      toast.success("📍 " + selectedLocation.city + " saved to pins");
      fetchPins();
      setPulsePin(true);
      setTimeout(() => setPulsePin(false), 800);
    } catch { toast.error("Failed to save pin"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/user/saved-locations?id=" + id);
      fetchPins();
    } catch { toast.error("Delete failed"); }
  };

  // ── Autocomplete search ──
  const fetchFromPhoton = async (q: string) => {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.features
      .filter((f: any) =>
        ['city', 'town', 'village', 'hamlet'].includes(f.properties?.type || "") ||
        f.properties?.osm_value === 'city'
      )
      .map((f: any) => ({
        place_id: f.properties.osm_id,
        lat: f.geometry.coordinates[1].toString(),
        lon: f.geometry.coordinates[0].toString(),
        display_name: `${f.properties.name}, ${f.properties.country}`,
        address: {
          city: f.properties.name,
          country: f.properties.country,
          country_code: f.properties.countrycode?.toLowerCase(),
          state: f.properties.state,
        }
      }));
  };

  const fetchFromNominatim = async (q: string) => {
    const params = new URLSearchParams({
      q: q, format: 'json', limit: '8', addressdetails: '1', featuretype: 'city',
      'accept-language': 'en', countrycodes: '', dedupe: '1',
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'Genome-Dashboard/3.2' }
    });
    const data = await res.json();
    const qLower = q.toLowerCase();
    const filtered = data.filter((r: any) => {
      const addr = r.address || {};
      const primaryName = (addr.city || addr.town || addr.village || addr.municipality || addr.county || r.display_name.split(',')[0] || "").toLowerCase();
      return primaryName.startsWith(qLower) || primaryName.includes(qLower);
    });
    return filtered.sort((a: any, b: any) => {
      const aName = (a.address?.city || a.address?.town || a.display_name.split(',')[0] || "").toLowerCase();
      const bName = (b.address?.city || b.address?.town || b.display_name.split(',')[0] || "").toLowerCase();
      return (aName.startsWith(qLower) ? 0 : 1) - (bName.startsWith(qLower) ? 0 : 1);
    }).slice(0, 6);
  };

  const fetchSuggestions = async (q: string) => {
    const queryTerm = q.trim().toLowerCase();
    if (queryTerm.length < 1) { setSuggestions([]); setShowSuggestions(false); setNoResults(false); return; }

    setIsSearching(true);
    setNoResults(false);
    try {
      let results = await fetchFromPhoton(q);
      if (results.length === 0) {
        results = await fetchFromNominatim(q);
      }
      GEO_SEARCH_CACHE.set(queryTerm, { results, ts: Date.now() });
      setSuggestions(results);
      setShowSuggestions(true);
      setNoResults(results.length === 0);
      setFocusedIdx(-1);
    } catch { setSuggestions([]); setNoResults(true); }
    finally { setIsSearching(false); }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Immediate Cache Look-up (0ms delay)
    const cached = GEO_SEARCH_CACHE.get(val.trim().toLowerCase());
    if (cached && Date.now() - cached.ts < GEO_SEARCH_CACHE_TTL) {
      setSuggestions(cached.results);
      setShowSuggestions(true);
      setNoResults(cached.results.length === 0);
      return;
    }

    // Debounced search (30ms delay)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const getSuggestionCity = (s: NominatimResult) => {
    const addr = s.address || {};
    return addr.city || addr.town || addr.village || addr.county || s.display_name.split(",")[0];
  };

  const handleSelectSuggestion = async (s: NominatimResult) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const addr = s.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || s.display_name.split(",")[0];
    const countryCode = (addr.country_code || "").toUpperCase();
    setQuery(city + ", " + countryCode);
    setShowSuggestions(false);
    setSuggestions([]);
    setFocusedIdx(-1);
    setMapCenter([lat, lng]);
    setSelectedCoords({ lat, lng });
    await handleLoadLocation(lat, lng);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (focusedIdx >= 0 && suggestions[focusedIdx]) {
        handleSelectSuggestion(suggestions[focusedIdx]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, -1));
    }
  };

  const { isDark } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", flex: 1, minHeight: 0 }}>
      {/* 3D Perspective Map Layer */}
      <div className="map-perspective-wrapper" style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <div className="map-tilt-inner" ref={mapWrapperRef} style={{ height: "100%" }}>
          <div style={{ height: "100%", width: "100%" }}>
            <MapPrimitive
              layer={layer}
              savedLocations={savedLocations}
              onDeleteSaved={handleDelete}
              mapCenter={mapCenter}
              onMapClick={handleMapClick}
              isDark={isDark}
            />
          </div>
          {/* Scientific Overlay when loading */}
          {pulsePin && (
            <div
              className="ripple"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '100px', height: '100px',
                border: '2px solid var(--accent)',
                borderRadius: '50%',
                zIndex: 2000,
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Search Input with Autocomplete */}
        <div style={{ position: "absolute", top: "46px", left: "10px", zIndex: 1000, width: "260px" }}>
          <div style={{ display: "flex", border: "1.5px solid var(--ink)" }}>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search city, country..."
              style={{
                flex: 1, fontFamily: "Space Mono", fontSize: "11px",
                padding: "7px 11px", background: "var(--paper)", color: "var(--ink)",
                border: "none", outline: "none",
              }}
            />
            {isSearching ? (
              <div style={{ padding: "7px 12px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "var(--dim)", fontFamily: "Space Mono" }}>...</span>
              </div>
            ) : (
              <button
                onClick={() => suggestions.length > 0 && handleSelectSuggestion(suggestions[0])}
                style={{
                  padding: "7px 14px", background: "var(--ink)", color: "var(--paper)",
                  border: "none", fontFamily: "Space Mono", fontSize: "10px",
                  textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {(showSuggestions || noResults) && (
            <div
              ref={suggestionsRef}
              className="search-dropdown"
              style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "var(--paper)", border: "1px solid var(--ink)",
                borderTop: "none", zIndex: 2000, maxHeight: "240px", overflowY: "auto",
              }}
            >
              {noResults && query.length >= 2 ? (
                <div style={{
                  padding: '10px 12px', fontSize: '10px', color: 'var(--dim)',
                  fontFamily: 'Space Mono', fontStyle: 'italic',
                }}>
                  No cities found for "{query}"
                </div>
              ) : (
                suggestions.map((s, i) => {
                  const addr = s.address || {};
                  const city = getSuggestionCity(s);
                  const country = addr.country || "";
                  const countryCode = (addr.country_code || "").toUpperCase();
                  const isFocused = i === focusedIdx;
                  return (
                    <div
                      key={s.place_id}
                      onMouseDown={() => handleSelectSuggestion(s)}
                      style={{
                        padding: "8px 12px", cursor: "pointer",
                        borderBottom: i < suggestions.length - 1 ? "1px solid rgba(15,14,13,0.1)" : "none",
                        transition: "background 0.1s",
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        background: isFocused ? "var(--paper2)" : "transparent",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isFocused ? "var(--paper2)" : "transparent")}
                    >
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--ink)", fontFamily: "Space Mono" }}>
                          <HighlightMatch text={city} query={query} />
                        </div>
                        <div style={{ fontSize: "9.5px", color: "var(--dim)", fontFamily: "Space Mono", marginTop: "1px" }}>
                          {country}
                        </div>
                      </div>
                      {countryCode && (
                        <div style={{
                          fontSize: "8.5px", color: "var(--dim)", fontFamily: "Space Mono",
                          border: "1px solid var(--dim)", padding: "1px 5px", letterSpacing: "0.06em",
                          flexShrink: 0, marginLeft: 8,
                        }}>
                          {countryCode}
                        </div>
                      )}
                    </div>
                  );
                }))}
            </div>
          )}
        </div>

        {/* Layer controls */}
        <div className="map-ctrls">
          <button className={"mc-btn" + (layer === "topo" ? " on" : "")} onClick={() => setLayer("topo")}>Topo</button>
          <button className={"mc-btn" + (layer === "street" ? " on" : "")} onClick={() => setLayer("street")}>Street</button>
          <button className={"mc-btn" + (layer === "satellite" ? " on" : "")} onClick={() => setLayer("satellite")}>Satellite</button>
        </div>

        {/* Save Pin button */}
        {selectedCoords && (
          <div style={{ position: "absolute", top: 9, left: 9, zIndex: 400 }}>
            <style>{`
              @keyframes pinPulse {
                0% { box-shadow: 0 0 0 0 rgba(181,69,27,0.5); }
                70% { box-shadow: 0 0 0 8px rgba(181,69,27,0); }
                100% { box-shadow: 0 0 0 0 rgba(181,69,27,0); }
              }
              .save-pin-btn.fresh { animation: pinPulse 0.8s ease-out; }
            `}</style>
            <button
              className={`save-pin-btn ${pulsePin ? "fresh" : ""}`}
              onClick={handleSave}
              disabled={isSaving}
              style={{
                border: "var(--b1)", background: "var(--paper)", color: "var(--ink)",
                fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase",
                letterSpacing: ".08em", padding: "4px 10px", cursor: "pointer",
                transition: "background .1s", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {"↗"} {isSaving ? "Saving..." : "Save Pin"}
            </button>
          </div>
        )}
      </div>

      {/* Location Info Card rendered below the map */}
      <LocationInfoCard />
    </div>
  );
}
