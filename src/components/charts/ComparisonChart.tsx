"use client";

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend, ChartOptions
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DataPoint { year: number; avgTemp: number; totalPrecip: number; }
interface Props { dataA: DataPoint[]; dataB: DataPoint[]; labelA: string; labelB: string; }

export default function ComparisonChart({ dataA, dataB, labelA, labelB }: Props) {
  const labels = dataA.map(d => d.year.toString());

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeInOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "var(--paper2,#ede8dc)",
        borderColor: "var(--ink,#0f0e0d)",
        borderWidth: 1,
        titleColor: "var(--ink,#0f0e0d)",
        bodyColor: "var(--dim,#7a756e)",
        titleFont: { family: "'Space Mono',monospace", size: 9 },
        bodyFont: { family: "'Space Mono',monospace", size: 9 },
        cornerRadius: 0,
        padding: 8,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(15,14,13,0.08)" },
        ticks: { font: { family: "'Space Mono',monospace", size: 8 }, color: "#7a756e", maxRotation: 0 },
        border: { color: "#0f0e0d", width: 1.2 },
      },
      y: {
        grid: { color: "rgba(15,14,13,0.08)" },
        ticks: { font: { family: "'Space Mono',monospace", size: 8 }, color: "#7a756e", callback: v => `${v}°` },
        border: { color: "#0f0e0d", width: 1.2 },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: `${labelA} Temp`,
        data: dataA.map(d => d.avgTemp),
        borderColor: "#e63a2e",
        backgroundColor: "rgba(230,58,46,0.07)",
        fill: true,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: `${labelB} Temp`,
        data: dataB.map(d => d.avgTemp),
        borderColor: "#1a6ef5",
        backgroundColor: "rgba(26,110,245,0.06)",
        fill: true,
        borderWidth: 2,
        borderDash: [5, 2.5],
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div style={{ height: 100, position: "relative" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
