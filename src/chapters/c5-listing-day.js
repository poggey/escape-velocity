/* ============================================================
   C5 · LISTING DAY (light) — the site's ONE pinned chapter (§12).
   What it looks like: the intraday story as a single drawn line —
   the $135 pricing baseline (dashed), a muted "open delayed"
   stretch, then the gain-green line from the $150 first trade at
   11:55 to the $160.95 close, with the $166.76 after-hours print
   as a hollow dot beyond the bell. Two live counters (gain %,
   market cap) ride above the chart.
   What it does: the section pins for ~1.5 screens of scroll while
   the line draws and the counters tick, keyed to the line's head.
   Only the four REPORTED anchors are drawn — no intraday path is
   invented between them (numbers rule).
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts, facts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import { svgEl, makeScale, pathFrom } from '../lib/chart.js';
import records from '../../data/ipo_records.json';

export function initChapter() {
  const c5 = document.querySelector('#c5');
  fillFacts(c5);

  // Record-raise strip: only rows with whitepaper-sourced figures render
  const sourced = records.records.filter((r) => r.raise_bn !== null);
  c5.querySelector('#c5-records').textContent =
    'RECORD RAISES — ' + sourced.map((r) => `${r.name} ${fmt.bn1(r.raise_bn)} (${r.year})`).join(' · ');

  const d = facts.day_one;
  const ipoPrice = facts.ipo.price;

  // ---- build the SVG (viewBox coordinates; scales to any width) ----
  const W = 1000, H = 380;
  const x = makeScale([570, 960], [50, 880]);   // minutes of day: 09:30 -> 16:00
  const y = makeScale([128, 172], [H - 44, 24]); // price -> px (inverted: SVG y grows down)
  const priceFromY = (py) => 128 + ((H - 44 - py) / (H - 44 - 24)) * (172 - 128);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    'aria-label': `Listing day: priced $${ipoPrice}, first trade $${d.open}, close $${d.close}` });

  const text = (tx, ty, str, anchor = 'start') => svg.appendChild(
    Object.assign(svgEl('text', { x: tx, y: ty, 'text-anchor': anchor }), { textContent: str }));

  // $135 pricing baseline + the delayed-open stretch along it
  svg.appendChild(svgEl('line', { class: 'baseline', x1: x(570), y1: y(ipoPrice), x2: x(960), y2: y(ipoPrice) }));
  text(x(570), y(ipoPrice) + 18, `PRICED ${fmt.usd0(ipoPrice)} · 11 JUNE`);
  text(x(570) + (x(715) - x(570)) / 2, y(ipoPrice) - 10, 'OPEN DELAYED', 'middle');

  // The traded line: first trade 11:55 (715 min) -> close 16:00 (960 min)
  const line = svgEl('path', { class: 'line', d: pathFrom([[x(715), y(d.open)], [x(960), y(d.close)]]) });
  svg.appendChild(line);

  // Anchor dots + labels for the reported prints
  svg.appendChild(svgEl('circle', { class: 'anchor', cx: x(715), cy: y(d.open), r: 4 }));
  text(x(715), y(d.open) - 14, `${fmt.usd2(d.open)} FIRST TRADE (${fmt.pct1(d.open_gain_pct)})`);
  svg.appendChild(svgEl('circle', { class: 'anchor', cx: x(960), cy: y(d.close), r: 4 }));
  text(x(960) - 8, y(d.close) - 14, `${fmt.usd2(d.close)} CLOSE`, 'end');
  svg.appendChild(svgEl('circle', { class: 'anchor', cx: x(960) + 34, cy: y(d.after_hours), r: 4, fill: 'none', stroke: 'currentColor' }));
  text(x(960) + 34, y(d.after_hours) - 14, `${fmt.usd2(d.after_hours)} AH`, 'middle');

  // Session clock along the base
  [['09:30', 570], ['11:55', 715], ['16:00', 960]].forEach(([t, m]) => text(x(m), H - 16, t, 'middle'));

  // The head dot the counters are keyed to
  const head = svgEl('circle', { class: 'head', r: 6, cx: x(715), cy: y(d.open) });
  svg.appendChild(head);

  c5.querySelector('#c5-chart').appendChild(svg);

  // ---- counters: derived from the head's price so line and numbers agree ----
  const gainEl = c5.querySelector('#c5-gain');
  const capEl = c5.querySelector('#c5-cap');
  const setReadout = (price) => {
    gainEl.textContent = fmt.pct1((price / ipoPrice - 1) * 100);
    // market cap = offering valuation scaled by price (same share base as $1.77tn)
    capEl.textContent = fmt.tn(facts.ipo.valuation_tn * (price / ipoPrice));
  };

  if (reducedMotion) {
    setReadout(d.close); // final state: +19.2%, ~$2.1T — no pin, no scrub
    return;
  }
  setReadout(ipoPrice);

  // The pin: the chapter holds still for 1.5 viewport-heights of scrolling
  // (end: '+=150%') while one linear proxy tween runs 0 -> 1. scrub: 1 ties
  // it to the wheel with light smoothing. From the proxy's progress we set
  // the line's dash-draw, the head position, and both counters — one driver,
  // so nothing can drift out of sync.
  const length = line.getTotalLength();
  line.style.strokeDasharray = length;
  const proxy = { p: 0 };
  gsap.to(proxy, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: c5, start: 'top top', end: '+=150%', pin: true, scrub: 1 },
    onUpdate: () => {
      line.style.strokeDashoffset = length * (1 - proxy.p);
      const pt = line.getPointAtLength(length * proxy.p);
      head.setAttribute('cx', pt.x);
      head.setAttribute('cy', pt.y);
      setReadout(priceFromY(pt.y));
    },
  });
}
