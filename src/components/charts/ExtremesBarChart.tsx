"use client";

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, Legend, ChartOptions
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  heatDays: number[];
  rainDays: number[];
  labels: string[];
}

export default function ExtremesBarChart({ heatDays, rainDays, labels }: Props) {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      delay(ctx) {
        return ctx.datasetIndex * 200 + ctx.dataIndex * 50;
      },
      duration: 400,
    },
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
        grid: { display: false },
        ticks: { font: { family: "'Space Mono',monospace", size: 8 }, color: "#7a756e" },
        border: { color: "#0f0e0d", width: 1.2 },
      },
      y: {
        grid: { color: "rgba(15,14,13,0.08)" },
        ticks: { font: { family: "'Space Mono',monospace", size: 8 }, color: "#7a756e" },
        border: { color: "#0f0e0d", width: 1.2 },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Heat Days (>35°C)",
        data: heatDays,
        backgroundColor: "rgba(230,58,46,0.85)",
        borderColor: "#e63a2e",
        borderWidth: 1.5,
        borderRadius: 0,
      },
      {
        label: "Rain Days (>50mm)",
        data: rainDays,
        backgroundColor: "rgba(26,110,245,0.85)",
        borderColor: "#1a6ef5",
        borderWidth: 1.5,
        borderRadius: 0,
      },
    ],
  };

  return (
    <div style={{ height: 110, position: "relative" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
