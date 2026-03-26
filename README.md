<!-- Logo Placeholder: Please copy logo.png from artifacts to public/ folder -->
# GENOME v3.4 | Surgical Sustainability Dashboard 🧬

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

**Genome** is a high-performance, neobrutalist environmental intelligence platform. It provides precision climate risk assessment, interactive time-series analysis, and global geocognition tools.

---

## 🎨 Design Philosophy: Neobrutalism
Genome adheres to a **Neobrutalist** aesthetic:
- **High Contrast**: Sharp, non-rounded borders (`border-radius: 0`).
- **Technical Typography**: Systematic use of `Space Mono` for all data-driven components.
- **Glassmorphism & Depth**: Subtle 3D perspective tilts on map layers and interactive cards.
- **Micro-interactions**: Animated error banners, state-aware buttons, and real-time pulse indicators.

---

## 🚀 Core Engine Features

### 🔍 Interactive Climate Intelligence
- **Floating Insight Engine**: Interactive [ClimateLineChart](file:///c:/Users/Dell/OneDrive/Desktop/genome/src/components/charts/ClimateLineChart.tsx) that spawns persistent data cards on year-click.
- **Vertical Selection Rule**: Precision vertical indicators for multi-metric comparison.
- **Data Freshness Tracker**: Real-time polling with SWR to ensure data currency and platform uptime.

### 🗺️ Global Geocognition
- **Theme-Aware Mapping**: Seamless transition between Topo, Street, and Satellite layers with **CartoDB Dark Matter** integration for dark mode legibility.
- **Coordinate Normalization**: Advanced longitude wrapping logic to handle global coordinate wrap-around without API failures.
- **Projected Markers**: Dynamic location pinning with custom SVG dot icons and detail popups.

### 🛡️ Surgical Authentication
- **Unified Auth Components**: Standardized [AuthButton](file:///c:/Users/Dell/OneDrive/Desktop/genome/src/components/auth/AuthButton.tsx) and [ErrorBanner](file:///c:/Users/Dell/OneDrive/Desktop/genome/src/components/auth/ErrorBanner.tsx) with "shake" and fade animations.
- **Granular Security**: Specific error tracing for `EmailNotFound` vs `WrongPassword` to improve user recovery.

### 📊 System Health monitoring
- **Real-time Latency Check**: Dynamic [Topbar](file:///c:/Users/Dell/OneDrive/Desktop/genome/src/components/ui/Topbar.tsx) indicator showing MongoDB and API status.
- **Automatic Polling**: Background health checks every 30s using SWR.

---

## 🛠️ Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19 |
| **Styling** | Vanilla CSS (Zero-utility, custom design tokens) |
| **Visuals** | Chart.js, React-Leaflet |
| **State/Caching** | SWR, React Context |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | NextAuth.js |

---

## ⚙️ Setup & Environment

Genome requires the following environment variables in `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Development Workflow

```bash
# Clone and Install
git clone https://github.com/your-username/genome.git
cd genome
npm install

# Run Dev Environment (Turbopack enabled)
npm run dev

# Production Build & Verification
npm run build
```

---

## 📄 Submission Requirements

- **IDE**: VS Code / Antigravity Agent
- **Hosting**: Vercel
- **AI Tools**: Antigravity (Google DeepMind)

---

<p align="center">
  Built with precision by <b>Genome Systems</b> • © 2026
</p>
