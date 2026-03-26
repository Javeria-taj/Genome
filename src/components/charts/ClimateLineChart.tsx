"use client";

import { useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  Plugin,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DataPoint {
  year: number;
  avgTemp: number;
  totalPrecip: number;
  extremeHeatDays: number;
}

interface Props {
  data: DataPoint[];
}

const trendLinePlugin: Plugin<"line"> = {
  id: "trendLine",
  afterDatasetsDraw(chart) {
    const dataset = chart.data.datasets[0];
    if (!dataset) return;
    const meta = chart.getDatasetMeta(0);
    const points = meta.data;
    if (!points || points.length < 2) return;
    const ctx = chart.ctx;
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    points.forEach((pt, i) => {
      sumX += i; sumY += pt.y; sumXY += i * pt.y; sumX2 += i * i;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const x0 = points[0].x;
    const x1 = points[n - 1].x;
    const y0 = slope * 0 + intercept;
    const y1 = slope * (n - 1) + intercept;
    ctx.save();
    ctx.strokeStyle = "rgba(181,69,27,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  },
};

ChartJS.register(trendLinePlugin);

export default function ClimateLineChart({ data }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);

  const labels = data.map(d => d.year.toString());
  const temps = data.map(d => d.avgTemp);
  const precips = data.map(d => d.totalPrecip);

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
    animation: { duration: 600, easing: "easeInOutQuart" },
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
        titleFont: { family: "Space Mono", size: 11, weight: "bold" as any },
        bodyFont: { family: "Space Mono", size: 10 },
        padding: 10,
        displayColors: true,
        callbacks: {
          title: (items) => "Year: " + items[0].label,
          label: (item) => {
            if (item.datasetIndex === 0) return " Temp: " + (item.raw as number).toFixed(1) + "\u00b0C";
            return " Precip: " + item.raw + "mm";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor, lineWidth: 0.5 },
        ticks: { color: dimColor, font: { family: "Space Mono", size: 11 } },
        border: { color: inkColor, width: 1.2 },
      },
      y: {
        position: "left",
        grid: { color: gridColor, lineWidth: 0.5 },
        ticks: { color: accentColor, font: { family: "Space Mono", size: 11 }, callback: v => v + "\u00b0" },
        border: { color: inkColor, width: 1.2 },
      },
      y1: {
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { color: blueColor, font: { family: "Space Mono", size: 11 }, callback: v => v + "mm" },
        border: { color: blueColor, width: 1 },
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
        label: "Avg Temp",
        data: temps,
        borderColor: accentColor,
        backgroundColor: accentGlow,
        pointBackgroundColor: accentColor,
        pointBorderColor: paperColor,
        pointBorderWidth: 1.5,
        borderWidth: 2,
        tension: 0.35,
        yAxisID: "y",
        pointHitRadius: 12,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "Precip",
        data: precips,
        borderColor: blueColor,
        backgroundColor: blueGlow,
        borderDash: [4, 2],
        pointBackgroundColor: blueColor,
        pointBorderColor: paperColor,
        pointBorderWidth: 1,
        borderWidth: 1.5,
        tension: 0.35,
        yAxisID: "y1",
        pointHitRadius: 12,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Chart wrapper — explicit height, overflow hidden */}
      <div style={{
        position: 'relative',
        height: '180px',
        marginBottom: '12px',
        overflow: 'hidden',
      }}>
        <Line
          plugins={[trendLinePlugin]}
          data={chartData}
          options={options as any}
          key={isDark ? "dark" : "light"}
          id="climate-line"
        />
      </div>

      {/* Legend row — sits BELOW chart, never overlapped */}
      <div className="chart-legend" style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '20px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'rgba(15,14,13,0.12)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'rgba(15,14,13,0.12)',
        marginBottom: '10px',
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "2.5px", background: accentColor }} />
          <span style={{ color: inkColor, fontFamily: "Space Mono" }}>
            Avg Temp
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "2px", background: blueColor, opacity: 0.8 }} />
          <span style={{ color: inkColor, fontFamily: "Space Mono" }}>
            Precip (mm)
          </span>
        </div>
      </div>

      {/* Persistent Info Box on Selection */}
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
          <b>{data[selectedYearIndex].year}</b>
          {" | Temp: "}
          <span style={{ color: "var(--accent)" }}>{data[selectedYearIndex].avgTemp.toFixed(1)}&deg;C</span>
          {" | Precip: "}
          <span style={{ color: "var(--blue)" }}>{data[selectedYearIndex].totalPrecip}mm</span>
          {" | Heat: "}
          {data[selectedYearIndex].extremeHeatDays}d
        </div>
      )}
    </div>
  );
}
