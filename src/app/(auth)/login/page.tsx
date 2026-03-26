"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import BrutalistEarth from "@/components/ui/BrutalistEarth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [termLines, setTermLines] = useState([false, false, false]);
  const [stars, setStars] = useState<{ x: number; y: number; r: number }[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }).map(() => ({
        x: Math.random() * 500,
        y: Math.random() * 700,
        r: Math.random() * 1.5 + 0.5,
      }))
    );
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setTermLines(p => [true, p[1], p[2]]), 300),
      setTimeout(() => setTermLines(p => [p[0], true, p[2]]), 900),
      setTimeout(() => setTermLines(p => [p[0], p[1], true]), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = document.getElementById("stat-pts");
    if (!el) return;
    const target = 14600;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setBtnState("loading");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.ok) {
      setBtnState("success");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setBtnState("error");
      toast.error("Invalid credentials — please try again.");
    }
  };

  const btnText = {
    idle: (
      <>
        <span style={{ width: 14, height: 14, border: "1.5px solid var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
          {"\u2192"}
        </span>
        {" Authenticate & Enter Dashboard"}
      </>
    ),
    loading: "Authenticating...",
    success: (
      <>
        <span style={{ width: 14, height: 14, border: "1.5px solid var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
          {"\u2713"}
        </span>
        {" Access Granted \u2014 Redirecting"}
      </>
    ),
    error: (
      <>
        <span style={{ width: 14, height: 14, border: "1.5px solid var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
          {"\u2192"}
        </span>
        {" Authenticate & Enter Dashboard"}
      </>
    ),
  };

  return (
    <div className="login-shell">
      {/* LEFT ART PANEL */}
      <div className="left login-left">

        {/* Animated 3D Earth */}
        <BrutalistEarth />

        {/* Text overlay */}
        <div className="login-left-content" style={{ position: "relative", zIndex: 10 }}>
          <div className="login-logo">
            <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <defs>
                <radialGradient id="fg" cx="35%" cy="32%" r="60%">
                  <stop offset="0%" stopColor="#2c8fb5"/>
                  <stop offset="70%" stopColor="#0e4d68"/>
                  <stop offset="100%" stopColor="#072d3f"/>
                </radialGradient>
                <clipPath id="fc"><circle cx="16" cy="16" r="11" transform="rotate(-23.5,16,16)"/></clipPath>
              </defs>
              <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(200,160,60,0.38)" strokeWidth="1.2" strokeDasharray="5 3" transform="rotate(-20,16,16)"/>
              <circle cx="16" cy="16" r="11" fill="url(#fg)" transform="rotate(-23.5,16,16)"/>
              <g clipPath="url(#fc)" stroke="none" fill="rgba(52,130,78,0.72)">
                <ellipse cx="12" cy="13" rx="4" ry="3" transform="rotate(-10,12,13)"/>
                <ellipse cx="20" cy="18" rx="3.5" ry="4" transform="rotate(8,20,18)"/>
                <ellipse cx="10" cy="20" rx="2.2" ry="2"/>
              </g>
              <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.3)" strokeWidth="2.5" transform="rotate(-23.5,16,16)"/>
              <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.08)" strokeWidth="5" transform="rotate(-23.5,16,16)"/>
              <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(212,168,60,0.9)" strokeWidth="1.8" strokeDasharray="5 3" transform="rotate(-20,16,16)" clipPath="url(#fc)"/>
            </svg>
            <span>Genome</span>
          </div>

          <div className="login-headline headline">
            Map your world.<br />
            Track the climate.<br />
            <em>40 years of data.</em>
          </div>

          <p className="login-subtext subtext">
            Historical weather analysis powered by Open-Meteo API.<br />
            Visualise temperature, precipitation &amp; extreme events<br />
            across any location on Earth.
          </p>

          <div className="login-stats stats-grid">
            <div className="ls">
              <span className="ls-val" id="stat-pts">0</span>
              <span className="ls-lbl">Data points</span>
            </div>
            <div className="ls">
              <span className="ls-val">40yr</span>
              <span className="ls-lbl">Coverage</span>
            </div>
            <div className="ls">
              <span className="ls-val">+2.1&deg;</span>
              <span className="ls-lbl">Avg rise</span>
            </div>
            <div className="ls">
              <span className="ls-val">&infin;</span>
              <span className="ls-lbl">Locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right">
        <div className="right-top">
          <span className="right-top-label">Sign in to Genome</span>
        </div>

        {/* Terminal animation */}
        <div className="terminal">
          <div className="term-line" style={{ opacity: termLines[0] ? 1 : 0, transition: "opacity .4s" }}>
            <b>$</b> genome --connect
          </div>
          <div className="term-line" style={{ opacity: termLines[1] ? 1 : 0, transition: "opacity .4s" }}>
            Initialising climate archive...{" "}<b style={{ color: "#2ecc71" }}>OK</b>
          </div>
          <div className="term-line" style={{ opacity: termLines[2] ? 1 : 0, transition: "opacity .4s" }}>
            40yr dataset ready. Awaiting credentials.{" "}
            {termLines[2] && <span className="term-cursor" />}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section-label">Credentials</div>

          <div className="field">
            <label className="field-label">Email address</label>
            <input {...register("email")} className="field-input" type="email" placeholder="user@genome.io" />
            {errors.email && (
              <div className="field-hint" style={{ color: "var(--accent)" }}>{errors.email.message}</div>
            )}
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input {...register("password")} className="field-input" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" />
            <div className="field-hint">Min. 8 characters &middot; case-sensitive</div>
            {errors.password && (
              <div className="field-hint" style={{ color: "var(--accent)" }}>{errors.password.message}</div>
            )}
          </div>



          <button
            type="submit"
            className="btn-primary"
            disabled={btnState === "loading" || btnState === "success"}
          >
            {btnText[btnState]}
          </button>
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
            <Link href="/register" style={{ fontSize: "10px", color: "var(--ink)", textDecoration: "underline" }}>Create account</Link>
            <span style={{ fontSize: "10px", color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>Forgot password?</span>
          </div>
        </form>

        <div className="divider">or</div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field-label">Access token</label>
          <input className="field-input" type="text" placeholder="gno_xxxxxxxxxxxxxxxx" />
          <div className="field-hint">For API / programmatic access</div>
        </div>

        <div className="form-footer">
          <span>Genome v3.0 &middot; Next.js + MongoDB</span>
        </div>

        <div style={{ marginTop: "10px", textAlign: "center", fontSize: "9px", color: "var(--dim)", letterSpacing: "0.06em" }}>
          Data &middot; open-meteo.com/en/docs/historical-weather-api
        </div>
      </div>
    </div>
  );
}
