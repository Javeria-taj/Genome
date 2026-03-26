"use client";

interface AuthButtonProps {
  status: "idle" | "loading" | "success" | "error";
  children: React.ReactNode;
  disabled?: boolean;
}

export default function AuthButton({ status, children, disabled }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={status === "loading" || status === "success" || disabled}
      className="btn-primary"
      style={{
        opacity: status === "loading" ? 0.75 : 1,
        cursor: status === "loading" ? "not-allowed" : "pointer",
        position: "relative",
      }}
    >
      {status === "loading" ? (
        <>
          <span style={{ display: "flex", gap: "4px", marginRight: "8px" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "5px",
                  height: "5px",
                  background: "#f5f0e8",
                  borderRadius: "50%",
                  animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </span>
          Authenticating...
        </>
      ) : status === "success" ? (
        <>
          <span className="arr">✓</span> Access Granted — Redirecting
        </>
      ) : (
        <>
          <span className="arr">→</span> {children}
        </>
      )}
    </button>
  );
}
