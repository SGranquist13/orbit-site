// Renders the favicon and apple-touch icon from media/brand/icon.png. Run: node scripts/make-assets.mjs
import sharp from "sharp";

await sharp("media/brand/icon.png").resize(180, 180).png().toFile("public/apple-touch-icon.png");
await sharp("media/brand/icon.png").resize(48, 48).png().toFile("public/favicon.png");
console.log("ok");
