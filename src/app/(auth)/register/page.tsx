"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import BrutalistEarth from "@/components/ui/BrutalistEarth";
import axios from "axios";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setBtnState("loading");
    setErrorMsg("");
    try {
      await axios.post("/api/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      setBtnState("success");
      toast.success("Account created — welcome to Genome");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      setBtnState("idle");
      setErrorMsg(err.response?.data?.error || "Registration failed — please try again.");
    }
  };

  return (
    <div className="login-shell">
      {/* LEFT ART PANEL */}
      <div className="left">
        <BrutalistEarth />

        <div className="left-top" style={{ position: "relative", zIndex: 10 }}>
          <div className="left-logo">
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
            Genome
          </div>
        </div>

        <div className="left-bottom" style={{ position: "relative", zIndex: 10 }}>
          <div className="left-headline headline">Map your world.<br/>Start tracking<br/>climate now.</div>
          <div className="subtext" style={{ fontSize:8.5,color:"rgba(245,240,232,.4)",lineHeight:1.7 }}>
            Join thousands of researchers<br/>analysing global climate patterns.
          </div>
          <div className="left-stats stats-grid">
            <div className="ls-cell"><span className="ls-val">∞</span><div className="ls-lbl">Locations</div></div>
            <div className="ls-cell"><span className="ls-val">40yr</span><div className="ls-lbl">Coverage</div></div>
            <div className="ls-cell"><span className="ls-val">Free</span><div className="ls-lbl">Always</div></div>
            <div className="ls-cell"><span className="ls-val">Open</span><div className="ls-lbl">Data source</div></div>
          </div>
          <div className="left-coords">Open-Meteo Historical Weather API · 1985 – 2024</div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right">
        <div className="right-top">
          <span className="right-top-label">Create your account</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section-label">Account Details</div>

          <div className="field">
            <label className="field-label">Full name</label>
            <input {...register("name")} className="field-input" type="text" placeholder="Dr. Jane Smith" />
            {errors.name && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.name.message}</div>}
          </div>

          <div className="field">
            <label className="field-label">Email address</label>
            <input {...register("email")} className="field-input" type="email" placeholder="user@genome.io" />
            {errors.email && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.email.message}</div>}
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input {...register("password")} className="field-input" type="password" placeholder="••••••••••••" />
            <div className="field-hint">Min. 8 characters · case-sensitive</div>
            {errors.password && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.password.message}</div>}
          </div>

          <div className="field">
            <label className="field-label">Confirm password</label>
            <input {...register("confirmPassword")} className="field-input" type="password" placeholder="••••••••••••" />
            {errors.confirmPassword && <div className="field-hint" style={{ color:"var(--red)" }}>{errors.confirmPassword.message}</div>}
          </div>

          {errorMsg && <div className="error-box">{errorMsg}</div>}

          <button type="submit" className="btn-primary" disabled={btnState !== "idle"}>
            {btnState === "idle" && <><span style={{ width:14,height:14,border:"1.5px solid var(--paper)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9 }}>→</span> Create Account &amp; Enter Dashboard</>}
            {btnState === "loading" && "Creating account..."}
            {btnState === "success" && <><span style={{ width:14,height:14,border:"1.5px solid var(--paper)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9 }}>✓</span> Account Created — Redirecting</>}
          </button>
          
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
            <Link href="/login" style={{ fontSize: "10px", color: "var(--ink)", textDecoration: "underline" }}>Already have an account? Sign in</Link>
          </div>
        </form>

        <div className="form-footer">
          <span>Genome v3.0 · Next.js + MongoDB</span>
        </div>
      </div>
    </div>
  );
}
