"use client";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      style={{
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        borderLeftColor: "#b5451b",
        background: "rgba(181,69,27,0.08)",
        padding: "9px 12px",
        marginBottom: "14px",
        fontSize: "11px",
        fontFamily: "Space Mono",
        color: "#b5451b",
        animation: "errorShake 0.4s ease-out, errorFadeIn 0.25s ease-out",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#b5451b",
          fontFamily: "Space Mono",
          fontSize: "13px",
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
