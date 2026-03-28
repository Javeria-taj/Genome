interface EmptyStateProps {
  icon: "map-pin" | "chart" | "compare" | "delta" | "extremes";
  message: string;
}

const icons = {
  "map-pin": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="14" r="5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M16 4 C10 4 6 9 6 14 C6 22 16 28 16 28 C16 28 26 22 26 14 C26 9 22 4 16 4Z"
        stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="16" cy="14" r="2" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  "chart": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polyline points="4,24 10,16 16,19 22,10 28,13"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
      <line x1="4" y1="8"  x2="4"  y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  ),
  "compare": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="18" y="12" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="14" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),
  "delta": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 6 L28 26 L4 26 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <line x1="16" y1="14" x2="16" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  ),
  "extremes": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="5"  y="18" width="5" height="8"  stroke="currentColor" strokeWidth="1.2"/>
      <rect x="13" y="12" width="5" height="14" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="21" y="8"  width="5" height="18" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", gap: "12px", height: "100%", minHeight: "120px",
    }}>
      <div style={{ color: "rgba(15,14,13,0.2)", width: "32px", height: "32px" }}>
        {icons[icon]}
      </div>
      <div style={{
        fontFamily: "Space Mono, monospace", fontSize: "10.5px",
        color: "var(--dim, #7a756e)", textAlign: "center", lineHeight: 1.7, maxWidth: "220px",
      }}>
        {message}
      </div>
    </div>
  );
}
