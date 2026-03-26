"use client";

import { useState } from "react";
import { YearlyClimateData } from "@/types/climate";
import Papa from "papaparse";

interface LocationMeta {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface Props {
  data: YearlyClimateData[];
  label: string;
  filename: string;
  locationInfo?: LocationMeta;
  style?: React.CSSProperties;
}

const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

export default function ExportButton({ data, label, filename, locationInfo, style }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleExport = () => {
    setState("loading");
    try {
      const rows = data.map(d => ({
        Year: d.year,
        City: locationInfo?.city || "",
        Country: locationInfo?.country || "",
        Latitude: locationInfo ? locationInfo.lat.toFixed(4) : "",
        Longitude: locationInfo ? locationInfo.lng.toFixed(4) : "",
        "Avg Temp (°C)": d.avgTemp.toFixed(2),
        "Total Precip (mm)": Math.round(d.totalPrecip),
        "Heat Days (>35°C)": d.extremeHeatDays,
        "Rain Days (>50mm)": d.extremeRainDays,
      }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Use genome brand + city slug in filename
      let finalName = filename;
      if (locationInfo?.city) {
        const citySlug = sanitize(locationInfo.city);
        const year = new Date().getFullYear();
        // filename already contains the type; wrap it
        finalName = "genome--" + sanitize(filename.replace(/^geosense-?/, "")) + "--" + citySlug + "--" + year;
      }
      a.download = finalName + ".csv";

      a.click();
      URL.revokeObjectURL(url);
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      className="exp-btn"
      onClick={handleExport}
      disabled={state !== "idle"}
      style={style}
    >
      <i className="exp-ico" style={style ? { borderColor: "currentColor" } : undefined}>
        {state === "done" ? "✓" : "↓"}
      </i>
      {state === "loading" ? "Downloading..." : state === "done" ? "Downloaded!" : label}
    </button>
  );
}
