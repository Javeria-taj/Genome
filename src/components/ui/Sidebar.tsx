"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: "◈" },
  { name: "Climate Trends", href: "/trends", icon: "◌" },
  { name: "Compare Cities", href: "/compare", icon: "⇌" },
  { name: "Decade Delta", href: "/delta", icon: "Δ" },
  { name: "Extremes", href: "/extremes", icon: "!" },
  { name: "Export", href: "/export", icon: "↓" },
];

// Saved pins will come from context in a full implementation
const savedPins = [
  { city: "Chennai, IN", color: "var(--red)" },
  { city: "Reykjavik, IS", color: "var(--blue)" },
  { city: "São Paulo, BR", color: "var(--dim)" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

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
        <div className="sb-label">Saved Pins</div>
        {savedPins.map(pin => (
          <div key={pin.city} className="nav-item">
            <div className="pin-dot" style={{ background: pin.color }} />
            <span className="nav-lbl">{pin.city}</span>
          </div>
        ))}
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
