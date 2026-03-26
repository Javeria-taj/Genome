"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: "◈" },
  { name: "Climate Trends", href: "/trends", icon: "◌" },
  { name: "Compare Cities", href: "/compare", icon: "⇌" },
  { name: "Decade Delta", href: "/delta", icon: "Δ" },
  { name: "Extremes", href: "/extremes", icon: "!" },
  { name: "Export", href: "/export", icon: "↓" },
];

// Project lat/lng to SVG ellipse viewBox 0 0 120 60, ellipse cx=60 cy=30 rx=45 ry=28
const projectPin = (lat: number, lng: number) => ({
  x: 60 + (lng / 180) * 45,
  y: 30 - (lat / 90) * 28,
});

const PIN_COLORS = ["var(--accent)", "var(--blue)", "var(--dim)"];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [savedPins, setSavedPins] = useState<any[]>([]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await axios.get("/api/user/saved-locations");
        setSavedPins(res.data.locations || []);
      } catch { /* unauthenticated or no pins */ }
    };
    fetchPins();
    // Refresh every 30s to catch newly saved pins
    const id = setInterval(fetchPins, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`sb no-print${collapsed ? " collapsed" : ""}`} id="sb">
      {/* Toggle */}
      <div className="sb-toggle" onClick={() => setCollapsed(c => !c)}>
        <div className="toggle-icon">
          <span style={{ width: "100%" }} />
          <span style={{ width: "100%" }} />
          <span style={{ width: "100%" }} />
        </div>
        <span className="sb-toggle-label">{collapsed ? "Expand" : "Collapse"}</span>
      </div>

      {/* Navigation */}
      <div className="sb-section">
        <div className="sb-label">Navigation</div>
        {navItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`nav-item${isActive ? " active" : ""}`}>
                <i className="nav-ico">{item.icon}</i>
                <span className="nav-lbl">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Saved Pins */}
      <div className="sb-section">
        <div style={{ padding: "10px 13px 6px", borderBottom: "1px solid var(--bh)", display: collapsed ? "none" : "block" }}>
          <svg viewBox="0 0 120 60" width="100%" style={{ display: "block", maxWidth: "154px" }}>
            <defs>
              <clipPath id="globeClip">
                <ellipse cx="60" cy="30" rx="45" ry="28" />
              </clipPath>
            </defs>
            <ellipse cx="60" cy="30" rx="45" ry="28" fill="var(--paper2)" stroke="var(--ink)" strokeWidth="1"/>
            <g className="globe-drift" clipPath="url(#globeClip)" style={{ transformOrigin: "60px 30px" }}>
              <ellipse cx="60" cy="30" rx="45" ry="8" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.3"/>
              <line x1="15" y1="30" x2="105" y2="30" stroke="var(--ink)" strokeWidth="0.4" opacity="0.3"/>
              <ellipse cx="60" cy="30" rx="32" ry="28" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.2"/>
              <ellipse cx="60" cy="30" rx="16" ry="28" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.2"/>
            </g>
            {savedPins.map((pin, i) => {
              const { x, y } = projectPin(pin.lat, pin.lng);
              const col = PIN_COLORS[i % PIN_COLORS.length];
              return (
                <g key={pin._id || i}>
                  <circle cx={x} cy={y} r="2.5" fill={col}/>
                  <circle cx={x} cy={y} r="2.5" fill="none" stroke={col} strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="2.5;5;2.5" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.7}s`}/>
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.7}s`}/>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="sb-label">Saved Pins</div>
        {savedPins.length > 0 ? (
          savedPins.map((pin, i) => (
            <div key={pin._id || i} className="nav-item">
              <div className="pin-dot" style={{ background: PIN_COLORS[i % PIN_COLORS.length] }} />
              <span className="nav-lbl">{pin.label || pin.city || (pin.lat?.toFixed(2) + ", " + pin.lng?.toFixed(2))}</span>
            </div>
          ))
        ) : (
          <div style={{
            padding: "10px 13px", fontSize: "11px", color: "var(--dim)",
            fontStyle: "italic", borderBottom: "1px solid var(--ink)",
            lineHeight: 1.5, fontFamily: "var(--mono)",
          }}>
            No saved pins yet.<br />Click map to pin a location.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-footer-inner">
          <div style={{ fontSize: 8.5, color: "var(--dim)" }}>Signed in as</div>
          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{session?.user?.name || "User"}</div>
          <div style={{ fontSize: 8.5, color: "var(--dim)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {session?.user?.email}
          </div>
          <div
            style={{ fontSize: 8.5, color: "var(--red)", marginTop: 6, cursor: "pointer", textDecoration: "underline" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </div>
        </div>
      </div>
    </div>
  );
}
