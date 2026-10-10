import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Recursive Bayer matrix, values 0..n*n-1. */
function bayer(n: number): number[][] {
  if (n === 2) return [[0, 2], [3, 1]];
  const half = n / 2;
  const h = bayer(half);
  const m: number[][] = [];
  for (let y = 0; y < n; y++) {
    m.push([]);
    for (let x = 0; x < n; x++) {
      const base = h[y % half][x % half] * 4;
      const q = y < half ? (x < half ? 0 : 2) : x < half ? 3 : 1;
      m[y].push(base + q);
    }
  }
  return m;
}
export const BAYER8 = bayer(8);

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** Radial glow rendered as a 1-bit Bayer 8x8 field, in line-strong..dim greys. */
function paintField(canvas: HTMLCanvasElement) {
  const cell = Number(canvas.dataset.cell || 3);
  const strength = Number(canvas.dataset.strength || 0.9) * (window.innerWidth < 640 ? 0.5 : 1);
  const power = Number(canvas.dataset.power || 1.6);
  const w = Math.max(1, Math.ceil(canvas.clientWidth / cell));
  const h = Math.max(1, Math.ceil(canvas.clientHeight / cell));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(w, h);
  const lo = hex(cssVar("--line-strong", "#34343b"));
  const hi = hex(cssVar(canvas.dataset.hi === "dim" ? "--dim" : "--mute", "#63636c"));
  const horizon = canvas.dataset.variant === "horizon";
  // Horizon: a large circle whose rim rises from the bottom. Bright limb, atmosphere above, dim surface below.
  const R = w * 0.95;
  const cx = w / 2;
  const cy = h * 0.42 + R;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v: number;
      if (horizon) {
        const d = Math.hypot(x - cx, y - cy) - R; // <0 inside the planet
        const edge = Math.min(1, Math.max(0, 1 - Math.abs(x / w - 0.5) * 2) * 3);
        v = d > 0 ? 0.85 * Math.exp(-d / (h * 0.09)) : 0.95 * Math.exp(-(-d) / (h * 0.012)) * 0.9 + 0.38 * Math.exp(-(-d) / (h * 0.3));
        v *= strength * edge * Math.min(1, (h - y) / (h * 0.2));
      } else {
        const nx = (x / w - 0.5) * 2;
        const ny = (y / h - 0.5) * 2;
        const d = Math.sqrt(nx * nx + ny * ny);
        v = Math.pow(Math.max(0, 1 - d), power) * strength;
      }
      if (v <= (BAYER8[y & 7][x & 7] + 0.5) / 64) continue;
      const k = (y * w + x) * 4;
      const t = Math.min(1, v);
      img.data[k] = lo[0] + (hi[0] - lo[0]) * t;
      img.data[k + 1] = lo[1] + (hi[1] - lo[1]) * t;
      img.data[k + 2] = lo[2] + (hi[2] - lo[2]) * t;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function initDitherFields() {
  document.querySelectorAll<HTMLCanvasElement>("canvas[data-dither-field]").forEach((c) => {
    let raf = 0;
    let lastW = 0;
    const ro = new ResizeObserver(() => {
      if (c.clientWidth === lastW) return;
      lastW = c.clientWidth;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => paintField(c));
    });
    ro.observe(c);
  });
}

/** Threshold-mask reveal: an overlay of --bg cells is removed in Bayer order. */
export function initDitherReveals(reduced: boolean) {
  document.querySelectorAll<HTMLElement>("[data-dither-reveal]").forEach((host) => {
    if (reduced) {
      host.setAttribute("data-ready", "");
      return;
    }
    const cell = Number(host.dataset.cell || 4);
    const delay = Number(host.dataset.delay || 0);
    const canvas = document.createElement("canvas");
    canvas.className = "dither-reveal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const w = Math.max(1, Math.ceil(host.clientWidth / cell));
    const h = Math.max(1, Math.ceil(host.clientHeight / cell));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const [r, g, b] = hex(cssVar("--bg", "#050506"));
    const draw = (p: number) => {
      const limit = p * 64;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const k = (y * w + x) * 4;
          img.data[k] = r;
          img.data[k + 1] = g;
          img.data[k + 2] = b;
          img.data[k + 3] = BAYER8[y & 7][x & 7] < limit ? 0 : 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    draw(0);
    host.setAttribute("data-ready", "");

    const state = { p: 0 };
    const run = () =>
      gsap.to(state, {
        p: 1,
        duration: 0.7,
        delay,
        ease: "power1.inOut",
        onUpdate: () => draw(state.p),
        onComplete: () => canvas.remove(),
      });
    if (host.dataset.trigger === "load") run();
    else ScrollTrigger.create({ trigger: host, start: "top 85%", once: true, onEnter: run });
  });
}
