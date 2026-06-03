// Projects grid hover: two organic SVG strokes draw across the card while
// the title slides up (SplitText). Falls back to static titles on touch.
import { gsap, SplitText } from "./gsap.js";

// organic stroke paths (shared with the page transition), injected per
// card so the long path data isn't repeated across the HTML
const STROKE_1 =
  "M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262";
const STROKE_2 =
  "M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012";

function injectStrokes(card) {
  const host = card.querySelector(".card__strokes");
  if (!host || host.childElementCount) return;
  host.innerHTML = `
    <div class="card__stroke card__stroke--1">
      <svg width="2453" height="2273" viewBox="0 0 2453 2273" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${STROKE_1}" stroke="var(--accent)" stroke-width="200" stroke-linecap="round"/></svg>
    </div>
    <div class="card__stroke card__stroke--2">
      <svg width="2250" height="2535" viewBox="0 0 2250 2535" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${STROKE_2}" stroke="var(--ink)" stroke-width="200" stroke-linecap="round"/></svg>
    </div>`;
}

export function initImageHover() {
  const cards = document.querySelectorAll("[data-card]");
  if (!cards.length) return;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  cards.forEach((card) => {
    injectStrokes(card);
    const paths = card.querySelectorAll(".card__stroke path");
    const title = card.querySelector(".card__title h3");
    const split = title
      ? SplitText.create(title, { type: "words", mask: "words", wordsClass: "word" })
      : null;

    if (!fine) {
      if (split) gsap.set(split.words, { yPercent: 0 });
      return;
    }

    if (split) gsap.set(split.words, { yPercent: 100 });
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    let tl;
    card.addEventListener("mouseenter", () => {
      tl?.kill();
      tl = gsap.timeline();
      paths.forEach((p) => {
        tl.to(
          p,
          { strokeDashoffset: 0, attr: { "stroke-width": 460 }, duration: 1.4, ease: "power2.out" },
          0,
        );
      });
      if (split)
        tl.to(
          split.words,
          { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 },
          0.3,
        );
    });

    card.addEventListener("mouseleave", () => {
      tl?.kill();
      tl = gsap.timeline();
      paths.forEach((p) => {
        const len = p.getTotalLength();
        tl.to(
          p,
          { strokeDashoffset: len, attr: { "stroke-width": 200 }, duration: 0.9, ease: "power2.out" },
          0,
        );
      });
      if (split)
        tl.to(
          split.words,
          {
            yPercent: 100,
            duration: 0.5,
            ease: "power3.out",
            stagger: { each: 0.05, from: "end" },
          },
          0,
        );
    });
  });
}
