/* ============================================================
   C6 · THE AFTERMATH (light) — two charts as artworks.
   Chart 1: the full daily series — the run to $225.64, the ~32%
   correction shaded red, the $175.50 unlock-trigger line, and a
   flag on the 7 July Nasdaq-100 entry. The line draws as you
   scroll (scrubbed).
   Chart 2: the supply cliff — float 4% at IPO to ~40% by
   December, bars rising as they enter view.
   Between them: the "was +19% hot?" pop ranking and the
   money-left-on-the-table annotation from /analysis.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import { svgEl, makeScale, pathFrom, scrubDraw } from '../lib/chart.js';
import daily from '../../data/spcx_daily.json';
import supply from '../../data/supply.json';
import pops from '../../data/day_one_pops.json';
import money from '../../data/money_left.json';
import drawdown from '../../data/drawdown.json';
import events from '../../data/events.json';

export function initChapter() {
  const c6 = document.querySelector('#c6');
  fillFacts(c6);
  buildPriceChart(c6);
  buildPops(c6);
  buildSupplyChart(c6);
}

function buildPriceChart(c6) {
  const rows = daily.rows;
  const W = 1000, H = 420;
  const x = makeScale([0, rows.length - 1], [40, 880]);
  const y = makeScale([130, 240], [H - 40, 30]); // inverted: SVG y grows downward

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    'aria-label': 'SPCX daily close since listing' });
  const text = (tx, ty, str, anchor = 'start') => svg.appendChild(
    Object.assign(svgEl('text', { x: tx, y: ty, 'text-anchor': anchor }), { textContent: str }));

  const points = rows.map((r, i) => [x(i), y(r.close)]);
  const peakIndex = rows.findIndex((r) => r.close === Math.max(...rows.map((q) => q.close)));

  // Correction shading: the area under the line from the peak to today
  const areaPoints = points.slice(peakIndex).concat([[points.at(-1)[0], H - 40], [points[peakIndex][0], H - 40]]);
  svg.appendChild(svgEl('path', { class: 'drawdown-area', d: pathFrom(areaPoints) + ' Z' }));

  // The $175.50 unlock-trigger level — the price the stock would now have
  // to RECLAIM before 3 Aug to unlock ~456m extra shares
  svg.appendChild(svgEl('line', { class: 'trigger-line', x1: 40, y1: y(175.5), x2: 940, y2: y(175.5) }));
  text(944, y(175.5) + 4, 'TRIGGER $175.50');

  // Flags from events.json (peak, NDX entry)
  for (const flag of events.chart_flags) {
    const i = rows.findIndex((r) => r.date === flag.date);
    if (i === -1) continue;
    svg.appendChild(svgEl('line', { class: 'flag', x1: x(i), y1: y(rows[i].close) - 8, x2: x(i), y2: 44 }));
    text(x(i), 36, flag.label, flag.kind === 'peak' ? 'middle' : 'end');
  }

  const line = svgEl('path', { class: 'line', d: pathFrom(points) });
  svg.appendChild(line);
  text(points.at(-1)[0] + 10, points.at(-1)[1] + 4, fmt.usd2(rows.at(-1).close) + ' · 8 JUL');
  text(x(0), H - 14, '12 JUN', 'middle');
  text(x(rows.length - 1), H - 14, '8 JUL', 'middle');

  c6.querySelector('#c6-price-chart').appendChild(svg);

  // The line draws over roughly the figure's own scroll through the viewport
  scrubDraw(line, c6.querySelector('#c6-price-chart'), { start: 'top 75%', end: 'bottom 45%' });

  // §10 analysis annotations, straight from the /analysis output JSONs
  const notes = c6.querySelector('#c6-price-annotations');
  const stub = daily.is_stub ? ' · STUB DATA — RUN NOTEBOOK' : '';
  for (const s of [
    `PEAK→TROUGH ${fmt.pct1(drawdown.drawdown_pct)} (REPORTED ~${fmt.pct0(drawdown.reported_drawdown_pct)})`,
    `ANNUALISED VOL ${drawdown.annualised_vol_pct}%${stub}`,
  ]) {
    const p = document.createElement('p');
    p.className = 'mono';
    p.textContent = s;
    notes.appendChild(p);
  }
}

function buildPops(c6) {
  // Horizontal mini-ranking: was +19.2% hot? Bars scaled to the biggest pop.
  const max = Math.max(...pops.pops.map((p) => p.pop_pct));
  const wrap = c6.querySelector('#c6-pops');
  for (const p of pops.pops) {
    const row = document.createElement('div');
    row.className = 'pop-row' + (p.highlight ? ' pop-row--spcx' : '');
    row.innerHTML = `<span class="mono">${p.name}</span><span class="bar" style="width:${Math.max((p.pop_pct / max) * 100, 1.5)}%"></span><span class="mono">${fmt.pct1(p.pop_pct)}</span>`;
    wrap.appendChild(row);
  }
  c6.querySelector('#c6-money').textContent =
    `MONEY LEFT ON THE TABLE ≈ ${fmt.bn1(money.left_on_table_bn)} (555.6M × $135→$160.95) · ${fmt.pct1(money.underpricing_pct)} — ${money.verdict.toUpperCase()}`;

  if (reducedMotion) return;
  // Bars grow from the left as the ranking scrolls in — once, reading-paced
  gsap.from(wrap.querySelectorAll('.bar'), {
    scaleX: 0, duration: 0.9, stagger: 0.08,
    scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
  });
}

function buildSupplyChart(c6) {
  const W = 1000, H = 300;
  const y = makeScale([0, 45], [H - 40, 20]);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    'aria-label': 'Tradable float rising from 4% to about 40% by December' });
  const bars = [];
  supply.points.forEach((point, i) => {
    const bx = 60 + i * 135;
    // endpoints are reported; the in-between months are estimates — the two
    // fills are styled differently so the chart admits what it knows
    const known = point.note.includes('IPO') || point.note.includes('reported');
    const bar = svgEl('rect', { class: known ? 'bar bar--known' : 'bar', x: bx, width: 90,
      y: y(point.float_pct), height: (H - 40) - y(point.float_pct) });
    svg.appendChild(bar);
    bars.push(bar);
    const label = svgEl('text', { x: bx + 45, y: H - 18, 'text-anchor': 'middle' });
    label.textContent = point.month;
    svg.appendChild(label);
    const value = svgEl('text', { x: bx + 45, y: y(point.float_pct) - 8, 'text-anchor': 'middle' });
    value.textContent = point.float_pct + '%' + (known ? '' : ' EST');
    svg.appendChild(value);
  });
  c6.querySelector('#c6-supply-chart').appendChild(svg);

  if (reducedMotion) return;
  // Bars rise from the baseline in date order — the supply wave arriving
  gsap.from(bars, {
    scaleY: 0, transformOrigin: 'bottom', duration: 0.8, stagger: 0.1,
    scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
  });
}
