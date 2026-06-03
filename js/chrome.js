// Shared chrome: injects the fluid canvas, nav, mobile menu, footer, and
// the transition strokes from one source so the four pages stay in sync.
// Wires the mobile menu, the scrolled-nav state, and back-to-top.
import { getLenis } from "./lenis.js";

/* ---- single source of site data ---- */
const NAV = [
  { label: "Home", href: "/", key: "home", num: "01" },
  { label: "Projects", href: "/projects/", key: "projects", num: "02" },
  { label: "About", href: "/about/", key: "about", num: "03" },
  { label: "Contact", href: "/contact/", key: "contact", num: "04" },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/", icon: "ph-github-logo" },
  { label: "X", href: "https://x.com/", icon: "ph-x-logo" },
  { label: "Instagram", href: "https://instagram.com/", icon: "ph-instagram-logo" },
  { label: "WhatsApp", href: "https://wa.me/12687758274", icon: "ph-whatsapp-logo" },
];

const EMAIL = "halleykimathi@gmail.com";
const PHONE = "+1 (268) 775-8274";
const PHONE_TEL = "+12687758274";

// transition stroke paths (organic, from the page-transition package)
const PATH_1 =
  "M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262";
const PATH_2 =
  "M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012";

/* ---- markup ---- */
function navMarkup(active) {
  const links = NAV.map(
    (n) =>
      `<li><a class="nav__link${n.key === active ? " is-active" : ""}${n.key === "home" ? " nav__link--home" : ""}" href="${n.href}" data-link="${n.key}">${n.label}</a></li>`,
  ).join("");
  return `
  <nav class="nav" data-nav aria-label="Primary">
    <div class="nav__pill">
      <a class="nav__brand" href="/" aria-label="Halley — home">
        <span class="nav__logo"></span>
      </a>
      <ul class="nav__menu">${links}</ul>
      <button class="nav__burger" data-burger aria-label="Open menu" aria-expanded="false" aria-controls="navmenu">
        <span></span><span></span>
      </button>
    </div>
  </nav>`;
}

function menuMarkup(active) {
  const links = NAV.map(
    (n) =>
      `<li><a class="${n.key === "home" ? "navmenu__home" : ""}" href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}><span class="num">${n.num}</span>${n.label}</a></li>`,
  ).join("");
  const socials = SOCIALS.map(
    (s) =>
      `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}"><i class="ph ${s.icon}"></i></a>`,
  ).join("");
  return `
  <div class="navmenu" id="navmenu" data-navmenu aria-hidden="true">
    <ul class="navmenu__list">${links}</ul>
    <div class="navmenu__foot">
      <span class="mono">Halley — Antigua</span>
      <div class="navmenu__socials">${socials}</div>
    </div>
  </div>`;
}

function footerMarkup() {
  const navLinks = NAV.map(
    (n) => `<a href="${n.href}" class="footer__navlink">${n.label}</a>`,
  ).join("");
  const socials = SOCIALS.map(
    (s) =>
      `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}"><i class="ph ${s.icon}"></i></a>`,
  ).join("");
  return `
  <footer class="site-footer" data-footer-el>
    <div class="footer__inner">
      <img class="footer__stampbg" src="/brand/made-in-antigua-grey.png" alt="" aria-hidden="true" />
      <div class="footer__head">
        <a class="footer__logo-link" href="/" aria-label="Halley — home"><span class="footer__logo"></span></a>
      </div>
      <div class="footer__bar">
        <div class="footer__contact">
          <p class="footer__coltitle">Say hello</p>
          <a class="footer__email" href="mailto:${EMAIL}">${EMAIL}</a>
          <a class="footer__phone" href="tel:${PHONE_TEL}">${PHONE}</a>
        </div>
        <div class="footer__social-group">
          <p class="footer__coltitle">Find me</p>
          <div class="footer__socials">${socials}</div>
        </div>
      </div>
      <nav class="footer__nav" aria-label="Footer">${navLinks}</nav>
      <div class="footer__copy">
        <p>&copy; 2026 Halley — All rights reserved.</p>
        <a class="footer__totop" href="#top" data-totop><span class="mono">Back to top</span> <i class="ph ph-arrow-up"></i></a>
      </div>
    </div>
  </footer>`;
}

function transitionSvg() {
  return `<svg class="transition__svg" viewBox="0 0 2453 2535" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="transition__stroke" d="${PATH_1}" stroke="var(--transition-stroke-2)" stroke-width="200" stroke-linecap="round" />
    <path class="transition__stroke" d="${PATH_2}" stroke="var(--transition-stroke-1)" stroke-width="200" stroke-linecap="round" />
  </svg>`;
}

/* ---- mount + wire ---- */
export function mountChrome() {
  const page = document.body.dataset.page || "home";

  // fluid canvas at the very back
  if (!document.getElementById("fluid")) {
    const c = document.createElement("canvas");
    c.id = "fluid";
    document.body.prepend(c);
  }

  // nav + mobile menu
  document.body.insertAdjacentHTML("afterbegin", navMarkup(page) + menuMarkup(page));

  // transition strokes into the pre-painted .transition shell
  const t = document.querySelector(".transition");
  if (t && !t.querySelector(".transition__svg")) {
    t.insertAdjacentHTML("beforeend", transitionSvg());
  }

  // footer (every page except contact, which has its own in-viewport footer)
  if (page !== "contact") {
    const markup = footerMarkup(page);
    if (t) t.insertAdjacentHTML("beforebegin", markup);
    else document.body.insertAdjacentHTML("beforeend", markup);
  }

  wireMenu();
  wireToTop();
  wireAnchors();
  wireSocialFills();
  wireFavicon();
}

// reverse the favicon's colors when the tab isn't in focus
function wireFavicon() {
  const ACTIVE = "/favicon.png";
  const INACTIVE = "/favicon-alt.png";
  let current = null;
  const setIcon = (href) => {
    if (href === current) return;
    current = href;
    document.querySelectorAll('link[rel="icon"]').forEach((l) => l.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = href;
    document.head.appendChild(link);
  };
  const update = () =>
    setIcon(document.hidden || !document.hasFocus() ? INACTIVE : ACTIVE);
  document.addEventListener("visibilitychange", update);
  window.addEventListener("blur", update);
  window.addEventListener("focus", update);
  update();
}

// swap social icons to their filled Phosphor variant on hover
function wireSocialFills() {
  const links = document.querySelectorAll(
    ".footer__socials a, .navmenu__socials a, .contact__socials a",
  );
  links.forEach((a) => {
    const icon = a.querySelector("i.ph, i.ph-fill");
    if (!icon) return;
    a.addEventListener("mouseenter", () => {
      icon.classList.replace("ph", "ph-fill");
    });
    a.addEventListener("mouseleave", () => {
      icon.classList.replace("ph-fill", "ph");
    });
  });
}

function wireAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-totop")) return;
    const id = a.getAttribute("href");
    if (id === "#") {
      e.preventDefault(); // dead link (e.g. a project with no site yet)
      return;
    }
    if (id === "#top") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: "smooth" });
  });
}

function wireMenu() {
  const burger = document.querySelector("[data-burger]");
  const menu = document.querySelector("[data-navmenu]");
  if (!burger || !menu) return;
  let open = false;

  const set = (next) => {
    open = next;
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const lenis = getLenis();
    if (lenis) open ? lenis.stop() : lenis.start();
  };

  burger.addEventListener("click", () => set(!open));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => open && set(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) set(false);
  });
}

function wireToTop() {
  const btn = document.querySelector("[data-totop]");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
