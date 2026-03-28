"use client";

import { useRef, useState, useEffect } from "react";
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
  Chart,
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

  const [selectedPoint, setSelectedPoint] = useState<{
    year: number;
    avgTemp: number;
    totalPrecip: number;
    extremeHeatDays: number;
    x: number;
    y: number;
  } | null>(null);

  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (data.length > 0) {
      setLastFetched(new Date());
    }
  }, [data]);

  useEffect(() => {
    if (!lastFetched) return;
    const update = () => {
      const secs = Math.floor((Date.now() - lastFetched.getTime()) / 1000);
      if (secs < 60) setTimeAgo('just now');
      else if (secs < 3600) setTimeAgo(`${Math.floor(secs / 60)} min ago`);
      else setTimeAgo(`${Math.floor(secs / 3600)} hr ago`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [lastFetched]);

  const selectedYearPlugin: Plugin<"line"> = {
    id: 'selectedYearLine',
    afterDraw(chart) {
      if (!selectedPoint) return;
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      const index = data.findIndex(d => d.year === selectedPoint.year);
      if (index === -1) return;
      const point = meta.data[index] as any;
      if (!point) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(point.x, chart.chartArea.top);
      ctx.lineTo(point.x, chart.chartArea.bottom);
      ctx.strokeStyle = isDark ? 'rgba(237,232,220,0.25)' : 'rgba(15,14,13,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.restore();
    },
  };

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
        titleFont: { family: "var(--mono)", size: 13, weight: "bold" as any },
        bodyFont: { family: "var(--mono)", size: 12 },
        padding: 11,
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
        ticks: { color: dimColor, font: { family: "var(--mono)", size: 12 } },
        border: { color: inkColor, width: 1.2 },
      },
      y: {
        position: "left",
        grid: { color: gridColor, lineWidth: 0.5 },
        ticks: { color: accentColor, font: { family: "var(--mono)", size: 12 }, callback: v => v + "\u00b0" },
        border: { color: inkColor, width: 1.2 },
      },
      y1: {
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { color: blueColor, font: { family: "var(--mono)", size: 12 }, callback: v => v + "mm" },
        border: { color: blueColor, width: 1 },
      },
    },
    onClick: (event, elements, chart) => {
      if (elements.length === 0) {
        setSelectedPoint(null);
        return;
      }
      const index = elements[0].index;
      const d = data[index];
      const meta = chart.getDatasetMeta(0);
      const point = meta.data[index] as any;

      if (point) {
        setSelectedPoint({
          year: d.year,
          avgTemp: d.avgTemp,
          totalPrecip: d.totalPrecip,
          extremeHeatDays: d.extremeHeatDays,
          x: point.x,
          y: point.y,
        });
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
          plugins={[trendLinePlugin, selectedYearPlugin]}
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
        borderTop: `1px solid ${isDark ? "rgba(237,232,220,0.12)" : "rgba(15,14,13,0.12)"}`,
        borderBottom: `1px solid ${isDark ? "rgba(237,232,220,0.12)" : "rgba(15,14,13,0.12)"}`,
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

      {/* Floating Card on Selection */}
      {selectedPoint && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(
              Math.max(selectedPoint.x - 90, 8),
              (wrapperRef.current?.offsetWidth || 400) - 188
            ),
            top: Math.max(selectedPoint.y - 130, 8),
            width: '180px',
            background: 'var(--paper)',
            border: '1.5px solid var(--ink)',
            padding: '10px 12px',
            zIndex: 200, // Above everything
            boxShadow: '4px 4px 0 rgba(15,14,13,0.12)',
            animation: 'cardPopIn 0.18s ease-out both',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setSelectedPoint(null)}
            style={{
              position: 'absolute', top: '6px', right: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: '16px',
              lineHeight: 1,
            }}
          >×</button>

          <div style={{
            fontSize: '15px', fontWeight: '700',
            fontFamily: 'var(--mono)',
            borderBottom: '1px solid rgba(15,14,13,0.12)',
            paddingBottom: '6px', marginBottom: '8px',
            color: 'var(--ink)',
          }}>
            {selectedPoint.year}
          </div>

          {[
            { label: 'Avg Temp',   value: `${selectedPoint.avgTemp.toFixed(1)}°C`,      color: 'var(--accent)' },
            { label: 'Precip',     value: `${Math.round(selectedPoint.totalPrecip)}mm`,  color: 'var(--blue)' },
            { label: 'Heat days',  value: `${selectedPoint.extremeHeatDays}`,            color: 'var(--accent)' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: '12px', fontFamily: 'var(--mono)',
              marginBottom: '5px',
              borderBottom: '1px solid rgba(15,14,13,0.07)',
              paddingBottom: '5px',
            }}>
              <span style={{ color: 'var(--dim)' }}>{row.label}</span>
              <span style={{ color: row.color, fontWeight: '700' }}>{row.value}</span>
            </div>
          ))}

          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '8px',
            background: 'var(--ink)',
            opacity: 0.3,
          }}/>
        </div>
      )}

      {/* Freshness Row */}
      {lastFetched && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 0',
          borderTop: '1px solid rgba(15,14,13,0.1)',
          marginTop: '8px',
          fontSize: '11px',
          fontFamily: 'var(--mono)',
          color: 'var(--dim)',
        }}>
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#2ecc71',
            flexShrink: 0,
            animation: 'freshPulse 3s ease-in-out infinite',
          }}/>
          <span>Last fetched: <b style={{ color: 'var(--ink)' }}>{timeAgo}</b></span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Source: Open-Meteo Archive</span>
        </div>
      )}
    </div>
  );
}
