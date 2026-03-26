import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { YearlyClimateData } from "@/types/climate";
import toast from "react-hot-toast";

// ─── Module-level client-side cache ──────────────────────────────────────────
// Shared across ALL instances of this hook (dashboard, trends, delta, extremes,
// compare). Once any page fetches data for a location, every other page reads
// from this cache — zero additional /api/climate calls.
const CLIENT_CACHE = new Map<string, { data: YearlyClimateData[]; ts: number }>();
const CLIENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Round to 2 decimal places (~1km) — same precision as server cache key
function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export function useClimateData(lat: number | null, lng: number | null) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<YearlyClimateData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClimateData = useCallback(async (latitude: number, longitude: number) => {
    const key = cacheKey(latitude, longitude);

    // ── Client cache hit: return immediately, no network call ──────────────
    const cached = CLIENT_CACHE.get(key);
    if (cached && Date.now() - cached.ts < CLIENT_CACHE_TTL) {
      setData(cached.data);
      return cached.data;
    }

    // ── Cache miss: call our own /api/climate route ──────────────────────
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/climate?lat=${latitude}&lng=${longitude}`);
      CLIENT_CACHE.set(key, { data: res.data, ts: Date.now() });
      setData(res.data);
      toast.success("Telemetry sync complete");
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "API limit reached or network error";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lat !== null && lng !== null) {
      fetchClimateData(lat, lng);
    } else {
      setData(null);
    }
  }, [lat, lng, fetchClimateData]);

  const refetch = useCallback(() => {
    if (lat !== null && lng !== null) {
      // Force refresh: clear this key from cache then re-fetch
      const key = cacheKey(lat, lng);
      CLIENT_CACHE.delete(key);
      fetchClimateData(lat, lng);
    }
  }, [lat, lng, fetchClimateData]);

  return { data, loading, error, refetch, fetchClimateData };
}
