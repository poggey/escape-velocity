/* ============================================================
   C3 · BREAKING THE PLAYBOOK (light) — the divergence board.
   What it looks like: all five deviations at once, one ruled row
   each on the gallery-white page — no tabs, no hidden state. A
   row reads left to right: the deviation name with its one-line
   chip, the convention reading (muted), a mini-fork glyph where
   the convention track runs straight and dashed and the SpaceX
   track bends away in dawn amber (how hard, per data-diverge),
   then the SpaceX reading with its sourced note. The five forks
   sit in a column, so the divergences compare at a glance.
   What it does: rows rise in once on scroll and every fork
   dash-draws itself; nothing to operate. Beneath: the deal
   timeline as a dotted amber strip. All content lives in the
   hidden #c3-deviations ledger in index.html, figures via
   data-fact (§14.5).
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { svgEl } from '../lib/chart.js';
import events from '../../data/events.json';

/* mini-fork geometry: one glyph per row, shared frame */
const FW = 150, FH = 78, FX0 = 4, FX1 = 146, FY = 60;

function buildFork(diverge) {
  const svg = svgEl('svg', { class: 'c3__fork', viewBox: `0 0 ${FW} ${FH}`, 'aria-hidden': 'true' });
  svg.appendChild(svgEl('line', { class: 'c3__fork-conv', x1: FX0, y1: FY, x2: FX1, y2: FY }));
  const yEnd = FY - diverge * 46;
  const core = svgEl('path', {
    class: 'c3__fork-core',
    d: `M ${FX0} ${FY} C ${FX0 + 46} ${FY}, ${FX0 + 72} ${FY - diverge * 17}, ${FX1} ${yEnd}`,
  });
  svg.appendChild(core);
  svg.appendChild(svgEl('circle', { class: 'c3__fork-origin', cx: FX0, cy: FY, r: 3 }));
  svg.appendChild(svgEl('circle', { class: 'c3__fork-tip', cx: FX1, cy: yEnd, r: 3.5 }));
  return { svg, core };
}

export function initChapter() {
  const c3 = document.querySelector('#c3');
  fillFacts(c3); // $135, <0.75%, 30%… all from facts.json

  /* ---- the board: one row per ledger entry, all visible ---- */
  const board = c3.querySelector('#c3-board');
  const rows = [];
  const forkCores = [];
  for (const li of c3.querySelectorAll('#c3-deviations li')) {
    const role = (name) => li.querySelector(`[data-role="${name}"]`).innerHTML;
    const row = document.createElement('article');
    row.className = 'c3__row';
    row.innerHTML =
      `<div class="c3__who">` +
      `<p class="mono c3__name">${li.dataset.name}</p>` +
      `<p class="mono c3__chip">${role('chip')}</p></div>` +
      `<div class="c3__side c3__side--conv">` +
      `<p class="mono c3__side-tag">CONVENTION</p>` +
      `<p class="c3__stat">${role('conv-stat')}</p>` +
      `<p class="c3__text">${role('conv')}</p></div>` +
      `<div class="c3__forkcell"></div>` +
      `<div class="c3__side c3__side--spcx">` +
      `<p class="mono c3__side-tag">SPACEX</p>` +
      `<p class="c3__stat">${role('spcx-stat')}</p>` +
      `<p class="c3__text">${role('spcx')}</p>` +
      `<p class="mono c3__note">${role('note')}</p></div>`;
    const fork = buildFork(Number(li.dataset.diverge));
    row.querySelector('.c3__forkcell').appendChild(fork.svg);
    board.appendChild(row);
    rows.push(row);
    forkCores.push(fork.core);
  }

  if (!reducedMotion) {
    // rows rise in and their forks draw, on the same stagger — once
    const trigger = { trigger: board, start: 'top 78%', once: true };
    gsap.from(rows, {
      opacity: 0, y: 22, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: trigger,
    });
    gsap.from(forkCores, {
      strokeDashoffset: (i, el) => el.getTotalLength(),
      strokeDasharray: (i, el) => `${el.getTotalLength()} ${el.getTotalLength()}`,
      duration: 1.1, stagger: 0.12, ease: 'power2.inOut',
      scrollTrigger: trigger,
      onComplete: () => forkCores.forEach((core) => core.style.removeProperty('stroke-dasharray')),
    });
  }

  /* ---- deal timeline strip: dates from events.json so the site's
     chronology has exactly one source ---- */
  const timeline = c3.querySelector('#c3-timeline');
  for (const event of events.deal_timeline) {
    const item = document.createElement('div');
    item.className = 'c3__tl-item';
    item.innerHTML = `<p class="mono c3__tl-date">${event.date}</p><p class="c3__tl-label">${event.label}</p>`;
    timeline.appendChild(item);
  }
  if (!reducedMotion) {
    gsap.from(timeline.children, {
      opacity: 0, y: 16, duration: 0.6, stagger: 0.06,
      scrollTrigger: { trigger: timeline, start: 'top 90%', once: true },
    });
  }
}
