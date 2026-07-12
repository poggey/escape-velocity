/* ============================================================
   C4 · THE PRICE OF BELIEF (dark, IMG-01)
   What it looks like: the monumental stat sequence over the
   pre-dawn rocket backdrop — one compact viewport per number:
   94× (the EBITDA multiple, set against the peers on an
   animated scale) → $28.5T (the claimed TAM) → the duel,
   $63 Morningstar (red) vs $236 Street average (green).
   What it does: each numeral counts up as its viewport arrives;
   the multiple scale's bands sweep out to their marks; captions
   rise with a mask reveal; the backdrop parallaxes.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
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

  buildMultipleScale(c4);

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

/* The 94× in context: two bands on one 0–94× scale. The peers occupy a
   modest stretch near the left; SPCX runs the full width of the track.
   The disproportion IS the message — no further comment drawn. */
function buildMultipleScale(c4) {
  const lo = facts.valuation.megacap_multiple_low;    // 15
  const hi = facts.valuation.megacap_multiple_high;   // 40
  const spcx = facts.valuation.ev_ebitda_multiple;    // 94

  const rows = [
    { name: 'TRILLION-DOLLAR PEERS', left: (lo / spcx) * 100, width: ((hi - lo) / spcx) * 100, value: `${lo}–${hi}×`, cls: 'peers' },
    { name: 'SPCX AT THE OFFER', left: 0, width: 100, value: fmt.x(spcx), cls: 'spcx' },
  ];

  const scale = c4.querySelector('#c4-scale');
  for (const row of rows) {
    const el = document.createElement('div');
    el.className = 'c4__scale-row';
    el.innerHTML =
      `<span class="mono">${row.name}</span>` +
      `<span class="c4__scale-track"><span class="c4__scale-fill c4__scale-fill--${row.cls}" style="left:${row.left}%;width:${row.width}%"></span></span>` +
      `<span class="mono c4__scale-val">${row.value}</span>`;
    scale.appendChild(el);
  }

  if (reducedMotion) return;
  gsap.from(scale.querySelectorAll('.c4__scale-fill'), {
    scaleX: 0, transformOrigin: 'left center', duration: 1.2, stagger: 0.25,
    scrollTrigger: { trigger: scale, start: 'top 80%', once: true },
  });
}
