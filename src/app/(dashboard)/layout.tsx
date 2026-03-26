import { Providers } from "@/components/providers/Providers";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";
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
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <div className="main">
            {children}
          </div>
        </div>
        {/* Bottom status bar */}
        <div className="bbar no-print">
          <span>Genome v3.0</span>
          <span>40yr · 14,600 pts</span>
          <span style={{ marginLeft: "auto", color: "var(--dim2)", fontSize: 8 }}>open-meteo.com/en/docs/historical-weather-api</span>
        </div>
      </div>
    </Providers>
  );
}
