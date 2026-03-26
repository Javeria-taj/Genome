# GENOME — Surgical Update Prompt v3.2
# Precise fixes on top of existing working codebase
# Do NOT rebuild from scratch — apply each section as a targeted edit

---

## FIX 1 — LOGIN LEFT PANEL: Favicon Icon Replaces Red Dot

The logo in the left panel currently shows a red CSS dot before "Genome".
Replace it with the actual favicon SVG inline.

In /app/(auth)/login/page.tsx, find the logo block:
```tsx
// REMOVE this:
<div className="logo-pip" />   {/* the red dot */}

// REPLACE with this inline SVG favicon:
<svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
  <defs>
    <radialGradient id="fg" cx="35%" cy="32%" r="60%">
      <stop offset="0%" stopColor="#2c8fb5"/>
      <stop offset="70%" stopColor="#0e4d68"/>
      <stop offset="100%" stopColor="#072d3f"/>
    </radialGradient>
    <clipPath id="fc"><circle cx="16" cy="16" r="11" transform="rotate(-23.5,16,16)"/></clipPath>
  </defs>
  {/* Back ring arc */}
  <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none"
    stroke="rgba(200,160,60,0.38)" strokeWidth="1.2" strokeDasharray="5 3"
    transform="rotate(-20,16,16)"/>
  {/* Earth */}
  <circle cx="16" cy="16" r="11" fill="url(#fg)" transform="rotate(-23.5,16,16)"/>
  {/* Continents */}
  <g clipPath="url(#fc)" fill="rgba(52,130,78,0.72)">
    <ellipse cx="12" cy="13" rx="4" ry="3" transform="rotate(-10,12,13)"/>
    <ellipse cx="20" cy="18" rx="3.5" ry="4" transform="rotate(8,20,18)"/>
    <ellipse cx="10" cy="20" rx="2.2" ry="2"/>
  </g>
  {/* Atmosphere rim */}
  <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.3)" strokeWidth="2.5" transform="rotate(-23.5,16,16)"/>
  <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.08)" strokeWidth="5" transform="rotate(-23.5,16,16)"/>
  {/* Front ring arc over Earth */}
  <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none"
    stroke="rgba(212,168,60,0.9)" strokeWidth="1.8" strokeDasharray="5 3"
    transform="rotate(-20,16,16)"
    clipPath="url(#fc)"/>
</svg>
```

The same inline SVG also appears in:
- Sidebar.tsx top logo
- Topbar.tsx left logo

Update both those locations with the same SVG (sized 18×18 in topbar/sidebar).

---

## FIX 2 — LOGIN EARTH: Real 3D Earth with Full Depth

The current Earth SVG (screenshot 2) has basic green blobs on flat teal.
Replace with this: USE either SVG or THREE.js
EARTH: Ink/Paper Wireframe Aesthetic
Design principle:
The Earth is near-black (#090807) with paper-toned (#ede8dc at low opacity)
wireframe grid lines and continent outlines — STROKES ONLY, NO FILLS.
The DNA ring is also paper-toned strokes. The ONLY color on the entire
left panel is the burnt-sienna (#b5451b) crosshair pin — matching the
accent used for pins on the real map in the dashboard.
This makes the login left panel feel like a zoomed-out view of the
dashboard's own world map — coherent, not decorative.

FULL SVG EARTH IMPLEMENTATION
Place this SVG absolutely positioned in the left panel:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geo-Scan :: Brutalist Earth</title>
    <style>
        /* Core Neo-Brutalist and Ink Sketch Aesthetic */
        :root {
            --bg-cream: #F4F0EB;
            --terminal-black: #000000;
            --ink-white: #FFFFFF;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--bg-cream);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden; /* Prevent scrollbars from animation pushing bounds */
        }

        /* Make SVG fully responsive, scaling to the viewport */
        svg {
            width: 90vmin; /* Uses viewport minimum dimension to stay circular and visible */
            max-width: 600px;
            height: auto;
            display: block;
            /* Optional: Add the geometric drop shadow directly to the globe if desired */
            /* filter: drop-shadow(8px 8px 0px var(--terminal-black)); */
        }

        /* SVG internal styling defined via CSS classes */
        .water {
            fill: var(--ink-white);
            stroke: var(--terminal-black);
            stroke-width: 4px; /* Thick brutalist globe border */
        }

        .grid {
            fill: none;
            stroke: var(--terminal-black);
            stroke-width: 1px;
            stroke-dasharray: 4,4; /* Dashed terminal grid lines */
            opacity: 0.6;
        }

        .land {
            fill: var(--ink-white);
            stroke: var(--terminal-black);
            stroke-width: 2px; /* Precise sketch outline for landmasses */
            stroke-linejoin: round;
        }
    </style>
</head>
<body>

    <!-- Pure SVG Visualization -->
    <svg id="brutalist-earth"></svg>

    <!-- Load D3.js and TopoJSON via CDN -->
    <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js"></script>
    <script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js"></script>

    <script type="module">
        // Standard D3.js and TopoJSON logic

        // Base coordinates for the projection logic
        const width = 500;
        const height = 500;
        
        // Select SVG and set viewBox for responsive scaling
        const svg = d3.select("#brutalist-earth")
          .attr("viewBox", `0 0 ${width} ${height}`) 
          .style("background", "transparent");

        // 3D Orthographic projection setup
        const projection = d3.geoOrthographic()
          .scale(240)
          .translate([width / 2, height / 2])
          .clipAngle(90);

        const path = d3.geoPath().projection(projection);

        // Define the terminal-style grid
        const graticule = d3.geoGraticule();

        // 1. Draw the base sphere (The Ocean boundary)
        const waterPath = svg.append("path")
          .datum({ type: "Sphere" })
          .attr("class", "water")
          .attr("d", path);

        // 2. Draw the graticule (coordinate grid)
        const gridPath = svg.append("path")
          .datum(graticule)
          .attr("class", "grid")
          .attr("d", path);

        // 3. Create a group to hold the landmasses
        const landGroup = svg.append("g");

        // Fetch Topography data and animate
        d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then((world) => {
          
          // Convert TopoJSON to GeoJSON features
          const land = topojson.feature(world, world.objects.land);

          // Render landmasses initially
          landGroup.selectAll(".land")
            .data(land.features)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", path);

          // Start the continuous animation loop
          d3.timer((elapsed) => {
            // Adjust this multiplier (0.015) to change rotation speed
            projection.rotate([elapsed * 0.015, -15]); 
            
            // Redraw all path elements on every frame to reflect rotation
            waterPath.attr("d", path);
            gridPath.attr("d", path);
            landGroup.selectAll(".land").attr("d", path);
          });
        });

    </script>
</body>
</html>


WHAT NOT TO DO (confirmed failures from v3.1):
✗ Do NOT use teal/green/blue fills on the Earth
✗ Do NOT use a gold/amber DNA ring color
✗ Do NOT use radialGradient with visible color stops on continents
✗ Do NOT fill continent paths — stroke-only
✗ Do NOT use realistic ocean colors
✗ Do NOT use CSS blur or glow effects (they flash during render)
✗ Do NOT place Earth entirely centered — offset bottom-right for drama
✗ Do NOT make the Earth smaller than 400px diameter rendered size

---

## FIX 3 — SEARCH AUTOCOMPLETE: Fix Relevance (Wrong Results Bug)

### Root cause identified from screenshot 3:
User typed "tumk" — results show "Magtymguly District" and "Magtymguly"
instead of anything related to the actual input.

This happens because Nominatim is returning results sorted by importance/rank
rather than string match relevance. The city name doesn't contain "tumk" at all.

### Why Nominatim returns irrelevant results:
Nominatim does a full-text search including address fields, descriptions, and
OSM tags — not just city names. "tumk" may match an internal OSM tag on those places.

### The fix — use Nominatim with stricter parameters:

```typescript
const fetchSuggestions = async (q: string) => {
  if (q.trim().length < 2) { setSuggestions([]); return; }

  setIsSearching(true);
  try {
    const params = new URLSearchParams({
      q: q,
      format: 'json',
      limit: '8',
      addressdetails: '1',
      featuretype: 'city',          // ← KEY: only return cities/towns
      'accept-language': 'en',
      countrycodes: '',              // empty = worldwide
      dedupe: '1',
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'Genome-Dashboard/3.0' } }
    );
    const data = await res.json();

    // CLIENT-SIDE RELEVANCE FILTER:
    // Only keep results where the primary name (city/town/display_name start) 
    // actually contains the query string
    const qLower = q.toLowerCase();
    const filtered = data.filter((r: NominatimResult) => {
      const addr = r.address || {};
      const primaryName = (
        addr.city || addr.town || addr.village || addr.municipality ||
        addr.county || r.display_name.split(',')[0]
      ).toLowerCase();
      // Must start with or contain the query
      return primaryName.startsWith(qLower) || primaryName.includes(qLower);
    });

    // Sort: starts-with first, then contains
    const sorted = filtered.sort((a: NominatimResult, b: NominatimResult) => {
      const aName = (a.address?.city || a.address?.town || a.display_name.split(',')[0]).toLowerCase();
      const bName = (b.address?.city || b.address?.town || b.display_name.split(',')[0]).toLowerCase();
      const aStarts = aName.startsWith(qLower) ? 0 : 1;
      const bStarts = bName.startsWith(qLower) ? 0 : 1;
      return aStarts - bStarts;
    });

    setSuggestions(sorted.slice(0, 6));
    setShowSuggestions(sorted.length > 0);
    
    if (sorted.length === 0 && data.length > 0) {
      // Nominatim returned results but none matched — show fallback message
      setSuggestions([]);
      setNoResults(true);
    } else {
      setNoResults(false);
    }

  } catch (e) {
    console.error('Geocoding error:', e);
  } finally {
    setIsSearching(false);
  }
};
```

### Also: use the Photon API as a fallback (better city name matching):
Photon (photon.komoot.com) is specifically designed for city/address autocomplete
and has much better prefix matching than Nominatim:

```typescript
// If Nominatim returns 0 relevant results, try Photon
const fetchFromPhoton = async (q: string) => {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  
  // Photon returns GeoJSON FeatureCollection
  return data.features
    .filter((f: PhotonFeature) => 
      ['city', 'town', 'village', 'hamlet'].includes(f.properties.type) ||
      f.properties.osm_value === 'city'
    )
    .map((f: PhotonFeature) => ({
      place_id: f.properties.osm_id,
      lat: f.geometry.coordinates[1].toString(),
      lon: f.geometry.coordinates[0].toString(),
      display_name: `${f.properties.name}, ${f.properties.country}`,
      address: {
        city: f.properties.name,
        country: f.properties.country,
        country_code: f.properties.countrycode?.toLowerCase(),
        state: f.properties.state,
      }
    }));
};

// Main fetch function — Photon primary, Nominatim fallback:
const fetchSuggestions = async (q: string) => {
  if (q.trim().length < 2) { setSuggestions([]); return; }
  setIsSearching(true);
  try {
    // Try Photon first (better for city-name prefix matching)
    const photonResults = await fetchFromPhoton(q);
    
    if (photonResults.length > 0) {
      setSuggestions(photonResults);
      setShowSuggestions(true);
    } else {
      // Fallback to Nominatim with client-side filter
      const nominatimResults = await fetchFromNominatim(q);
      setSuggestions(nominatimResults);
      setShowSuggestions(nominatimResults.length > 0);
    }
  } finally {
    setIsSearching(false);
  }
};
```

### Suggestion display — show what matched:
Highlight the matching portion of the city name in the dropdown:

```tsx
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </span>
  );
};

// In dropdown item:
<div style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: 'Space Mono' }}>
  <HighlightMatch text={city} query={query} />
</div>
```

### Debounce stays at 280ms. Add minimum 2 characters before fetching.

### Empty / no-match state in dropdown:
```tsx
{showSuggestions && noResults && (
  <div style={{
    padding: '10px 12px', fontSize: '10px', color: 'var(--dim)',
    fontFamily: 'Space Mono', fontStyle: 'italic',
    border: '1px solid var(--ink)', borderTop: 'none',
    background: 'var(--paper)',
  }}>
    No cities found for "{query}"
  </div>
)}
```

---

## FIX 4 — ANIMATIONS: Entrance Animations Throughout Dashboard

### 4a. Chart panel — slide up from below on data load

In ClimateLineChart.tsx and ExtremesBarChart.tsx:

Add a wrapper div with CSS animation triggered when data arrives:
```tsx
// State for animation
const [hasData, setHasData] = useState(false);

useEffect(() => {
  if (data && data.length > 0) {
    // Slight delay so chart renders before animating
    setTimeout(() => setHasData(true), 50);
  }
}, [data]);

// Wrapper markup:
<div
  style={{
    opacity: hasData ? 1 : 0,
    transform: hasData ? 'translateY(0)' : 'translateY(28px)',
    transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
  }}
>
  <canvas ref={chartRef} />
</div>
```

### 4b. Stat cards row — staggered slide up

In the stats row (below climate chart), each card animates in with stagger:
```tsx
{[
  { val: '28.2°', label: 'AVG 2024' },
  { val: '+1.2°', label: 'Δ 40YR', color: 'var(--accent)' },
  { val: '2,124', label: 'MM / YR' },
].map((stat, i) => (
  <div
    key={stat.label}
    style={{
      opacity: hasData ? 1 : 0,
      transform: hasData ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.45s ${0.1 + i * 0.08}s ease-out, transform 0.45s ${0.1 + i * 0.08}s ease-out`,
    }}
  >
    <span style={{ fontSize: '18px', fontWeight: 700, color: stat.color || 'var(--ink)' }}>
      {stat.val}
    </span>
    <span style={{ fontSize: '10px', color: 'var(--dim)', display: 'block' }}>{stat.label}</span>
  </div>
))}
```

### 4c. Location info card — slide down from map

When a pin is placed and location info loads:
```css
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.location-info-card {
  animation: slideDown 0.28s ease-out both;
}
```

### 4d. Saved pins mini-globe — dots pulse in on load

Each pin dot in the mini SVG globe gets a staggered entrance:
```svg
<circle cx={x} cy={y} r="0" fill={color}>
  <animate attributeName="r" values="0;3;2.5" dur="0.4s" begin={`${i * 0.15}s`} fill="freeze"/>
  <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.15}s`} fill="freeze"/>
</circle>
```

### 4e. Search dropdown — fade + slide in
```css
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-5px) scaleY(0.96); }
  to   { opacity: 1; transform: translateY(0) scaleY(1); }
}
.search-dropdown {
  animation: dropIn 0.14s ease-out both;
  transform-origin: top center;
}
```

### 4f. Panel headers — fade in on page load
Apply to ALL panel header divs across all dashboard pages:
```css
@keyframes panelFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel { animation: panelFadeIn 0.4s ease-out both; }
.panel:nth-child(1) { animation-delay: 0s; }
.panel:nth-child(2) { animation-delay: 0.07s; }
.panel:nth-child(3) { animation-delay: 0.14s; }
.panel:nth-child(4) { animation-delay: 0.21s; }
```

### 4g. Extremes bar chart — staggered bar entrance
In ExtremesBarChart.tsx, use Chart.js animation delay:
```typescript
animation: {
  duration: 700,
  easing: 'easeOutQuart',
  delay: (context) => {
    // Each bar group delayed by its index
    return context.dataIndex * 120 + context.datasetIndex * 60;
  },
},
```

### 4h. Heat Gauge fill — springs to value on mount
```css
.gauge-fill {
  width: 0%;  /* starts at 0 */
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);  /* springy overshoot */
}
```
Trigger by setting width via JS after a 100ms mount delay:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setGaugeWidth(`${(delta / 4) * 100}%`);
  }, 100);
  return () => clearTimeout(timer);
}, [delta]);
```

### 4i. Number count-up on ALL stat values
Whenever climate data loads/changes, all stat numbers should count up:
```typescript
const useCountUp = (target: number, duration = 700) => {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  
  return value;
};

// Usage:
const animatedTemp = useCountUp(avgTemp, 600);
// Display: animatedTemp.toFixed(1)
```

### 4j. Map tile load — fade in
```css
.leaflet-tile {
  transition: opacity 0.3s ease-in;
}
.leaflet-tile-loaded {
  opacity: 1 !important;
}
```

### 4k. Sidebar nav items — hover slide
```css
.nav-item {
  position: relative;
  overflow: hidden;
}
.nav-item::before {
  content: '';
  position: absolute;
  left: -100%;
  top: 0; bottom: 0;
  width: 100%;
  background: color-mix(in srgb, var(--ink) 7%, transparent);
  transition: left 0.18s ease;
}
.nav-item:hover::before { left: 0; }
.nav-item.active::before { left: 0; background: var(--ink); }
```

### 4l. Login page entrance
Left panel: headline, subtext, and stats grid all fade up with stagger:
```css
.headline { animation: fadeUp 0.8s ease-out both; }
.subtext  { animation: fadeUp 0.8s 0.15s ease-out both; }
.stats-grid { animation: fadeUp 0.8s 0.3s ease-out both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## FIX 5 — SVG ANIMATIONS: Add Throughout Dashboard

### 5a. Sidebar mini-globe — continuous slow rotation hint
Add a subtle panning animation to the mini SVG globe's grid lines:
```svg
<g style="animation: globePan 20s linear infinite">
  <!-- all longitude ellipses -->
</g>
@keyframes globePan {
  from { transform: translateX(0); }
  to   { transform: translateX(-10px); }  /* subtle drift */
}
```

### 5b. Map "Save Pin" button — pulse on new pin
When a pin is freshly dropped:
```css
@keyframes pinPulse {
  0% { box-shadow: 0 0 0 0 rgba(181,69,27,0.5); }
  70% { box-shadow: 0 0 0 8px rgba(181,69,27,0); }
  100% { box-shadow: 0 0 0 0 rgba(181,69,27,0); }
}
.save-pin-btn.fresh { animation: pinPulse 0.8s ease-out; }
```

### 5c. Location info card AQI indicator — breathing animation for Poor/Very Poor
```css
@keyframes aqiBreathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.aqi-poor { animation: aqiBreathe 2s ease-in-out infinite; }
```

### 5d. Climate trend chart — trend line drawing animation
Use Chart.js animation to make the line draw from left to right:
```typescript
animation: {
  x: {
    type: 'number',
    easing: 'linear',
    duration: 1200,
    from: NaN,    // the initial value
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) return 0;
      ctx.xStarted = true;
      return ctx.index * 18;  // delay each point progressively
    },
  },
  y: {
    type: 'number',
    easing: 'easeOutElastic',
    duration: 600,
    from: (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1]?.getProps(['y'], true).y,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) return 0;
      ctx.yStarted = true;
      return ctx.index * 18;
    },
  },
},
```

### 5e. Topbar coordinates update — flash on change
When coords change (new pin dropped):
```typescript
const [coordsFlash, setCoordsFlash] = useState(false);

useEffect(() => {
  setCoordsFlash(true);
  const t = setTimeout(() => setCoordsFlash(false), 600);
  return () => clearTimeout(t);
}, [selectedLocation?.lat, selectedLocation?.lng]);
```

```css
@keyframes coordFlash {
  0% { background: rgba(181,69,27,0.15); }
  100% { background: transparent; }
}
.coords-flash { animation: coordFlash 0.6s ease-out; }
```

---

##Fix 5
In the dashborad section where the heat days are shown fix the colors to a warm orange tone.
In login page verify login logic is correctly working and of the password is wrong show error message through a hot toast notification
Also in the login page the "create account" and "forgot password" links should be clickable and should navigate to the respective pages and placed below the login button. Also the links should be in black color
Increase overall font size of the dashboard.
Also implement AQI metrics in the dashboard.

## VERIFICATION CHECKLIST

[ ] Logo on login left panel: favicon SVG (Earth + DNA ring), NOT a red dot
[ ] Earth is large, positioned bottom-right, TILTED 23.5°
[ ] Earth has: radial gradient depth, continent paths, atmospheric rim, specular highlight, night shadow
[ ] DNA ring: back arc (low opacity) → earth layers → front arc (high opacity, clipped)
[ ] DNA ring ROTATES continuously (22s SVG animateTransform)
[ ] Gold nucleotide dots orbit along the ring path (animateMotion)
[ ] Star field: 20+ stars with individual staggered twinkle animations
[ ] Search: typing "mum" → suggestions show Mumbai, Muminabad, Muma etc (relevant)
[ ] Search: typing "tumk" → shows Turkmenabat, Tümkür etc (NOT Magtymguly)
[ ] Search highlight: matched portion of city name is bold in dropdown
[ ] No-results state shows when no relevant cities found
[ ] Chart slides up from below (translateY 28px → 0) when data arrives
[ ] Stat cards stagger in (3 cards, 80ms apart)
[ ] Extremes bars grow up from baseline with staggered delay
[ ] Heat gauge springs to value (cubic-bezier spring easing) on mount
[ ] All numeric stats count up from 0 when data loads
[ ] Sidebar hover: sliding background effect
[ ] Map pin popup shows city name (not just lat/lng)
[ ] Location card slides down from map edge
[ ] AQI value breathes/pulses if air quality is Poor or worse
[ ] Login headline/stats fade up with stagger on page load
[ ] Terminal lines appear sequentially (300ms / 950ms / 1700ms)
```