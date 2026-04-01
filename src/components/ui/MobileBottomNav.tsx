"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Map",
    path: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="14" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 4 C10 4 6 9 6 14 C6 22 16 28 16 28 C16 28 26 22 26 14 C26 9 22 4 16 4Z"
          stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Trends",
    path: "/trends",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <polyline points="4,24 10,16 16,19 22,10 28,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
  },
  {
    label: "Compare",
    path: "/compare",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <path d="M10 8 L10 24 M22 8 L22 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 16 L22 16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
      </svg>
    ),
  },
  {
    label: "Delta",
    path: "/delta",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L28 26 L4 26 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Extremes",
    path: "/extremes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <path d="M16 7 L16 19 M16 24 L16 25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      </svg>
    ),
  },
  {
    label: "Export",
    path: "/export",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L16 22 M10 16 L16 22 L22 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav no-print">
      {NAV.map(item => {
        const isActive = pathname === item.path ||
          (item.path !== "/dashboard" && pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`mobile-nav-item${isActive ? " active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <div className="mobile-nav-icon-wrap" style={{ 
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isActive ? "scale(1.2) translateY(-2px)" : "scale(1)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {item.icon}
            </div>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
