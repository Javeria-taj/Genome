"use client";

import { useRef, useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend, ChartOptions
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DataPoint { year: number; avgTemp: number; totalPrecip: number; }
interface Props { dataA: DataPoint[]; dataB: DataPoint[]; labelA: string; labelB: string; }

export default function ComparisonChart({ dataA, dataB, labelA, labelB }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);

  const labels = dataA.map(d => d.year.toString());

  const inkColor = isDark ? "#ede8dc" : "#0f0e0d";
  const dimColor = isDark ? "#8a8278" : "#7a756e";
  const paperColor = isDark ? "#1c1a17" : "#f5f0e8";
  const gridColor = isDark ? "rgba(237,232,220,0.10)" : "rgba(15,14,13,0.10)";
  const accentColor = isDark ? "#d4672a" : "#b5451b";
  const accentGlow = isDark ? "rgba(212,103,42,0.08)" : "rgba(181,69,27,0.07)";
  const blueColor = isDark ? "#4d7ff0" : "#2259c7";
  const blueGlow = isDark ? "rgba(77,127,240,0.08)" : "rgba(34,89,199,0.06)";

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false, axis: "x" },
    hover: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        position: "nearest",
        backgroundColor: isDark ? "#232018" : "#f5f0e8",
        borderColor: isDark ? "rgba(237,232,220,0.4)" : "rgba(15,14,13,0.4)",
        borderWidth: 1,
        titleColor: inkColor,
        bodyColor: dimColor,
        titleFont: { family: "Space Mono", size: 12, weight: "bold" as any },
        bodyFont: { family: "Space Mono", size: 11 },
        padding: 11,
        cornerRadius: 0,
        displayColors: true,
        callbacks: {
          title: (items) => "Year: " + items[0].label,
          label: (item) => {
            const cityName = item.datasetIndex === 0 ? labelA : labelB;
            return " " + cityName + " Temp: " + (item.raw as number).toFixed(1) + "\u00b0C";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor, lineWidth: 0.5 },
        ticks: { font: { family: "Space Mono", size: 11 }, color: dimColor, maxRotation: 0 },
        border: { color: inkColor, width: 1.2 },
      },
      y: {
        grid: { color: gridColor, lineWidth: 0.5 },
        ticks: { font: { family: "Space Mono", size: 11 }, color: dimColor, callback: v => v + "\u00b0" },
        border: { color: inkColor, width: 1.2 },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        setSelectedYearIndex(elements[0].index);
      } else {
        setSelectedYearIndex(null);
      }
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: labelA + " Temp",
        data: dataA.map(d => d.avgTemp),
        borderColor: accentColor,
        backgroundColor: accentGlow,
        fill: true,
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: accentColor,
        pointBorderColor: paperColor,
        pointBorderWidth: 1.5,
        pointHitRadius: 12,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
      {
        label: labelB + " Temp",
        data: dataB.map(d => d.avgTemp),
        borderColor: blueColor,
        backgroundColor: blueGlow,
        fill: true,
        borderWidth: 2,
        borderDash: [5, 2.5],
        tension: 0.35,
        pointBackgroundColor: blueColor,
        pointBorderColor: paperColor,
        pointBorderWidth: 1.5,
        pointHitRadius: 12,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Custom Legend */}
      <div style={{
        display: "flex", gap: "20px", alignItems: "center",
        padding: "8px 0", borderBottom: "1px solid " + inkColor + "20",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "14px", background: accentGlow, borderTop: "2px solid " + accentColor }} />
          <span style={{ fontSize: "11px", color: inkColor, fontFamily: "Space Mono" }}>{labelA}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "14px", background: blueGlow, borderTop: "2px dashed " + blueColor }} />
          <span style={{ fontSize: "11px", color: inkColor, fontFamily: "Space Mono" }}>{labelB}</span>
        </div>
      </div>

      {/* Selection Info Box */}
      {selectedYearIndex !== null && (
        <div style={{
          position: "absolute", top: "-6px", right: 0,
          backgroundColor: isDark ? "rgba(212,103,42,0.1)" : "rgba(181,69,27,0.1)",
          border: "1.5px solid var(--accent)",
          padding: "8px 12px",
          fontFamily: "Space Mono",
          fontSize: "10px",
          color: inkColor,
          zIndex: 10,
          pointerEvents: "none",
        }}>
          <b>{dataA[selectedYearIndex].year}</b>
          {" | " + labelA + ": "}
          <span style={{ color: accentColor }}>{dataA[selectedYearIndex].avgTemp.toFixed(1)}&deg;C</span>
          {" | " + labelB + ": "}
          <span style={{ color: blueColor }}>{dataB[selectedYearIndex].avgTemp.toFixed(1)}&deg;C</span>
        </div>
      )}

      {/* Chart Canvas */}
      <div
        ref={wrapperRef}
        style={{
          background: isDark ? "var(--paper2)" : "var(--paper)",
          border: "1px solid " + inkColor,
          padding: "12px",
          position: "relative",
          height: 140,
        }}
      >
        <Line
          data={chartData}
          options={options as any}
          key={isDark ? "dark" : "light"}
          id="compare-line"
        />
      </div>
    </div>
  );
}
