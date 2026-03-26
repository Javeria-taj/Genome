import { NextResponse } from "next/server";
import axios from "axios";

// ─── Server-side in-memory cache (24h TTL) ────────────────────────────────────
// Eliminates repeat Open-Meteo calls for the same coordinates.
// Cache is shared across all requests within the same server instance lifetime.
const SERVER_CACHE = new Map<string, { data: unknown[]; ts: number }>();
const SERVER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Round coords to 2 decimal places (~1km precision) for cache key
function cacheKey(lat: string, lng: string) {
  return `${parseFloat(lat).toFixed(2)},${parseFloat(lng).toFixed(2)}`;
}

// ─── Direct Open-Meteo call — single request for full 40-year range ──────────
// Uses one request instead of 4 decade splits. Open-Meteo archive API
// supports date ranges of up to 40 years in a single call.
const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

async function fetchArchive(lat: string, lng: string, retries = 3, baseDelay = 1500) {
  const url =
    `${OPEN_METEO_ARCHIVE_URL}?latitude=${lat}&longitude=${lng}` +
    `&start_date=1985-01-01&end_date=2024-12-31` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 30000 });
      return res.data;
    } catch (err: any) {
      const is429 = err.response?.status === 429;
      if (is429 && attempt < retries - 1) {
        const wait = baseDelay * (attempt + 1);
        console.warn(`[climate] 429 rate limit — retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");

  if (!latRaw || !lngRaw) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  // Normalize longitude to -180 to 180 range (Surgical Fix)
  const latNum = parseFloat(latRaw);
  const lngNum = parseFloat(lngRaw);
  const normalizedLng = ((lngNum + 180) % 360 + 360) % 360 - 180;
  
  const lat = latNum.toString();
  const lng = normalizedLng.toString();

  const key = cacheKey(lat, lng);

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const cached = SERVER_CACHE.get(key);
  if (cached && Date.now() - cached.ts < SERVER_CACHE_TTL) {
    console.log(`[climate] Cache HIT for ${key} — 0 Open-Meteo calls made`);
    return NextResponse.json(cached.data);
  }

  // ── Cache miss: fetch from Open-Meteo (1 call total) ──────────────────────
  try {
    console.log(`[climate] Cache MISS for ${key} — fetching from Open-Meteo`);
    const raw = await fetchArchive(lat, lng);

    if (!raw?.daily) {
      return NextResponse.json({ error: "No data returned from Open-Meteo" }, { status: 502 });
    }

    const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = raw.daily;

    // Aggregate daily data into yearly summaries
    const aggregated = new Map<string, {
      tempSum: number; precipSum: number; count: number;
      extremeHeat: number; extremeRain: number;
    }>();

    for (let i = 0; i < time.length; i++) {
      const year = time[i].substring(0, 4);
      const tMax = temperature_2m_max[i];
      const tMin = temperature_2m_min[i];
      const precip = precipitation_sum[i];
      if (tMax === null || tMin === null || precip === null) continue;

      if (!aggregated.has(year)) {
        aggregated.set(year, { tempSum: 0, precipSum: 0, count: 0, extremeHeat: 0, extremeRain: 0 });
      }
      const yr = aggregated.get(year)!;
      yr.tempSum += (tMax + tMin) / 2;
      yr.precipSum += precip;
      yr.count += 1;
      if (tMax > 35) yr.extremeHeat += 1;
      if (precip > 50) yr.extremeRain += 1;
    }

    const finalData = Array.from(aggregated.entries())
      .map(([year, d]) => ({
        year: parseInt(year),
        avgTemp: d.tempSum / d.count,
        totalPrecip: d.precipSum,
        extremeHeatDays: d.extremeHeat,
        extremeRainDays: d.extremeRain,
      }))
      .sort((a, b) => a.year - b.year);

    // Store in server cache
    SERVER_CACHE.set(key, { data: finalData, ts: Date.now() });

    return NextResponse.json(finalData);

  } catch (error: any) {
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again soon." },
        { status: 429 }
      );
    }
    console.error("[climate] Fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch climate data" }, { status: 500 });
  }
}
