"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import MiniEarth from "./MiniEarth";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dispatch event when mobileOpen changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { isOpen: mobileOpen } }));
  }, [mobileOpen]);

  // Listen for hamburger toggle event from Topbar
  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await axios.get("/api/user/saved-locations");
        setSavedPins(res.data.locations || []);
      } catch { /* unauthenticated or no pins */ }
    };
    fetchPins();
    const id = setInterval(fetchPins, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
    {/* Mobile backdrop */}
    <div
      className={`sb-backdrop${mobileOpen ? " visible" : ""}`}
      onClick={() => setMobileOpen(false)}
    />
    <div className={`sb no-print${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`} id="sb">
      {/* Toggle */}
      <div className="sb-toggle" onClick={() => {
        setCollapsed(c => !c);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 220); // Sync with transition
      }}>
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
        {!collapsed && (
          <MiniEarth pins={savedPins.map((p, i) => ({
            lat: p.lat,
            lng: p.lng,
            color: PIN_COLORS[i % PIN_COLORS.length],
          }))} />
        )}
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
            padding: "12px 13px", fontSize: "10.5px", color: "var(--dim)",
            fontFamily: "Space Mono", lineHeight: 1.7, fontStyle: "italic",
            borderBottom: "1px solid var(--ink)",
          }}>
            No saved pins yet.<br />Click the map to pin a location,<br />then click &quot;Save Pin&quot;.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-footer-inner">
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, fontFamily: "var(--mono)" }}>{session?.user?.name || "User"}</div>
          <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--mono)" }}>
            {session?.user?.email}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--red)", marginTop: 8, cursor: "pointer", textDecoration: "underline", fontFamily: "var(--mono)", fontWeight: 700 }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
