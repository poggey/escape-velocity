/* ============================================================
   C2 · THREE ENGINES (dark, IMG-02)
   What it looks like: LAUNCH / STARLINK / xAI as three columns
   over the satellite-constellation backdrop. Each column carries
   one oversized numeral — Starlink revenue in market green, xAI
   quarterly losses in market red — plus a one-line caption.
   Below them, the balance instrument: two glowing bars showing
   2025 AI spend dwarfing space spend, drawn from facts.json.
   What it does: the columns rise in staggered; the numerals count
   up when they enter view; the balance bars sweep to their marks.
   Note: the whitepaper sketch suggested "flights flown" for the
   launch column, but gives no sourced figure — so per the
   numbers rule we show 2025 space spend ($3.8bn, §2) instead.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts, facts } from '../lib/facts.js';
import { countUp } from '../lib/counter.js';
import { fmt } from '../lib/format.js';

export function initChapter() {
  const c2 = document.querySelector('#c2');
  fillFacts(c2);

  // The three signature numerals, counted up per §12. snap 0.1 keeps the
  // tick in tenths so "$11.4BN" never flashes "$11.3721BN" mid-count.
  countUp(c2.querySelector('#c2-launch'), facts.engines.space_spend_2025_bn, fmt.bn1, { snap: 0.1 });
  countUp(c2.querySelector('#c2-starlink'), facts.engines.starlink_rev_bn, fmt.bn1, { snap: 0.1 });
  countUp(c2.querySelector('#c2-xai'), facts.engines.xai_loss_qtr_bn, (v) => fmt.bn1(v) + ' /QTR', { snap: 0.1 });

  buildBalance(c2);

  if (reducedMotion) return;

  // Columns rise one after another as the grid enters — a single "from"
  // with stagger; once: the reveal shouldn't replay on every pass
  gsap.from(c2.querySelectorAll('.engine'), {
    y: 56,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    scrollTrigger: { trigger: c2.querySelector('.c2__cols'), start: 'top 75%', once: true },
  });
}

/* Where the money goes: AI spend vs space spend on one shared scale.
   The disproportion is the point — the "space company" spends 3.3× more
   on AI than on space. */
function buildBalance(c2) {
  const rows = [
    { name: '2025 AI SPEND', value: facts.engines.ai_spend_2025_bn, cls: 'ai' },
    { name: '2025 SPACE SPEND', value: facts.engines.space_spend_2025_bn, cls: 'space' },
  ];
  const max = Math.max(...rows.map((r) => r.value));

  const wrap = c2.querySelector('#c2-balance');
  for (const row of rows) {
    const el = document.createElement('div');
    el.className = 'c2__balance-row';
    el.innerHTML =
      `<span class="mono">${row.name}</span>` +
      `<span class="c2__balance-track"><span class="c2__balance-fill c2__balance-fill--${row.cls}" style="width:${(row.value / max) * 100}%"></span></span>` +
      `<span class="mono c2__balance-val">${fmt.bn1(row.value)}</span>`;
    wrap.appendChild(el);
  }

  if (reducedMotion) return;
  gsap.from(wrap.querySelectorAll('.c2__balance-fill'), {
    scaleX: 0, transformOrigin: 'left center', duration: 1.2, stagger: 0.2,
    scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
  });
}
