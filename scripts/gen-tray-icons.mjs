// Generates tray PNG set from the Escribbo pencil mark.
// Output: src-tauri/resources/tray_{idle,recording,transcribing}{,_dark,_colored}.png (all 64x64)
// Run: bun run scripts/gen-tray-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../src-tauri/resources");
mkdirSync(outDir, { recursive: true });

const SIZE = 64;

function svg({ strokeColor, pencilFill, state }) {
  const recordingDot =
    state === "recording"
      ? `<circle cx="40" cy="8" r="7" fill="#E53935" stroke="${strokeColor}" stroke-width="2"/>`
      : "";
  const transcribingDots =
    state === "transcribing"
      ? `<g fill="${strokeColor}">
           <circle cx="14" cy="44" r="2.2"/>
           <circle cx="22" cy="44" r="2.2"/>
           <circle cx="30" cy="44" r="2.2"/>
         </g>`
      : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd"
        d="M24 24V19L39 4L44 9L29 24H24Z"
        fill="${pencilFill}" stroke="${strokeColor}" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 24H9C6.23858 24 4 26.2386 4 29C4 31.7614 6.23858 34 9 34H39C41.7614 34 44 36.2386 44 39C44 41.7614 41.7614 44 39 44H18"
        stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  ${recordingDot}
  ${transcribingDots}
</svg>`;
}

const variants = [
  // mono white (system dark theme)
  { state: "idle", strokeColor: "#FFFFFF", pencilFill: "#FFFFFF", file: "tray_idle.png" },
  { state: "recording", strokeColor: "#FFFFFF", pencilFill: "#FFFFFF", file: "tray_recording.png" },
  { state: "transcribing", strokeColor: "#FFFFFF", pencilFill: "#FFFFFF", file: "tray_transcribing.png" },
  // mono black (system light theme)
  { state: "idle", strokeColor: "#000000", pencilFill: "#000000", file: "tray_idle_dark.png" },
  { state: "recording", strokeColor: "#000000", pencilFill: "#000000", file: "tray_recording_dark.png" },
  { state: "transcribing", strokeColor: "#000000", pencilFill: "#000000", file: "tray_transcribing_dark.png" },
  // colored (Linux)
  { state: "idle", strokeColor: "#000000", pencilFill: "#2F88FF", file: "tray_idle_colored.png" },
  { state: "recording", strokeColor: "#000000", pencilFill: "#2F88FF", file: "tray_recording_colored.png" },
  { state: "transcribing", strokeColor: "#000000", pencilFill: "#2F88FF", file: "tray_transcribing_colored.png" },
];

const legacy = ["handy.png", "recording.png", "transcribing.png"];
for (const name of legacy) {
  const p = resolve(outDir, name);
  if (existsSync(p)) {
    unlinkSync(p);
    console.log("removed legacy:", name);
  }
}

for (const v of variants) {
  const buf = Buffer.from(svg(v));
  const out = resolve(outDir, v.file);
  await sharp(buf, { density: 384 })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log("wrote:", v.file);
}
