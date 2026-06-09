/**
 * Generates all PNG app assets from icon.svg using @resvg/resvg-js.
 *
 * Outputs:
 *   assets/icon.png                   1024×1024  — iOS icon, Android fallback
 *   assets/splash-icon.png            1024×1024  — Expo splash screen
 *   assets/favicon.png                  48×48    — Web favicon
 *   assets/android-icon-foreground.png 1024×1024 — Adaptive icon foreground (66% safe zone)
 *   assets/android-icon-background.png 1024×1024 — Solid #1B4332 background
 *   assets/android-icon-monochrome.png 1024×1024 — Android 13+ themed icon (white on transparent)
 */

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const iconSvg = fs.readFileSync(path.join(assetsDir, 'icon.svg'), 'utf8');

function renderSvg(svgString, targetWidth, outFile) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: targetWidth },
  });
  const png = resvg.render().asPng();
  const outPath = path.join(assetsDir, outFile);
  fs.writeFileSync(outPath, png);
  const { width, height } = resvg.innerBBox() || { width: targetWidth, height: targetWidth };
  console.log(`  ✓  ${outFile.padEnd(34)} ${targetWidth}px`);
}

// 1 + 2. Main icon and splash (identical source, full-bleed at 1024)
renderSvg(iconSvg, 1024, 'icon.png');
renderSvg(iconSvg, 1024, 'splash-icon.png');

// 3. Favicon — 48px is the de-facto web standard
renderSvg(iconSvg, 48, 'favicon.png');

// 4. Adaptive icon foreground — icon shrunk to fit the 66% safe zone.
//    Expanding the viewBox by 174px on all sides makes the artwork occupy
//    676/1024 ≈ 66% of the output, so it's never clipped by any launcher shape.
const SAFE_PAD = 174;
const fgSvg = iconSvg.replace(
  'viewBox="0 0 1024 1024"',
  `viewBox="${-SAFE_PAD} ${-SAFE_PAD} ${1024 + SAFE_PAD * 2} ${1024 + SAFE_PAD * 2}"`
);
renderSvg(fgSvg, 1024, 'android-icon-foreground.png');

// 5. Adaptive icon background — solid dark-forest square, matches app.json backgroundColor.
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#1B4332"/>
</svg>`;
renderSvg(bgSvg, 1024, 'android-icon-background.png');

// 6. Monochrome icon — white artwork on transparent background for Android 13+ theming.
//    Expanded viewBox keeps art within the safe zone (same 66% rule).
const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${-SAFE_PAD} ${-SAFE_PAD} ${1024 + SAFE_PAD * 2} ${1024 + SAFE_PAD * 2}"
  width="1024" height="1024">

  <g transform="translate(512, 512)">
    <path d="M -214.5,-179.8 A 280,280 0 0,1 214.5,-179.8"
          fill="none" stroke="white" stroke-width="56" stroke-linecap="round"/>
    <polygon points="214.5,-179.8 146.2,-217.3 189.3,-253.7" fill="white"/>

    <g transform="rotate(120)">
      <path d="M -214.5,-179.8 A 280,280 0 0,1 214.5,-179.8"
            fill="none" stroke="white" stroke-width="56" stroke-linecap="round"/>
      <polygon points="214.5,-179.8 146.2,-217.3 189.3,-253.7" fill="white"/>
    </g>

    <g transform="rotate(240)">
      <path d="M -214.5,-179.8 A 280,280 0 0,1 214.5,-179.8"
            fill="none" stroke="white" stroke-width="56" stroke-linecap="round"/>
      <polygon points="214.5,-179.8 146.2,-217.3 189.3,-253.7" fill="white"/>
    </g>
  </g>

  <path d="M512,411 C579,411 613,484 574,551 C540,618 422,602 422,523 C422,434 467,411 512,411 Z"
        fill="white" opacity="0.92"/>
  <line x1="512" y1="411" x2="501" y2="590"
        stroke="white" stroke-width="11" stroke-linecap="round"/>
  <circle cx="575" cy="417" r="28" fill="white" opacity="0.85"/>
</svg>`;
renderSvg(monoSvg, 1024, 'android-icon-monochrome.png');

console.log('\nAll assets generated successfully.');
