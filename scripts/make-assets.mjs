// Pre-crops real UI details (source px, 2560x1600 captures) and renders icons. Run: node scripts/make-assets.mjs
import sharp from "sharp";

const crops = [
  // [out, source, left, top, width, height]
  ["context", "orbit-dark-workspace", 1380, 1400, 1000, 190],
  ["session", "orbit-dark-workspace", 640, 740, 960, 190],
  ["sync", "orbit-dark-inbox", 650, 585, 1700, 150],
];
for (const [out, src, left, top, width, height] of crops) {
  await sharp(`media/raw/${src}.png`).extract({ left, top, width, height }).png().toFile(`src/assets/crops/${out}.png`);
}
await sharp("media/brand/icon.png").resize(180, 180).png().toFile("public/apple-touch-icon.png");
await sharp("media/brand/icon.png").resize(48, 48).png().toFile("public/favicon.png");
console.log("ok");
