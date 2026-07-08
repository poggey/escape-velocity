/* ============================================================
   C7 · THE VERDICT (dark, IMG-06)
   What it looks like: the six-constituency ledger as a clean
   table over the exchange-tower backdrop, verdict words in mono
   (WIN, UNDERWATER, PYRRHIC…), then a final near-full viewport
   with the thesis alone in display type: "Priced efficiently.
   Traded emotionally."
   What it does: rows stagger in as the table arrives; the thesis
   mask-reveals; the backdrop parallaxes.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { maskReveal, parallax } from '../lib/reveal.js';

export function initChapter() {
  const c7 = document.querySelector('#c7');
  fillFacts(c7); // proceeds, gains, fee figures in the evidence cells
  parallax(c7.querySelector('.media'), c7);

  // The closing line is the whole argument in four words — it gets the
  // slowest, most deliberate reveal on the site (extra stagger between lines)
  maskReveal(c7.querySelectorAll('.c7__thesis .mask-line'), {
    trigger: c7.querySelector('.c7__thesis'),
    start: 'top 60%',
    stagger: 0.35,
  });

  if (reducedMotion) return;

  gsap.from(c7.querySelectorAll('tbody tr'), {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    scrollTrigger: { trigger: c7.querySelector('table'), start: 'top 75%', once: true },
  });
}
