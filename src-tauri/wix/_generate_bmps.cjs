// One-off helper to generate WixUI banner.bmp (493x58) and dialog.bmp (493x312)
// in 24-bit BMP format with an indigo gradient and "Escribbo" wordmark.
// Usage: node _generate_bmps.js

const fs = require("fs");
const path = require("path");

// --- Tiny 5x7 bitmap font (A-Z, lowercase via uppercase, space) ---
const FONT = {
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Colors (RGB)
const TOP = [79, 70, 229]; // #4f46e5
const BOT = [129, 140, 248]; // #818cf8
const WHITE = [255, 255, 255];

function writeBMP(filename, width, height, pixelFn) {
  // Row is padded to multiple of 4 bytes (24-bit = 3 bytes per pixel).
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buf = Buffer.alloc(fileSize);
  // BITMAPFILEHEADER
  buf.write("BM", 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);
  // BITMAPINFOHEADER
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22); // positive => bottom-up
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30); // BI_RGB
  buf.writeUInt32LE(pixelArraySize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);

  // Pixel data: bottom-up row order, BGR
  for (let y = 0; y < height; y++) {
    const rowStart = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      const p = rowStart + x * 3;
      buf[p] = b;
      buf[p + 1] = g;
      buf[p + 2] = r;
    }
  }
  fs.writeFileSync(filename, buf);
  console.log(`wrote ${filename} (${width}x${height}, ${fileSize} bytes)`);
}

// Rasterize "Escribbo" into a Set of "on" pixels at a given scale and top-left.
function wordmarkPixels(text, scale, originX, originY, tracking = 1) {
  const on = [];
  let cx = originX;
  const charW = 5;
  const charH = 7;
  for (const ch of text) {
    const glyph = FONT[ch.toUpperCase()] || FONT[" "];
    for (let gy = 0; gy < charH; gy++) {
      for (let gx = 0; gx < charW; gx++) {
        if (glyph[gy][gx] === "1") {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              on.push([cx + gx * scale + sx, originY + gy * scale + sy]);
            }
          }
        }
      }
    }
    cx += (charW + tracking) * scale;
  }
  return new Set(on.map(([x, y]) => `${x},${y}`));
}

function gradientColor(y, height) {
  const t = y / Math.max(1, height - 1);
  return [lerp(TOP[0], BOT[0], t), lerp(TOP[1], BOT[1], t), lerp(TOP[2], BOT[2], t)];
}

// --- banner.bmp: 493x58, horizontal layout. Wordmark on left. ---
(function banner() {
  const W = 493, H = 58;
  const text = "Escribbo";
  const scale = 4; // glyph height 28px
  const wordW = (5 * text.length + (text.length - 1) * 1) * scale;
  const wordH = 7 * scale;
  const ox = 24;
  const oy = Math.floor((H - wordH) / 2);
  const on = wordmarkPixels(text, scale, ox, oy);
  writeBMP(path.join(__dirname, "banner.bmp"), W, H, (x, y) => {
    if (on.has(`${x},${y}`)) return WHITE;
    return gradientColor(y, H);
  });
})();

// --- dialog.bmp: 493x312, sidebar. Wordmark centered horizontally near top. ---
(function dialog() {
  const W = 493, H = 312;
  const text = "Escribbo";
  const scale = 6; // glyph height 42px
  const wordW = (5 * text.length + (text.length - 1) * 1) * scale;
  const wordH = 7 * scale;
  const ox = Math.floor((W - wordW) / 2);
  const oy = 64;
  const on = wordmarkPixels(text, scale, ox, oy);

  // Subtle "cursor writing" underline: a horizontal bar + small caret.
  const barY1 = oy + wordH + 24;
  const barY2 = barY1 + 4;
  const barX1 = ox;
  const barX2 = ox + wordW;
  const caretX1 = barX2 + 8;
  const caretX2 = caretX1 + 4;
  const caretY1 = barY1 - 14;
  const caretY2 = barY2 + 14;

  writeBMP(path.join(__dirname, "dialog.bmp"), W, H, (x, y) => {
    if (on.has(`${x},${y}`)) return WHITE;
    if (x >= barX1 && x <= barX2 && y >= barY1 && y <= barY2) return WHITE;
    if (x >= caretX1 && x <= caretX2 && y >= caretY1 && y <= caretY2) return WHITE;
    return gradientColor(y, H);
  });
})();
