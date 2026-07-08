/* ============================================================
   INTERLUDES — the two full-bleed 21:9 image moments (§13):
   IMG-04 (booster catch) after C4, IMG-05 (server hall) after
   C6, each carrying a single pull-quote in display type.
   What they do: pacing beats. The image breathes with a slow
   settle from a slight zoom while it crosses the viewport; the
   quote mask-reveals once. Nothing else.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { maskReveal } from '../lib/reveal.js';

export function initChapter() {
  for (const interlude of document.querySelectorAll('.interlude')) {
    maskReveal(interlude.querySelectorAll('.mask-line, cite'), {
      trigger: interlude,
      start: 'top 60%',
    });

    if (reducedMotion) continue;

    // A scale drift instead of a translate parallax: the 21:9 frame is its
    // own layout box (not a cover behind content), so translating it would
    // expose edges. scrub: true ties the drift linearly to scroll.
    gsap.fromTo(
      interlude.querySelector('.media--wide'),
      { scale: 1.08 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: interlude, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  }
}
