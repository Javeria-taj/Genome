"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import AuthButton from "@/components/auth/AuthButton";
import ErrorBanner from "@/components/auth/ErrorBanner";
import Field from "@/components/auth/Field";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, password }),
      });
      const data = await res.json();

      if (data.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setStatus("error");
        setMsg(data.error || "Reset failed. The link may have expired.");
      }
    } catch (err) {
      setStatus("error");
      setMsg("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-shell">
      <AuthLeftPanel variant="login" />
      <div className="right">
        <div className="right-top">
          <span className="right-top-label">Reset your password</span>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-section-label">New Credentials</div>
          <ErrorBanner message={msg} onDismiss={() => { setStatus("idle"); setMsg(""); }} />
          
          <Field label="New password">
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </Field>

          <Field label="Confirm password">
            <input
              type="password"
              className="field-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
            />
          </Field>

          <AuthButton 
            status={status}
            successLabel="Password Updated — Redirecting to Login"
          >
            Set new password
          </AuthButton>
        </form>

        <div className="form-footer">
          <span>&copy; 2026 Genome &middot; Built by Javeria Taj</span>
        </div>
      </div>
    </div>
  );
}
