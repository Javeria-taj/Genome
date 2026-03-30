"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import ErrorBanner from "@/components/auth/ErrorBanner";
import Field from "@/components/auth/Field";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [termLines, setTermLines] = useState([false, false, false]);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "sent">("idle");

  useEffect(() => {
    const timers = [
      setTimeout(() => setTermLines((p) => [true, p[1], p[2]]), 300),
      setTimeout(() => setTermLines((p) => [p[0], true, p[2]]), 900),
      setTimeout(() => setTermLines((p) => [p[0], p[1], true]), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const errorMessages: Record<string, string> = {
    'EmailNotFound':    'No account found with this email address.',
    'WrongPassword':    'Incorrect password. Check your spelling and try again.',
    'CredentialsSignin':'Incorrect email or password.',
    'TooManyAttempts':  'Too many failed attempts. Please wait 30 seconds.',
    'default':          'Authentication failed. Please try again.',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      const msg = errorMessages['TooManyAttempts'];
      setErrorMsg(msg);
      setStatus("error");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      setStatus("error");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.ok && !result?.error) {
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setStatus("error");
      const newCount = errorCount + 1;
      setErrorCount(newCount);

      if (newCount >= 5) {
        setLockedUntil(Date.now() + 30000);
        setErrorMsg(errorMessages['TooManyAttempts']);
      } else {
        const msg = errorMessages[result?.error ?? 'default'] ?? errorMessages['default'];
        setErrorMsg(msg);
      }
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) return;
    setForgotStatus("loading");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim() }),
    });
    setForgotStatus("sent");
  };

  return (
    <div className="right" style={{ position: "relative" }}>
      <div className="right-top">
        <span className="right-top-label">Sign in to Genome</span>
      </div>

      <div className="terminal">
        <div className="term-line" style={{ opacity: termLines[0] ? 1 : 0, transition: "opacity .4s" }}>
          <b>$</b> genome --connect
        </div>
        <div className="term-line" style={{ opacity: termLines[1] ? 1 : 0, transition: "opacity .4s" }}>
          Initialising climate archive... <b style={{ color: "#2ecc71" }}>OK</b>
        </div>
        <div className="term-line" style={{ opacity: termLines[2] ? 1 : 0, transition: "opacity .4s" }}>
          40yr dataset ready. Awaiting credentials.{" "}
          {termLines[2] && <span className="term-cursor" />}
        </div>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-section-label">Credentials</div>
        <ErrorBanner message={errorMsg} onDismiss={() => { setStatus("idle"); setErrorMsg(""); }} />

        <Field label="Email address">
          <input
            className="field-input"
            type="email"
            placeholder="user@genome.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password">
          <input
            className="field-input"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ marginTop: "6px", textAlign: "right" }}>
            <span
              onClick={() => { setForgotOpen(true); setForgotEmail(email); }}
              style={{ 
                cursor: "pointer", 
                textDecoration: "underline", 
                color: "var(--accent)", 
                fontSize: "clamp(12px, 0.85vw, 13px)",
                letterSpacing: "0.02em"
              }}
            >
              Forgot password?
            </span>
          </div>
        </Field>

        <AuthButton status={status}>Authenticate & Enter Dashboard</AuthButton>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
          <Link href="/register" style={{ 
            fontSize: "clamp(12px, 0.85vw, 13px)", 
            color: "var(--ink)", 
            textDecoration: "underline",
            letterSpacing: "0.02em"
          }}>
            Create account
          </Link>
        </div>
      </form>

      <div className="divider">or</div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label className="field-label">Access token</label>
        <input className="field-input" type="text" placeholder="gno_xxxxxxxxxxxxxxxx" readOnly />
        <div className="field-hint">For API / programmatic access</div>
      </div>

      <div className="form-footer">
        <span>&copy; 2026 Genome &middot; Built by Javeria Taj</span>
      </div>

      {forgotOpen && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(237,232,220,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50,
          animation: "errorFadeIn 0.2s ease-out",
        }}>
          <div style={{
            background: "var(--paper)",
            border: "1.5px solid var(--ink)",
            padding: "28px 32px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "5px 5px 0 rgba(15,14,13,0.15)",
            animation: "errorFadeIn 0.25s ease-out",
            position: "relative",
          }}>
            <button
              onClick={() => { setForgotOpen(false); setForgotStatus("idle"); setForgotEmail(""); }}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#ff4500", // Deep orange (OrangeRed)
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "4px",
                lineHeight: 1,
                transition: "transform 0.2s",
              }}
              className="modal-close-btn"
              title="Close"
            >
              ×
            </button>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>Reset password</div>
            <div style={{ fontSize: "10.5px", color: "var(--dim)", marginBottom: "18px", lineHeight: 1.7 }}>
              Enter your email address. If an account exists, you'll receive a reset link within a few minutes.
            </div>

            {forgotStatus === "sent" ? (
              <div style={{
                fontSize: "11px",
                borderLeft: "3px solid #2ecc71",
                padding: "12px 14px",
                background: "rgba(46,204,113,0.07)",
                color: "#1a7a40",
                position: "relative",
                animation: "errorFadeIn 0.3s ease-out",
              }}>
                <div
                  onClick={() => { setForgotOpen(false); setForgotStatus("idle"); setForgotEmail(""); }}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    opacity: 0.7,
                  }}
                  title="Dismiss"
                >
                  ×
                </div>
                If that email is registered, a reset link has been sent. Check your inbox.
                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={() => { setForgotOpen(false); setForgotStatus("idle"); setForgotEmail(""); }}
                    style={{
                      width: "100%",
                      background: "var(--ink)",
                      color: "var(--paper)",
                      border: "none",
                      fontFamily: "Space Mono",
                      fontSize: "10.5px",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="user@genome.io"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleForgotSubmit()}
                  style={{ width: "100%", border: "1px solid var(--ink)", background: "var(--paper)",
                           color: "var(--ink)", fontFamily: "Space Mono", fontSize: "12px",
                           padding: "9px 11px", outline: "none", marginBottom: "12px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleForgotSubmit}
                    disabled={forgotStatus === "loading"}
                    style={{ flex: 1, background: "var(--ink)", color: "var(--paper)",
                             border: "none", fontFamily: "Space Mono", fontSize: "10.5px",
                             textTransform: "uppercase", letterSpacing: ".1em",
                             padding: "9px", cursor: "pointer" }}
                  >
                    {forgotStatus === "loading" ? "Sending..." : "Send reset link"}
                  </button>
                  <button
                    onClick={() => { setForgotOpen(false); setForgotStatus("idle"); setForgotEmail(""); }}
                    style={{ padding: "9px 14px", border: "1px solid var(--ink)", background: "transparent",
                             fontFamily: "Space Mono", fontSize: "10.5px", cursor: "pointer", color: "var(--ink)" }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
