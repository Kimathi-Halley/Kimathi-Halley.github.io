// Seamless, width-independent marquee.
//
// The markup holds ONE copy of the items. We clone that unit until a single
// "lane" comfortably exceeds the viewport, then duplicate the lane so the
// translateX(-50%) loop never reveals a gap — at any screen width. The
// animation duration is derived from the final lane width, so the scroll speed
// stays constant no matter how many clones were needed. Rebuilds on resize;
// stays static under reduced-motion.

const SPEED = 34; // px per second

export function initMarquee() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const marquees = document.querySelectorAll(".marquee");
  if (!marquees.length) return;

  const build = (marquee) => {
    const track = marquee.querySelector(".marquee__track");
    if (!track) return;
    if (track._unit == null) track._unit = track.innerHTML; // one lane's worth

    track.style.animation = "none";
    track.innerHTML = track._unit;

    let guard = 0;
    while (track.scrollWidth < marquee.offsetWidth + 320 && guard++ < 80) {
      track.insertAdjacentHTML("beforeend", track._unit);
    }

    const laneWidth = track.scrollWidth; // one filled lane
    track.innerHTML += track.innerHTML; // duplicate → -50% loops seamlessly
    if (!reduce) {
      track.style.animation = `marquee ${(laneWidth / SPEED).toFixed(1)}s linear infinite`;
    }
  };

  const buildAll = () => marquees.forEach(build);
  (document.fonts?.ready ?? Promise.resolve()).then(buildAll);

  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(buildAll, 200);
  });
}
