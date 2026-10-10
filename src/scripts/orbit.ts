// Ported from agentic_ide/src/components/OrbitHero.tsx. Geometry as fractions of the art size.
const CENTER = { x: 0.52, y: 0.475 };
const ORBIT = { rx: 0.44, ry: 0.11, tilt: (-15 * Math.PI) / 180 };
const PERIOD_MS = 16_000;

export function initOrbits(reduced: boolean) {
  document.querySelectorAll<HTMLElement>("[data-orbit]").forEach((root) => {
    const planet = root.querySelector<HTMLElement>("[data-orbit-planet]");
    if (!planet) return;

    const place = (theta: number) => {
      const ox = ORBIT.rx * Math.cos(theta);
      const oy = ORBIT.ry * Math.sin(theta);
      const x = CENTER.x + ox * Math.cos(ORBIT.tilt) - oy * Math.sin(ORBIT.tilt);
      const y = CENTER.y + ox * Math.sin(ORBIT.tilt) + oy * Math.cos(ORBIT.tilt);
      const depth = (Math.sin(theta) + 1) / 2; // 0 far .. 1 near
      planet.style.left = `${x * 100}%`;
      planet.style.top = `${y * 100}%`;
      planet.style.transform = `translate(-50%, -50%) scale(${0.7 + 0.45 * depth})`;
      planet.style.opacity = String(0.55 + 0.45 * depth);
      planet.style.zIndex = Math.sin(theta) > 0 ? "4" : "1";
    };

    place(0.5);
    if (reduced) return;

    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let last = 0;
    const tick = (now: number) => {
      elapsed += now - last;
      last = now;
      place((elapsed / PERIOD_MS) * Math.PI * 2);
      frame = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) {
        visible = true;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(frame);
      }
    }).observe(root);
  });
}
