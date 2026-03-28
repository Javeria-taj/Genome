# GENOME — Precise Fix Prompt v4.3
# Based on 4 screenshots. Fix ONLY what's broken. Touch only the files listed.

---

## WHAT THE SCREENSHOTS SHOW — EXACT ISSUES

### Screenshot 1 — Landing page:
- Left panel text (headline + subtext + CTAs) is pushed to the very bottom
- Right panel has no top content — stats and features start halfway down
- CTAs (SIGN IN, CREATE ACCOUNT, TRY DEMO) are at the bottom left, too low
- Font sizes too small throughout

### Screenshot 2 — Dashboard:
- Mobile bottom nav (©, Map, Trends, H, Compare, Del, Export) is bleeding
  onto the desktop view at the bottom-left corner
- "SYSTEM: HEALTHY (0MS)" showing 0ms — timer bug

### Screenshot 3 — Dashboard bottom-left closeup:
- Confirms: ©, Map, ^, Trends, H, Compare, △, Del, ↓ rendered on desktop
- This is `.mobile-bottom-nav` with `display: flex` hardcoded inline

### Screenshot 4 — Login page:
- Only shows: "SIGN IN TO GENOME" label + terminal block
- MISSING: email field, password field, forgot password, submit button,
  divider, access token field, footer
- The left panel (Earth + stars) is also not visible — page appears
  to only show the right panel content starting from the top-right

---

## FIX 1 — LANDING PAGE: Move left panel content UP

### Problem: `marginTop: 'auto'` on the bottom content div pushes everything
### to the very bottom. The content should be vertically centered, not bottom-aligned.

In /app/page.tsx, in the left panel content div:

```tsx
// FIND this pattern in the left panel:
<div style={{
  position: 'relative',
  zIndex: 10,
  padding: '...',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}}>
  {/* Logo at top */}
  <div style={{ marginBottom: 'auto' }}>  {/* logo */}  </div>

  {/* Content pushed to bottom */}
  <div style={{ marginTop: 'auto' }}>     {/* headline + stats */}  </div>
</div>

// REPLACE WITH — content in the middle-to-lower-third, not the very bottom:
<div style={{
  position: 'relative',
  zIndex: 10,
  padding: '40px 48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',   // ← CENTER vertically
  minHeight: '100vh',
  gap: '0',
}}>
  {/* Logo — absolutely positioned top-left */}
  <div style={{
    position: 'absolute',
    top: '32px',
    left: '48px',
    display: 'flex', alignItems: 'center', gap: '10px',
  }}>
    {/* favicon + "Genome" text */}
  </div>

  {/* Main content — centered vertically */}
  <div style={{ maxWidth: '480px' }}>

    {/* Small label above headline */}
    <div style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
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
      fontSize: 'clamp(36px, 4.5vw, 64px)',   // ← LARGER
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
      color: 'rgba(237,232,220,0.95)',
      marginBottom: '20px',
    }}>
      40 years of<br/>
      climate data,<br/>
      <em>mapped.</em>
    </h1>

    {/* Subtext */}
    <p style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 'clamp(11px, 1.1vw, 13px)',    // ← LARGER
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
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <a href="/login" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#ede8dc', color: '#0f0e0d',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '12px 22px', textDecoration: 'none',
        border: '1.5px solid #ede8dc',
        transition: 'opacity 0.15s',
      }}>
        → Sign In
      </a>
      <a href="/register" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', color: '#ede8dc',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '12px 22px', textDecoration: 'none',
        border: '1px solid rgba(237,232,220,0.35)',
        transition: 'border-color 0.15s',
      }}>
        Create Account
      </a>
      <a href="/demo" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', color: 'rgba(237,232,220,0.45)',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '12px 18px', textDecoration: 'none',
        border: '1px solid rgba(237,232,220,0.15)',
      }}>
        Try Demo →
      </a>
    </div>
  </div>
</div>
```

### Also fix the right panel — add padding-top so stats don't start at top edge:

```tsx
// Right panel wrapper:
<div style={{
  background: '#f5f0e8',
  display: 'flex',
  flexDirection: 'column',
  padding: '48px 56px',        // generous padding all round
  justifyContent: 'center',    // center content vertically
  gap: '32px',
}}>

  {/* 1. Stats row — 3 columns */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 0,
    border: '1.5px solid #0f0e0d',
  }}>
    {[
      { val: '14,600', label: 'Daily data points' },
      { val: '40yr',   label: 'Historical coverage' },
      { val: '195',    label: 'Countries covered' },
    ].map((s, i) => (
      <div key={s.label} style={{
        padding: '18px 20px',
        borderRight: i < 2 ? '1px solid #0f0e0d' : 'none',
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(24px, 2.5vw, 36px)',   // ← LARGER
          color: '#0f0e0d',
          lineHeight: 1,
          marginBottom: '4px',
        }}>
          {s.val}
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',                         // ← LARGER
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
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#7a756e',
      marginBottom: '14px',
    }}>
      What you can do
    </div>
    {[
      ['Interactive World Map',       'Click any location to fetch its full climate history'],
      ['40-Year Temperature Trends',  'Annual avg temperature + precipitation since 1985'],
      ['City Comparison',             "Overlay two locations — see who's warming faster"],
      ['Decade Delta Calculator',     'Measure exact temperature rise between any two decades'],
      ['Extreme Events Tracker',      'Count days above 35°C or 50mm rain per decade'],
      ['CSV Export',                  'Download raw data for use in Excel or research tools'],
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
        }}/>
        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',                       // ← LARGER
            fontWeight: '700', color: '#0f0e0d',
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',                       // ← LARGER
            color: '#7a756e', marginTop: '2px',
          }}>
            {desc}
          </div>
        </div>
      </div>
    ))}
  </div>

</div>
```

---

## FIX 2 — LOGIN PAGE: Restore missing form fields

### Problem (Screenshot 4): Only "SIGN IN TO GENOME" + terminal visible.
### The rest of the form (email, password, button, access token) is missing.
### Most likely cause: the form JSX is inside a conditional that never renders,
### OR the right panel div has `overflow: hidden` with a fixed height cutting it off,
### OR the file was partially written and the form JSX is missing.

### In src/app/(auth)/login/page.tsx, ensure the RIGHT PANEL contains ALL of this
### in order, after the terminal block:

```tsx
{/* RIGHT PANEL — full content */}
<div style={{
  background: '#f5f0e8',
  color: '#0f0e0d',
  borderLeft: '1.5px solid #1e1c18',
  display: 'flex',
  flexDirection: 'column',
  padding: '36px 40px',
  minHeight: '100vh',         // ← ADD THIS — prevents content cutoff
  overflowY: 'auto',          // ← ADD THIS — allows scroll if needed
  position: 'relative',
}}>

  {/* 1. Top row */}
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '26px',
  }}>
    <span style={{
      fontSize: '11px',                 // ← LARGER (was 9px)
      textTransform: 'uppercase',
      letterSpacing: '0.14em', color: '#7a756e',
      fontFamily: "'Space Mono', monospace",
    }}>
      Sign in to Genome
    </span>
    <a href="/register" style={{
      fontSize: '11px',                 // ← LARGER (was 9px)
      color: '#2259c7', textDecoration: 'underline',
      fontFamily: "'Space Mono', monospace",
    }}>
      Create account →
    </a>
  </div>

  {/* 2. Terminal (first visit only) */}
  {showTerminal && (
    <div style={{
      border: '1px solid rgba(15,14,13,0.22)',
      background: '#ede8dc',
      padding: '12px 14px',
      marginBottom: '22px',
    }}>
      <div style={{
        fontSize: '12px',               // ← LARGER
        color: '#7a756e', lineHeight: 1.9,
        opacity: t1 ? 1 : 0, transition: 'opacity 0.4s',
        fontFamily: "'Space Mono', monospace",
      }}>
        <b style={{ color: '#0f0e0d' }}>$</b> genome --connect
      </div>
      <div style={{
        fontSize: '12px',               // ← LARGER
        color: '#7a756e', lineHeight: 1.9,
        opacity: t2 ? 1 : 0, transition: 'opacity 0.4s',
        fontFamily: "'Space Mono', monospace",
      }}>
        Initialising climate archive...{' '}
        <b style={{ color: '#2ecc71' }}>OK</b>
      </div>
      <div style={{
        fontSize: '12px',               // ← LARGER
        color: '#7a756e', lineHeight: 1.9,
        opacity: t3 ? 1 : 0, transition: 'opacity 0.4s',
        fontFamily: "'Space Mono', monospace",
      }}>
        40yr dataset ready. Awaiting credentials.
        <span style={{
          display: 'inline-block', width: '7px', height: '12px',
          background: '#b5451b', verticalAlign: 'middle',
          marginLeft: '4px', animation: 'blink 0.85s step-end infinite',
        }}/>
      </div>
    </div>
  )}

  {/* 3. Section label */}
  <div style={{
    fontSize: '11px',                   // ← LARGER
    textTransform: 'uppercase',
    letterSpacing: '0.14em', color: '#7a756e',
    marginBottom: '8px',
    fontFamily: "'Space Mono', monospace",
    borderBottom: '0.5px solid rgba(15,14,13,0.12)',
    paddingBottom: '5px',
  }}>
    Credentials
  </div>

  {/* 4. Error banner — only when status === 'error' */}
  {status === 'error' && errorMsg && (
    <div style={{
      borderLeft: '3px solid #b5451b',
      background: 'rgba(181,69,27,0.08)',
      padding: '10px 12px',
      marginTop: '10px', marginBottom: '12px',
      fontSize: '12px',                 // ← LARGER
      color: '#b5451b',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: "'Space Mono', monospace",
      animation: 'errorShake 0.4s ease-out',
    }}>
      <span style={{ lineHeight: 1.6 }}>{errorMsg}</span>
      <button onClick={() => { setStatus('idle'); setErrorMsg(''); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
                 color: '#b5451b', fontSize: '18px', lineHeight: 1 }}>×</button>
    </div>
  )}

  {/* 5. FORM */}
  <form onSubmit={handleLogin} style={{ marginTop: '12px' }}>

    {/* Email field */}
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        fontSize: '11px',               // ← LARGER
        textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#7a756e',
        marginBottom: '6px', display: 'block',
        fontFamily: "'Space Mono', monospace",
      }}>
        Email address
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="user@genome.io"
        autoComplete="email"
        style={{
          width: '100%',
          border: '1px solid #0f0e0d',
          background: '#f5f0e8',
          color: '#0f0e0d',
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',             // ← LARGER
          padding: '10px 12px',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#b5451b'; e.target.style.borderLeftWidth = '3px'; e.target.style.paddingLeft = '10px'; }}
        onBlur={e => { e.target.style.borderColor = '#0f0e0d'; e.target.style.borderLeftWidth = '1px'; e.target.style.paddingLeft = '12px'; }}
      />
    </div>

    {/* Password field */}
    <div style={{ marginBottom: '6px' }}>
      <label style={{
        fontSize: '11px',               // ← LARGER
        textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#7a756e',
        marginBottom: '6px', display: 'block',
        fontFamily: "'Space Mono', monospace",
      }}>
        Password
      </label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••••••"
        autoComplete="current-password"
        style={{
          width: '100%',
          border: '1px solid #0f0e0d',
          background: '#f5f0e8',
          color: '#0f0e0d',
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',             // ← LARGER
          padding: '10px 12px',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#b5451b'; e.target.style.borderLeftWidth = '3px'; e.target.style.paddingLeft = '10px'; }}
        onBlur={e => { e.target.style.borderColor = '#0f0e0d'; e.target.style.borderLeftWidth = '1px'; e.target.style.paddingLeft = '12px'; }}
      />
      {/* Forgot password link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
        <button
          type="button"
          onClick={() => { setForgotOpen(true); setForgotEmail(email); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',           // ← LARGER
            color: '#2259c7', textDecoration: 'underline',
          }}
        >
          Forgot password?
        </button>
      </div>
    </div>

    {/* Submit button */}
    <button
      type="submit"
      disabled={status === 'loading' || status === 'success'}
      style={{
        width: '100%',
        border: '1.5px solid #0f0e0d',
        background: '#0f0e0d',
        color: '#f5f0e8',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',               // ← LARGER
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        padding: '12px',                // ← TALLER
        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        opacity: status === 'loading' ? 0.75 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', marginTop: '16px',
      }}
    >
      {status === 'loading' && (
        <>
          <span style={{ display: 'flex', gap: '4px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: '5px', height: '5px',
                background: '#f5f0e8', borderRadius: '50%',
                animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
              }}/>
            ))}
          </span>
          Authenticating...
        </>
      )}
      {status === 'success' && (
        <>
          <span style={{ width: '14px', height: '14px', border: '1.5px solid #f5f0e8',
                         display: 'flex', alignItems: 'center',
                         justifyContent: 'center', fontSize: '10px' }}>✓</span>
          Access Granted — Redirecting
        </>
      )}
      {(status === 'idle' || status === 'error') && (
        <>
          <span style={{ width: '14px', height: '14px', border: '1.5px solid #f5f0e8',
                         display: 'flex', alignItems: 'center',
                         justifyContent: 'center', fontSize: '10px' }}>→</span>
          Authenticate &amp; Enter Dashboard
        </>
      )}
    </button>

    {/* OR divider */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      margin: '18px 0',
      fontSize: '10px', color: 'rgba(15,14,13,0.3)',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,14,13,0.12)' }}/>
      or
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,14,13,0.12)' }}/>
    </div>

    {/* Access token */}
    <div>
      <label style={{
        fontSize: '11px',               // ← LARGER
        textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#7a756e',
        marginBottom: '6px', display: 'block',
        fontFamily: "'Space Mono', monospace",
      }}>
        Access token
      </label>
      <input
        type="text"
        placeholder="gno_xxxxxxxxxxxxxxxx"
        style={{
          width: '100%',
          border: '1px solid #0f0e0d',
          background: '#f5f0e8',
          color: '#0f0e0d',
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',             // ← LARGER
          padding: '10px 12px',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#b5451b'; }}
        onBlur={e => { e.target.style.borderColor = '#0f0e0d'; }}
      />
      <div style={{
        fontSize: '10px',               // ← LARGER
        color: '#7a756e', marginTop: '4px',
        fontFamily: "'Space Mono', monospace",
      }}>
        For API / programmatic access
      </div>
    </div>

  </form>

  {/* Footer */}
  <div style={{
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '0.5px solid rgba(15,14,13,0.1)',
    display: 'flex', justifyContent: 'space-between',
    fontSize: '10px',                   // ← LARGER
    color: '#7a756e',
    fontFamily: "'Space Mono', monospace",
  }}>
    <span>Genome v3.3 · Next.js + MongoDB</span>
  </div>
  <div style={{
    marginTop: '6px', textAlign: 'center',
    fontSize: '9px', color: 'rgba(15,14,13,0.25)',
    fontFamily: "'Space Mono', monospace",
  }}>
    open-meteo.com/en/docs/historical-weather-api
  </div>

</div>
```

---

## FIX 3 — REGISTER PAGE: Same font size increases + ensure all 4 fields visible

Apply the same font size increases to register/page.tsx:

```
All labels:        fontSize: '11px'   (was 9–10px)
All inputs:        fontSize: '13px'   (was 11px)
All hint text:     fontSize: '10px'   (was 8.5px)
Submit button:     fontSize: '12px'   (was 10.5px)
Section label:     fontSize: '11px'   (was 9–10px)
Top row label:     fontSize: '11px'   (was 9px)
Footer:            fontSize: '10px'   (was 9.5px)
```

Also ensure the right panel has:
```tsx
minHeight: '100vh',
overflowY: 'auto',
```

This prevents the bottom fields from being clipped.

---

## FIX 4 — DASHBOARD: Mobile bottom nav on desktop

### Root cause: the component uses inline `display: 'flex'` which beats CSS.

### In /components/ui/MobileBottomNav.tsx (or wherever it's defined):

REMOVE any inline `display` from the nav element. The nav must have NO
inline display property at all:

```tsx
// WRONG — this overrides all CSS:
<nav style={{ display: 'flex', position: 'sticky', bottom: 0, ... }}>

// CORRECT — no inline display:
<nav className="mobile-bottom-nav">
  {/* nav items */}
</nav>
```

### In globals.css — ensure these exact rules exist (add or replace):

```css
/* Default: HIDDEN on all screens */
.mobile-bottom-nav {
  display: none;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 56px;
  background: var(--paper);
  border-top: 1.5px solid var(--ink);
  z-index: 100;
  justify-content: space-around;
  align-items: stretch;
  font-family: 'Space Mono', monospace;
}

/* ONLY show on mobile */
@media (max-width: 640px) {
  .mobile-bottom-nav {
    display: flex !important;
  }

  /* Also hide sidebar and bottom bar on mobile */
  .sidebar,
  #sb {
    display: none !important;
  }
  .bbar {
    display: none !important;
  }
}
```

---

## FIX 5 — HEALTH CHECK: Fix 0ms display

### In /app/api/health/route.ts:

```typescript
// Ensure timer starts BEFORE the fetch:
const meteoStart = Date.now();

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 4000);

const res = await fetch(
  'https://geocoding-api.open-meteo.com/v1/search?name=London&count=1&language=en&format=json',
  { signal: controller.signal, cache: 'no-store' }
);
clearTimeout(timeout);

const latencyMs = Math.max(Date.now() - meteoStart, 1);  // minimum 1ms, never 0

health.services.openMeteo = { status: 'ok', latencyMs };
```

### In /components/ui/Topbar.tsx — display format:

```typescript
// If latency is 0 or falsy, don't show the ms:
const latencyDisplay = latency && latency > 0 ? ` (${latency}ms)` : '';
const statusLabel = loading     ? 'Checking...'
                  : openMeteoOk ? `System: Healthy${latencyDisplay}`
                  :               'System: Degraded';
```

---

## FIX 6 — GLOBAL FONT SIZE INCREASES (dashboard)

Add to globals.css:

```css
/* ── DASHBOARD FONT SIZE INCREASES ── */
.ptitle      { font-size: 11.5px !important; letter-spacing: 0.12em !important; }
.ptag        { font-size: 9.5px  !important; }
.nav-item    { font-size: 12.5px !important; }
.sb-label    { font-size: 10px   !important; letter-spacing: 0.14em !important; }
.tb-coords   { font-size: 11.5px !important; }
.tb-btn      { font-size: 10.5px !important; }
.ph-title    { font-size: 24px   !important; }
.ph-sub      { font-size: 10.5px !important; }
.stat-val    { font-size: 20px   !important; }
.stat-lbl    { font-size: 10px   !important; }
.bbar        { font-size: 10.5px !important; }
.lic-city    { font-size: 17px   !important; }
.lic-label   { font-size: 10px   !important; }
.lic-coord   { font-size: 12.5px !important; }
.lic-time    { font-size: 20px   !important; }
.lic-aqi-val { font-size: 22px   !important; }
```

---

## FILES TO TOUCH — and ONLY these files:

1. `/app/page.tsx` — landing page left panel positioning + font sizes
2. `/app/(auth)/login/page.tsx` — restore missing form fields + font sizes
3. `/app/(auth)/register/page.tsx` — font sizes + ensure minHeight/overflowY
4. `/components/ui/MobileBottomNav.tsx` — remove inline display style
5. `/app/globals.css` — mobile-bottom-nav CSS rules + dashboard font sizes
6. `/app/api/health/route.ts` — fix 0ms timer
7. `/components/ui/Topbar.tsx` — fix 0ms display string

---

## VERIFICATION CHECKLIST

[ ] Landing page: headline + subtext + CTAs are in the MIDDLE of the left panel, not the bottom
[ ] Landing page: right panel has stats (3-col grid) and feature list visible on load
[ ] Landing page: all font sizes larger (headline clamp 36–64px, feature list 12px)
[ ] Login page: left panel with Earth + stars + headline + stats visible
[ ] Login page: right panel shows ALL content: label, terminal, Credentials section, email field, password field, forgot password link, submit button, OR divider, access token field, footer
[ ] Login page: font sizes — labels 11px, inputs 13px, button 12px, terminal 12px
[ ] Register page: same left panel as login (Earth + stars + "Map your world" headline)
[ ] Register page: all 4 fields visible (Full name, Email, Password, Confirm password)
[ ] Register page: same font size increases as login
[ ] Dashboard: mobile bottom nav NOT visible at desktop widths (1366px, 1920px)
[ ] Dashboard: mobile bottom nav IS visible at 375px mobile width
[ ] Dashboard: "SYSTEM: HEALTHY (0MS)" now shows real latency (e.g., 142ms)
[ ] All other files unchanged
[ ] npm run build — no TypeScript errors
```