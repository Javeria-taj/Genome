import { Providers } from "@/components/providers/Providers";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";
import OnboardingOverlay from "@/components/ui/OnboardingOverlay";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Providers>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Topbar />
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          <Sidebar />
          <div className="main" style={{ position: "relative" }}>
            <OnboardingOverlay />
            {children}
          </div>
        </div>
        {/* Bottom status bar */}
        <div className="bbar no-print">
          <span>Genome</span>
          <span style={{ color: "var(--dim)" }}>·</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/Javeria-taj"
              target="_blank"
              style={{ color: "var(--ink)", textDecoration: "underline" }}
            >
              Javeria Taj
            </a>
          </span>
          <span style={{ color: "var(--dim)" }}>·</span>
          <span>40yr · 14,600 pts loaded</span>
          <a
            href="https://github.com/Javeria-taj"
            target="_blank"
            style={{ marginLeft: "auto", color: "var(--dim)", textDecoration: "none", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            GitHub →
          </a>
          <a
            href="https://open-meteo.com/en/docs/historical-weather-api"
            target="_blank"
            style={{ color: "var(--dim2)", fontSize: 9, textDecoration: "none" }}
          >
            open-meteo.com
          </a>
        </div>
        <MobileBottomNav />
      </div>
    </Providers>
  );
}
