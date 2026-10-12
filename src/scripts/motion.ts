import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initDitherFields, initDitherReveals } from "./dither";
import { initOrbits } from "./orbit";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Nav: transparent at the top, blurred bar after 40px. */
const nav = document.querySelector<HTMLElement>("[data-nav]");
const onScroll = () => nav?.toggleAttribute("data-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Videos: play only while visible. Reduced motion keeps the poster. */
if (!reduced && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    },
    { threshold: 0.2 },
  );
  document.querySelectorAll<HTMLVideoElement>("video[data-lazy-video]").forEach((v) => io.observe(v));
}

initDitherFields();
initOrbits(reduced);
initDitherReveals(reduced);

let lenis: Lenis | null = null;

if (!reduced) {
  /* 1. Lenis, wired to ScrollTrigger. */
  lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 } });
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const l = lenis;
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* 2. Hero load: eyebrow, H1 lines, lead, CTAs. */
  gsap.fromTo(
    gsap.utils.toArray<HTMLElement>("[data-hero-in]"),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
  );

  /* 3. Product window settles flat as it reaches the viewport centre. */
  const win = document.querySelector<HTMLElement>("[data-hero-window]");
  if (win) {
    gsap.fromTo(
      win,
      { scale: 0.9, rotateX: 14, y: 60, transformOrigin: "50% 100%" },
      {
        scale: 1,
        rotateX: 0,
        y: 0,
        ease: "none",
        scrollTrigger: { trigger: win, start: "top 95%", end: "center center", scrub: 0.6 },
      },
    );
    const phone = document.querySelector<HTMLElement>("[data-hero-phone]");
    if (phone) {
      gsap.fromTo(
        phone,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: win, start: "top 70%", end: "center center", scrub: 0.6 },
        },
      );
    }
  }

  /* Dither field parallax at 0.5x (moves at half the scroll speed). */
  const hero = document.querySelector<HTMLElement>("#hero");
  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 0 },
      {
        y: () => window.innerHeight * 1.2 * Number(el.dataset.parallax || 0.5),
        ease: "none",
        scrollTrigger: {
          trigger: hero ?? el,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.2,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  /* Hero exit: the copy lags the scroll (0.85x screen speed, i.e. +0.15 x scroll, capped at 40px) and fades to 0.2 over 60vh. */
  const heroCopy = document.querySelector<HTMLElement>(".hero-copy");
  if (heroCopy && hero) {
    gsap.fromTo(
      heroCopy,
      { y: 0 },
      { y: 40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + 40 / 0.15, scrub: 0.6, invalidateOnRefresh: true } },
    );
    gsap.fromTo(
      heroCopy,
      { opacity: 1 },
      { opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + window.innerHeight * 0.6, scrub: 0.6, invalidateOnRefresh: true } },
    );
  }

  /* 4. Statement: words go line-strong -> fg while crossing 70% -> 40% of the viewport. */
  document.querySelectorAll<HTMLElement>("[data-statement]").forEach((el) => {
    const words = el.querySelectorAll<HTMLElement>(".word");
    gsap
      .timeline({
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 40%", scrub: 0.6 },
      })
      .fromTo(words, { color: "#34343b" }, { color: "#ececef", ease: "none", stagger: 1, duration: 1 });
  });
}

/* 5. Features: pinned story on desktop; click-to-switch when not pinned. */
const features = document.querySelector<HTMLElement>("[data-features]");
if (features) {
  const items = [...features.querySelectorAll<HTMLElement>("[data-feat-item]")];
  const slides = [...features.querySelectorAll<HTMLElement>("[data-feat-slide]")];
  const count = features.querySelector<HTMLElement>("[data-feat-count]");
  const pin = features.querySelector<HTMLElement>("[data-feat-pin]")!;
  const steps = items.length;
  let current = -1;
  const activate = (step: number) => {
    if (step === current) return;
    current = step;
    items.forEach((el, i) => el.toggleAttribute("data-active", i === step));
    slides.forEach((el, k) => el.toggleAttribute("data-active", k === step));
    if (count) count.textContent = String(step + 1).padStart(2, "0");
  };

  let trigger: ScrollTrigger | null = null;
  const mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { desktop, ok } = ctx.conditions as { desktop: boolean; ok: boolean };
    if (!desktop || !ok) return;
    trigger = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => "+=" + window.innerHeight * 0.8 * steps,
      pin: true,
      onUpdate: (self) => activate(Math.min(steps - 1, Math.floor(self.progress * steps))),
    });
    // No zoom or pan on the screenshots: they are full app windows, and any crop cuts off the app's own chrome.
    return () => {
      trigger = null;
    };
  });

  items.forEach((el, i) => {
    el.querySelector<HTMLElement>("[data-feat-head]")?.addEventListener("click", () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      if (trigger) {
        const y = trigger.start + ((i + 0.5) / steps) * (trigger.end - trigger.start);
        if (lenis) lenis.scrollTo(y, { duration: 1.2 });
        else window.scrollTo({ top: y });
      } else activate(i);
    });
  });
}

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* Why Orbit: as each row crosses the middle of the viewport, the usual way fades back
   (its red pixel greys out) and Orbit's side comes forward (its pixel turns green). Scrubbed. */
document.querySelectorAll<HTMLElement>("[data-why-row]").forEach((row) => {
  if (reduced) return;
  const st = { trigger: row, start: "top 82%", end: "top 48%", scrub: 0.6 };
  const before = row.querySelector(".why-before");
  const after = row.querySelector(".why-after");
  const pxB = row.querySelector(".px-before");
  const pxA = row.querySelector(".px-after");
  if (before) gsap.fromTo(before, { opacity: 1 }, { opacity: 0.55, ease: "none", scrollTrigger: st });
  if (pxB) gsap.fromTo(pxB, { backgroundColor: cssVar("--bad") }, { backgroundColor: cssVar("--line-strong"), ease: "none", scrollTrigger: st });
  if (after) gsap.fromTo(after, { opacity: 0.25, x: 12 }, { opacity: 1, x: 0, ease: "none", scrollTrigger: st });
  if (pxA) gsap.fromTo(pxA, { backgroundColor: cssVar("--line-strong") }, { backgroundColor: cssVar("--ok"), ease: "none", scrollTrigger: st });
});

/* 7. Mobile phone fan: phones start stacked behind the centre one and fan out as the section enters.
   Inner pair first, the outer pair (wide screens only) follows a beat later; the centre rises. */
const fan = document.querySelector<HTMLElement>("[data-fan]");
if (fan && !reduced) {
  const mq = gsap.matchMedia();
  const inner = (st: ScrollTrigger.Vars) => {
    gsap.fromTo(".fan-left", { xPercent: 0, y: 0, rotate: 0, scale: 1 }, { xPercent: -58, y: 12, rotate: -5, scale: 0.94, ease: "none", scrollTrigger: st });
    gsap.fromTo(".fan-right", { xPercent: 0, y: 0, rotate: 0, scale: 1 }, { xPercent: 58, y: 12, rotate: 5, scale: 0.94, ease: "none", scrollTrigger: st });
    gsap.fromTo(".fan-center", { y: 0 }, { y: -24, ease: "none", scrollTrigger: st });
  };
  mq.add("(min-width: 640px) and (max-width: 1099px)", () => {
    gsap.set(".fan-phone", { clearProps: "transform" });
    inner({ trigger: fan, start: "top 80%", end: "center 55%", scrub: 0.6 });
  });
  mq.add("(min-width: 1100px)", () => {
    gsap.set(".fan-phone", { clearProps: "transform" });
    inner({ trigger: fan, start: "top 80%", end: "center 60%", scrub: 0.6 });
    const outer = { trigger: fan, start: "top 70%", end: "center 50%", scrub: 0.6 };
    gsap.fromTo(".fan-outer-left", { xPercent: -58, y: 12, rotate: -5, scale: 0.94 }, { xPercent: -106, y: 40, rotate: -9, scale: 0.86, ease: "none", scrollTrigger: outer });
    gsap.fromTo(".fan-outer-right", { xPercent: 58, y: 12, rotate: 5, scale: 0.94 }, { xPercent: 106, y: 40, rotate: 9, scale: 0.86, ease: "none", scrollTrigger: outer });
  });
}

/* How it works: numbers go line-strong -> fg as each column enters, staggered. */
if (!reduced) {
  const wide = window.matchMedia("(min-width: 768px)").matches;
  document.querySelectorAll<HTMLElement>("[data-step]").forEach((step, i) => {
    const num = step.querySelector<HTMLElement>(".num");
    if (!num) return;
    ScrollTrigger.create({
      trigger: step,
      start: "top 80%",
      once: true,
      onEnter: () => gsap.to(num, { color: "#ececef", duration: 0.9, ease: "power3.out", delay: wide ? i * 0.18 : 0 }),
    });
  });
}

/* ---------- Feature marquee ---------- */
const marquee = document.querySelector<HTMLElement>("[data-marquee]");
if (marquee && !reduced) {
  const tracks = [...marquee.querySelectorAll<HTMLElement>(".track")];
  const SPEED = 30; // px per second
  const setDur = () => tracks.forEach((t) => t.style.setProperty("--dur", `${t.scrollWidth / 2 / SPEED}s`));
  setDur();
  window.addEventListener("resize", setDur);
  let rate = 1;
  let target = 1;
  const anims = () => tracks.flatMap((t) => t.getAnimations());
  let inView = false;
  const updateRunning = () => marquee.toggleAttribute("data-running", inView && !document.hidden);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateRunning();
  }).observe(marquee);
  document.addEventListener("visibilitychange", updateRunning);
  lenis?.on("scroll", ({ velocity }: { velocity: number }) => {
    target = Math.max(target, 1 + Math.min(3, Math.abs(velocity) * 0.25));
  });
  gsap.ticker.add(() => {
    if (!inView || document.hidden) return;
    target = 1 + (target - 1) * 0.94;
    rate += (target - rate) * 0.1;
    const r = Math.round(rate * 100) / 100;
    anims().forEach((a) => a.playbackRate !== r && (a.playbackRate = r));
  });
}

/* ---------- Everything in Orbit ---------- */
const everything = document.querySelector<HTMLElement>("[data-everything]");
if (everything) {
  const chapters = [...everything.querySelectorAll<HTMLElement>("[data-chapter]")];
  const rows = [...everything.querySelectorAll<HTMLElement>("[data-index]")];
  const chips = [...everything.querySelectorAll<HTMLElement>("[data-chip]")];
  const track = everything.querySelector<HTMLElement>("[data-chips-track]");
  const fill = everything.querySelector<HTMLElement>("[data-index-fill]");

  let active = "";
  const setActive = (id: string) => {
    if (id === active) return;
    active = id;
    rows.forEach((r) => r.toggleAttribute("data-active", r.dataset.index === id));
    chips.forEach((c) => {
      const on = c.dataset.chip === id;
      c.toggleAttribute("data-active", on);
      if (on && track) track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    });
  };
  chapters.forEach((ch) => {
    ScrollTrigger.create({
      trigger: ch,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => self.isActive && setActive(ch.dataset.chapter!),
    });
  });

  const wrap = everything.querySelector<HTMLElement>(".chapters");
  if (wrap && fill) {
    ScrollTrigger.create({
      trigger: wrap,
      start: "top 45%",
      end: "bottom 45%",
      onLeaveBack: () => setActive(chapters[0].dataset.chapter!),
      onUpdate: (self) => (fill.style.transform = `scaleY(${self.progress})`),
    });
  }

  /* Index and chip clicks scroll through Lenis. */
  everything.querySelectorAll<HTMLAnchorElement>("[data-index], [data-chip]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById("ch-" + (a.dataset.index ?? a.dataset.chip));
      if (!target) return;
      e.preventDefault();
      const offset = window.matchMedia("(min-width: 1024px)").matches ? -96 : -140;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.2 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset });
    });
  });

  if (!reduced) {
    /* Stats count up once. */
    const stats = everything.querySelector<HTMLElement>("[data-stats]");
    if (stats) {
      const nums = [...stats.querySelectorAll<HTMLElement>("[data-count]")];
      nums.forEach((n) => (n.textContent = "0"));
      ScrollTrigger.create({
        trigger: stats,
        start: "top 85%",
        once: true,
        onEnter: () =>
          nums.forEach((n) => {
            const o = { v: 0 };
            gsap.to(o, { v: Number(n.dataset.count), duration: 1.2, ease: "power2.out", onUpdate: () => (n.textContent = String(Math.round(o.v))) });
          }),
      });
    }

    chapters.forEach((ch) => {
      /* Media: the whole window fades up once as it enters. The crops are tight, so nothing inside
         the frame is clipped, zoomed or panned: the screenshot always shows exactly its crop. */
      const frame = ch.querySelector<HTMLElement>(".ch-frame");
      if (frame) {
        gsap.set(frame, { opacity: 0, y: 32 });
        ScrollTrigger.create({
          trigger: frame,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(frame, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }),
        });
      }
      /* Features fade up once, 40ms apart. */
      const feats = ch.querySelectorAll<HTMLElement>(".feat");
      gsap.set(feats, { opacity: 0, y: 12 });
      ScrollTrigger.create({
        trigger: ch.querySelector(".ch-grid"),
        start: "top 88%",
        once: true,
        onEnter: () => gsap.to(feats, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.04 }),
      });
    });
  }
}

/* ---------- Scroll details: headline lines, rules, kbd presses, CTA, nav ---------- */
document.fonts?.ready.then(() => ScrollTrigger.refresh());

/* Nav: the link for the section in view gets --fg and a sliding underline. Works under reduced motion too (no slide). */
const navEl = document.querySelector<HTMLElement>("[data-nav-links]");
const navInd = document.querySelector<HTMLElement>("[data-nav-ind]");
const navLinks = [...(navEl?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
let navCurrent: HTMLAnchorElement | null = null;
const setNav = (a: HTMLAnchorElement | null) => {
  if (a === navCurrent) return;
  navCurrent = a;
  navLinks.forEach((l) => l.toggleAttribute("data-current", l === a));
  if (!navInd) return;
  if (!a) {
    navInd.style.opacity = "0";
    return;
  }
  navInd.style.width = a.offsetWidth + "px";
  navInd.style.transform = `translateX(${a.offsetLeft}px)`;
  navInd.style.opacity = "1";
};
navLinks.forEach((a) => {
  const sec = document.querySelector<HTMLElement>(a.getAttribute("href") ?? "");
  if (!sec) return;
  ScrollTrigger.create({
    trigger: sec,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (self.isActive) setNav(a);
      else if (navCurrent === a) setNav(null);
    },
  });
});

if (!reduced) {
  /* Headline line reveal. Each .h2 is split into lines (words grouped by measured top) inside overflow-hidden masks. */
  type Tok = { k: "w"; text: string; cls: string } | { k: "s" } | { k: "br" };
  const tokens = (root: Node): Tok[] => {
    const out: Tok[] = [];
    const walk = (node: Node, cls: string) => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const part of (node.textContent ?? "").split(/(\s+)/)) {
          if (!part) continue;
          out.push(/^\s+$/.test(part) ? { k: "s" } : { k: "w", text: part, cls });
        }
        return;
      }
      if (!(node instanceof HTMLElement)) return;
      if (node.tagName === "BR") {
        out.push({ k: "br" });
        return;
      }
      // Block-level spans (the feature headline mute clause) start and end their own line.
      const block = getComputedStyle(node).display === "block";
      const next = node.tagName === "SPAN" ? [cls, node.className].filter(Boolean).join(" ") : cls;
      if (block) out.push({ k: "br" });
      node.childNodes.forEach((n) => walk(n, next));
      if (block) out.push({ k: "br" });
    };
    root.childNodes.forEach((n) => walk(n, ""));
    return out;
  };
  const wordEl = (t: { text: string; cls: string }) => {
    const s = document.createElement("span");
    s.className = t.cls ? `hl-w ${t.cls}` : "hl-w";
    s.textContent = t.text;
    return s;
  };
  const splitHeadline = (h2: HTMLElement, src: string): HTMLElement[] => {
    h2.innerHTML = src;
    const toks = tokens(h2);
    // Measure: lay the words out inline, exactly as the browser wraps them, and read each word's top.
    h2.replaceChildren();
    const words: HTMLElement[] = [];
    for (const t of toks) {
      if (t.k === "w") {
        const s = wordEl(t);
        words.push(s);
        h2.append(s);
      } else if (t.k === "s") h2.append(" ");
      else h2.append(document.createElement("br"));
    }
    const tops = words.map((w) => w.getBoundingClientRect().top);
    // Group tokens into visual lines.
    const lines: Tok[][] = [[]];
    let lineY: number | null = null;
    let wi = 0;
    for (const t of toks) {
      if (t.k === "br") {
        lines.push([]);
        lineY = null;
        continue;
      }
      if (t.k === "w") {
        const y = tops[wi++];
        if (lineY !== null && Math.abs(y - lineY) > 4) lines.push([]);
        lineY = y;
      }
      lines[lines.length - 1].push(t);
    }
    // Rebuild as mask > slide pairs.
    h2.replaceChildren();
    const inners: HTMLElement[] = [];
    for (const line of lines) {
      if (!line.some((t) => t.k === "w")) continue;
      const ln = document.createElement("span");
      ln.className = "hl";
      const inner = document.createElement("span");
      inner.className = "hl-in";
      for (const t of line) {
        if (t.k === "w") inner.append(wordEl(t));
        else if (t.k === "s") inner.append(" ");
      }
      ln.append(inner);
      h2.append(ln);
      inners.push(inner);
    }
    return inners;
  };

  const heads = [...document.querySelectorAll<HTMLElement>(".h2")].map((el) => ({
    el,
    src: el.innerHTML,
    inners: [] as HTMLElement[],
    played: false,
  }));
  const splitAll = () =>
    heads.forEach((h) => {
      h.inners = splitHeadline(h.el, h.src);
      gsap.set(h.inners, { yPercent: h.played ? 0 : 100 });
    });
  splitAll();
  heads.forEach((h) =>
    ScrollTrigger.create({
      trigger: h.el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        h.played = true;
        gsap.to(h.inners, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.09 });
      },
    }),
  );
  // Fonts change line widths, so split again once they land; re-split on resize (debounced).
  document.fonts?.ready.then(() => {
    splitAll();
    ScrollTrigger.refresh();
  });
  let splitTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(splitTimer);
    splitTimer = window.setTimeout(splitAll, 200);
  });

  /* Dotted rules draw in from the left (the vertical rule on mobile draws down), once. */
  document.querySelectorAll<HTMLElement>("#everything .feat .dither-rule, #how .rule").forEach((r) => {
    const b = r.getBoundingClientRect();
    const horiz = b.width >= b.height;
    const prop = horiz ? { scaleX: 0 } : { scaleY: 0 };
    gsap.set(r, { ...prop, transformOrigin: horiz ? "0% 50%" : "50% 0%" });
    ScrollTrigger.create({
      trigger: r,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.to(r, { ...(horiz ? { scaleX: 1 } : { scaleY: 1 }), duration: 0.8, ease: "power3.out" }),
    });
  });

  /* Kbd press: each row presses once when first visible (2px/2px and back over 0.25s, 60ms apart). */
  const kbdIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        kbdIO.unobserve(e.target);
        gsap.to(e.target.querySelectorAll(".kbd"), { x: 2, y: 2, duration: 0.125, ease: "power2.out", repeat: 1, yoyo: true, stagger: 0.06 });
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>("#features .kbds, #everything .feat-keys").forEach((g) => {
    if (g.querySelector(".kbd")) kbdIO.observe(g);
  });

  /* Final CTA: the horizon rises and the orbit art drifts down while the section enters. */
  const cta = document.querySelector<HTMLElement>("#cta");
  if (cta) {
    const horizon = cta.querySelector<HTMLElement>(".cta-reveal");
    if (horizon)
      gsap.fromTo(horizon, { y: 40 }, { y: 0, ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "top 30%", scrub: 0.6 } });
  }
}
