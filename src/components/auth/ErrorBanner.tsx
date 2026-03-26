'use client';
import { useEffect } from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs = 5000,
}: ErrorBannerProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [message, onDismiss, autoDismissMs]);

  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        borderLeft: '3px solid var(--accent)',
        background: 'rgba(181,69,27,0.08)',
        padding: '9px 12px',
        marginBottom: '14px',
        fontSize: '11.5px',
        fontFamily: 'Space Mono, monospace',
        color: 'var(--accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        animation: 'errorShake 0.4s ease-out, errorFadeIn 0.2s ease-out',
      }}
    >
      <span style={{ lineHeight: 1.6 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--accent)',
          fontFamily: 'Space Mono, monospace',
          fontSize: '16px',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
