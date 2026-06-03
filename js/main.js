// Entry point for every page. Loads styles, mounts shared chrome, starts
// the transition + smooth scroll + fluid trail, then lazy-loads only the
// effect the current page needs.
import "../css/globals.css";
import "../css/chrome.css";
import "../css/transition.css";
import "../css/home.css";
import "../css/projects.css";
import "../css/about.css";
import "../css/contact.css";

// Phosphor icon weights (self-hosted; regular + fill for hover swap)
import "@phosphor-icons/web/regular";
import "@phosphor-icons/web/fill";

import { mountChrome } from "./chrome.js";
import { initTransitions } from "./transition.js";
import { initLenis } from "./lenis.js";
import { ScrollTrigger } from "./gsap.js";

const page = document.body.dataset.page || "home";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

mountChrome();
initTransitions();
if (page !== "contact") initLenis();

// global fluid trail — dynamic import keeps Three.js in its own chunk and
// off the critical path; skipped entirely under reduced motion
if (!reduce) {
  import("./fluid.js").then((m) => m.initFluid());
}

// page-specific effects
if (page === "home" && !reduce) {
  import("./smudge.js").then((m) => m.initSmudge());
}
if (page === "projects") {
  import("./image-hover.js").then((m) => m.initImageHover());
}
if (page === "about") {
  import("./pills.js").then((m) => m.initPills());
}

// settle ScrollTrigger once fonts + the entry transition have resolved
window.addEventListener("load", () => {
  setTimeout(() => ScrollTrigger.refresh(), 350);
});
