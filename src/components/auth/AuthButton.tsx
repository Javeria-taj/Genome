'use client';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

interface AuthButtonProps {
  status: AuthStatus;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  successLabel?: string;
}

export default function AuthButton({
  status,
  disabled,
  onClick,
  children,
  successLabel = 'Access Granted — Redirecting',
}: AuthButtonProps) {
  const isDisabled = disabled || status === 'loading' || status === 'success';

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: '100%',
        border: '1.5px solid var(--ink)',
        background: 'var(--ink)',
        color: 'var(--paper)',
        fontFamily: 'Space Mono, monospace',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        padding: '11px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: status === 'loading' ? 0.75 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '4px',
        transition: 'opacity 0.15s',
      }}
    >
      {status === 'loading' && (
        <>
          <LoadingDots />
          <span>Authenticating...</span>
        </>
      )}
      {status === 'success' && (
        <>
          <span style={{
            width: '14px', height: '14px',
            border: '1.5px solid var(--paper)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '10px',
          }}>✓</span>
          <span>{successLabel}</span>
        </>
      )}
      {(status === 'idle' || status === 'error') && (
        <>
          <ArrowIcon />
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

function LoadingDots() {
  return (
    <svg width="24" height="6" viewBox="0 0 24 6" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2].map(i => (
        <circle
          key={i}
          cx={3 + i * 9}
          cy="3"
          r="2.5"
          fill="var(--paper)"
          style={{
            animation: `dotBounce 1.4s ${i * 0.2}s infinite ease-in-out`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <span style={{
      width: '14px', height: '14px',
      border: '1.5px solid var(--paper)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '10px',
      transition: 'transform 0.2s ease',
    }}
    className="btn-arrow"
    >→</span>
  );
}
