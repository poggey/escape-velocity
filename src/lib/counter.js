/* Big-numeral count-up (§12: "counted up by GSAP", with snap).
   The final text is written IMMEDIATELY, so reduced-motion users and
   anyone with JS half-loaded always see the true figure; the animation
   then (motion permitting) re-plays it from zero when scrolled into view. */
import { gsap, reducedMotion } from './motion.js';

export function countUp(el, value, format, { duration = 1.4, snap = 1 } = {}) {
  el.textContent = format(value);
  if (reducedMotion) return;

  const n = { v: 0 };
  gsap.to(n, {
    v: value,
    duration,
    // snap stops the tween showing ugly in-between decimals: a counter to 94
    // ticks in whole numbers (snap 1); one to 11.4 ticks in tenths (snap 0.1)
    snap: { v: snap },
    onUpdate: () => { el.textContent = format(n.v); },
    scrollTrigger: {
      trigger: el,
      // start counting when the numeral's top clears the lower fifth of the
      // viewport — visible from zero, not already finished when you arrive
      start: 'top 80%',
      once: true,
    },
  });
}
