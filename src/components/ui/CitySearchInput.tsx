"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface Result {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

interface Props {
  onSelect: (city: string, lat: number, lng: number) => void;
  placeholder?: string;
  defaultValue?: string;
}

export default function CitySearchInput({ onSelect, placeholder = "Search city...", defaultValue = "" }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&format=json`
        );
        setResults(res.data?.results || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (r: Result) => {
    const label = `${r.name}${r.admin1 ? `, ${r.admin1}` : ""}, ${r.country}`;
    setQuery(label);
    setOpen(false);
    onSelect(label, r.latitude, r.longitude);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        className="city-inp"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{ width: "100%" }}
      />
      {loading && (
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "var(--dim)" }}>
          …
        </div>
      )}
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999,
          border: "var(--b1)", background: "var(--paper)", maxHeight: 180, overflowY: "auto"
        }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                padding: "6px 10px", fontSize: 9, cursor: "pointer",
                borderBottom: "var(--bh)", color: "var(--ink)",
                fontFamily: "var(--mono)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "color-mix(in srgb, var(--ink) 7%, transparent)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 700 }}>{r.name}</span>
              {r.admin1 && <span style={{ color: "var(--dim)" }}>, {r.admin1}</span>}
              <span style={{ color: "var(--dim)" }}>, {r.country}</span>
              <span style={{ float: "right", fontSize: 8, color: "var(--dim2)" }}>
                {r.latitude.toFixed(2)}° {r.longitude.toFixed(2)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
