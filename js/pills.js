// About page: colors the blank testimonial placeholders with random brand
// colors, and drives the floating-pill parallax (desktop only).
import { gsap, ScrollTrigger } from "./gsap.js";

// blank testimonial cards get a random brand color + a contrasting
// quote-mark color on each load
function colorTestimonials() {
  const cards = document.querySelectorAll("[data-quote]");
  if (!cards.length) return;
  const palette = [
    { bg: "#1b3a2e", qc: "#bc5a3c" }, // pine / terracotta
    { bg: "#bc5a3c", qc: "#ece5d3" }, // terracotta / warm cream
    { bg: "#b9c3a8", qc: "#1b3a2e" }, // clay / pine
    { bg: "#2e4a3c", qc: "#e7d8c0" }, // soft pine / warm sand
    { bg: "#e7e3d4", qc: "#bc5a3c" }, // warm beige / terracotta
  ];
  const shuffled = [...palette].sort(() => Math.random() - 0.5);
  cards.forEach((card, i) => {
    const c = shuffled[i % shuffled.length];
    card.style.background = c.bg;
    card.style.setProperty("--qc", c.qc);
  });
}

export function initPills() {
  colorTestimonials();

  const section = document.querySelector("[data-pills]");
  if (!section) return;
  if (window.innerWidth <= 1000) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pills = [
    { sel: "#pill-1", y: -300, rot: -45 },
    { sel: "#pill-2", y: -150, rot: 70 },
    { sel: "#pill-3", y: -400, rot: 120 },
    { sel: "#pill-4", y: -350, rot: -60 },
    { sel: "#pill-5", y: -210, rot: 100 },
  ];

  pills.forEach((p) => {
    gsap.to(p.sel, {
      y: p.y,
      rotation: p.rot,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom+=100% top",
        scrub: 1,
      },
    });
  });
}
