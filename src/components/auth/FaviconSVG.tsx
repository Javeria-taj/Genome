"use client";

export default function FaviconSVG({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="fg" cx="35%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#2c8fb5"/>
          <stop offset="70%" stopColor="#0e4d68"/>
          <stop offset="100%" stopColor="#072d3f"/>
        </radialGradient>
        <clipPath id="fc"><circle cx="16" cy="16" r="11" transform="rotate(-23.5,16,16)"/></clipPath>
      </defs>
      <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(200,160,60,0.38)" strokeWidth="1.2" strokeDasharray="5 3" transform="rotate(-20,16,16)"/>
      <circle cx="16" cy="16" r="11" fill="url(#fg)" transform="rotate(-23.5,16,16)"/>
      <g clipPath="url(#fc)" stroke="none" fill="rgba(52,130,78,0.72)">
        <ellipse cx="12" cy="13" rx="4" ry="3" transform="rotate(-10,12,13)"/>
        <ellipse cx="20" cy="18" rx="3.5" ry="4" transform="rotate(8,20,18)"/>
        <ellipse cx="10" cy="20" rx="2.2" ry="2"/>
      </g>
      <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.3)" strokeWidth="2.5" transform="rotate(-23.5,16,16)"/>
      <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(100,190,230,0.08)" strokeWidth="5" transform="rotate(-23.5,16,16)"/>
      <ellipse cx="16" cy="16" rx="13.5" ry="13" fill="none" stroke="rgba(212,168,60,0.9)" strokeWidth="1.8" strokeDasharray="5 3" transform="rotate(-20,16,16)" clipPath="url(#fc)"/>
    </svg>
  );
}
