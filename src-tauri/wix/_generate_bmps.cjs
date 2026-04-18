// Regenerates NSIS banner.bmp (493x58) and dialog.bmp (493x312)
// with Escribbo pencil mark + wordmark on an indigo gradient.
// Requires: sharp (installed as devDependency).
// Usage: node src-tauri/wix/_generate_bmps.cjs

const sharp = require("sharp");
const path = require("path");

const OUT_DIR = __dirname;

const GRADIENT_TOP = "#4F46E5";
const GRADIENT_BOT = "#818CF8";
const FG = "#FFFFFF";

function pencilSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd"
          d="M24 24V19L39 4L44 9L29 24H24Z"
          fill="#2F88FF" stroke="#0B1020" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 24H9C6.23858 24 4 26.2386 4 29C4 31.7614 6.23858 34 9 34H39C41.7614 34 44 36.2386 44 39C44 41.7614 41.7614 44 39 44H18"
          stroke="#0B1020" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

function dialogSvg(width, height) {
  const iconSize = Math.floor(height * 0.55);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${GRADIENT_TOP}"/>
        <stop offset="100%" stop-color="${GRADIENT_BOT}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <g transform="translate(${Math.floor(width / 2 - iconSize / 2)}, ${Math.floor(height * 0.18)})">
      ${pencilSvg(iconSize).replace(/<\/?svg[^>]*>/g, "")
        .replace('viewBox="0 0 48 48"', "")}
    </g>
    <text x="${width / 2}" y="${Math.floor(height * 0.85)}"
          text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
          font-size="${Math.floor(height * 0.12)}" font-weight="700" fill="${FG}"
          letter-spacing="2">
      Escribbo
    </text>
  </svg>`;
}

function bannerSvg(width, height) {
  const iconSize = height - 12;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${GRADIENT_TOP}"/>
        <stop offset="100%" stop-color="${GRADIENT_BOT}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <g transform="translate(12, ${Math.floor((height - iconSize) / 2)})">
      ${pencilSvg(iconSize).replace(/<\/?svg[^>]*>/g, "")
        .replace('viewBox="0 0 48 48"', "")}
    </g>
    <text x="${iconSize + 28}" y="${Math.floor(height * 0.68)}"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="${Math.floor(height * 0.55)}" font-weight="700" fill="${FG}"
          letter-spacing="2">
      Escribbo
    </text>
  </svg>`;
}

async function renderBmp(svgStr, outFile, targetWidth, targetHeight) {
  const buf = await sharp(Buffer.from(svgStr), { density: 144 })
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .flatten({ background: GRADIENT_TOP })
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Fallback: use sharp's built-in bmp? sharp lacks BMP output, so write via manual 24-bit encoder.
  const { data, info } = buf;
  writeBmp24(outFile, info.width, info.height, data, info.channels);
}

function writeBmp24(filePath, width, height, pixels, channels) {
  const fs = require("fs");
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = Buffer.alloc(fileSize);
  buf.write("BM", 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixelArraySize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);

  let p = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      buf[p++] = b;
      buf[p++] = g;
      buf[p++] = r;
    }
    const padding = rowSize - width * 3;
    for (let k = 0; k < padding; k++) buf[p++] = 0;
  }
  fs.writeFileSync(filePath, buf);
}

(async () => {
  await renderBmp(bannerSvg(493, 58), path.join(OUT_DIR, "banner.bmp"), 493, 58);
  console.log("wrote: banner.bmp (493x58)");
  await renderBmp(dialogSvg(493, 312), path.join(OUT_DIR, "dialog.bmp"), 493, 312);
  console.log("wrote: dialog.bmp (493x312)");
})();
