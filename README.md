# GENOME v3.4 — Technical Documentation 🧬

> A high-performance, neobrutalist environmental intelligence platform for 40-year climate risk assessment, interactive geocognition, and real-time system monitoring.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Data Flow Pipeline](#data-flow-pipeline)
4. [API Reference](#api-reference)
5. [Authentication System](#authentication-system)
6. [Caching Architecture](#caching-architecture)
7. [Frontend Component Hierarchy](#frontend-component-hierarchy)
8. [State Management](#state-management)
9. [Design System](#design-system)
10. [Mobile Responsiveness](#mobile-responsiveness)
11. [Environment Setup](#environment-setup)
12. [Development](#development)

---

## System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Browser (React 19)"]
        UI["Dashboard Pages"]
        CTX["CoordinateContext"]
        HOOK["useClimateData Hook"]
        SWR["useSystemHealth (SWR)"]
        CC["Client Cache (Map)"]
    end

    subgraph Server["⚙️ Next.js 15 API Routes"]
        CLIMATE["/api/climate"]
        HEALTH["/api/health"]
        AUTH["/api/auth/[...nextauth]"]
        REG["/api/register"]
        FORGOT["/api/auth/forgot-password"]
        RESET["/api/auth/reset-password"]
        PINS["/api/user/saved-locations"]
        SC["Server Cache (Map)"]
    end

    subgraph External["🌐 External Services"]
        METEO["Open-Meteo Archive API"]
        GEO["Open-Meteo Geocoding API"]
        AQI["Open-Meteo Air Quality API"]
    end

    subgraph DB["🗄️ MongoDB"]
        USERS["Users Collection"]
    end

    UI --> CTX
    CTX --> HOOK
    HOOK --> CC
    CC -->|miss| CLIMATE
    CLIMATE --> SC
    SC -->|miss| METEO
    SWR --> HEALTH
    HEALTH --> DB
    AUTH --> DB
    REG --> DB
    FORGOT --> DB
    RESET --> DB
    PINS --> DB
    UI --> GEO
    UI --> AQI
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) | Server-side rendering, API routes, file-based routing |
| **Language** | TypeScript 5 | Type safety across client and server |
| **UI** | React 19 | Component rendering and state management |
| **Styling** | Vanilla CSS (custom design tokens) | Neobrutalist design system with zero utility frameworks |
| **Charts** | Chart.js + react-chartjs-2 | Climate time-series, comparison, and extremes visualizations |
| **Maps** | React-Leaflet + Leaflet | Interactive world map with CartoDB Dark Matter tiles |
| **Database** | MongoDB + Mongoose | User accounts, saved locations, password reset tokens |
| **Auth** | NextAuth.js v5 (beta) | Session-based authentication with credentials provider |
| **Caching** | SWR + custom Map caches | Multi-layer data caching (client + server) |
| **HTTP** | Axios | API calls with retry logic |
| **Hashing** | bcryptjs | Password hashing (10 salt rounds) |
| **Validation** | Zod + react-hook-form | Form validation schemas |
| **Theming** | next-themes + custom ThemeContext | Dark/light mode with CSS variable switching |

---

## Data Flow Pipeline

This diagram traces a single user interaction from map click to rendered chart:

```mermaid
sequenceDiagram
    participant User
    participant WorldMap
    participant CoordCtx as CoordinateContext
    participant Hook as useClimateData
    participant ClientCache as Client Cache (Map)
    participant API as /api/climate
    participant ServerCache as Server Cache (Map)
    participant OpenMeteo as Open-Meteo Archive API

    User->>WorldMap: Clicks map at (lat, lng)
    WorldMap->>WorldMap: Reverse geocode via Open-Meteo Geocoding
    WorldMap->>WorldMap: Fetch AQI via Open-Meteo Air Quality
    WorldMap->>CoordCtx: setSelectedCoords({lat, lng})
    CoordCtx->>Hook: Triggers useEffect(lat, lng)
    Hook->>ClientCache: Check cache key (lat.toFixed(2), lng.toFixed(2))

    alt Client Cache HIT
        ClientCache-->>Hook: Return cached data
        Hook-->>User: Render charts immediately
    else Client Cache MISS
        Hook->>API: GET /api/climate?lat=X&lng=Y
        API->>API: Normalize longitude to [-180, 180]
        API->>ServerCache: Check cache key (lat.toFixed(2), lng.toFixed(2))

        alt Server Cache HIT
            ServerCache-->>API: Return cached data
        else Server Cache MISS
            API->>OpenMeteo: GET /v1/archive?lat=X&lng=Y&start_date=1985-01-01&end_date=2024-12-31
            OpenMeteo-->>API: Raw daily data (14,600 data points)
            API->>API: Aggregate daily → yearly summaries
            API->>ServerCache: Store result (24h TTL)
        end

        API-->>Hook: JSON array of yearly climate data
        Hook->>ClientCache: Store result (24h TTL)
        Hook-->>User: Render charts
    end
```

---

## API Reference

### `GET /api/climate`

Fetches 40 years of historical climate data for a coordinate pair.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | `string` | ✅ | Latitude (-90 to 90) |
| `lng` | `string` | ✅ | Longitude (auto-normalized to -180 to 180) |

**Response** — `200 OK`:
```json
[
  {
    "year": 1985,
    "avgTemp": 24.3,
    "totalPrecip": 1245.6,
    "extremeHeatDays": 12,
    "extremeRainDays": 3
  }
]
```

**Error Responses**: `400` (missing params), `429` (rate limit), `500` (server error)

**Internal Logic**:
1. Parse and normalize longitude: `((lng + 180) % 360 + 360) % 360 - 180`
2. Generate cache key: `lat.toFixed(2),lng.toFixed(2)` (~1km precision)
3. Check server-side `Map` cache (24h TTL)
4. On miss: single GET to `archive-api.open-meteo.com` for full 40-year range
5. Aggregate raw daily data into yearly summaries (avgTemp, totalPrecip, extremeHeatDays, extremeRainDays)
6. Store result in server cache and return JSON

---

### `GET /api/health`

Real-time platform health check. Polled by `useSystemHealth` hook every 30 seconds via SWR.

**Response** — `200 OK`:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-26T14:30:00.000Z",
  "services": {
    "database": "operational",
    "api": "operational"
  },
  "metrics": {
    "latency": "2ms",
    "uptime": 86400
  }
}
```

**Error Response** — `503`: Database connection failed.

---

### `GET/POST/DELETE /api/user/saved-locations`

CRUD operations for user-pinned map locations. All routes require authentication.

| Method | Action | Body / Params |
|---|---|---|
| `GET` | List all saved pins | — |
| `POST` | Save a new pin | `{ lat, lng, label }` |
| `DELETE` | Remove a pin | `?id=<mongoId>` |

---

### `POST /api/register`

Creates a new user account.

| Field | Type | Validation |
|---|---|---|
| `name` | `string` | Required |
| `email` | `string` | Required, unique |
| `password` | `string` | Required, min 6 chars |

Password is hashed with `bcryptjs` (10 salt rounds) before storage.

---

### `POST /api/auth/forgot-password`

Generates a password reset token (1h expiry) and logs the reset URL to the server console.

```
POST { "email": "user@example.com" }
→ Always returns 200 OK (prevents email enumeration)
→ Console: PASSWORD RESET REQUESTED — Reset Link: /reset-password/<token>
```

---

### `POST /api/auth/reset-password`

Validates the token, hashes the new password, and clears the reset token from the user record.

---

## Authentication System

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant NextAuth as NextAuth.js
    participant MongoDB
    participant Dashboard

    User->>LoginPage: Enter email + password
    LoginPage->>NextAuth: signIn("credentials", {email, password})
    NextAuth->>MongoDB: User.findOne({ email })

    alt User Not Found
        NextAuth-->>LoginPage: Error: "EmailNotFound"
        LoginPage-->>User: ErrorBanner: "No account found"
    else Wrong Password
        NextAuth-->>LoginPage: Error: "WrongPassword"
        LoginPage-->>User: ErrorBanner: "Incorrect password"
    else Success
        NextAuth->>NextAuth: bcrypt.compare(password, hash)
        NextAuth-->>Dashboard: Session created, redirect
    end
```

**Key Design Decisions**:
- **Granular error codes**: `EmailNotFound`, `WrongPassword`, `TooManyAttempts` — mapped to user-friendly UI messages
- **AuthButton component**: State machine with `idle → loading → success` transitions
- **ErrorBanner component**: Auto-dismissing (5s), animated shake effect

---

## Caching Architecture

Genome uses a **3-layer caching strategy** to minimize API calls and maximize responsiveness:

```mermaid
graph LR
    A["User Action"] --> B{"Client Cache<br/>(useClimateData)"}
    B -->|HIT| C["Instant Render"]
    B -->|MISS| D{"Server Cache<br/>(/api/climate)"}
    D -->|HIT| E["Fast Response"]
    D -->|MISS| F["Open-Meteo API<br/>(Single 40yr request)"]
    F --> D
    D --> B
    B --> C

    style B fill:#2259c7,color:#fff
    style D fill:#b5451b,color:#fff
    style F fill:#0f0e0d,color:#fff
```

| Layer | Location | TTL | Key Precision | Scope |
|---|---|---|---|---|
| **L1: Client Cache** | `useClimateData.ts` (module-level `Map`) | 24 hours | ~1km (2 decimal places) | Shared across all dashboard pages |
| **L2: Server Cache** | `api/climate/route.ts` (module-level `Map`) | 24 hours | ~1km (2 decimal places) | Shared across all server requests |
| **L3: AQI Cache** | `WorldMap.tsx` (module-level `Map`) | 1 hour | ~1km (2 decimal places) | Map component only |
| **L4: Geocoding Cache** | `CitySearchInput.tsx` (module-level `Map`) | 1 hour | Exact query string | Search input only |

**Cache Invalidation**: The `refetch()` function in `useClimateData` deletes the specific key from L1 cache before re-fetching, which cascades to L2.

---

## Frontend Component Hierarchy

```mermaid
graph TD
    RootLayout["RootLayout (layout.tsx)"]
    DashLayout["DashboardLayout"]
    Topbar["Topbar"]
    Sidebar["Sidebar"]
    Main["Main Content Area"]

    RootLayout --> DashLayout
    DashLayout --> Topbar
    DashLayout --> Sidebar
    DashLayout --> Main

    Main --> Overview["Overview Page"]
    Main --> Trends["Trends Page"]
    Main --> Compare["Compare Page"]
    Main --> Delta["Delta Page"]
    Main --> Extremes["Extremes Page"]
    Main --> Export["Export Page"]

    Overview --> WorldMap
    Overview --> ClimateLineChart
    Trends --> ClimateLineChart
    Compare --> ComparisonChart
    Extremes --> ExtremesBarChart
    Delta --> HeatGauge

    WorldMap --> MapPrimitive
    WorldMap --> LocationInfoCard
    WorldMap --> CitySearchInput
```

---

## State Management

Genome uses **React Context** for global coordinate state and **module-level caches** for data persistence:

| State | Provider | Consumed By |
|---|---|---|
| Selected coordinates | `CoordinateContext` | All dashboard pages, Topbar |
| Location metadata (city, AQI, timezone) | `CoordinateContext` | WorldMap, Dashboard, Topbar |
| Climate data (City A / City B) | `CoordinateContext` | Compare page |
| Theme (dark/light) | `ThemeContext` | Topbar, MapPrimitive, all charts |
| System health | `useSystemHealth` (SWR) | Topbar |
| Climate data (per-location) | `useClimateData` (hook) | Dashboard, Trends, Delta, Extremes |

---

## Design System

Genome follows a **Neobrutalist** design language:

| Token | Value | Purpose |
|---|---|---|
| `--ink` | `#0f0e0d` / `#ede8dc` | Primary text, borders |
| `--paper` | `#f5f0e8` / `#131210` | Background surfaces |
| `--accent` | `#b5451b` / `#d4672a` | Interactive elements, temperature |
| `--blue` | `#2259c7` / `#4d7ff0` | Precipitation, secondary data |
| `--mono` | `Space Mono` | All UI text |
| `--serif` | `Instrument Serif` | Headlines, decorative |
| `border-radius` | `0` everywhere | Brutalist edges |

**Dark mode**: Toggled via `ThemeContext`, which adds `html.dark` class. All CSS variables are re-mapped in the `html.dark` selector.

---

## Mobile Responsiveness

Single breakpoint at `768px`:

| Component | Desktop | Mobile (<768px) |
|---|---|---|
| Sidebar | Fixed 190px column | Slide-in overlay drawer |
| Topbar | Full row with coords | Compact; coords hidden |
| Panel Grid | 2-column CSS grid | 1-column stack |
| Auth Pages | 2-column (branding + form) | 1-column (form only) |
| Map | 210px height | 260px (touch-friendly) |

**Sidebar Drawer**: Uses `CustomEvent('sidebar-toggle')` dispatched by the hamburger button in `Topbar.tsx` and listened by `Sidebar.tsx`.

---

## Environment Setup

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/genome
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key
```

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

<p align="center">
  Built with precision by <b>Genome Systems</b> · © 2026<br/>
  <i>Next.js 15 · React 19 · MongoDB · Chart.js · Leaflet</i>
</p>
