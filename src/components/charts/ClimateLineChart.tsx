"use client";

import { useEffect, useRef } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DataPoint {
  year: number;
  avgTemp: number;
  totalPrecip: number;
}

interface Props {
  data: DataPoint[];
}

// Linear regression trend line plugin
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
    ctx.strokeStyle = "rgba(230,58,46,0.4)";
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

  const labels = data.map(d => d.year.toString());
  const temps = data.map(d => d.avgTemp);
  const precips = data.map(d => d.totalPrecip);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeInOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "var(--paper2, #ede8dc)",
        borderColor: "var(--ink, #0f0e0d)",
        borderWidth: 1,
        titleColor: "var(--ink, #0f0e0d)",
        bodyColor: "var(--dim, #7a756e)",
        titleFont: { family: "'Space Mono', monospace", size: 9 },
        bodyFont: { family: "'Space Mono', monospace", size: 9 },
        padding: 8,
        cornerRadius: 0,
        callbacks: {
          title: (items) => `Year: ${items[0].label}`,
          label: (item) => {
            if (item.datasetIndex === 0) return ` Temp: ${item.raw}°C`;
            return ` Precip: ${item.raw}mm`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(15,14,13,0.08)" },
        ticks: { font: { family: "'Space Mono', monospace", size: 8 }, color: "var(--dim, #7a756e)", maxRotation: 0 },
        border: { color: "var(--ink, #0f0e0d)", width: 1.2 },
      },
      y: {
        type: "linear",
        position: "left",
        grid: { color: "rgba(15,14,13,0.08)" },
        ticks: { font: { family: "'Space Mono', monospace", size: 8 }, color: "var(--dim, #7a756e)", callback: v => `${v}°` },
        border: { color: "var(--ink, #0f0e0d)", width: 1.2 },
      },
      y1: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { font: { family: "'Space Mono', monospace", size: 8 }, color: "var(--blue, #1a6ef5)", callback: v => `${v}mm` },
        border: { color: "var(--blue, #1a6ef5)", width: 1 },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Avg Temp (°C)",
        data: temps,
        borderColor: "var(--red, #e63a2e)",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2.5,
        pointHoverRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Total Precip (mm)",
        data: precips,
        borderColor: "var(--blue, #1a6ef5)",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [4, 2],
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 3,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div ref={wrapperRef} className="chart-fade" style={{ height: 130, position: "relative" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
