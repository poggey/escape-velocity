/* ============================================================
   C1 · THE MACHINE (light)
   What it looks like: the conventional IPO playbook as five
   hairline step cards in a row (S-1 → roadshow → bookbuild →
   allocate → debut), closing with "SpaceX kept the paperwork —
   and threw away the machine."
   What it does: as you scroll the row into view, each card's top
   rule draws across and the card rises in, left to right — the
   machine assembling itself. The closing line mask-reveals.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { maskReveal } from '../lib/reveal.js';

export function initChapter() {
  const c1 = document.querySelector('#c1');
  fillFacts(c1); // convention figures (fees 4–7%, retail 5–10%…) from facts.json

  maskReveal(c1.querySelector('.c1__close'), { start: 'top 85%' });

  if (reducedMotion) return;

  const cards = c1.querySelectorAll('.step-card');
  const steps = c1.querySelector('.c1__steps');

  // One timeline, scrubbed: the five cards assemble in sequence as the row
  // crosses the middle of the viewport. scrub: 1 ties the timeline's playhead
  // to the scrollbar with ~1s of catch-up smoothing — scroll back up and the
  // machine politely disassembles. We deliberately do NOT pin here: §12
  // reserves the site's single pinned chapter for C5 (Listing Day).
  const assemble = gsap.timeline({
    scrollTrigger: {
      trigger: steps,
      start: 'top 80%',   // begin as the row enters the lower fifth of the viewport
      end: 'top 35%',     // finish while it's still comfortably on screen
      scrub: 1,
    },
  });

  cards.forEach((card) => {
    assemble
      // the hairline draws across the card's top first…
      .fromTo(card.querySelector('.step-card__rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'none' })
      // …then the card itself rises in under it
      .from(card, { y: 40, opacity: 0, duration: 0.5, ease: 'none' }, '<0.15');
  });
}
