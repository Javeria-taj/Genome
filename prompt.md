You are building GeoSense, a production-grade GeoScience & Remote Sensing 
Dashboard. Stack: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, 
MongoDB. A blank Next.js boilerplate is already in place.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aesthetic: "Engineering Blueprint" neo-brutalism.
  - Paper: #f5f0e8 (warm off-white), never pure white
  - Ink: #0f0e0d (near-black), never pure black
  - Paper-2 (surface): #ede8dc
  - Accent Red: #e63a2e — temperature, heat, alerts, CTAs
  - Accent Blue: #1a6ef5 — precipitation, secondary data, links
  - Dim: #7a756e — labels, captions, secondary text
  - Dark mode: ink↔paper swap, red→#ff5a4f, blue→#4d8eff
  
Fonts (Google Fonts, load in layout.tsx):
  - 'Space Mono' (400, 700, italic) — ALL UI text, labels, data
  - 'Instrument Serif' (italic) — page titles, login headline only

Border rules:
  - Heavy border: 1.5px solid var(--ink) — panel edges, primary CTAs
  - Medium border: 1px solid var(--ink) — section dividers, inputs
  - Hairline: 0.5px solid rgba(15,14,13,0.18) — table rows, sub-dividers
  - NO border-radius anywhere except inputs (0px) and map pins

Background texture:
  On map panel and login left panel only: CSS grid lines
    background-image: linear-gradient(var(--ink) 1px, transparent 1px),
                      linear-gradient(90deg, var(--ink) 1px, transparent 1px);
    background-size: 28px 28px; opacity: 0.055;

Typography scale (Space Mono only):
  - Page title: Instrument Serif italic 21px
  - Panel title: 9.5px uppercase letter-spacing 0.12em font-weight 700
  - Body / nav items: 10–11px
  - Labels / tags / captions: 8–9px uppercase letter-spacing 0.10em
  - Data values (stat cards): 15–18px font-weight 700
  - Mega value (Heat Gauge): Instrument Serif italic 28–32px


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PACKAGE INSTALLATION (run first)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm install next-auth@beta mongoose bcryptjs leaflet react-leaflet \
  chart.js react-chartjs-2 axios papaparse react-hook-form zod \
  react-hot-toast lucide-react \
  @types/leaflet @types/bcryptjs @types/papaparse


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/app
  /api
    /auth/[...nextauth]/route.ts
    /auth/register/route.ts
    /climate/route.ts              ← Open-Meteo proxy
    /user/saved-locations/route.ts
  /(auth)
    /login/page.tsx
    /register/page.tsx
    layout.tsx                     ← no sidebar, full bleed
  /(dashboard)
    layout.tsx                     ← sidebar + topbar + context
    page.tsx                       ← overview
    /trends/page.tsx
    /compare/page.tsx
    /delta/page.tsx
    /extremes/page.tsx
    /export/page.tsx
    /print/page.tsx                ← A4 printable report

/components
  /map
    WorldMap.tsx                   ← dynamic import, ssr:false
    MapControls.tsx
  /charts
    ClimateLineChart.tsx
    ComparisonChart.tsx
    ExtremesBarChart.tsx
    HeatGauge.tsx
  /ui
    Sidebar.tsx                    ← collapsible drawer
    Topbar.tsx                     ← with dark mode toggle
    StatCard.tsx
    SkeletonLoader.tsx             ← animated pulse skeleton
    ExportButton.tsx
    DecadePicker.tsx
    CitySearchInput.tsx
    PrintButton.tsx

/lib
  mongodb.ts
  auth.ts
  openmeteo.ts
  csv.ts

/models
  User.ts
  SavedLocation.ts

/types
  climate.ts
  user.ts

/hooks
  useClimateData.ts               ← returns {data, loading, error, refetch}
  useMapClick.ts
  useDarkMode.ts                  ← persists to localStorage

/context
  CoordinateContext.tsx
  ThemeContext.tsx


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN PAGE  /app/(auth)/login/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: CSS grid, two equal columns, min-height 100vh, border 1.5px solid ink
on all four outer edges.

LEFT PANEL (background: var(--ink), color: var(--paper)):
  - Absolute positioned CSS grid texture (opacity 0.06)
  - Three concentric SVG circles centered, stroke rgba(paper, 0.12)
  - Horizontal + vertical center cross-hair lines rgba(paper, 0.08)
  - Red pulsing center dot with ring animation (same as map pin)
  - SVG lat/lng arc lines (decorative, opacity 0.07):
      3 horizontal curved paths simulating latitude lines
      3 vertical curved paths simulating longitude lines
  - 4 scatter pin circles with connector dashed lines between them
  - Top-left: GeoSense logo (pip + wordmark)
  - Bottom section:
      Instrument Serif italic headline: "40 years of\nclimate data,\nmapped."
      Subtext: "Historical weather analysis powered by Open-Meteo API"
      2×2 stat grid (border 1px rgba(paper,0.18)):
        14,600 data points | 40yr coverage | +2.1° avg rise | ∞ locations
      Coordinate readout: "13.0827° N · 80.2707° E · Chennai, IN"

RIGHT PANEL (background: var(--paper)):
  - Top row: "Sign in to GeoSense" label left | "Create account →" link right
  
  TERMINAL BLOCK (border 1px ink, bg paper-2, padding 12px 14px):
    Three lines that fade in sequentially with these delays:
      300ms:  "$ geosense --init"
      900ms:  "Connecting to Open-Meteo archive...  OK" (OK in #2ecc71)
      1600ms: "Loading 40yr dataset... Ready." + blinking red cursor
    Cursor: 7×11px red rect, blink animation 0.8s step-end infinite

  FORM (react-hook-form + zod):
    Section label: "Credentials" (8px uppercase hairline below)
    Field: Email address → type="email" placeholder="user@geosense.io"
    Field: Password → type="password" placeholder="••••••••••••"
           Hint: "Min. 8 characters · case-sensitive"
    Error box (hidden by default, border 1px red, text red):
      Shows on invalid submit
    Primary CTA button (full width, bg ink, color paper):
      "→  Authenticate & Enter Dashboard"
      On click: button text → "Authenticating..." for 1400ms
      On success: button text → "✓ Access Granted — Redirecting"
      On error: show error box
    Divider: "or" with hairline rules either side
    Field: Access token → placeholder="gso_xxxxxxxxxxxxxxxx"
           Hint: "For API / programmatic access"
  
  Footer (margin-top auto, border-top hairline):
    Left: "GeoSense v2.0 · Next.js + MongoDB"
    Right: "Forgot password?" (blue underline)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGISTER PAGE  /app/(auth)/register/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identical split-screen layout as login. Left panel headline:
"Map your world.\nStart tracking\nclimate now."

Right panel form fields: Name, Email, Password, Confirm Password.
Zod schema: passwords must match, email valid, password ≥ 8 chars.
On success: call signIn() → redirect to /dashboard.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DASHBOARD LAYOUT  /app/(dashboard)/layout.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOPBAR (height 42px, border-bottom 1.5px solid ink):
  Left:
    Logo block (border-right 1.5px): pip + "GeoSense" — hover inverts ink/paper
    Coordinates block (border-right 1px): LAT · LNG · ALT from CoordinateContext
  Right (each item border-left 1px):
    Dark Mode Toggle button:
      Label "Light" / "Dark", icon is a 10×10px square that fills on dark
      On click: toggles ThemeContext, persists to localStorage
      Transition: background color 200ms ease on html element
    API Status: green pip + "Open-Meteo Live"
    UTC Clock: updates every second via useEffect setInterval
    User: "User #XXXX"

SIDEBAR (Sidebar.tsx):
  Width: 190px expanded, 44px collapsed
  Transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1) — smooth drawer animation
  
  Collapse toggle button (height 38px, border-bottom 1px):
    Left: hamburger icon (3 lines, 16×11px)
      When collapsed: line 2 width 60%, line 3 width 80% (visual cue)
    Label: "Collapse" / "Expand"
    Hover: inverts ink/paper
  
  When collapsed: all text labels and section headings have opacity:0,
    pointer-events:none. Only icons remain visible. Width 44px shows icon only.
  
  Navigation section:
    Items: Overview(◈) · Climate Trends(◌) · Compare Cities(⇌) · 
           Decade Delta(Δ) · Extremes(!) · Export(↓)
    Active item: background ink, color paper
    Hover: background ink 7% tint
  
  Saved Pins section:
    Each pin: colored dot (red/blue/dim) + city name
    Clicking a pin sets CoordinateContext coords
  
  Footer (margin-top auto, border-top hairline):
    Shows when expanded only: username + "Sign out" (red underline)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKELETON LOADER  /components/ui/SkeletonLoader.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Used whenever useClimateData has loading:true.
CSS keyframes animation: shimmer — background-position slides left to right.

@keyframes shimmer {
  0%   { background-position: -400px 0 }
  100% { background-position: 400px 0 }
}
background: linear-gradient(
  90deg,
  var(--paper2) 25%,
  var(--paper3) 50%,
  var(--paper2) 75%
);
background-size: 800px 100%;
animation: shimmer 1.4s ease-in-out infinite;

Variants (prop: variant):
  "chart"   → full width, height 120px
  "stat"    → 3 columns, each 60px tall
  "map"     → full width, height 210px
  "bar"     → 4 columns of varying heights (mimics bar chart)

Show skeleton while loading, swap to real component when data arrives.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERACTIVE WORLD MAP  /components/map/WorldMap.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dynamic import in every page that uses it:
  const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false })

Leaflet setup:
  Default center: [20, 0], zoom: 2
  Container: height 210px (in overview), min-height 400px (in /trends page)

Custom CSS overrides (globals.css):
  .leaflet-container { background: var(--paper2); font-family: Space Mono; }
  .leaflet-tile { filter: sepia(0.15) contrast(0.95); }  /* paper-ify tiles */
  .leaflet-control-zoom a { 
    font-family: Space Mono; border: 1px solid var(--ink); border-radius: 0; 
  }

Two tile layers:
  Street: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  Satellite: https://server.arcgisonline.com/ArcGIS/rest/services/
             World_Imagery/MapServer/tile/{z}/{y}/{x}
Toggle via MapControls component (styled as topbar-style buttons, border 1.5px).

Map click handler:
  On click: capture latlng → setSelectedCoords in CoordinateContext
  Show custom marker: red dot + pulsing ring (CSS, same as login panel)
  Marker popup: monospace label "LAT XX.XXXX · LNG XX.XXXX"

Saved location markers:
  Fetch from /api/user/saved-locations on mount
  Each renders as a smaller colored dot marker

Info bar (absolute bottom of map):
  Shows current coords, zoom level, "Click map to drop pin" hint

SkeletonLoader variant="map" shown until Leaflet tiles load.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIMATE DATA API  /app/api/climate/route.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint: GET /api/climate?lat=XX&lng=XX&start=1985&end=2024

Internally calls Open-Meteo Historical Weather API:
  https://archive-api.open-meteo.com/v1/archive
    ?latitude={lat}
    &longitude={lng}
    &start_date={year}-01-01
    &end_date={year}-12-31
    &daily=temperature_2m_max,temperature_2m_min,precipitation_sum
    &timezone=auto

Batch strategy: fetch in 4 decade chunks (1985–94, 95–04, 05–14, 15–24)
  using Promise.all to parallelize.

Aggregate per year:
  avgTemp = mean of ((temp_max[i] + temp_min[i]) / 2) for all days
  totalPrecip = sum of precipitation_sum for all days
  extremeHeatDays = count of days where temp_max > 35
  extremeRainDays = count of days where precipitation_sum > 50

Return:
  { year, avgTemp, totalPrecip, extremeHeatDays, extremeRainDays }[]

Error handling: catch rate limit (429), return { error, retryAfter } JSON.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
40-YEAR CLIMATE TRENDS  /app/(dashboard)/trends/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ClimateLineChart.tsx (Chart.js):
  Type: line, dual Y-axes
  Left axis: Temperature °C (red line, stroke-width 2)
  Right axis: Precipitation mm (blue dashed line, stroke-width 1.5)
  Both lines: tension: 0.35 (slight curve), pointRadius: 3
  
  MICRO-ANIMATION on data update:
    Chart.js update() with animation duration 600ms, easing 'easeInOutQuart'
    Add CSS transition on the chart canvas wrapper: opacity 0 → 1 over 300ms
    When new data arrives: fade canvas out (150ms) → update chart → fade in (300ms)

  Custom Chart.js plugin: draw a linear regression trend line for temperature
    Color: red at 40% opacity, stroke-dasharray style via plugin

  Chart theme (dark mode aware):
    grid lines: rgba(ink, 0.12)
    tick labels: Space Mono 9px, color dim
    tooltip: background paper-2, border 1px ink, font Space Mono 10px

  Below chart: summary row
    "Warmest Year: XXXX (XX.X°C) · Most Rain: XXXX (XXXXmm) · Trend: +X.X°C"

  Show SkeletonLoader variant="chart" while loading.
  On API error: red border box "API error — check network" with retry button.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCATION COMPARISON  /app/(dashboard)/compare/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two CitySearchInput components (City A / City B):
  Each calls geocoding API on input change (debounced 400ms):
    https://geocoding-api.open-meteo.com/v1/search?name={q}&count=5
  Shows dropdown of results, each selectable to set lat/lng

ComparisonChart.tsx:
  4 datasets:
    City A Temp: red solid line, fill area below (opacity 0.07)
    City B Temp: blue dashed line, fill area below (opacity 0.06)
    City A Precip: red dotted, right axis
    City B Precip: blue dotted, right axis
  
  MICRO-ANIMATION: same 600ms Chart.js animation + fade wrapper on update

  When both cities loaded: calculate warming rate via linear regression slope
  Display warming badge below chart:
    Border-left 3px solid red, bg red 6% tint
    "[City A] warming X.Xx faster than [City B] over 40yr"

Decade comparison table: show avg temp per decade for each city as a
  simple bordered table (no border-radius, Space Mono, hairline rows).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECADE DELTA CALCULATOR  /app/(dashboard)/delta/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DecadePicker component: two <select> elements, Space Mono, border 1px ink.
  Options: 1980–1990, 1990–2000, 2000–2010, 2010–2020

HeatGauge.tsx:
  Track: border 1.5px solid ink, height 32px, bg paper-2, overflow hidden
  Fill: absolutely positioned div, left 0, transition width 600ms cubic-bezier(0.4,0,0.2,1)
  Fill color rules:
    delta < 1.0°C → var(--dim)
    delta 1.0–2.0°C → #e6a020 (amber)
    delta > 2.0°C → var(--red)
  Fill width: (delta / 4) * 100% — scale is 0–4°C
  Inside fill: Instrument Serif italic label "+X.X°C" 
    color: paper, mix-blend-mode: difference (visible on both light/dark fill)

  Scale below track: 5 labels "0°C 1°C 2°C 3°C 4°C" evenly spaced

  Decade mini-bars row (4 bars showing each decade's relative avg):
    Each bar: bordered rect, fill from bottom up
    Color ramps from dim → red as decades progress

  MICRO-ANIMATION on recalculate:
    Count-up effect on the label: useEffect + requestAnimationFrame
    Start from previous value, animate to new value over 800ms

  Meta row below: "Precip Δ +XXmm · Extreme days Δ +XX · Trend Accelerating/Stable"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEATHER EXTREMES  /app/(dashboard)/extremes/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ExtremesBarChart.tsx (Chart.js grouped bar):
  X-axis: 4 decade labels
  Two datasets per decade: Heat Days (red) + Rain Days (blue)
  Bar border-width: 1.5px (ink color) — the "outlined bar" brutalist look
  Bar border-radius: 0 (no rounding)
  
  MICRO-ANIMATION on load/update:
    Chart.js animation: delay each bar by (datasetIndex * 200 + index * 50)ms
    Creates a staggered "bars growing up" entrance
  
  Hover tooltip: custom tooltip plugin
    Position absolute, border 1px ink, bg paper, Space Mono 9px
    Shows: "XXXX–XXXX: XX heat days, XX rain days"

  On hover over a bar: that bar gets border-color red/blue (respective)
    and all other bars dim to 40% opacity

  Alert callout below:
    "Extreme heat days +109% since 1985 · Most extreme decade: 2015–2024"
    Border-left 3px red, bg red 5% tint

  SkeletonLoader variant="bar" while loading.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA EXPORT  /app/(dashboard)/export/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preview table: bordered, Space Mono 8.5px, hairline rows
  Columns: Year | Avg Temp | Total Precip mm | Heat Days | Rain Days
  Hot values in red (2024 row highlighted)
  Paginated: 10 rows per page, "← 1 2 3 →" pagination (border 1px ink buttons)

Export buttons column (5 buttons, each border 1px ink, hover inverts):
  Full dataset | City A only | City B only | Comparison overlay | Extremes only

ExportButton.tsx:
  Uses papaparse.unparse() to convert data array to CSV string
  Creates Blob: new Blob([csv], { type: 'text/csv' })
  Creates anchor, sets href to URL.createObjectURL(blob)
  Sets download: `geosense-${locationLabel}-${dateRange}.csv`
  Programmatically clicks anchor
  Button state machine: 'idle' → 'loading' (spinner) → 'done' (✓ Downloaded)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRINT / REPORT VIEW  /app/(dashboard)/print/page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A4 layout (210mm × 297mm). Use @page CSS and print media queries.

CSS:
  @page { size: A4; margin: 18mm 16mm; }
  @media print {
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    body { background: white; }
  }

Report sections:
  1. Header: GeoSense logo + location name + date range + generation timestamp
  2. Summary stats row: 4 boxes (avg temp, precip, heat days, trend)
  3. 40-Year Temperature trend chart (static Chart.js canvas, rendered server-side)
  4. Decade Delta summary: large "+X.X°C" with gauge bar drawn in SVG
  5. Extremes table: decade-by-decade counts (not chart, actual table for print)
  6. Footer: "Data source: Open-Meteo Historical Weather API" + coordinates

PrintButton.tsx component:
  Placed in dashboard topbar "Export" section
  On click: opens /print in a new tab
  Second button: "Print PDF" → calls window.print() on the print page


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DARK MODE  useDarkMode.ts + ThemeContext.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useDarkMode hook:
  Read initial value from localStorage key 'geosense-theme'
  Fallback to prefers-color-scheme media query
  On toggle: set localStorage + toggle class 'dark' on document.documentElement

globals.css dark mode:
  Use CSS variables on :root (light values)
  Override on :root.dark or html.dark:
    --ink: #ede8dc; --paper: #131210; --paper2: #1c1a17; etc.

Topbar toggle button:
  Shows "○ Light" / "● Dark" using a small filled/empty circle indicator
  Transition: color-scheme property on html element for smooth OS-level flip


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONGODB + AUTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User model: { email, password (bcrypt), name, createdAt, savedLocations[] }
SavedLocation: { lat, lng, label, createdAt }

NextAuth v5: CredentialsProvider, JWT session strategy
  signIn: find by email → bcrypt.compare → return user
  JWT/session callbacks: include user.id and user.name

/api/auth/register/route.ts:
  POST: validate with zod, hash password, create User doc, return 201

/api/user/saved-locations/route.ts:
  GET: return user's saved pins (auth required)
  POST: append pin to user's array
  DELETE: remove pin by id


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.env.local
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONGODB_URI=mongodb://localhost:27017/geosense
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD ORDER — follow exactly, confirm each before proceeding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.  tailwind.config.ts — extend colors, fonts (Space Mono, Instrument Serif)
2.  globals.css — CSS variables, dark mode class, leaflet overrides, 
    skeleton shimmer keyframes, print styles
3.  MongoDB connection + User model + SavedLocation model
4.  NextAuth config + /api/auth routes
5.  Login page (split-screen, terminal animation, form with validation)
6.  Register page (same layout, different headline)
7.  ThemeContext + useDarkMode hook
8.  CoordinateContext
9.  Dashboard layout: Sidebar (collapsible) + Topbar (with dark toggle + clock)
10. WorldMap component (dynamic import, tile layers, click handler, pins)
11. SkeletonLoader component (all variants)
12. /api/climate proxy route (Open-Meteo, decade batching, aggregation)
13. useClimateData hook
14. ClimateLineChart (dual axis, trend line plugin, micro-animation)
15. Trends page
16. CitySearchInput (geocoding dropdown)
17. ComparisonChart (4 datasets, area fill, warming badge)
18. Compare page
19. HeatGauge (fill bar, count-up animation, color thresholds)
20. Delta page
21. ExtremesBarChart (grouped bars, staggered entrance, hover dim effect)
22. Extremes page
23. ExportButton (papaparse, blob download, state machine)
24. Export page (preview table, pagination, 5 export buttons)
25. Print page (A4 layout, @page CSS, static charts, PrintButton)
26. /api/user/saved-locations CRUD
27. Wire saved pins to map markers
28. Final pass: toast notifications, error states, 404 page, loading.tsx files

Generate complete file contents for every file. No placeholders. No TODOs.