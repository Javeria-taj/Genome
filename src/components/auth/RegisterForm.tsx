"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import ErrorBanner from "@/components/auth/ErrorBanner";
import Field from "@/components/auth/Field";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await axios.post("/api/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      // Auto sign-in after registration
      const result = await signIn("credentials", { 
        email: data.email, 
        password: data.password, 
        redirect: false 
      });
      
      if (result?.ok) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setStatus("error");
        setErrorMsg("Account created, but auto-login failed. Please sign in manually.");
      }
    } catch (err: any) {
      setStatus("error");
      const msg = err.response?.data?.error;
      if (msg?.includes("already registered") || msg?.includes("exists")) {
        setErrorMsg("Email already registered — sign in instead?");
      } else {
        setErrorMsg(msg || "Registration failed — please try again.");
      }
    }
  };

  return (
    <div className="right">
      <div className="right-top">
        <span className="right-top-label">Create your account</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section-label">Account Details</div>
        <ErrorBanner 
          message={errorMsg} 
          onDismiss={() => { setStatus("idle"); setErrorMsg(""); }} 
        />

        <Field label="Full name" error={errors.name?.message}>
          <input {...register("name")} className="field-input" type="text" placeholder="Dr. Jane Smith" />
        </Field>

        <Field label="Email address" error={errors.email?.message}>
          <input {...register("email")} className="field-input" type="email" placeholder="user@genome.io" />
        </Field>

        <Field label="Password" error={errors.password?.message} hint="Min. 8 characters &middot; must contain a number">
          <input {...register("password")} className="field-input" type="password" placeholder="••••••••••••" />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input {...register("confirmPassword")} className="field-input" type="password" placeholder="••••••••••••" />
        </Field>

        <AuthButton
          status={status}
          successLabel="Account Created — Entering Dashboard"
        >
          Create Account &amp; Enter Dashboard
        </AuthButton>
        
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
          <Link href="/login" style={{ 
            fontSize: "clamp(12px, 0.85vw, 13px)", 
            color: "var(--ink)", 
            textDecoration: "underline",
            letterSpacing: "0.02em"
          }}>
            Already have an account? Sign in
          </Link>
        </div>
      </form>

      <div className="form-footer">
        <span>&copy; 2026 Genome &middot; Built by Javeria Taj</span>
      </div>
    </div>
  );
}
