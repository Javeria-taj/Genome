"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [termLines, setTermLines] = useState([false, false, false]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Terminal animation
  useEffect(() => {
    const timers = [
      setTimeout(() => setTermLines(p => [true, p[1], p[2]]), 300),
      setTimeout(() => setTermLines(p => [p[0], true, p[2]]), 900),
      setTimeout(() => setTermLines(p => [p[0], p[1], true]), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const onSubmit = async (data: FormData) => {
    setBtnState("loading");
    setErrorMsg("");
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
      setErrorMsg("Invalid credentials — please try again.");
    }
  };

  const btnText = {
    idle: <><span style={{ width:14,height:14,border:'1.5px solid var(--paper)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>→</span> Authenticate &amp; Enter Dashboard</>,
    loading: "Authenticating...",
    success: <><span style={{ width:14,height:14,border:'1.5px solid var(--paper)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>✓</span> Access Granted — Redirecting</>,
    error: <><span style={{ width:14,height:14,border:'1.5px solid var(--paper)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>→</span> Authenticate &amp; Enter Dashboard</>,
  };

  return (
    <div className="login-shell">
      {/* LEFT ART PANEL */}
      <div className="left">
        <div className="left-grid" />

        {/* Geo decoration */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="geo-ring" style={{ width: 320, height: 320, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-ring" style={{ width: 220, height: 220, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-ring" style={{ width: 120, height: 120, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-cross-h" />
          <div className="geo-cross-v" />
          <svg className="left-paths" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute",inset:0,width:"100%",height:"100%" }}>
            <path d="M0 210 Q200 190 400 210" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M0 280 Q200 260 400 280" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M0 350 Q200 330 400 350" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M0 420 Q200 400 400 420" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M120 0 Q110 350 120 700" fill="none" stroke="rgba(245,240,232,.06)" strokeWidth="1"/>
            <path d="M200 0 Q190 350 200 700" fill="none" stroke="rgba(245,240,232,.06)" strokeWidth="1"/>
            <path d="M280 0 Q270 350 280 700" fill="none" stroke="rgba(245,240,232,.06)" strokeWidth="1"/>
            <circle cx="140" cy="240" r="2.5" fill="rgba(230,58,46,.5)"/>
            <circle cx="260" cy="180" r="2.5" fill="rgba(26,110,245,.5)"/>
            <circle cx="80" cy="380" r="2.5" fill="rgba(245,240,232,.3)"/>
            <circle cx="320" cy="420" r="2.5" fill="rgba(245,240,232,.3)"/>
            <line x1="140" y1="240" x2="260" y2="180" stroke="rgba(230,58,46,.25)" strokeWidth=".8" strokeDasharray="3 3"/>
            <line x1="260" y1="180" x2="320" y2="420" stroke="rgba(26,110,245,.2)" strokeWidth=".8" strokeDasharray="4 4"/>
          </svg>
          <div className="center-ring" />
          <div className="center-dot" />
        </div>

        {/* Top logo */}
        <div className="left-top">
          <div className="left-logo">
            <div className="logo-pip" />
            GeoSense
          </div>
        </div>

        {/* Bottom content */}
        <div className="left-bottom">
          <div className="left-headline">40 years of<br/>climate data,<br/>mapped.</div>
          <div style={{ fontSize:8.5,color:"rgba(245,240,232,.4)",lineHeight:1.7 }}>
            Historical weather analysis powered<br/>by Open-Meteo API · 1985 – 2024
          </div>
          <div className="left-stats">
            <div className="ls-cell"><span className="ls-val">14,600</span><div className="ls-lbl">Data points</div></div>
            <div className="ls-cell"><span className="ls-val">40yr</span><div className="ls-lbl">Coverage</div></div>
            <div className="ls-cell"><span className="ls-val">+2.1°</span><div className="ls-lbl">Avg rise</div></div>
            <div className="ls-cell"><span className="ls-val">∞</span><div className="ls-lbl">Locations</div></div>
          </div>
          <div className="left-coords">13.0827° N &nbsp;·&nbsp; 80.2707° E &nbsp;·&nbsp; Chennai, IN</div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right">
        <div className="right-top">
          <span className="right-top-label">Sign in to GeoSense</span>
          <Link href="/register" style={{ fontSize:8.5,color:"var(--blue)",textDecoration:"underline",fontFamily:"var(--mono)" }}>
            Create account →
          </Link>
        </div>

        {/* Terminal animation */}
        <div className="terminal">
          <div className="term-line" style={{ opacity: termLines[0] ? 1 : 0, transition:"opacity .4s" }}>
            <b>$</b> geosense --init
          </div>
          <div className="term-line" style={{ opacity: termLines[1] ? 1 : 0, transition:"opacity .4s" }}>
            Connecting to Open-Meteo archive... <b style={{ color:"#2ecc71" }}>OK</b>
          </div>
          <div className="term-line" style={{ opacity: termLines[2] ? 1 : 0, transition:"opacity .4s" }}>
            Loading 40yr dataset... <b>Ready.</b> {termLines[2] && <span className="term-cursor" />}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section-label">Credentials</div>

          <div className="field">
            <label className="field-label">Email address</label>
            <input {...register("email")} className="field-input" type="email" placeholder="user@geosense.io" />
            {errors.email && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.email.message}</div>}
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input {...register("password")} className="field-input" type="password" placeholder="••••••••••••" />
            <div className="field-hint">Min. 8 characters · case-sensitive</div>
            {errors.password && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.password.message}</div>}
          </div>

          {(btnState === "error" || errorMsg) && (
            <div className="error-box">{errorMsg || "Invalid credentials — please try again."}</div>
          )}

          <button type="submit" className="btn-primary" disabled={btnState === "loading" || btnState === "success"}>
            {btnText[btnState]}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field-label">Access token</label>
          <input className="field-input" type="text" placeholder="gso_xxxxxxxxxxxxxxxx" />
          <div className="field-hint">For API / programmatic access</div>
        </div>

        <div className="form-footer">
          <span>GeoSense v2.0 · Next.js + MongoDB</span>
          <span style={{ color:"var(--blue)",cursor:"pointer",textDecoration:"underline" }}>Forgot password?</span>
        </div>
      </div>
    </div>
  );
}
