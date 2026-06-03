// Smooth scroll, driven by the GSAP ticker and synced to ScrollTrigger.
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap.js";

let lenis = null;

export function getLenis() {
  return lenis;
}

export function initLenis() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return null;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 1.6,
    lerp: 0.1,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
