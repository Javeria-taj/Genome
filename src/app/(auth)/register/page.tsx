"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

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
      toast.success("Account created — welcome to GeoSense");
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
        <div className="left-grid" />
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="geo-ring" style={{ width: 320, height: 320, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-ring" style={{ width: 220, height: 220, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-ring" style={{ width: 120, height: 120, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div className="geo-cross-h" />
          <div className="geo-cross-v" />
          <svg className="left-paths" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute",inset:0,width:"100%",height:"100%" }}>
            <path d="M0 210 Q200 190 400 210" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M0 350 Q200 330 400 350" fill="none" stroke="rgba(245,240,232,.07)" strokeWidth="1"/>
            <path d="M200 0 Q190 350 200 700" fill="none" stroke="rgba(245,240,232,.06)" strokeWidth="1"/>
            <circle cx="160" cy="260" r="2.5" fill="rgba(230,58,46,.5)"/>
            <circle cx="280" cy="200" r="2.5" fill="rgba(26,110,245,.5)"/>
            <circle cx="100" cy="400" r="2.5" fill="rgba(245,240,232,.3)"/>
            <line x1="160" y1="260" x2="280" y2="200" stroke="rgba(230,58,46,.25)" strokeWidth=".8" strokeDasharray="3 3"/>
          </svg>
          <div className="center-ring" />
          <div className="center-dot" />
        </div>

        <div className="left-top">
          <div className="left-logo">
            <div className="logo-pip" />
            GeoSense
          </div>
        </div>

        <div className="left-bottom">
          <div className="left-headline">Map your world.<br/>Start tracking<br/>climate now.</div>
          <div style={{ fontSize:8.5,color:"rgba(245,240,232,.4)",lineHeight:1.7 }}>
            Join thousands of researchers<br/>analysing global climate patterns.
          </div>
          <div className="left-stats">
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
          <Link href="/login" style={{ fontSize:8.5,color:"var(--blue)",textDecoration:"underline",fontFamily:"var(--mono)" }}>
            Sign in →
          </Link>
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
            <input {...register("email")} className="field-input" type="email" placeholder="user@geosense.io" />
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
        </form>

        <div className="form-footer">
          <span>GeoSense v2.0 · Next.js + MongoDB</span>
          <Link href="/login" style={{ color:"var(--blue)",textDecoration:"underline" }}>Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}
