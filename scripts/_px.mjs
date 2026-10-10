import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4321", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
console.log(await p.evaluate(() => { const e=document.querySelector(".eyebrow"); const c=getComputedStyle(e); return [c.color,c.opacity,c.fontSmooth]; }));
await p.screenshot({ path: "media/qa/eyebrow.png", clip: { x: 590, y: 135, width: 260, height: 30 } });
await b.close();
