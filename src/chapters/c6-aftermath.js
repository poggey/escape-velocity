/* ============================================================
   C6 · THE AFTERMATH (light) — two charts as instruments.
   Chart 1 "The round trip": the daily series inside a real
   frame — price grid with $ labels, date ticks, a soft ink
   area under the line, the correction shaded in loss red with
   its figure printed inside the shape, flags for the peak and
   the NDX entry, and the $175.50 unlock trigger as a labelled
   dashed line. The line draws as you scroll (scrubbed).
   Chart 2 "The supply cliff": float by month — reported months
   as solid ink bars, estimates hollow, a legend that says so,
   and the first-wave marker on August.
   Between them: the pop ranking and the money-left annotation.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { facts, fillFacts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import { countUp } from '../lib/counter.js';
import { maskReveal } from '../lib/reveal.js';
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

  // the chapter's summary strip: run, give-back, money left — counted in
  countUp(c6.querySelector('#c6-run'), facts.aftermath.peak_gain_pct, fmt.pct0);
  countUp(c6.querySelector('#c6-give'), facts.aftermath.drawdown_pct, fmt.pct0);
  countUp(c6.querySelector('#c6-left'), facts.day_one.money_left_bn, fmt.bn1, { snap: 0.1 });

  buildPriceChart(c6);
  buildPops(c6);
  buildSupplyChart(c6);

  maskReveal(c6.querySelectorAll('.c6__close .mask-line'), {
    trigger: c6.querySelector('.c6__close'), start: 'top 80%', stagger: 0.3,
  });
}

function buildPriceChart(c6) {
  const rows = daily.rows;
  const W = 1000, H = 470;
  const PLOT = { x0: 84, x1: 880, y0: 44, y1: 400 };
  const x = makeScale([0, rows.length - 1], [PLOT.x0, PLOT.x1]);
  const y = makeScale([135, 235], [PLOT.y1, PLOT.y0]); // inverted: SVG y grows downward

  const points = rows.map((r, i) => [x(i), y(r.close)]);
  const last = rows.length - 1;
  const peakIndex = rows.findIndex((r) => r.close === Math.max(...rows.map((q) => q.close)));
  // '2026-06-16' -> '16 JUN', so the labels follow whatever window the notebook wrote
  const day = (iso) => new Date(iso + 'T00:00:00Z')
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase();

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    'aria-label': `SPCX daily close since listing: run to a ${fmt.usd2(rows[peakIndex].close)} closing peak, ` +
      `then down to ${fmt.usd2(rows[last].close)} by ${day(rows[last].date)}` });
  const text = (tx, ty, str, anchor = 'start', cls = '') => svg.appendChild(Object.assign(
    svgEl('text', { x: tx, y: ty, 'text-anchor': anchor, class: cls }), { textContent: str }));

  // price grid with $ labels in the left gutter
  for (const price of [150, 175, 200, 225]) {
    svg.appendChild(svgEl('line', { class: 'grid', x1: PLOT.x0, y1: y(price), x2: PLOT.x1, y2: y(price) }));
    text(PLOT.x0 - 12, y(price) + 4, '$' + price, 'end');
  }

  // soft ink area under the whole series (SVG gradient, tokens via CSS vars)
  const defs = svgEl('defs', {});
  defs.innerHTML =
    '<linearGradient id="c6-ink-fade" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" class="area-stop area-stop--top"/>' +
    '<stop offset="1" class="area-stop area-stop--bottom"/></linearGradient>';
  svg.appendChild(defs);
  svg.appendChild(svgEl('path', { class: 'series-area', fill: 'url(#c6-ink-fade)',
    d: pathFrom(points.concat([[points[last][0], PLOT.y1], [points[0][0], PLOT.y1]])) + ' Z' }));

  // the correction: area under the line from the peak, in loss red,
  // with its figure printed inside the shape — the chart's one loud mark
  const ddPoints = points.slice(peakIndex).concat([[points[last][0], PLOT.y1], [points[peakIndex][0], PLOT.y1]]);
  svg.appendChild(svgEl('path', { class: 'drawdown-area', d: pathFrom(ddPoints) + ' Z' }));
  text(x(peakIndex + (last - peakIndex) / 2), y(140),
    `${fmt.pct0(drawdown.drawdown_pct)} IN ${last - peakIndex} SESSIONS`, 'middle', 'loss-label');

  // the unlock-trigger level, dashed, labelled in place (terms from supply.json)
  const trig = supply.trigger;
  const triggerLine = svgEl('line', { class: 'trigger-line', x1: PLOT.x0, y1: y(trig.price), x2: PLOT.x1, y2: y(trig.price) });
  svg.appendChild(triggerLine);
  const triggerLabel = text(PLOT.x1 - 4, y(trig.price) - 8, `UNLOCK TRIGGER ${fmt.usd2(trig.price)} · BEFORE 3 AUG`, 'end', 'loss-label');

  // flags: the peak close (the $225.64 headline figure was intraday, so the
  // closing line peaks lower), then each dated flag from events.json
  const peakClose = rows[peakIndex].close;
  const peakLabel = text(x(peakIndex), y(peakClose) - 16,
    `PEAK CLOSE ${fmt.usd2(peakClose)} · ${fmt.pct0((peakClose / daily.ipo_price - 1) * 100)}`, 'middle', 'em');
  const peakRing = svgEl('circle', { class: 'peak-ring', cx: points[peakIndex][0], cy: points[peakIndex][1], r: 8 });
  svg.appendChild(peakRing);
  const annos = [peakLabel, peakRing, triggerLine, triggerLabel];
  for (const f of events.chart_flags) {
    const i = rows.findIndex((r) => r.date === f.date);
    if (i === -1) continue; // flag dated outside the series window
    const flag = svgEl('line', { class: 'flag', x1: x(i), y1: y(rows[i].close) - 8, x2: x(i), y2: PLOT.y0 + 14 });
    svg.appendChild(flag);
    annos.push(flag, text(x(i) + 6, PLOT.y0 + 8, f.label, 'end'));
  }

  // the line itself, then the reported prints as dots
  const line = svgEl('path', { class: 'line', d: pathFrom(points) });
  svg.appendChild(line);
  for (const i of [0, peakIndex, last]) {
    svg.appendChild(svgEl('circle', { class: 'anchor', cx: points[i][0], cy: points[i][1], r: 4 }));
  }
  text(points[last][0] + 12, points[last][1] + 4, `${fmt.usd2(rows[last].close)} · ${day(rows[last].date)}`, 'start', 'em');
  text(points[0][0] + 8, points[0][1] + 22, `$${rows[0].close.toFixed(2)} · DAY-ONE CLOSE`);

  // date ticks along the base: listing, peak, last
  for (const i of [0, peakIndex, last]) {
    svg.appendChild(svgEl('line', { class: 'tick', x1: x(i), y1: PLOT.y1, x2: x(i), y2: PLOT.y1 + 6 }));
    text(x(i), PLOT.y1 + 24, day(rows[i].date), 'middle');
  }

  c6.querySelector('#c6-price-chart').appendChild(svg);

  // The line draws over roughly the figure's own scroll through the viewport
  scrubDraw(line, c6.querySelector('#c6-price-chart'), { start: 'top 75%', end: 'bottom 45%' });

  // the annotations settle in after the line: peak, trigger, NDX — once
  if (!reducedMotion) {
    gsap.from(annos, {
      opacity: 0, y: 6, duration: 0.6, stagger: 0.15,
      scrollTrigger: { trigger: svg, start: 'top 55%', once: true },
    });
  }

  // §10 analysis annotations, straight from the /analysis output JSONs
  const notes = c6.querySelector('#c6-price-annotations');
  const stub = daily.is_stub ? ' · STUB DATA — RUN NOTEBOOK' : '';
  for (const s of [
    `PEAK→TROUGH ${fmt.pct1(drawdown.drawdown_pct)} ON CLOSES (REPORTED ~${fmt.pct0(drawdown.reported_drawdown_pct)} FROM THE INTRADAY HIGH)`,
    `ANNUALISED VOL ${drawdown.annualised_vol_pct}%` +
      (drawdown.qqq_annualised_vol_pct ? ` · QQQ ${drawdown.qqq_annualised_vol_pct}%` : '') + stub,
  ]) {
    const p = document.createElement('p');
    p.className = 'mono';
    p.textContent = s;
    notes.appendChild(p);
  }
}

function buildPops(c6) {
  // Horizontal ranking: was +19.2% hot? Bars scaled to the biggest pop.
  const max = Math.max(...pops.pops.map((p) => p.pop_pct));
  const wrap = c6.querySelector('#c6-pops');
  for (const p of pops.pops) {
    const row = document.createElement('div');
    row.className = 'pop-row' + (p.highlight ? ' pop-row--spcx' : '');
    const name = p.name + (p.year ? ' ' + p.year : '');
    row.innerHTML =
      `<span class="mono">${name}</span>` +
      `<span class="pop-track"><span class="bar" style="width:${Math.max((p.pop_pct / max) * 100, 1)}%"></span></span>` +
      `<span class="mono pop-val">${fmt.pct1(p.pop_pct)}</span>`;
    wrap.appendChild(row);
  }
  c6.querySelector('#c6-money').textContent =
    `MONEY LEFT ON THE TABLE ≈ ${fmt.bn1(money.left_on_table_bn)} (555.6M × $135→$160.95) · ${fmt.pct1(money.underpricing_pct)} — ${money.verdict.toUpperCase()}`;

  if (reducedMotion) return;
  // Bars grow from the left as the ranking scrolls in — once, reading-paced
  gsap.from(wrap.querySelectorAll('.bar'), {
    scaleX: 0, transformOrigin: 'left center', duration: 0.9, stagger: 0.08,
    scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
  });
}

function buildSupplyChart(c6) {
  const W = 1000, H = 360;
  const PLOT = { x0: 84, x1: 940, y0: 40, y1: 300 };
  const y = makeScale([0, 45], [PLOT.y1, PLOT.y0]);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    'aria-label': 'Tradable float rising from 4% at IPO to about 40% by December' });
  const text = (tx, ty, str, anchor = 'start', cls = '') => svg.appendChild(Object.assign(
    svgEl('text', { x: tx, y: ty, 'text-anchor': anchor, class: cls }), { textContent: str }));

  // % grid
  for (const pct of [0, 10, 20, 30, 40]) {
    svg.appendChild(svgEl('line', { class: pct === 0 ? 'tick' : 'grid', x1: PLOT.x0, y1: y(pct), x2: PLOT.x1, y2: y(pct) }));
    text(PLOT.x0 - 12, y(pct) + 4, pct + '%', 'end');
  }

  // legend: the chart admits which bars are reported and which are guesses
  text(PLOT.x1, PLOT.y0 - 14, 'SOLID REPORTED · HOLLOW ESTIMATE', 'end');

  const slot = (PLOT.x1 - PLOT.x0) / supply.points.length;
  const bars = [];
  supply.points.forEach((point, i) => {
    const cx = PLOT.x0 + slot * (i + 0.5);
    const bw = Math.min(64, slot * 0.5);
    const known = point.note.includes('IPO') || point.note.includes('reported');
    const bar = svgEl('rect', { class: known ? 'bar bar--known' : 'bar', x: cx - bw / 2, width: bw,
      y: y(point.float_pct), height: PLOT.y1 - y(point.float_pct) });
    svg.appendChild(bar);
    bars.push(bar);
    text(cx, PLOT.y1 + 24, point.month, 'middle');
    text(cx, y(point.float_pct) - 10, point.float_pct + '%', 'middle', known ? 'em' : '');
    if (point.month === 'AUG') text(cx, PLOT.y1 + 42, 'FIRST WAVE · 6 AUG', 'middle', 'label--wave');
  });

  c6.querySelector('#c6-supply-chart').appendChild(svg);

  if (reducedMotion) return;
  // Bars rise from the baseline in date order — the supply wave arriving
  gsap.from(bars, {
    scaleY: 0, transformOrigin: 'bottom', duration: 0.8, stagger: 0.1,
    scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
  });
}
