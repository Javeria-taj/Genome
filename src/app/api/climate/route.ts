import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  try {
    const fetchWithRetry = async (start: string, end: string, retries = 3, delay = 1200) => {
      for (let i = 0; i < retries; i++) {
        try {
          const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
          const res = await axios.get(url);
          return res.data;
        } catch (err: any) {
          if (err.response?.status === 429 && i < retries - 1) {
            console.warn(`Rate limit hit for ${start}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            continue;
          }
          throw err;
        }
      }
    };

    const decades = [
      { start: "1985-01-01", end: "1994-12-31" },
      { start: "1995-01-01", end: "2004-12-31" },
      { start: "2005-01-01", end: "2014-12-31" },
      { start: "2015-01-01", end: "2024-12-31" }
    ];

    // Sequential fetching to stay within rate limits more reliably
    const results = [];
    for (const d of decades) {
      results.push(await fetchWithRetry(d.start, d.end));
    }

    const aggregatedData = new Map<string, { 
      tempSum: number; 
      precipSum: number; 
      count: number; 
      extremeHeat: number; 
      extremeRain: number 
    }>();

    for (const data of results) {
      if (!data?.daily) continue;
      const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = data.daily;
      
      for (let i = 0; i < time.length; i++) {
        const year = time[i].substring(0, 4);
        const tMax = temperature_2m_max[i];
        const tMin = temperature_2m_min[i];
        const precip = precipitation_sum[i];
        
        if (tMax === null || tMin === null || precip === null) continue;

        const avgDailyTemp = (tMax + tMin) / 2;
        
        if (!aggregatedData.has(year)) {
          aggregatedData.set(year, { tempSum: 0, precipSum: 0, count: 0, extremeHeat: 0, extremeRain: 0 });
        }
        
        const yrData = aggregatedData.get(year)!;
        yrData.tempSum += avgDailyTemp;
        yrData.precipSum += precip;
        yrData.count += 1;
        if (tMax > 35) yrData.extremeHeat += 1;
        if (precip > 50) yrData.extremeRain += 1;
      }
    }

    const finalData = Array.from(aggregatedData.entries())
      .map(([year, data]) => ({
        year: parseInt(year),
        avgTemp: data.tempSum / data.count,
        totalPrecip: data.precipSum,
        extremeHeatDays: data.extremeHeat,
        extremeRainDays: data.extremeRain
      }))
      .sort((a, b) => a.year - b.year);

    return NextResponse.json(finalData);

  } catch (error: any) {
    if (error.response?.status === 429) {
      return NextResponse.json({ error: "API rate limit exceeded. Please try again soon." }, { status: 429 });
    }
    console.error("Climate API Error:", error);
    return NextResponse.json({ error: "Failed to fetch climate data" }, { status: 500 });
  }
}
