import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="login-shell">
      <AuthLeftPanel variant="login" />
      <LoginForm />
    </div>
  );
}
