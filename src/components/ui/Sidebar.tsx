"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCoordinateContext } from "@/context/CoordinateContext";
import axios from "axios";
import MiniEarth from "./MiniEarth";

const navItems = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="14" r="5" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M16 4 C10 4 6 9 6 14 C6 22 16 28 16 28 C16 28 26 22 26 14 C26 9 22 4 16 4Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      </svg>
    )
  },
  { 
    name: "Climate Trends", 
    href: "/trends", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <polyline points="4,24 10,16 16,19 22,10 28,13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      </svg>
    )
  },
  { 
    name: "Compare Cities", 
    href: "/compare", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <path d="M10 8 L10 24 M22 8 L22 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M10 16 L22 16" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 2"/>
      </svg>
    )
  },
  { 
    name: "Decade Delta", 
    href: "/delta", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L28 26 L4 26 Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      </svg>
    )
  },
  { 
    name: "Extremes", 
    href: "/extremes", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L16 18 M16 24 L16 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" opacity="0.3"/>
      </svg>
    )
  },
  { 
    name: "Export", 
    href: "/export", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L16 22 M10 16 L16 22 L22 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )
  },
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
  const router = useRouter();
  const { setSelectedCoords, setLocationLabel } = useCoordinateContext();
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
                <div className="nav-ico-wrap" style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isActive ? "scale(1.15)" : "scale(1)"
                }}>
                  {item.icon}
                </div>
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
            <div
              key={pin._id || i}
              className="nav-item"
              onClick={() => {
                setSelectedCoords({ lat: pin.lat, lng: pin.lng });
                setLocationLabel(pin.label);
                router.push("/dashboard");
              }}
            >
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
