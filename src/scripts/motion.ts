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
  // Slide k belongs to a step; step 5 (index 4) owns two slides (issues, routines).
  const slideStep = slides.map((_, k) => (k < 4 ? k : 4));
  let current = -1;
  const activate = (step: number, sub = 0) => {
    const slide = step < 4 ? step : 4 + sub;
    if (slide === current) return;
    current = slide;
    items.forEach((el, i) => el.toggleAttribute("data-active", i === step));
    slides.forEach((el, k) => el.toggleAttribute("data-active", k === slide));
    if (count) count.textContent = String(step + 1).padStart(2, "0");
  };
  void slideStep;

  let trigger: ScrollTrigger | null = null;
  const mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { desktop, ok } = ctx.conditions as { desktop: boolean; ok: boolean };
    if (!desktop || !ok) return;
    trigger = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => "+=" + window.innerHeight * 0.8 * 5,
      pin: true,
      onUpdate: (self) => {
        const p = Math.min(0.9999, self.progress) * 5;
        const step = Math.floor(p);
        activate(step, step === 4 && p - 4 > 0.5 ? 1 : 0);
      },
    });
    return () => {
      trigger = null;
    };
  });

  items.forEach((el, i) => {
    el.querySelector<HTMLElement>("[data-feat-head]")?.addEventListener("click", () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      if (trigger) {
        const y = trigger.start + ((i + 0.5) / 5) * (trigger.end - trigger.start);
        if (lenis) lenis.scrollTo(y, { duration: 1.2 });
        else window.scrollTo({ top: y });
      } else activate(i);
    });
  });
}

/* 7. Mobile phone fan: sides slide out and rotate, centre rises. */
const fan = document.querySelector<HTMLElement>("[data-fan]");
if (fan && !reduced) {
  const mq = gsap.matchMedia();
  mq.add("(min-width: 640px)", () => {
    gsap.set(".fan-left, .fan-right, .fan-center", { clearProps: "transform" });
    const st = { trigger: fan, start: "top 80%", end: "center 55%", scrub: 0.6 };
    gsap.fromTo(".fan-left", { xPercent: 0, rotate: 0 }, { xPercent: -72, rotate: -6, ease: "none", scrollTrigger: st });
    gsap.fromTo(".fan-right", { xPercent: 0, rotate: 0 }, { xPercent: 72, rotate: 6, ease: "none", scrollTrigger: st });
    gsap.fromTo(".fan-center", { y: 0 }, { y: -24, ease: "none", scrollTrigger: st });
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

  /* Paper and Void: the diagonal split drifts slightly with scroll. */
  const split = document.querySelector<HTMLElement>("[data-split]");
  if (split) {
    const line = split.querySelector<SVGLineElement>("[data-split-line]");
    const state = { s: 58 };
    const apply = () => {
      split.style.setProperty("--s", state.s + "%");
      if (line) {
        line.setAttribute("x1", String(state.s + 14));
        line.setAttribute("x2", String(state.s - 14));
      }
    };
    apply();
    gsap.to(state, {
      s: 42,
      ease: "none",
      onUpdate: apply,
      scrollTrigger: { trigger: split, start: "top 90%", end: "bottom 20%", scrub: 0.6 },
    });
  }
}
