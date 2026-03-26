# GENOME — GeoScience Dashboard · Antigravity Prompt v3
# Full update on top of existing Next.js codebase

---

## WHAT THIS PROMPT IS

This is an incremental update prompt. The base dashboard already exists and
is working. Apply ALL of the following changes surgically without breaking
existing functionality. Every section below is a precise specification.

---

## 1. REBRAND: GeoSense → Genome

Find and replace every instance of:
  - "GeoSense"  →  "Genome"
  - "geosense"  →  "genome" (lowercase variants, slugs, classNames)
  - "GeoSense v2.0" in the bottom bar → "Genome v3.0"
  - Document <title> in layout.tsx → "Genome — GeoScience Dashboard"
  - localStorage key 'geosense-theme' → 'genome-theme'
  - .env.local DB name: geosense → genome

---

## 2. FAVICON — Earth with DNA Ring

Create /app/favicon.svg (Next.js 14 supports SVG favicons via metadata):

In /app/layout.tsx metadata:
```typescript
export const metadata: Metadata = {
  title: 'Genome — GeoScience Dashboard',
  icons: { icon: '/favicon.svg' },
}
```

Create /public/favicon.svg:
An SVG at 32×32px depicting:
  - A circle (Earth) filled with a subtle gradient: deep teal (#0d4f6e) with 
    a lighter patch (#1a7a9e) at top-left to suggest atmosphere
  - Thin white/light landmass paths (simplified continents — just 3-4 blob shapes)
  - The circle is TILTED ~23.5° (Earth's axial tilt) via transform="rotate(-23.5)"
  - A DNA double-helix strand rendered as an ELLIPTICAL PATH orbiting the Earth
    like Saturn's rings — drawn as two interleaved sine-wave paths forming the 
    double helix, rotated in 3D perspective using SVG skewX transforms
    Color: rgba(200, 160, 80, 0.9) — warm gold
  - The ring/helix should appear to pass BEHIND the earth at one end and 
    IN FRONT at the other (achieved by drawing back-arc first, then earth circle,
    then front-arc on top)

Full SVG code:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <radialGradient id="earth" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#1a7a9e"/>
      <stop offset="100%" stop-color="#0a3d55"/>
    </radialGradient>
    <clipPath id="ec"><circle cx="16" cy="16" r="11"/></clipPath>
  </defs>
  <!-- DNA ring back arc (behind earth) -->
  <ellipse cx="16" cy="16" rx="15" ry="4.5" fill="none" 
    stroke="#c8a050" stroke-width="1.2" opacity="0.6"
    stroke-dasharray="6 4"
    clip-path="none"
    transform="rotate(-20, 16, 16)"/>
  <!-- Earth body -->
  <circle cx="16" cy="16" r="11" fill="url(#earth)"/>
  <!-- Landmass blobs -->
  <g fill="rgba(34,120,80,0.7)" clip-path="url(#ec)">
    <ellipse cx="13" cy="13" rx="4" ry="3" transform="rotate(-15,13,13)"/>
    <ellipse cx="20" cy="18" rx="3" ry="4" transform="rotate(10,20,18)"/>
    <ellipse cx="10" cy="20" rx="2" ry="2.5"/>
  </g>
  <!-- Earth shine -->
  <circle cx="12" cy="12" r="3.5" fill="rgba(255,255,255,0.07)"/>
  <!-- DNA ring front arc (in front of earth) -->
  <ellipse cx="16" cy="16" rx="15" ry="4.5" fill="none"
    stroke="#c8a050" stroke-width="1.8" opacity="0.9"
    stroke-dasharray="6 4"
    transform="rotate(-20, 16, 16)"
    clip-path="url(#ec)"/>
</svg>
```

---

## 3. COLOR SYSTEM UPDATE — Replace Harsh Red

The current --red (#e63a2e) is too aggressive. Replace with a warm 
BURNT SIENNA / BLOOD ORANGE that reads as alert without harshness.

In globals.css, update ALL color variables:

```css
:root {
  /* Replace --red everywhere with: */
  --accent: #b5451b;          /* Burnt sienna — primary accent, CTAs, heat data */
  --accent-light: #c4571f;    /* Slightly lighter for hover states */
  --accent-glow: rgba(181, 69, 27, 0.12);  /* Background tints */
  
  /* Blue stays — slightly desaturated to pair better */
  --blue: #2259c7;            /* Slightly deeper blue for precipitation */
  --blue-glow: rgba(34, 89, 199, 0.10);
  
  /* Keep all paper/ink variables as-is */
}

html.dark {
  --accent: #d4672a;          /* Warmer in dark mode — more orange, less brown */
  --accent-light: #e07535;
  --accent-glow: rgba(212, 103, 42, 0.15);
  --blue: #4d7ff0;
  --blue-glow: rgba(77, 127, 240, 0.14);
}
```

Find and replace in ALL component files:
  var(--red) → var(--accent)
  #e63a2e → var(--accent)
  color: var(--red) → color: var(--accent)
  background: var(--red) → background: var(--accent)
  border-color: var(--red) → border-color: var(--accent)
  stroke: var(--red) → stroke: var(--accent)

The signed-in user name and "Sign out" in sidebar:
  Change color from red to var(--accent) — this makes it warm orange, not jarring red.

---

## 4. TYPOGRAPHY — Increase Base Text Size

In globals.css:
```css
html { font-size: 13px; }  /* was 11px implied by Space Mono usage */
```

Update all component font-size values:
  Panel titles: 10.5px → 11px uppercase
  Nav items: 11px → 12px  
  Labels/captions: 9px → 10px
  Stat values: 15px → 17px
  Body text (sidebar, form): 11px → 12px
  Topbar text: 9.5px → 11px
  Chart axis labels: 9px → 10.5px
  Chart legend: 9px → 11px (make it more prominent — see Section 8)
  Bottom bar: 8.5px → 10px

---

## 5. DARK MODE — GRAPH VISIBILITY FIX

The graph is invisible in dark mode because Chart.js uses default dark colors
on a dark background. Fix this completely.

In ClimateLineChart.tsx and ComparisonChart.tsx, make ALL chart colors 
theme-aware by reading the current theme from ThemeContext:

```typescript
// At top of chart component
const { isDark } = useTheme();

// Derive all chart colors from theme
const inkColor = isDark ? '#ede8dc' : '#0f0e0d';
const dimColor = isDark ? '#8a8278' : '#7a756e';
const paperColor = isDark ? '#1c1a17' : '#f5f0e8';
const gridColor = isDark ? 'rgba(237,232,220,0.10)' : 'rgba(15,14,13,0.10)';
```

Chart.js dataset colors:
```typescript
// Temperature line
{
  label: 'Avg Temp',
  borderColor: isDark ? '#d4672a' : '#b5451b',   // warm orange in dark
  backgroundColor: isDark ? 'rgba(212,103,42,0.08)' : 'rgba(181,69,27,0.07)',
  pointBackgroundColor: isDark ? '#d4672a' : '#b5451b',
  pointBorderColor: isDark ? '#1c1a17' : '#f5f0e8',
  pointBorderWidth: 1.5,
  borderWidth: 2,
}

// Precipitation line
{
  label: 'Precip',
  borderColor: isDark ? '#4d7ff0' : '#2259c7',
  backgroundColor: isDark ? 'rgba(77,127,240,0.08)' : 'rgba(34,89,199,0.06)',
  borderDash: [4, 2.5],
  pointBackgroundColor: isDark ? '#4d7ff0' : '#2259c7',
  borderWidth: 1.5,
}
```

Chart.js global options (theme-aware):
```typescript
const chartOptions = {
  responsive: true,
  animation: { duration: 600, easing: 'easeInOutQuart' },
  plugins: {
    legend: { display: false },  // We use custom legend (see Section 8)
    tooltip: {
      enabled: true,
      backgroundColor: isDark ? '#232018' : '#f5f0e8',
      borderColor: isDark ? 'rgba(237,232,220,0.4)' : 'rgba(15,14,13,0.4)',
      borderWidth: 1,
      titleColor: isDark ? '#ede8dc' : '#0f0e0d',
      bodyColor: isDark ? '#8a8278' : '#7a756e',
      titleFont: { family: 'Space Mono', size: 11, weight: '700' },
      bodyFont: { family: 'Space Mono', size: 10 },
      padding: 10,
      displayColors: true,
      callbacks: {
        title: (items) => `Year: ${items[0].label}`,
        label: (item) => {
          if (item.datasetIndex === 0) return ` Temp: ${item.raw.toFixed(1)}°C`;
          return ` Precip: ${Math.round(item.raw)}mm`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: gridColor, lineWidth: 0.5 },
      ticks: { color: dimColor, font: { family: 'Space Mono', size: 10 } },
    },
    y: {
      position: 'left',
      grid: { color: gridColor, lineWidth: 0.5 },
      ticks: { color: isDark ? '#d4672a' : '#b5451b', font: { family: 'Space Mono', size: 10 } },
    },
    y1: {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: { color: isDark ? '#4d7ff0' : '#2259c7', font: { family: 'Space Mono', size: 10 } },
    }
  }
};
```

Also: wrap chart canvas in a div with explicit background:
```tsx
<div style={{ 
  background: isDark ? 'var(--paper2)' : 'var(--paper)',
  border: '1px solid var(--ink)',
  padding: '12px',
  position: 'relative'
}}>
  <canvas ref={chartRef} />
</div>
```

Re-initialize the chart (chart.destroy() + chart = new Chart()) every time
isDark changes. Add isDark to the useEffect dependency array.

---

## 6. GRAPH TOOLTIP / CLICK FIX

The issue: tooltips not visible when clicking a data point.

Fix in chart options:
```typescript
interaction: {
  mode: 'index',          // Shows tooltip for ALL datasets at that x position
  intersect: false,        // Triggers even if not directly on a point
  axis: 'x',
},
hover: {
  mode: 'index',
  intersect: false,
},
plugins: {
  tooltip: {
    enabled: true,
    mode: 'index',
    intersect: false,
    position: 'nearest',
    // ... rest of tooltip config
  }
}
```

Increase point hit radius so clicks register more easily:
```typescript
pointHitRadius: 12,   // large invisible click target around each point
pointRadius: 4,        // visible dot size
pointHoverRadius: 7,   // dot size on hover
```

Also add onClick handler to the chart for pinning a selected year:
```typescript
onClick: (event, elements) => {
  if (elements.length > 0) {
    const index = elements[0].index;
    const year = data[index].year;
    setSelectedYear(year);  // highlight that year's column
  }
}
```

When a year is selected via click:
  - Draw a vertical line at that x position (Chart.js plugin)
  - Show a persistent info box ABOVE the chart (not inside it) with:
    Year: XXXX | Temp: XX.X°C | Precip: XXXmm | Heat days: XX
    Box styling: border 1.5px var(--accent), bg var(--accent-glow), 
    Space Mono 10px, positioned absolute top-0 right-0

---

## 7. CHART LEGEND — MORE PROMINENT

Replace the small tucked-away legend with a proper legend row:

```tsx
{/* Custom legend — above or below chart, prominent */}
<div style={{
  display: 'flex', gap: '20px', alignItems: 'center',
  padding: '8px 0', borderBottom: '1px solid var(--ink)',
  marginBottom: '10px'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '24px', height: '2.5px', background: 'var(--accent)' }} />
    <span style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: 'Space Mono' }}>
      Avg Temperature (°C)
    </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ 
      width: '24px', height: '2px', background: 'var(--blue)',
      backgroundImage: 'repeating-linear-gradient(90deg, var(--blue) 0, var(--blue) 4px, transparent 4px, transparent 6.5px)'
    }} />
    <span style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: 'Space Mono' }}>
      Precipitation (mm)
    </span>
  </div>
  {selectedYear && (
    <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--accent)' }}>
      Selected: {selectedYear}
    </div>
  )}
</div>
```

---

## 8. MAP — 3D TILT EFFECT + SEARCH + LOCATION INFO CARD

### 8a. 3D Perspective Effect on Map

In the map panel wrapper div, add CSS 3D perspective:
```css
.map-perspective-wrapper {
  perspective: 800px;
  perspective-origin: 50% 30%;
}
.map-tilt-inner {
  transform: rotateX(8deg) scale(1.08);
  transform-origin: center top;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
  border-bottom: 3px solid var(--ink); /* ground edge */
}
.map-tilt-inner:hover {
  transform: rotateX(4deg) scale(1.06); /* flattens slightly on hover */
}
```

Wrap the Leaflet container div in this structure:
```tsx
<div className="map-perspective-wrapper">
  <div className="map-tilt-inner" ref={mapWrapperRef}>
    <div id="map" style={{ height: '210px', width: '100%' }} />
  </div>
</div>
```

Note: Leaflet renders in this wrapper — mouse events still work because
we are only applying CSS transforms to the containing div, not the Leaflet canvas.

Add a subtle edge shadow under the map to reinforce 3D depth:
```css
.map-tilt-inner::after {
  content: '';
  position: absolute;
  bottom: -12px; left: 10%; right: 10%;
  height: 12px;
  background: radial-gradient(ellipse, rgba(15,14,13,0.25) 0%, transparent 70%);
  pointer-events: none;
}
```

### 8b. Map Search Bar

Add a search input OVERLAID on the map (top-left, below the save pin button):

```tsx
<div style={{
  position: 'absolute', top: '46px', left: '10px', zIndex: 1000,
  display: 'flex', gap: '0', border: '1.5px solid var(--ink)'
}}>
  <input
    type="text"
    placeholder="Search location..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
    style={{
      fontFamily: 'Space Mono', fontSize: '11px',
      padding: '6px 10px', background: 'var(--paper)', color: 'var(--ink)',
      border: 'none', outline: 'none', width: '200px'
    }}
  />
  <button
    onClick={handleLocationSearch}
    style={{
      padding: '6px 12px', background: 'var(--ink)', color: 'var(--paper)',
      border: 'none', fontFamily: 'Space Mono', fontSize: '10px',
      cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em'
    }}
  >
    Search
  </button>
</div>
```

Search handler — calls OpenStreetMap Nominatim (free, no key):
```typescript
const handleLocationSearch = async () => {
  if (!searchQuery.trim()) return;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`
  );
  const results = await res.json();
  if (results.length > 0) {
    const { lat, lon, display_name } = results[0];
    map.flyTo([parseFloat(lat), parseFloat(lon)], 10, { duration: 1.2 });
    setSelectedCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setLocationLabel(display_name.split(',').slice(0, 2).join(', '));
  }
};
```

Show a dropdown of up to 5 search results below the input with the same
blueprint styling (border 1px ink, bg paper, hover: ink inverts).

### 8c. Location Info Card — shown when a pin is placed

When user clicks the map OR selects from search, fetch and display a card 
BELOW the map (in the gap between map and climate trends section).

This card shows:
  1. Location Name (city, country)
  2. Country code
  3. AQI (Air Quality Index)
  4. Current local time at that location
  5. Timezone

For AQI, use Open-Meteo Air Quality API (free):
```
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}&longitude={lng}
  &hourly=european_aqi
  &timezone=auto
```
Take the most recent non-null value from european_aqi array.

AQI color coding:
  0–20: Good (#2ecc71)
  21–40: Fair (#f39c12)  
  41–60: Moderate (#e67e22)
  61–80: Poor (var(--accent))
  81+: Very Poor (#8b0000)

For current local time:
  Use Intl.DateTimeFormat with timezone from the Nominatim result or
  Open-Meteo's timezone field.

For country name:
  Parse from Nominatim display_name (last segment is usually country name).

Location Info Card markup:
```tsx
<div style={{
  display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr',
  gap: '0', border: '1.5px solid var(--ink)',
  margin: '0', /* flush against map bottom */
  background: 'var(--paper)',
}}>
  {/* Location name */}
  <div style={{ 
    padding: '10px 14px', borderRight: '1px solid var(--ink)',
    gridColumn: '1 / 2'
  }}>
    <div style={{ fontSize: '8.5px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Location
    </div>
    <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', fontFamily: 'Space Mono' }}>
      {cityName}
    </div>
    <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '1px' }}>
      {countryName}
    </div>
  </div>

  {/* AQI */}
  <div style={{ padding: '10px 14px', borderRight: '1px solid var(--ink)' }}>
    <div style={{ fontSize: '8.5px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Air Quality Index
    </div>
    <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: aqiColor, fontFamily: 'Space Mono' }}>
      {aqi}
    </div>
    <div style={{ fontSize: '9px', color: aqiColor }}>{aqiLabel}</div>
  </div>

  {/* Local time */}
  <div style={{ padding: '10px 14px', borderRight: '1px solid var(--ink)' }}>
    <div style={{ fontSize: '8.5px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Local Time
    </div>
    <div style={{ fontSize: '17px', fontWeight: '700', marginTop: '2px', fontFamily: 'Space Mono' }}>
      {localTime}  {/* updates every minute via setInterval */}
    </div>
    <div style={{ fontSize: '9px', color: 'var(--dim)' }}>{timezone}</div>
  </div>

  {/* Coordinates */}
  <div style={{ padding: '10px 14px' }}>
    <div style={{ fontSize: '8.5px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Coordinates
    </div>
    <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px', fontFamily: 'Space Mono' }}>
      {lat.toFixed(4)}° {lat >= 0 ? 'N' : 'S'}
    </div>
    <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'Space Mono' }}>
      {lng.toFixed(4)}° {lng >= 0 ? 'E' : 'W'}
    </div>
  </div>
</div>
```

Show SkeletonLoader (variant="stat") while this card is loading.

---

## 9. SAVED PINS — Show on Earth Globe in Sidebar

In the sidebar, above the "SAVED PINS" text label, add a small SVG Earth
visualization (120px × 60px — a small globe showing pin locations).

```tsx
{/* Mini Earth in sidebar */}
<div style={{ padding: '10px 13px 6px', borderBottom: '1px solid var(--ink)' }}>
  <svg viewBox="0 0 120 60" width="100%" style={{ display: 'block', maxWidth: '154px' }}>
    {/* Earth ellipse */}
    <ellipse cx="60" cy="30" rx="45" ry="28" fill="var(--paper2)" stroke="var(--ink)" strokeWidth="1"/>
    {/* Latitude lines */}
    <ellipse cx="60" cy="30" rx="45" ry="8" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.3"/>
    <line x1="15" y1="30" x2="105" y2="30" stroke="var(--ink)" strokeWidth="0.4" opacity="0.3"/>
    <ellipse cx="60" cy="30" rx="32" ry="28" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.2"/>
    <ellipse cx="60" cy="30" rx="16" ry="28" fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.2"/>
    {/* 
      Map lat/lng of each saved pin to SVG coordinates:
      x = 15 + ((lng + 180) / 360) * 90   [maps -180..180 lng to 15..105]
      y = 2 + ((90 - lat) / 180) * 56     [maps 90..-90 lat to 2..58]
      Clamp to ellipse bounds before rendering.
    */}
    {savedPins.map((pin, i) => {
      const x = 15 + ((pin.lng + 180) / 360) * 90;
      const y = 2 + ((90 - pin.lat) / 180) * 56;
      return (
        <g key={pin._id}>
          <circle cx={x} cy={y} r="2.5" fill={pinColors[i % 3]}/>
          <circle cx={x} cy={y} r="2.5" fill="none" 
            stroke={pinColors[i % 3]} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="2.5;5;2.5" dur="2.5s" 
              repeatCount="indefinite" begin={`${i * 0.7}s`}/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" 
              repeatCount="indefinite" begin={`${i * 0.7}s`}/>
          </circle>
        </g>
      );
    })}
  </svg>
</div>
```

pinColors array: ['var(--accent)', 'var(--blue)', 'var(--dim)']
The globe collapses to just the pulsing dots when sidebar is collapsed (44px mode).

---

## 10. LOGIN PAGE — Full Redesign with SVG Animations

Replace the existing login page with this full redesign.
Keep the same split-screen structure but elevate every detail.

### 10a. Left Panel — Animated Earth with DNA

The left panel (background: var(--ink)) gets a large animated SVG:

```tsx
{/* Full-height animated left panel */}
<div className="login-left">
  
  {/* Background: animated SVG Earth + DNA + star field */}
  <svg className="login-bg-svg" viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice">
    
    {/* Star field — 40 scattered dots */}
    {stars.map((s, i) => (
      <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgba(237,232,220,0.4)">
        <animate attributeName="opacity" values="0.4;0.9;0.4" 
          dur={`${2.5 + s.r * 1.5}s`} repeatCount="indefinite" 
          begin={`${i * 0.18}s`}/>
      </circle>
    ))}

    {/* Large Earth circle — centered, slightly below mid */}
    <defs>
      <radialGradient id="earthGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#1a6e8a"/>
        <stop offset="60%" stop-color="#0d4a66"/>
        <stop offset="100%" stop-color="#072d3f"/>
      </radialGradient>
      <clipPath id="earthClip">
        <circle cx="250" cy="400" r="130"/>
      </clipPath>
    </defs>
    
    {/* Earth body */}
    <circle cx="250" cy="400" r="130" fill="url(#earthGrad)"/>
    
    {/* Continent silhouettes (simplified, inside clip) */}
    <g clipPath="url(#earthClip)" fill="rgba(34,110,70,0.5)">
      <ellipse cx="220" cy="360" rx="55" ry="38" transform="rotate(-15,220,360)"/>
      <ellipse cx="295" cy="420" rx="40" ry="52" transform="rotate(8,295,420)"/>
      <ellipse cx="165" cy="435" rx="28" ry="25"/>
      <ellipse cx="330" cy="355" rx="22" ry="18"/>
    </g>
    
    {/* Atmospheric glow rim */}
    <circle cx="250" cy="400" r="130" fill="none" 
      stroke="rgba(100,180,220,0.25)" strokeWidth="14"/>
    <circle cx="250" cy="400" r="130" fill="none" 
      stroke="rgba(100,180,220,0.10)" strokeWidth="28"/>
    
    {/* Earth shine */}
    <ellipse cx="210" cy="355" rx="40" ry="28" fill="rgba(255,255,255,0.06)" 
      transform="rotate(-20,210,355)"/>

    {/* DNA helix ring orbiting Earth — drawn as ellipse path */}
    {/* Back half (behind earth — clip to left/right outside earth) */}
    <ellipse cx="250" cy="400" rx="175" ry="30" fill="none"
      stroke="rgba(200,160,80,0.35)" strokeWidth="1.5"
      strokeDasharray="8 5"
      transform="rotate(-15, 250, 400)">
      <animateTransform attributeName="transform" type="rotate"
        from="-15 250 400" to="345 250 400" dur="18s" repeatCount="indefinite"/>
    </ellipse>

    {/* DNA strand dots along the orbital path */}
    <g opacity="0.7">
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 250 + 175 * Math.cos(rad);
        const cy = 400 + 30 * Math.sin(rad);
        return (
          <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.5 : 1.5} 
            fill="rgba(200,160,80,0.8)">
            <animateMotion dur="18s" repeatCount="indefinite" begin={`${i * -2.25}s`}>
              <mpath href="#orbitPath"/>
            </animateMotion>
          </circle>
        );
      })}
    </g>
    <path id="orbitPath" d="M 75 400 A 175 30 0 1 1 425 400 A 175 30 0 1 1 75 400" 
      fill="none" transform="rotate(-15, 250, 400)"/>

    {/* Front half of ring (in front of earth) */}
    <ellipse cx="250" cy="400" rx="175" ry="30" fill="none"
      stroke="rgba(200,160,80,0.9)" strokeWidth="2"
      strokeDasharray="8 5"
      clipPath="url(#earthClip)"
      transform="rotate(-15, 250, 400)">
      <animateTransform attributeName="transform" type="rotate"
        from="-15 250 400" to="345 250 400" dur="18s" repeatCount="indefinite"/>
    </ellipse>

    {/* Lat/lng grid lines on earth (animated slow rotation) */}
    <g clipPath="url(#earthClip)" stroke="rgba(237,232,220,0.08)" strokeWidth="0.5" fill="none">
      <ellipse cx="250" cy="400" rx="130" ry="40"/>
      <ellipse cx="250" cy="400" rx="130" ry="90"/>
      <ellipse cx="250" cy="400" rx="70" ry="130"/>
      <ellipse cx="250" cy="400" rx="130" ry="130"/>
      <line x1="120" y1="400" x2="380" y2="400"/>
    </g>

    {/* Coordinate crosshair at selected pin */}
    <line x1="250" y1="370" x2="250" y2="430" stroke="var(--accent)" 
      strokeWidth="0.8" opacity="0.6"/>
    <line x1="220" y1="400" x2="280" y2="400" stroke="var(--accent)" 
      strokeWidth="0.8" opacity="0.6"/>
    <circle cx="250" cy="400" r="4" fill="var(--accent)"/>
    <circle cx="250" cy="400" r="4" fill="none" stroke="var(--accent)" strokeWidth="1.5">
      <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>

  </svg>

  {/* Text content — overlaid on SVG */}
  <div className="login-left-content">
    <div className="login-logo">
      <img src="/favicon.svg" width="22" height="22" alt="Genome"/>
      <span>Genome</span>
    </div>
    
    <div className="login-headline">
      Map your world.<br/>
      Track the climate.<br/>
      <em>40 years of data.</em>
    </div>
    
    <p className="login-subtext">
      Historical weather analysis powered by Open-Meteo API.<br/>
      Visualise temperature, precipitation, and extreme events<br/>
      across any location on Earth.
    </p>

    {/* Animated stat counters — count up on mount */}
    <div className="login-stats">
      <div className="ls">
        <span className="ls-val" data-target="14600" id="stat-pts">0</span>
        <span className="ls-lbl">Data points</span>
      </div>
      <div className="ls">
        <span className="ls-val" data-target="40">40yr</span>
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
```

Left panel CSS:
```css
.login-left {
  position: relative;
  background: var(--ink);
  color: var(--paper);
  overflow: hidden;
}
.login-bg-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.login-left-content {
  position: relative;
  z-index: 2;
  padding: 32px;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.login-logo {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; font-size: 15px; letter-spacing: 0.1em;
  margin-bottom: auto;
}
.login-headline {
  font-family: var(--serif);
  font-style: italic;
  font-size: 36px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: rgba(237,232,220,0.95);
  margin-bottom: 18px;
}
.login-subtext {
  font-size: 11px;
  line-height: 1.8;
  color: rgba(237,232,220,0.4);
  margin-bottom: 28px;
}
.login-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid rgba(237,232,220,0.15);
}
.ls { padding: 12px 14px; border-right: 1px solid rgba(237,232,220,0.12); border-bottom: 1px solid rgba(237,232,220,0.12); }
.ls:nth-child(even) { border-right: none; }
.ls:nth-child(3), .ls:nth-child(4) { border-bottom: none; }
.ls-val { font-size: 22px; font-weight: 700; display: block; color: rgba(237,232,220,0.9); }
.ls-lbl { font-size: 9px; color: rgba(237,232,220,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
```

Count-up animation for stat numbers (runs on mount):
```typescript
useEffect(() => {
  const el = document.getElementById('stat-pts');
  if (!el) return;
  const target = 14600;
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 25);
  return () => clearInterval(timer);
}, []);
```

### 10b. Right Panel — Form Improvements

Keep the split layout but upgrade styling:

Terminal block: same 3-line sequence animation as before. Update text:
  Line 1: "$ genome --connect"
  Line 2: "Initialising climate archive... OK"
  Line 3: "40yr dataset ready. Awaiting credentials." + blinking cursor

Form labels: increase to 10px uppercase, more breathing room (margin 7px below label).

Input focus: Instead of just border-color change, add a subtle left-accent:
```css
.field-input:focus {
  border-color: var(--accent);
  border-width: 1.5px;
  border-left-width: 3px;  /* thick left accent on focus */
  padding-left: 8px;        /* compensate for extra border */
}
```

Primary CTA button: add a subtle SVG arrow that slides right on hover:
```css
.btn-signin .btn-arrow {
  transition: transform 0.2s ease;
}
.btn-signin:hover .btn-arrow {
  transform: translateX(4px);
}
```

Add a small "Powered by Open-Meteo API" badge at very bottom of right panel:
```tsx
<div style={{ 
  marginTop: '10px', textAlign: 'center', fontSize: '9px', 
  color: 'var(--dim)', letterSpacing: '0.06em' 
}}>
  Data · open-meteo.com/en/docs/historical-weather-api
</div>
```

---

## 11. GEMINI RECOMMENDATIONS — Apply Best Ones

### 11a. Map Contrast
Apply a CSS filter to Leaflet tiles for better legibility in both modes:

In globals.css:
```css
/* Light mode — warm paper-ified map */
.leaflet-tile {
  filter: sepia(0.2) contrast(0.92) brightness(0.97) saturate(0.85);
}
/* Dark mode — invert and re-color */
html.dark .leaflet-tile {
  filter: invert(1) hue-rotate(180deg) sepia(0.1) contrast(0.88) brightness(0.85);
}
```

This gives the map a hand-drawn cartographic feel in light mode, and a
dark inky satellite feel in dark mode — matching the blueprint aesthetic perfectly.

### 11b. Muted Accent Color — Already done in Section 3

### 11c. Better terrain
If user hasn't selected Satellite, default tile should use:
  OpenTopoMap for terrain detail: https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
  (attribute: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap")
  
  This shows elevation contours and terrain — much more useful for a GeoScience tool.
  
  3 tile options:
    "Topo" (default): opentopomap
    "Street": openstreetmap  
    "Satellite": ArcGIS World Imagery

Update MapControls to show 3 buttons: Topo | Street | Satellite

---

## 12. ANIMATIONS SUMMARY — Keep All, Add These

Existing animations to keep:
  - Sidebar collapse transition (width 220ms cubic-bezier)
  - Chart.js 600ms easeInOutQuart update animation
  - Chart bars staggered entrance (ExtremesBarChart)
  - Heat Gauge fill slide (600ms cubic-bezier)
  - Delta count-up (800ms requestAnimationFrame)
  - Skeleton shimmer (1.4s linear infinite)
  - Map pin pulse ring (CSS, 2s ease-out infinite)
  - Terminal lines fade in (sequential 300/900/1600ms)
  - Dark mode color transition (200ms on html element)

New animations to add:
  - Login Earth globe DNA ring rotation (18s SVG animateTransform)
  - Login star field twinkle (per-star opacity animate, staggered)
  - Login stat counter count-up (25ms setInterval)
  - Saved pins mini-globe pulse dots (SVG animate, staggered by index)
  - Map 3D tilt hover ease (CSS transform transition 0.4s)
  - Chart selected year vertical line fade in (opacity 0→1, 200ms)
  - Location info card slide in below map (translateY -8px → 0, 250ms ease-out)
  - Search results dropdown fade in (opacity 0→1, 150ms)

---

## 13. MISC FIXES

### Bottom bar
Change "GeoSense v2.0" → "Genome v3.0"

### Page <title>
"Genome — GeoScience Dashboard"

### Toast notifications (react-hot-toast)
In the toaster config, change accent color:
```tsx
<Toaster toastOptions={{
  style: {
    fontFamily: 'Space Mono',
    fontSize: '11px',
    border: '1px solid var(--ink)',
    background: 'var(--paper)',
    color: 'var(--ink)',
  },
  success: { iconTheme: { primary: '#2ecc71', secondary: 'var(--paper)' } },
  error: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--paper)' } },
}}/>
```

### API Attribution
At bottom of every page, update URL display:
  "open-meteo.com/en/docs/historical-weather-api"
  Make it a clickable link (color: var(--dim), underline on hover).

---

## 14. BUILD ORDER FOR THIS UPDATE

Apply in this exact order:

1.  Color variables update (globals.css) — --accent replaces --red
2.  Favicon SVG creation (/public/favicon.svg)
3.  Rebrand: find/replace GeoSense → Genome everywhere
4.  Typography size increases (globals.css)
5.  Dark mode chart fix (ClimateLineChart.tsx, ComparisonChart.tsx)
6.  Chart tooltip/click fix (interaction mode + pointHitRadius)
7.  Chart legend upgrade (custom legend component)
8.  Map CSS filter for tile contrast (globals.css)
9.  Map 3D perspective CSS (map panel wrapper)
10. Map search bar + Nominatim integration
11. Map tile options: Topo/Street/Satellite (MapControls.tsx)
12. Location info card (AQI + local time + city name)
13. Saved pins mini-globe in sidebar
14. Login page full redesign (SVG animations, stat counter, improved form)
15. Register page — update headline only
16. Toast notification theme update
17. Bottom bar version bump

After each step: verify no TypeScript errors, test dark mode toggle,
test map click, test chart tooltip. Do not proceed if a step breaks existing features.

Generate complete file contents for every modified file. No placeholders. No TODOs.
```