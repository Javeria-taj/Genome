"use client";

import { useState } from "react";
import { YearlyClimateData } from "@/types/climate";
import Papa from "papaparse";

interface Props {
  data: YearlyClimateData[];
  label: string;
  filename: string;
  style?: React.CSSProperties;
}

export default function ExportButton({ data, label, filename, style }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleExport = () => {
    setState("loading");
    try {
      const csv = Papa.unparse(data.map(d => ({
        Year: d.year,
        "Avg Temp (°C)": d.avgTemp.toFixed(2),
        "Total Precip (mm)": d.totalPrecip.toFixed(1),
        "Heat Days (>35°C)": d.extremeHeatDays,
        "Rain Days (>50mm)": d.extremeRainDays,
      })));
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().getFullYear()}.csv`;
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
