/* ============================================================
   C1 · THE MACHINE (light)
   What it looks like: the conventional IPO playbook as a launch
   sequence — a countdown rail (T−5 → T−1) running through five
   station nodes, a card of copy under each, and a pulse of
   dawn-amber light travelling the rail on a loop. Ghost numerals
   sit behind the cards. Closes with "SpaceX kept the paperwork —
   and threw away the machine."
   What it does: as you scroll the sequence into view the rail
   fill draws left to right, each node lights and its card rises —
   the machine assembling itself, scrubbed to the wheel. The
   travelling pulse (pure CSS) starts once assembly completes.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { maskReveal } from '../lib/reveal.js';

export function initChapter() {
  const c1 = document.querySelector('#c1');
  fillFacts(c1); // convention figures (fees 4–7%, retail 5–10%…) from facts.json

  maskReveal(c1.querySelector('.c1__close'), { start: 'top 85%' });

  const sequence = c1.querySelector('.c1__sequence');
  if (reducedMotion) return; // fully assembled, no pulse (global reduce rule)

  const cards = c1.querySelectorAll('.step-card');

  // One timeline, scrubbed: rail draws while the five stations assemble in
  // sequence. scrub: 1 ties the playhead to the scrollbar with ~1s of
  // catch-up — scroll back up and the machine politely disassembles.
  // No pin: §12 reserves the site's single pinned chapter for C5.
  const assemble = gsap.timeline({
    scrollTrigger: {
      trigger: sequence,
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1,
      // the travelling pulse only makes sense on a finished rail
      onLeave: () => sequence.classList.add('is-live'),
      onEnterBack: () => sequence.classList.remove('is-live'),
    },
  });

  assemble.fromTo(
    c1.querySelector('.c1__rail-fill'),
    { scaleX: 0 },
    { scaleX: 1, duration: 2.5, ease: 'none' },
    0
  );
  cards.forEach((card, i) => {
    assemble.from(card.querySelector('.step-card__node'), { scale: 0, duration: 0.18, ease: 'none' }, i * 0.5 + 0.2);
    assemble.from(card, { y: 44, opacity: 0, duration: 0.45, ease: 'none' }, i * 0.5 + 0.05);
  });
}
