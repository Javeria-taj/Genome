import Link from "next/link";
import StarField from "@/components/auth/StarField";
import EarthWireframe from "@/components/auth/EarthWireframe";
import FaviconSVG from "@/components/auth/FaviconSVG";

export const metadata = {
  title: "Genome — 40 Years of Climate Data, Mapped",
  description:
    "Pick any location on Earth. See how its temperature, rainfall, and extreme weather have changed since 1985. Compare cities. Export raw data.",
};

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "Space Mono, monospace", background: "#09090f", color: "#ede8dc" }}>
      {/* ── SECTION 1: HERO ─────────────────────────────────── */}
      <section
        className="landing-hero"
        style={{
          minHeight: "100vh",
          background: "#09090f",
          color: "#ede8dc",
        }}
      >
        {/* LEFT — Earth animation */}
        <div className="landing-left" style={{ position: "relative", overflow: "hidden" }}>
          <StarField />
          <EarthWireframe />
          <div
            className="landing-left-inner"
            style={{
              position: 'relative',
              zIndex: 10,
              padding: 'clamp(32px, 5vw, 48px)',
              paddingTop: 'clamp(60px, 8vw, 80px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 'clamp(400px, 60vh, 100vh)',
              gap: '0',
            }}
          >
            {/* Logo — absolutely positioned top-left */}
            <div style={{
              position: 'absolute',
              top: '32px',
              left: '48px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <FaviconSVG size={22} />
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '.08em' }}>Genome</span>
            </div>

            {/* Main content — centered vertically */}
            <div style={{ maxWidth: '480px' }}>
              {/* Small label above headline */}
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'rgba(237,232,220,0.4)',
                marginBottom: '16px',
              }}>
                Open-Meteo Historical API · 1985–2024
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(38px, 4.5vw, 58px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: 'rgba(237,232,220,0.95)',
                marginBottom: '20px',
              }}>
                40 years of<br />
                climate data,<br />
                <em>mapped.</em>
              </h1>

              {/* Subtext */}
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(12px, 1.4vw, 16px)',
                lineHeight: 1.85,
                color: 'rgba(237,232,220,0.38)',
                marginBottom: '32px',
                maxWidth: '420px',
              }}>
                Pick any location on Earth. See how its temperature, rainfall,
                and extreme weather have changed since 1985.
                Compare cities. Export raw data.
              </p>

              {/* CTAs */}
              <div className="landing-ctas" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/demo" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#ede8dc', color: '#0f0e0d',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '15.5px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '12px 22px', textDecoration: 'none',
                  border: '1.5px solid #ede8dc',
                }}>
                  Try Demo →
                </Link>
                <Link href="/register" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'transparent', color: '#ede8dc',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '15.5px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '12px 22px', textDecoration: 'none',
                  border: '1px solid rgba(237,232,220,0.35)',
                }}>
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Stats + Feature list */}
        <div
          className="landing-right"
          style={{
            background: '#f5f0e8',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            justifyContent: 'center',
            gap: '32px',
            position: 'relative',
          }}
        >
          {/* Sign In link top right */}
          <div style={{
            position: 'absolute', top: '20px', right: '24px',
            fontFamily: "'Space Mono', monospace", fontSize: '14px',
          }}>
            <Link href="/login" style={{ color: '#242321ff', textDecoration: 'underline' }}>
              Already have an account? Sign in →
            </Link>
          </div>

          {/* Right panel top label */}
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px', textTransform: 'uppercase',
            letterSpacing: '0.14em', color: '#7a756e',
            marginBottom: '24px',
            paddingTop: '0',
          }}>
            Genome · Climate Intelligence Platform
          </div>

          {/* 1. Stats row — 3 columns */}
          <div className="landing-stats-grid" style={{
            border: '1.5px solid #0f0e0d',
          }}>
            {[
              { val: '14,600', label: 'Daily data points' },
              { val: '40yr', label: 'Historical coverage' },
              { val: '195', label: 'Countries covered' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '18px 20px',
                borderRight: i < 2 ? '1px solid #0f0e0d' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(32px, 3.2vw, 46px)',
                  color: '#0f0e0d',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  {s.val}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#7a756e',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Feature list */}
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#7a756e',
              marginBottom: '14px',
            }}>
              What you can do
            </div>
            {[
              ['Interactive World Map', 'Click any location to fetch its full climate history'],
              ['40-Year Temperature Trends', 'Annual avg temperature + precipitation since 1985'],
              ['City Comparison', "Overlay two locations — see who's warming faster"],
              ['Decade Delta Calculator', 'Measure exact temperature rise between any two decades'],
              ['Extreme Events Tracker', 'Count days above 35°C or 50mm rain per decade'],
              ['CSV Export', 'Download raw data for use in Excel or research tools'],
            ].map(([title, desc]) => (
              <div key={title} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '11px 0',
                borderBottom: '1px solid rgba(15,14,13,0.1)',
              }}>
                <div style={{
                  width: '6px', height: '6px',
                  background: '#b5451b', borderRadius: '50%',
                  marginTop: '5px', flexShrink: 0,
                }} />
                <div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '15px',
                    fontWeight: '700', color: '#0f0e0d',
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '14.5px',
                    color: '#7a756e', marginTop: '2px',
                  }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ─────────────────────────── */}
      <section
        style={{
          background: "#ede8dc",
          padding: "76px 48px",
          borderTop: "1.5px solid #0f0e0d",
        }}
      >
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#7a756e",
            marginBottom: "8px",
          }}
        >
          How it works
        </div>
        <h2
          style={{
            fontFamily: "Instrument Serif",
            fontStyle: "italic",
            fontSize: "44px",
            color: "#0f0e0d",
            marginBottom: "40px",
          }}
        >
          Three steps to 40 years of insight.
        </h2>
        <div
          className="landing-how-grid"
          style={{
            border: "1.5px solid #0f0e0d",
          }}
        >
          {[
            {
              num: "01",
              title: "Pin a location",
              desc: "Click anywhere on the interactive world map. Genome reverse-geocodes it instantly — city name, country, AQI, and local time.",
            },
            {
              num: "02",
              title: "Fetch 40 years",
              desc: "One click pulls daily temperature and precipitation data from 1985–2024 via the Open-Meteo Historical Archive API.",
            },
            {
              num: "03",
              title: "Explore + export",
              desc: "Compare cities, calculate decade deltas, track extreme events, and download your data as CSV for further analysis.",
            },
          ].map((step, i) => (
            <div
              key={step.num}
              style={{
                padding: "24px 28px",
                borderRight: i < 2 ? "1px solid #0f0e0d" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "Instrument Serif",
                  fontStyle: "italic",
                  fontSize: "40px",
                  color: "rgba(15,14,13,0.12)",
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  fontFamily: "Space Mono",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f0e0d",
                  marginBottom: "8px",
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontFamily: "Space Mono",
                  fontSize: "14.5px",
                  color: "#7a756e",
                  lineHeight: 1.75,
                }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: USE CASES ────────────────────────────── */}
      <section
        style={{
          background: "#ede8dc",
          padding: "76px 48px",
          borderTop: "1.5px solid #0f0e0d",
        }}
      >
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#7a756e",
            marginBottom: "8px",
          }}
        >
          Who uses Genome
        </div>
        <h2
          style={{
            fontFamily: "Instrument Serif",
            fontStyle: "italic",
            fontSize: "44px",
            color: "#0f0e0d",
            marginBottom: "40px",
          }}
        >
          Real-world use cases.
        </h2>
        <div
          className="landing-use-cases-grid"
          style={{
            border: "1.5px solid #0f0e0d",
          }}
        >
          {[
            {
              role: "Climate Researchers",
              use: "Cross-validate Open-Meteo data against field measurements. Export decade-level CSVs for statistical analysis.",
            },
            {
              role: "Journalists",
              use: 'Back up climate reporting with local data. "Mumbai has had 88 extreme heat days in the past decade — up from 42 in the 1980s."',
            },
            {
              role: "Students & Educators",
              use: "Visualise climate change at the local level. Compare your city to another. Write better essays with real numbers.",
            },
            {
              role: "Urban Planners",
              use: "Understand how a region's heat and rainfall profile has shifted. Plan infrastructure for the next 20 years.",
            },
          ].map((uc, i) => (
            <div
              key={uc.role}
              style={{
                padding: "22px 26px",
                borderRight: i % 2 === 0 ? "1px solid #0f0e0d" : "none",
                borderBottom: i < 2 ? "1px solid #0f0e0d" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Mono",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f0e0d",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    background: "#b5451b",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                {uc.role}
              </div>
              <div
                style={{
                  fontFamily: "Space Mono",
                  fontSize: "14.5px",
                  color: "#7a756e",
                  lineHeight: 1.75,
                }}
              >
                {uc.use}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: FOOTER ───────────────────────────────── */}
      <footer
        className="landing-footer"
        style={{
          background: "#0f0e0d",
          color: "#ede8dc",
          padding: "clamp(24px, 5vw, 48px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1.5px solid rgba(237,232,220,0.1)",
          fontFamily: "Space Mono",
          fontSize: "10.5px",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaviconSVG size={19} />
          <span>Genome</span>
          <span style={{ color: "rgba(237,232,220,0.3)" }}>·</span>
          <span style={{ color: "rgba(237,232,220,0.45)" }}>
            Built by{" "}
            <a
              href="https://github.com/Javeria-taj"
              target="_blank"
              style={{ color: "#ede8dc", textDecoration: "underline" }}
            >
              Javeria Taj
            </a>
          </span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <a
            href="https://github.com/Javeria-taj"
            target="_blank"
            style={{
              color: "rgba(237,232,220,0.55)",
              textDecoration: "none",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            GitHub
          </a>
          <Link
            href="/about"
            style={{
              color: "rgba(237,232,220,0.55)",
              textDecoration: "none",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            About
          </Link>
          <span style={{ color: "rgba(237,232,220,0.25)", fontSize: "12px" }}>
            Data: open-meteo.com
          </span>
        </div>
      </footer>
    </div>
  );
}
