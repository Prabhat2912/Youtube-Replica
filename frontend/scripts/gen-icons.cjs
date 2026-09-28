// Renders the PlayTube mark to PWA icon PNGs.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUB = path.join(__dirname, "..", "public");

const mark = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0" stop-color="#FFB800"/>
      <stop offset="1" stop-color="#FF4D2E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#0C0A09"/>
  <g transform="translate(${pad},${pad})">
    <rect width="${512 - pad * 2}" height="${512 - pad * 2}" rx="150" fill="url(#g)"/>
    <g transform="translate(${(512 - pad * 2) / 2},${(512 - pad * 2) / 2}) scale(${(512 - pad * 2) / 48}) translate(-24,-24)">
      <path d="M17 16.5v15l13-7.5-13-7.5Z" fill="#0C0A09"/>
      <path d="M31 15a13 13 0 0 1 0 18" stroke="#FFF7ED" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
  </g>
</svg>`;

async function main() {
  const jobs = [
    ["pwa-192.png", 192, 0],
    ["pwa-512.png", 512, 0],
    ["maskable-512.png", 512, 56],
    ["apple-touch-icon.png", 180, 0],
  ];
  for (const [file, size, pad] of jobs) {
    // eslint-disable-next-line no-await-in-loop
    await sharp(Buffer.from(mark(pad))).resize(size, size).png().toFile(path.join(PUB, file));
    console.log("wrote", file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
