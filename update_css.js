const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Font size bumps
css = css.replace(/(\.tb-coords\s*{[^}]*font-size:\s*)9\.5px/g, '$111px');
css = css.replace(/(\.tb-btn\s*{[^}]*font-size:\s*)9px/g, '$110px');
css = css.replace(/(\.sb-toggle-label\s*{[^}]*font-size:\s*)9px/g, '$110px');
css = css.replace(/(\.sb-label\s*{[^}]*font-size:\s*)8\.5px/g, '$110px');
css = css.replace(/(\.nav-lbl\s*{[^}]*font-size:\s*)10px/g, '$112px');
css = css.replace(/(\.ph-title\s*{[^}]*font-size:\s*)21px/g, '$126px');
css = css.replace(/(\.ph-sub\s*{[^}]*font-size:\s*)9px/g, '$110.5px');
css = css.replace(/(\.ptitle\s*{[^}]*font-size:\s*)9\.5px/g, '$111px');
css = css.replace(/(\.ptag\s*{[^}]*font-size:\s*)8px/g, '$19px');
css = css.replace(/(\.sv\s*{[^}]*font-size:\s*)15px/g, '$117px');
css = css.replace(/(\.sl\s*{[^}]*font-size:\s*)8px/g, '$110px');
css = css.replace(/(\.mc-btn\s*{[^}]*font-size:\s*)8\.5px/g, '$110px');
css = css.replace(/(\.map-infobar\s*{[^}]*font-size:\s*)8\.5px/g, '$110px');
css = css.replace(/(\.mp-lbl\s*{[^}]*font-size:\s*)8px/g, '$19px');
css = css.replace(/(\.field-input\s*{[^}]*font-size:\s*)10px/g, '$112px');
css = css.replace(/(\.field-label\s*{[^}]*font-size:\s*)9px/g, '$110px');
css = css.replace(/(\.btn-primary\s*{[^}]*font-size:\s*)10px/g, '$111px');
css = css.replace(/(\.city-inp\s*{[^}]*font-size:\s*)9\.5px/g, '$111px');
css = css.replace(/(\.btn-calc\s*{[^}]*font-size:\s*)9\.5px/g, '$111px');
css = css.replace(/(\.bbar\s*{[^}]*font-size:\s*)8\.5px/g, '$110px');
css = css.replace(/(\.exp-table\s*{[^}]*font-size:\s*)8\.5px/g, '$110px');
css = css.replace(/(\.exp-btn\s*{[^}]*font-size:\s*)9px/g, '$110px');

// Leaflet override
css = css.replace(/\.leaflet-tile \{ filter: sepia\(0\.15\) contrast\(0\.95\); \}/g, '.leaflet-tile { filter: sepia(0.2) contrast(0.92) brightness(0.97) saturate(0.85); }\nhtml.dark .leaflet-tile { filter: invert(1) hue-rotate(180deg) sepia(0.1) contrast(0.88) brightness(0.85); }');

// Map perspective classes
if (!css.includes('.map-perspective-wrapper')) {
    css += `
/* ─── MAP 3D PERSPECTIVE ─────────────────────────────────── */
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
  position: relative;
}
.map-tilt-inner:hover {
  transform: rotateX(4deg) scale(1.06); /* flattens slightly on hover */
}
.map-tilt-inner::after {
  content: '';
  position: absolute;
  bottom: -12px; left: 10%; right: 10%;
  height: 12px;
  background: radial-gradient(ellipse, rgba(15,14,13,0.25) 0%, transparent 70%);
  pointer-events: none;
}
`;
}

// Add focus accent style to fields
if (!css.includes('.field-input:focus { border-color: var(--accent); border-width: 1.5px; border-left-width: 3px; padding-left: 8px; }')) {
    css = css.replace(/\.field-input:focus \{[^}]*}/g, '.field-input:focus { border-color: var(--accent); border-width: 1.5px; border-left-width: 3px; padding-left: 8px; }');
}

// Button arrow hover
if (!css.includes('.btn-signin .btn-arrow')) {
    css += `
.btn-primary .btn-arrow { transition: transform 0.2s ease; }
.btn-primary:hover .btn-arrow { transform: translateX(4px); }
`;
}

fs.writeFileSync('src/app/globals.css', css);
console.log('CSS updated successfully');
