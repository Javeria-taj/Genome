"use client";

interface SkeletonProps {
  variant?: "chart" | "stat" | "map" | "bar";
  className?: string;
}

export default function SkeletonLoader({ variant = "chart", className = "" }: SkeletonProps) {
  if (variant === "map") {
    return (
      <div className={`skeleton ${className}`} style={{ width: "100%", height: 210 }} />
    );
  }
  if (variant === "stat") {
    return (
      <div style={{ display: "flex", gap: 0, border: "1px solid var(--ink)", marginTop: 9 }}>
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ flex: 1, height: 60, borderRight: i < 3 ? "1px solid var(--ink)" : undefined }} />
        ))}
      </div>
    );
  }
  if (variant === "bar") {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", height: 90, gap: 8, borderBottom: "1px solid var(--ink)", borderLeft: "1px solid var(--ink)" }}>
        {[65, 80, 45, 90].map((h, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: `${h}%` }} />
        ))}
      </div>
    );
  }
  // chart (default)
  return (
    <div className={`skeleton ${className}`} style={{ width: "100%", height: 120 }} />
  );
}
