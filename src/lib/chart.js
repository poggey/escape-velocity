/* Tiny hand-rolled SVG chart helpers (§14.10: no chart library).
   Shared by C5 (listing day) and C6 (aftermath) — both draw the same kind
   of mono-annotated line into a responsive <svg viewBox>. */
import { gsap, ScrollTrigger, reducedMotion } from './motion.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* Create an SVG element with attributes: svgEl('circle', { cx: 5, r: 3 }) */
export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

/* Linear scale: makeScale([dataMin, dataMax], [pxStart, pxEnd]) returns a
   function mapping data -> pixels. Note a y-scale's pixel range runs
   high-to-low because SVG y grows downward. */
export function makeScale([d0, d1], [r0, r1]) {
  return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

/* Polyline path string from [[x, y], ...] points */
export function pathFrom(points) {
  return points
    .map(([x, y], i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1))
    .join(' ');
}

/* The line-draw scrub (§12: "chart line draws scrubbed to scroll").
   Classic stroke-dasharray trick: dash the stroke in one segment as long as
   the whole path, then animate the offset from "fully hidden" to 0.
   scrub: 1 ties the draw to the scrollbar with ~1s of smoothing, so the
   line grows as you scroll and retreats if you scroll back up.
   Under reduced motion we do nothing — the line just sits fully drawn. */
export function scrubDraw(pathEl, trigger, { start = 'top 70%', end = 'bottom 80%' } = {}) {
  if (reducedMotion) return;
  const length = pathEl.getTotalLength();
  gsap.fromTo(
    pathEl,
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger, start, end, scrub: 1 } }
  );
}

export { gsap, ScrollTrigger, reducedMotion };
