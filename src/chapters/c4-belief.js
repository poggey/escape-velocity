/* ============================================================
   C4 · THE PRICE OF BELIEF (dark, IMG-03)
   What it looks like: the monumental stat sequence over the
   engine-grid backdrop — one full viewport per number:
   94× (the EBITDA multiple) → $28.5T (the claimed TAM) → the
   duel, $63 Morningstar (red) vs $236 Street average (green).
   What it does: each numeral counts up as its viewport arrives;
   captions rise with a mask reveal; the backdrop parallaxes.
   ============================================================ */
import { reducedMotion } from '../lib/motion.js';
import { fillFacts, facts } from '../lib/facts.js';
import { countUp } from '../lib/counter.js';
import { maskReveal, parallax } from '../lib/reveal.js';
import { fmt } from '../lib/format.js';

export function initChapter() {
  const c4 = document.querySelector('#c4');
  fillFacts(c4);
  parallax(c4.querySelector('.media'), c4);

  // The four monuments. Values come from facts.json; the formatters decide
  // the shape ("94×", "$28.5T", "$63", "$236").
  countUp(c4.querySelector('#c4-multiple'), facts.valuation.ev_ebitda_multiple, fmt.x);
  countUp(c4.querySelector('#c4-tam'), facts.valuation.tam_tn, fmt.tn1, { snap: 0.1 });
  countUp(c4.querySelector('#c4-bear'), facts.valuation.morningstar_fv, fmt.usd0);
  countUp(c4.querySelector('#c4-bull'), facts.valuation.street_avg_high, fmt.usd0);

  if (reducedMotion) return;

  // Each caption mask-reveals slightly after its numeral starts counting —
  // number first, explanation second
  for (const monument of c4.querySelectorAll('.monument')) {
    maskReveal(monument.querySelectorAll('.caption, .mono, figcaption'), {
      trigger: monument,
      start: 'top 70%',
    });
  }
}
