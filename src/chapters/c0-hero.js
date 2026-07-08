/* ============================================================
   C0 · HERO (dark, IMG-01)
   What it looks like: a full-viewport pre-dawn rocket backdrop
   (placeholder for now), the mono ticker label "NASDAQ : SPCX",
   the two-line headline "The $1.77 Trillion / Offering.", a
   sub-line and a scroll cue.
   What it does: animates ON LOAD, not on scroll — it's the first
   thing seen. The backdrop settles from a slight zoom, the
   headline rises out of its mask, then label/sub/cue fade in.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';

export function initChapter() {
  const c0 = document.querySelector('#c0');
  fillFacts(c0); // writes $1.77 into the headline from facts.json

  if (reducedMotion) return; // page is authored in final state — nothing to undo

  const timeline = gsap.timeline();

  // §13: "image scale 1.06 -> 1 on load" — the settle makes the static
  // backdrop feel photographed rather than pasted
  timeline.from(c0.querySelector('.media'), { scale: 1.06, duration: 1.2 });

  // §12 mask-reveal: each headline line rises out of its own clip rectangle.
  // (Done inline rather than via lib/reveal.js because this one runs on load,
  // with no ScrollTrigger.)
  timeline.fromTo(
    c0.querySelectorAll('.mask-line'),
    { clipPath: 'inset(0 0 100% 0)', yPercent: 30 },
    { clipPath: 'inset(0 0 -10% 0)', yPercent: 0, duration: 0.9, stagger: 0.12 },
    '-=0.8' // overlap with the settle so the whole entrance stays under 1.2s (§14)
  );

  timeline.from(
    [c0.querySelector('.c0__kicker'), c0.querySelector('.c0__sub'), c0.querySelector('.c0__cue')],
    { opacity: 0, duration: 0.6, stagger: 0.1 },
    '-=0.5'
  );
}
