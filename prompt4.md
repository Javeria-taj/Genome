# GENOME — Surgical Update Prompt v3.3
# Apply ON TOP of existing codebase. Do not rebuild from scratch.
# Fix every item in the exact order listed.

---

## FIX 1 — CHART OVERLAPPING TEXT

### Root cause (confirmed in screenshot 1):
The chart canvas has no bottom boundary. It renders on top of the
summary stats text row below it.

### Fix in ClimateLineChart.tsx:

```tsx
{/* Chart wrapper — explicit height, overflow hidden */}
<div style={{
  position: 'relative',
  height: '180px',          // explicit fixed height
  marginBottom: '12px',     // gap before legend row
  overflow: 'hidden',       // hard clipping — canvas cannot escape
}}>
  <canvas ref={chartRef} style={{ display: 'block' }}/>
</div>

{/* Legend row — sits BELOW chart, never overlapped */}
<div style={{
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  gap: '20px',
  padding: '8px 0',
  borderTop: '1px solid rgba(15,14,13,0.12)',
  borderBottom: '1px solid rgba(15,14,13,0.12)',
  marginBottom: '10px',
}}>
  {/* ... legend items */}
</div>

{/* Stats row — also has explicit z-index */}
<div style={{ position: 'relative', zIndex: 2 }}>
  {/* ... stat cells */}
</div>
```

In Chart.js options, also set:
```typescript
maintainAspectRatio: false,   // lets the canvas fill exactly the wrapper div
responsive: true,
```

This combination — fixed-height wrapper + maintainAspectRatio:false +
overflow:hidden — guarantees the chart never escapes its container.

Also in the panel body:
```css
.panel-body {
  overflow: hidden;      /* belt-and-suspenders */
  position: relative;
}
```

---

## FIX 2 — AUTH: WRONG PASSWORD SHOWS "ACCESS GRANTED"

### This is a critical security/UX bug. The current handleLogin() runs
### the success animation regardless of whether NextAuth accepted the credentials.

### Correct implementation in /app/(auth)/login/page.tsx:

```typescript
'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting (client-side soft lock)
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      setErrorMsg(`Too many attempts. Try again in ${secs}s.`);
      setStatus('error');
      return;
    }

    // Validation
    if (!email.trim()) { setErrorMsg('Please enter your email address.'); setStatus('error'); return; }
    if (!password)     { setErrorMsg('Please enter your password.'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,   // CRITICAL: don't auto-redirect, check result first
    });

    if (result?.ok && !result?.error) {
      // ✅ ONLY show success when server confirms
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 800);
    } else {
      // ❌ Server rejected — show specific error
      setStatus('error');
      const newCount = errorCount + 1;
      setErrorCount(newCount);

      if (result?.error === 'CredentialsSignin') {
        if (newCount >= 5) {
          setLockedUntil(Date.now() + 30000);  // 30s soft lock
          setErrorMsg('Too many failed attempts. Please wait 30 seconds.');
        } else {
          setErrorMsg(`Incorrect email or password. ${5 - newCount} attempt${5 - newCount !== 1 ? 's' : ''} remaining.`);
        }
      } else if (result?.error === 'EmailNotFound') {
        setErrorMsg('No account found with this email address.');
      } else {
        setErrorMsg('Authentication failed. Please try again.');
      }
    }
  };
```

### Error banner UI — animated, dismissable:
```tsx
{status === 'error' && errorMsg && (
  <div
    style={{
      borderLeft: '3px solid #b5451b',
      background: 'rgba(181,69,27,0.08)',
      padding: '9px 12px',
      marginBottom: '14px',
      fontSize: '11px',
      fontFamily: 'Space Mono',
      color: '#b5451b',
      animation: 'errorShake 0.4s ease-out, errorFadeIn 0.25s ease-out',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <span>{errorMsg}</span>
    <button
      onClick={() => { setStatus('idle'); setErrorMsg(''); }}
      style={{ background: 'none', border: 'none', cursor: 'pointer',
               color: '#b5451b', fontFamily: 'Space Mono', fontSize: '13px' }}
    >
      ×
    </button>
  </div>
)}
```

CSS keyframes (add to globals.css):
```css
@keyframes errorShake {
  0%  { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100%{ transform: translateX(0); }
}
@keyframes errorFadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Button states:
```tsx
<button
  type="submit"
  disabled={status === 'loading' || (lockedUntil ? Date.now() < lockedUntil : false)}
  style={{
    /* ... existing styles ... */
    opacity: status === 'loading' ? 0.75 : 1,
    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
  }}
>
  {status === 'loading' ? (
    <>
      <span style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: '5px', height: '5px',
            background: '#f5f0e8',
            borderRadius: '50%',
            animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}/>
        ))}
      </span>
      Authenticating...
    </>
  ) : status === 'success' ? (
    <><span className="arr">✓</span> Access Granted — Redirecting</>
  ) : (
    <><span className="arr">→</span> Authenticate &amp; Enter Dashboard</>
  )}
</button>
```

CSS:
```css
@keyframes dotPulse {
  0%, 100% { transform: translateY(0);    opacity: 0.4; }
  50%       { transform: translateY(-4px); opacity: 1; }
}
```

---

## FIX 3 — SHARED AUTH LEFT PANEL COMPONENT

### Create /components/auth/AuthLeftPanel.tsx

This component is shared between login AND register pages.
Both pages import it. Zero duplication.

```typescript
interface AuthLeftPanelProps {
  variant: 'login' | 'register';
}

export default function AuthLeftPanel({ variant }: AuthLeftPanelProps) {
  // Count-up animation
  useEffect(() => {
    const el = document.getElementById('stat-pts');
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
  }, []);

  return (
    <div className={styles.left}>
      {/* Stars SVG — identical for both pages */}
      <StarField />

      {/* Earth SVG — identical for both pages */}
      <EarthWireframe />

      {/* Content */}
      <div className={styles.leftBody}>
        <div className={styles.logo}>
          <FaviconSVG size={20}/>
          <span>Genome</span>
        </div>

        <div className={styles.bottomContent}>
          {variant === 'login' ? (
            <h1 className={styles.headline}>
              40 years of<br/>
              climate data,<br/>
              <em>mapped.</em>
            </h1>
          ) : (
            <h1 className={styles.headline}>
              Map your world.<br/>
              Start tracking<br/>
              <em>climate now.</em>
            </h1>
          )}

          <p className={styles.subtext}>
            {variant === 'login'
              ? 'Historical weather analysis powered by Open-Meteo API. Visualise temperature, precipitation & extreme events across any location on Earth.'
              : 'Join researchers and analysts mapping 40 years of global climate patterns. Free, open, and powered by Open-Meteo.'}
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.sg}>
              <span className={styles.sv} id="stat-pts">0</span>
              <span className={styles.sl}>Data points</span>
            </div>
            <div className={styles.sg}>
              <span className={styles.sv}>40yr</span>
              <span className={styles.sl}>Coverage</span>
            </div>
            <div className={styles.sg}>
              <span className={styles.sv}>+2.1°</span>
              <span className={styles.sl}>Avg rise</span>
            </div>
            <div className={styles.sg}>
              <span className={styles.sv}>∞</span>
              <span className={styles.sl}>Locations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Extract EarthWireframe and StarField into their own sub-components:

`/components/auth/EarthWireframe.tsx` — contains the full Earth SVG
from prompt v3.2. No changes to the SVG itself.

`/components/auth/StarField.tsx` — contains the star SVG (the 20 twinkling dots).

`/components/auth/FaviconSVG.tsx` — the inline favicon SVG, accepts a `size` prop.

Both login and register pages:
```tsx
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';

// Login page:
<div className={styles.shell}>
  <AuthLeftPanel variant="login"/>
  <LoginForm/>
</div>

// Register page:
<div className={styles.shell}>
  <AuthLeftPanel variant="register"/>
  <RegisterForm/>
</div>
```

---

## FIX 4 — REGISTER PAGE FORM

### Keep register form exactly as-is but fix these details:

1. Remove the quirky left panel (headline, Earth, stats) — use AuthLeftPanel
2. Register form fields: Full Name, Email, Password, Confirm Password
3. Zod validation:
   - Name: min 2 chars
   - Email: valid format
   - Password: min 8 chars, at least 1 number
   - Confirm: must match password
4. On submit: POST /api/auth/register → auto signIn → redirect /dashboard
5. Same button loading/error/success states as login
6. Same error banner component (extract to /components/auth/ErrorBanner.tsx)
7. Error messages:
   - "Email already registered — sign in instead?"  (with link to /login)
   - "Passwords do not match."
   - "Password must be at least 8 characters."

---

## FIX 5 — FORGOT PASSWORD: FULL IMPLEMENTATION

### Step 1 — API route: /app/api/auth/forgot-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  await connectDB();

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  // Always return 200 — never reveal whether email exists (security)
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);  // 1 hour

  user.resetToken = token;
  user.resetTokenExpires = expires;
  await user.save();

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  await sendPasswordResetEmail({
    to: email,
    name: user.name,
    resetUrl,
  });

  return NextResponse.json({ ok: true });
}
```

### Step 2 — Reset password API: /app/api/auth/reset-password/route.ts

```typescript
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  await connectDB();

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() },  // not expired
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
```

### Step 3 — Reset password page: /app/(auth)/reset-password/[token]/page.tsx

```tsx
'use client';
export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setMsg('Passwords do not match.'); setStatus('error'); return; }
    if (password.length < 8)  { setMsg('Password must be at least 8 characters.'); setStatus('error'); return; }

    setStatus('loading');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, password }),
    });
    const data = await res.json();

    if (data.ok) {
      setStatus('success');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setStatus('error');
      setMsg(data.error || 'Reset failed. The link may have expired.');
    }
  };

  return (
    <div className={styles.shell}>
      <AuthLeftPanel variant="login"/>
      <div className={styles.right}>
        <div className={styles.rt}>
          <span className={styles.rtLabel}>Reset your password</span>
        </div>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontSize: '13px', fontFamily: 'Space Mono' }}>
              Password updated. Redirecting to login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <ErrorBanner message={msg} onDismiss={() => setMsg('')}/>
            <Field label="New password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"/>
            </Field>
            <Field label="Confirm password">
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••••••"/>
            </Field>
            <AuthButton status={status}>Set new password</AuthButton>
          </form>
        )}
      </div>
    </div>
  );
}
```

### Step 4 — "Forgot password?" modal on login page:

```tsx
const [forgotOpen, setForgotOpen] = useState(false);
const [forgotEmail, setForgotEmail] = useState('');
const [forgotStatus, setForgotStatus] = useState<'idle'|'loading'|'sent'>('idle');

const handleForgotSubmit = async () => {
  if (!forgotEmail.trim()) return;
  setForgotStatus('loading');
  await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: forgotEmail.trim() }),
  });
  setForgotStatus('sent');  // always show sent (don't reveal if email exists)
};
```

Modal markup (renders in normal flow with min-height container):
```tsx
{forgotOpen && (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'rgba(237,232,220,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
    animation: 'errorFadeIn 0.2s ease-out',
  }}>
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--ink)',
      padding: '28px 32px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '5px 5px 0 rgba(15,14,13,0.15)',
      animation: 'errorFadeIn 0.25s ease-out',
    }}>
      <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>Reset password</div>
      <div style={{ fontSize: '10.5px', color: 'var(--dim)', marginBottom: '18px', lineHeight: 1.7 }}>
        Enter your email address. If an account exists, you'll receive a reset link within a few minutes.
      </div>

      {forgotStatus === 'sent' ? (
        <div style={{ fontSize: '11px', borderLeft: '3px solid #2ecc71', padding: '8px 12px',
                      background: 'rgba(46,204,113,0.07)', color: '#1a7a40' }}>
          If that email is registered, a reset link has been sent. Check your inbox.
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder="user@genome.io"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()}
            style={{ width: '100%', border: '1px solid var(--ink)', background: 'var(--paper)',
                     color: 'var(--ink)', fontFamily: 'Space Mono', fontSize: '12px',
                     padding: '9px 11px', outline: 'none', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleForgotSubmit}
              disabled={forgotStatus === 'loading'}
              style={{ flex: 1, background: 'var(--ink)', color: 'var(--paper)',
                       border: 'none', fontFamily: 'Space Mono', fontSize: '10.5px',
                       textTransform: 'uppercase', letterSpacing: '.1em',
                       padding: '9px', cursor: 'pointer' }}
            >
              {forgotStatus === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
            <button
              onClick={() => { setForgotOpen(false); setForgotStatus('idle'); setForgotEmail(''); }}
              style={{ padding: '9px 14px', border: '1px solid var(--ink)', background: 'transparent',
                       fontFamily: 'Space Mono', fontSize: '10.5px', cursor: 'pointer', color: 'var(--ink)' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
```

Change the "Forgot password?" link:
```tsx
<span
  onClick={() => { setForgotOpen(true); setForgotEmail(email); }}  // pre-fill with typed email
  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--blue)', fontSize: '10px' }}
>
  Forgot password?
</span>
```

### Step 5 — User model update (/models/User.ts):

Add reset token fields to schema:
```typescript
const UserSchema = new Schema({
  // ... existing fields ...
  resetToken:        { type: String,  select: false },
  resetTokenExpires: { type: Date,    select: false },
});
```

### Step 6 — Email utility (/lib/email.ts):

Use Resend (recommended — simple, reliable, free tier):
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  to, name, resetUrl
}: { to: string; name: string; resetUrl: string }) {
  await resend.emails.send({
    from: 'Genome <noreply@genome.io>',
    to,
    subject: 'Reset your Genome password',
    html: `
      <div style="font-family: 'Courier New', monospace; max-width: 480px; color: #0f0e0d;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Genome</div>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the link below within 1 hour:</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#0f0e0d;color:#f5f0e8;
                  padding:10px 20px;text-decoration:none;font-size:13px;
                  margin:16px 0;letter-spacing:.05em;">
          Reset password →
        </a>
        <p style="color:#7a756e;font-size:11px;">
          If you didn't request this, ignore this email. Link expires in 1 hour.
        </p>
      </div>
    `,
  });
}
```

Add to .env.local:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Install: `npm install resend`

---

## FIX 6 — SIDEBAR MINI-GLOBE: Use Wireframe Earth

### Replace the flat oval SVG with a scaled wireframe Earth.

Create /components/ui/MiniEarth.tsx:

```tsx
interface MiniEarthProps {
  pins?: Array<{ lat: number; lng: number; color: string }>;
}

export default function MiniEarth({ pins = [] }: MiniEarthProps) {
  return (
    <div style={{ padding: '10px 13px 4px', borderBottom: '1px solid var(--ink)' }}>
      <svg viewBox="0 0 260 260" width="154" height="154" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="meg" cx="40%" cy="35%" r="62%">
            <stop offset="0%"   stopColor="#1a1814"/>
            <stop offset="55%"  stopColor="#111009"/>
            <stop offset="100%" stopColor="#080705"/>
          </radialGradient>
          <radialGradient id="meRim" cx="38%" cy="34%" r="64%">
            <stop offset="70%"  stopColor="transparent"/>
            <stop offset="92%"  stopColor="rgba(237,232,220,0.10)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <radialGradient id="meNight" cx="70%" cy="60%" r="44%">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.65)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <clipPath id="meClip">
            <circle cx="130" cy="130" r="96"/>
          </clipPath>
          <clipPath id="meFrontClip">
            <ellipse cx="130" cy="130" rx="128" ry="33"/>
          </clipPath>
          <path id="meOrbit" fill="none"
            d="M258,130 A128,30 0 1,1 2,130 A128,30 0 1,1 258,130"
            transform="rotate(-10,130,130)"/>
        </defs>

        {/* Back DNA ring */}
        <ellipse cx="130" cy="130" rx="128" ry="30" fill="none"
          stroke="rgba(237,232,220,0.10)" strokeWidth="1" strokeDasharray="8 6"
          transform="rotate(-10,130,130)">
          <animateTransform attributeName="transform" type="rotate"
            from="-10 130 130" to="350 130 130" dur="28s" repeatCount="indefinite"/>
        </ellipse>

        {/* Earth body */}
        <circle cx="130" cy="130" r="96" fill="url(#meg)"/>

        {/* Latitude lines (static) */}
        <g clipPath="url(#meClip)" fill="none"
           stroke="rgba(237,232,220,0.18)" strokeWidth="0.6">
          <ellipse cx="130" cy="130" rx="96" ry="30"/>
          <ellipse cx="130" cy="130" rx="96" ry="58"/>
          <line x1="34" y1="130" x2="226" y2="130"
            stroke="rgba(237,232,220,0.28)" strokeWidth="0.7"/>
        </g>

        {/* Longitude lines (rotating) */}
        <g clipPath="url(#meClip)" fill="none"
           stroke="rgba(237,232,220,0.18)" strokeWidth="0.6">
          <g>
            <animateTransform attributeName="transform" type="rotate"
              from="0 130 130" to="360 130 130" dur="28s" repeatCount="indefinite"/>
            <line x1="130" y1="34" x2="130" y2="226"/>
            <ellipse cx="130" cy="130" rx="34" ry="96"/>
            <ellipse cx="130" cy="130" rx="68" ry="96"/>
          </g>
        </g>

        {/* Continent strokes — simplified for small size */}
        <g clipPath="url(#meClip)" fill="rgba(237,232,220,0.03)"
           stroke="rgba(237,232,220,0.38)" strokeWidth="0.7" strokeLinejoin="round">
          <path d="M122 68Q131 64 138 71Q144 79 141 90Q137 99 130 101Q122 102 117 95Q111 87 115 77Z"/>
          <path d="M119 103Q130 99 137 107Q143 116 140 128Q137 140 129 144Q119 147 112 139Q104 129 107 117Z"/>
          <path d="M72 72Q81 66 88 73Q94 81 91 93Q88 103 81 106Q73 108 67 100Q60 91 63 80Z"/>
          <path d="M65 112Q74 107 81 115Q87 124 84 136Q81 147 73 150Q64 152 58 143Q51 132 55 120Z"/>
          <path d="M150 65Q163 59 172 68Q180 78 177 92Q174 104 165 108Q155 111 148 103Q140 93 143 79Z"/>
          <path d="M172 98Q182 92 190 101Q197 112 193 126Q189 138 180 142Q169 145 162 135Q155 124 159 110Z"/>
          <path d="M182 148Q192 142 198 151Q203 160 199 172Q194 182 186 184Q177 186 171 176Q165 165 169 153Z"/>
          <ellipse cx="76" cy="56" rx="13" ry="10" transform="rotate(-8,76,56)"/>
          <ellipse cx="130" cy="214" rx="35" ry="11" stroke="rgba(237,232,220,0.22)"/>
          <ellipse cx="130" cy="46"  rx="44" ry="15" stroke="rgba(237,232,220,0.22)"/>
        </g>

        {/* Overlays */}
        <circle cx="130" cy="130" r="96" fill="url(#meRim)"/>
        <circle cx="130" cy="130" r="96" fill="url(#meNight)"/>
        <circle cx="130" cy="130" r="96" fill="none"
          stroke="rgba(237,232,220,0.14)" strokeWidth="0.8"/>

        {/* Saved pin dots — projected lat/lng */}
        {pins.map((pin, i) => {
          // Project lat/lng to SVG circle
          // x = 130 + cos(lng_rad) * sin(lat_from_pole_rad) * 96
          // y = 130 - cos(lat_rad) * 96
          // Simple equirectangular for small display:
          const x = 130 + (pin.lng / 180) * 96;
          const y = 130 - (pin.lat / 90) * 96;
          // Only show if inside circle
          const dist = Math.sqrt((x-130)**2 + (y-130)**2);
          if (dist > 90) return null;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill={pin.color}/>
              <circle cx={x} cy={y} r="3" fill="none" stroke={pin.color} strokeWidth="0.8">
                <animate attributeName="r"       values="3;7;3"   dur="2.5s" repeatCount="indefinite" begin={`${i*0.7}s`}/>
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" begin={`${i*0.7}s`}/>
              </circle>
            </g>
          );
        })}

        {/* Front DNA ring */}
        <g clipPath="url(#meFrontClip)">
          <ellipse cx="130" cy="130" rx="128" ry="30" fill="none"
            stroke="rgba(237,232,220,0.50)" strokeWidth="1.2" strokeDasharray="8 6"
            transform="rotate(-10,130,130)">
            <animateTransform attributeName="transform" type="rotate"
              from="-10 130 130" to="350 130 130" dur="28s" repeatCount="indefinite"/>
          </ellipse>
        </g>

        {/* Orbiting dot */}
        <circle r="2" fill="rgba(237,232,220,0.65)">
          <animateMotion dur="28s" repeatCount="indefinite"><mpath href="#meOrbit"/></animateMotion>
        </circle>
      </svg>
    </div>
  );
}
```

In Sidebar.tsx, replace the existing mini-globe with:
```tsx
import MiniEarth from '@/components/ui/MiniEarth';

// Pass real saved pins with colors:
<MiniEarth pins={savedPins.map((p, i) => ({
  lat: p.lat,
  lng: p.lng,
  color: ['#b5451b', '#2259c7', '#7a756e'][i % 3],
}))}/>
```

When sidebar is collapsed (44px mode), hide MiniEarth:
```tsx
{!collapsed && <MiniEarth pins={...}/>}
```

---

## FIX 7 — FONT SIZE INCREASES (specific values)

Apply these in globals.css and component-level styles:

### globals.css:
```css
/* Increase base */
html { font-size: 13px; }

/* Login/Register specific */
.login-headline { font-size: 44px; }
.login-subtext  { font-size: 12px; }
.stats-val      { font-size: 22px; }
.stats-lbl      { font-size: 9.5px; }

/* Form elements */
.field-label    { font-size: 11px; }
.field input    { font-size: 13px; }
.btn-main       { font-size: 12px; }
.terminal .tl   { font-size: 11.5px; }
.sec-label      { font-size: 10.5px; }

/* Dashboard */
.panel-title    { font-size: 11.5px; }
.nav-item       { font-size: 12.5px; }
.stat-val       { font-size: 19px; }
.stat-lbl       { font-size: 10px; }
.bottom-bar     { font-size: 10.5px; }
.chart-legend   { font-size: 12px; }

/* Chart axis labels (in chartOptions): */
/* scales.x.ticks.font.size: 11 */
/* scales.y.ticks.font.size: 11 */
```

---

## FIX 8 — LOADING SKELETON FOR AUTH LEFT PANEL

The Earth and star field should appear immediately (they're SVG, no loading).
But add a `mounted` state check to prevent SSR hydration mismatch:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <div className={styles.left} style={{ background: '#09090f' }}/>;
```

---

## FIX 9 — SESSION HANDLING: Protect Dashboard Route

In /app/(dashboard)/layout.tsx:
```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <>{children}</>;
}
```

In /app/(auth)/login/page.tsx — redirect if already logged in:
```tsx
import { getServerSession } from 'next-auth';
// At top of component or as server component check:
const session = await getServerSession(authOptions);
if (session) redirect('/dashboard');
```

---

## ENV VARIABLES NEEDED

Add to .env.local:
```
RESEND_API_KEY=re_xxxxxxxxxxxx        # from resend.com (free tier: 3000 emails/mo)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/genome
```

Install new dependency:
```bash
npm install resend
```

---

## ANIMATION POLISH

### Login page entrance sequence (staggered):
```
0ms:   Left panel renders (Earth + stars already in DOM)
100ms: DNA ring starts rotating
300ms: Terminal line 1 fades in
950ms: Terminal line 2 fades in
1700ms: Terminal line 3 fades in + cursor starts blinking
800ms: Headline fades up
950ms: Subtext fades up
1100ms: Stats grid fades up
```

### Form interactions:
- Input focus: left border 1px → 3px accent, 150ms ease
- Button hover: arrow slides right 3px, 200ms ease
- Error banner: shake + fade-in simultaneously
- Success: button text swaps instantly, no delay (result is confirmed)
- Modal open: backdrop + card both fade+scale-up 200ms

### Dashboard page transitions:
```css
/* app/layout.tsx — wrap page content with: */
.page-enter {
  animation: pageEnter 0.3s ease-out both;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## ARCHITECTURE SUGGESTIONS

1. **Extract reusable auth form fields** into a `<Field>` component that accepts
   label, children (input), hint, error — reduces duplication across login/register/reset.

2. **Create /components/auth/AuthButton.tsx** — handles loading/success/error states
   with the spinner, so login, register, and reset forms all use the same button logic.

3. **Create /components/auth/ErrorBanner.tsx** — the shake-and-dismiss error strip,
   reused across all three auth forms.

4. **SWR for saved locations** — use `useSWR('/api/user/saved-locations')` so the
   sidebar auto-updates when a pin is saved without a full page refresh.

5. **API rate limiting** — add a simple rate limiter to /api/climate using
   `@upstash/ratelimit` or a simple in-memory Map with IP + timestamp.
   Prevents runaway API calls if a user hammers the fetch button.

6. **Add loading.tsx files** for each dashboard route segment — Next.js 14 shows
   these automatically while the page loads. Use the SkeletonLoader component.

7. **Toast library cleanup** — standardize on one pattern: success toasts slide in
   from bottom-right, error toasts shake in from top-center. Don't mix positions.

---

## VERIFICATION CHECKLIST

[ ] Chart never overlaps the legend or stats row below it
[ ] Wrong password → error banner (shakes, shows count), NO "Access Granted"
[ ] Correct password → loading dots → success → redirect to /dashboard
[ ] Login and register left panels are IDENTICAL (same Earth, stars, DNA ring)
[ ] Forgot password → modal opens, email pre-filled from form, sends email, shows confirmation
[ ] Reset password link in email works → loads /reset-password/[token] → accepts new password
[ ] Expired/invalid token → shows "This link has expired" message
[ ] Register → wrong confirm password → "Passwords do not match" error
[ ] Register → existing email → "Email already registered" with sign-in link
[ ] Sidebar mini-globe: shows wireframe Earth with rotating longitude lines + DNA ring
[ ] Saved pins appear as colored pulsing dots on mini-globe
[ ] When sidebar collapses, mini-globe hides
[ ] All auth pages redirect to /dashboard if already logged in
[ ] Dashboard redirects to /login if not logged in
[ ] Font sizes visibly larger than v3.2 across all pages
[ ] MiniEarth renders in sidebar at 154×154px (not the flat oval)
[ ] No TypeScript errors on build
[ ] npm run build completes without warnings
```