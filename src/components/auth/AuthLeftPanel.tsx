"use client";

import { useEffect, useState } from "react";
import StarField from "./StarField";
import EarthWireframe from "./EarthWireframe";
import FaviconSVG from "./FaviconSVG";

interface AuthLeftPanelProps {
  variant: "login" | "register";
}

export default function AuthLeftPanel({ variant }: AuthLeftPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = document.getElementById("stat-pts");
    if (!el) return;
    let current = 0;
    const target = 14600;
    const step = target / 55;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 22);
    return () => clearInterval(timer);
  }, [mounted]);

  if (!mounted) return <div className="left" style={{ background: "#09090f" }} />;

  return (
    <div className="left login-left">
      <StarField />
      <EarthWireframe />

      <div className="login-left-content" style={{ position: "relative", zIndex: 10 }}>
        <div className="login-logo">
          <FaviconSVG size={20} />
          <span>Genome</span>
        </div>

        <div className="left-bottom">
          {variant === "login" ? (
            <h1 className="login-headline headline">
              40 years of<br />
              climate data,<br />
              <em>mapped.</em>
            </h1>
          ) : (
            <h1 className="login-headline headline">
              Map your world.<br />
              Start tracking<br />
              <em>climate now.</em>
            </h1>
          )}

          <p className="login-subtext subtext">
            {variant === "login"
              ? "Historical weather analysis powered by Open-Meteo API. Visualise temperature, precipitation & extreme events across any location on Earth."
              : "Join researchers and analysts mapping 40 years of global climate patterns. Free, open, and powered by Open-Meteo."}
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
              <span className="ls-val">+2.1°</span>
              <span className="ls-lbl">Avg rise</span>
            </div>
            <div className="ls">
              <span className="ls-val">∞</span>
              <span className="ls-lbl">Locations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
