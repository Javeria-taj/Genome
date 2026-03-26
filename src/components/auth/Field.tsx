"use client";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}

export default function Field({ label, children, hint, error }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
      {error && (
        <div className="field-hint" style={{ color: "var(--accent)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
