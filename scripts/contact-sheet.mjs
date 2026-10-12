// QA helper: labeled contact sheet of captured screenshots. Usage: node scripts/contact-sheet.mjs <glob-prefix> <out.png> [cols]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [prefix, out, cols = "3"] = process.argv.slice(2);
const dir = path.dirname(prefix), base = path.basename(prefix);
const files = fs.readdirSync(dir).filter((f) => f.startsWith(base) && f.endsWith(".png")).sort();
const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;width:${cols * 700}px">${files
  .map((f) => `<figure style="margin:0;position:relative"><img src="${pathToFileURL(path.resolve(dir, f)).href}" style="width:100%;display:block"><figcaption style="position:absolute;top:4px;left:4px;background:#000c;color:#ff0;font:bold 18px sans-serif;padding:2px 6px">${f.replace(base, "").replace(".png", "")}</figcaption></figure>`)
  .join("")}</body>`;
const tmp = path.resolve(process.env.TEMP ?? ".", "sheet.html"); fs.writeFileSync(tmp, html);
const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: cols * 700 + 12, height: 800 } });
await p.goto(pathToFileURL(tmp).href); await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: true }); await b.close(); console.log(files.length, "->", out);
