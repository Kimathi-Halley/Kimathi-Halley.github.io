// Global fluid cursor-trail wrapper.
// Recolors the trail to a terracotta pigment (reads as a smudge of
// clay under `mix-blend-mode: multiply`), scales the sim down on
// mobile, removes itself under reduced motion, and disposes the
// WebGL context on navigation so contexts don't leak across pages.
import * as THREE from "three";
import { FluidSimulation } from "./fluid/FluidSimulation.js";

let sim = null;

export function getFluid() {
  return sim;
}

export function initFluid() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("fluid");
  if (!canvas) return null;
  if (reduce) {
    canvas.remove();
    return null;
  }

  const small = matchMedia("(max-width: 768px)").matches;

  const base = {
    simResolution: 256,
    dyeResolution: 1024,
    curl: 40,
    pressureIterations: 36,
    velocityDissipation: 0.93,
    dyeDissipation: 0.95,
    splatRadius: 0.26,
    forceStrength: 7.5,
    pressureDecay: 0.78,
    threshold: 0.92,
    edgeSoftness: 0.08,
    inkColor: new THREE.Color("#a8492f"), // terracotta pigment
  };

  const config = small
    ? {
        ...base,
        simResolution: 128,
        dyeResolution: 512,
        pressureIterations: 20,
        dyeDissipation: 0.94,
      }
    : base;

  try {
    sim = new FluidSimulation(canvas, config);
  } catch (err) {
    console.warn("[fluid] WebGL unavailable — disabling trail.", err);
    canvas.remove();
    sim = null;
    return null;
  }

  // pause GPU work when the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (sim) sim.enabled = !document.hidden;
  });

  // release the WebGL context before the page unloads (MPA navigations
  // create a fresh context each time; browsers cap ~16)
  window.addEventListener("pagehide", () => {
    if (sim) sim.dispose();
    sim = null;
  });

  return sim;
}
