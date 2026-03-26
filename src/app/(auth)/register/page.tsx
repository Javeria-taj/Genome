import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="login-shell">
      <AuthLeftPanel variant="register" />
      <RegisterForm />
    </div>
  );
}
