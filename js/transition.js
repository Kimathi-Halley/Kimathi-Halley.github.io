// Vanilla multi-page transition.
// A pine panel covers the screen at first paint (in the HTML, so there's
// no content flash), then lifts upward on enter while two organic strokes
// erase. On leave it drops up from the bottom while the strokes draw in,
// then navigates. Travels upward across every navigation.
import { gsap } from "./gsap.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DUR_IN = 0.62;
const DUR_OUT = 0.9;
const EASE = "power3.inOut";

const strokes = () => Array.from(document.querySelectorAll(".transition__stroke"));
const panel = () => document.querySelector(".transition__panel");

function setStrokes(state) {
  // state: "covered" (drawn + fat) or "erased" (hidden + thin)
  strokes().forEach((s) => {
    const len = s.getTotalLength();
    s.style.strokeDasharray = len;
    s.style.strokeDashoffset = state === "covered" ? 0 : len;
    s.setAttribute("stroke-width", state === "covered" ? 700 : 200);
  });
}

function enter() {
  const p = panel();
  const overlay = document.querySelector(".transition");
  if (!p || !overlay) return;
  gsap.set(overlay, { autoAlpha: 1 });
  gsap.set(p, { yPercent: 0 });
  requestAnimationFrame(() => {
    setStrokes("covered");
    // hide the whole overlay once revealed, so the strokes' round end-caps
    // don't linger as stray ovals on top of the page content
    const tl = gsap.timeline({
      onComplete: () => gsap.set(overlay, { autoAlpha: 0 }),
    });
    strokes().forEach((s) => {
      const len = s.getTotalLength();
      tl.to(
        s,
        {
          strokeDashoffset: -len,
          attr: { "stroke-width": 200 },
          duration: DUR_OUT,
          ease: EASE,
        },
        0,
      );
    });
    tl.to(p, { yPercent: -100, duration: DUR_OUT * 0.78, ease: EASE }, DUR_OUT * 0.2);
  });
}

function leave(href) {
  const p = panel();
  if (!p) {
    window.location.href = href;
    return;
  }
  gsap.set(".transition", { autoAlpha: 1 });
  gsap.set(p, { yPercent: 100 });
  setStrokes("erased");
  const tl = gsap.timeline({
    onComplete: () => {
      window.location.href = href;
    },
  });
  tl.to(p, { yPercent: 0, duration: DUR_IN, ease: EASE }, 0);
  strokes().forEach((s) => {
    const len = s.getTotalLength();
    tl.to(
      s,
      {
        strokeDashoffset: 0,
        attr: { "stroke-width": 700 },
        duration: DUR_IN,
        ease: EASE,
      },
      0,
    );
  });
}

function isSamePage(url) {
  const norm = (path) =>
    path.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  return norm(url.pathname) === norm(location.pathname);
}

function onClick(e) {
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (a.target === "_blank" || a.hasAttribute("download")) return;
  if (e.defaultPrevented) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (/^(mailto:|tel:|#)/.test(href)) return;

  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return;
  }
  if (url.origin !== location.origin) return; // external

  if (isSamePage(url)) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  leave(url.href);
}

export function initTransitions() {
  const t = document.querySelector(".transition");
  if (!t) return;

  if (reduce) {
    gsap.set(t, { display: "none" }); // lift the boot cover, no curtain
    return;
  }

  enter();
  document.addEventListener("click", onClick, true);

  // back/forward bfcache restore can return a covered or half-lifted panel
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) enter();
  });
}
