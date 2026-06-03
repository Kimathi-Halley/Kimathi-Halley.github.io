// Smudge paint-away reveal, scoped to the index CTA band (not a full
// hero). The cursor stamps gooey blobs into an SVG mask that reveals the
// invitation underneath. Coordinates are section-relative and re-measured
// on resize/scroll. While the cursor is inside, the global fluid trail is
// suppressed so the two cursor effects don't fight.
import { gsap } from "./gsap.js";
import { getFluid } from "./fluid.js";

const cfg = {
  smoothing: 0.12,
  movementThreshold: 0.01,
  sizeFromSpeed: 0.22,
  expandMultiplier: 2,
  expandTime: 2,
  expandEase: "power1.inOut",
  dissolveStart: 2,
  dissolveTime: 3,
  dissolveEase: "power3.in",
};

export function initSmudge() {
  const section = document.querySelector("[data-smudge]");
  if (!section) return;
  const svg = section.querySelector(".smudge__svg");
  const blobs = section.querySelector(".smudge__blobs");
  if (!svg || !blobs) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    section.classList.add("is-static"); // reveal the invitation, no smudge
    return;
  }

  let rect = section.getBoundingClientRect();
  const measure = () => {
    rect = section.getBoundingClientRect();
    svg.style.width = rect.width + "px";
    svg.style.height = rect.height + "px";
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  };
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", () => (rect = section.getBoundingClientRect()), {
    passive: true,
  });

  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  let started = false;
  let inside = false;

  const toLocal = (clientX, clientY) => {
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
    if (!started) {
      smooth.x = pointer.x;
      smooth.y = pointer.y;
      started = true;
    }
  };

  section.addEventListener("mousemove", (e) => toLocal(e.clientX, e.clientY));
  section.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) toLocal(t.clientX, t.clientY);
    },
    { passive: true },
  );

  // suppress the fluid trail while the cursor owns this band
  let fade;
  section.addEventListener("pointerenter", () => {
    inside = true;
    const sim = getFluid();
    if (sim) {
      sim.suppressSplat = true;
      fade?.kill();
      fade = gsap.to(sim.config, { dyeDissipation: 0.85, duration: 0.5 });
    }
  });
  section.addEventListener("pointerleave", () => {
    inside = false;
    const sim = getFluid();
    if (sim) {
      sim.suppressSplat = false;
      fade?.kill();
      fade = gsap.to(sim.config, { dyeDissipation: 0.95, duration: 0.6 });
    }
  });

  function stamp(x, y, radius) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", radius);
    c.setAttribute("fill", "#fff");
    blobs.prepend(c);

    const r = { v: radius };
    const tl = gsap.timeline({
      onUpdate: () => c.setAttribute("r", Math.max(0, r.v)),
      onComplete: () => {
        tl.kill();
        c.remove();
      },
    });
    tl.to(r, {
      v: radius * cfg.expandMultiplier,
      duration: cfg.expandTime,
      ease: cfg.expandEase,
    });
    tl.to(
      r,
      { v: 0, duration: cfg.dissolveTime, ease: cfg.dissolveEase },
      cfg.dissolveStart,
    );
  }

  function update() {
    if (started && inside) {
      smooth.x += (pointer.x - smooth.x) * cfg.smoothing;
      smooth.y += (pointer.y - smooth.y) * cfg.smoothing;
      const speed = Math.hypot(pointer.x - smooth.x, pointer.y - smooth.y);
      if (speed > cfg.movementThreshold) {
        stamp(smooth.x, smooth.y, speed * cfg.sizeFromSpeed);
      }
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
