"use client";

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
          const x = 130 + (pin.lng / 180) * 96;
          const y = 130 - (pin.lat / 90) * 96;
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
