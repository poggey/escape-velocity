/* ============================================================
   C5 · LISTING DAY (dark terminal) — the site's ONE pinned chapter (§12).
   What it looks like: the session as a designed instrument, not
   a floating line — a price grid down the left ($140…$170), the
   session clock along the base (09:30…16:00), the $135 pricing
   baseline dashed, a shaded "no prints" panel for the delayed
   open, then the traded line rising from the $150 first trade
   to the $160.95 close with the gain area tinted beneath it.
   Past the closing-bell rule, the $166.76 after-hours print
   sits in its own zone. Two live counters (gain %, market cap)
   ride above the chart, keyed to the line's head.
   What it does: the section pins for ~1.5 screens of scroll
   while the line draws and the counters tick.
   Only the REPORTED prints are drawn — no intraday path is
   invented between them (numbers rule); the chart says so.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts, facts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import { svgEl, makeScale, pathFrom } from '../lib/chart.js';
import { mountSky } from '../lib/lumen.js';
import records from '../../data/ipo_records.json';

export function initChapter() {
  const c5 = document.querySelector('#c5');
  fillFacts(c5);
  mountSky(c5, { stars: 110 }); // redesign: the terminal sits under the night sky

  // Record-raise strip: only rows with whitepaper-sourced figures render
  const sourced = records.records.filter((r) => r.raise_bn !== null);
  c5.querySelector('#c5-records').textContent =
    'RECORD RAISES — ' + sourced.map((r) => `${r.name} ${fmt.bn1(r.raise_bn)} (${r.year})`).join(' · ');

  const d = facts.day_one;
  const ipoPrice = facts.ipo.price;

  /* ---- geometry: left price gutter, session plot, after-hours zone ---- */
  const W = 1000, H = 460;
  const PLOT = { x0: 84, x1: 850, y0: 34, y1: 396 };   // the traded session
  const AH_X = 940;                                    // after-hours zone edge
  const x = makeScale([570, 960], [PLOT.x0, PLOT.x1]); // minutes: 09:30 -> 16:00
  const y = makeScale([128, 174], [PLOT.y1, PLOT.y0]); // price (SVG y grows down)
  const priceFromY = (py) => 128 + ((PLOT.y1 - py) / (PLOT.y1 - PLOT.y0)) * (174 - 128);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
    preserveAspectRatio: 'xMinYMid meet',   // height-capped by CSS: stay left-aligned with the text column
    'aria-label': `Listing day: priced $${ipoPrice}, first trade $${d.open} at 11:55, close $${d.close}, after hours $${d.after_hours}` });
  const text = (tx, ty, str, anchor = 'start', cls = '') => svg.appendChild(Object.assign(
    svgEl('text', { x: tx, y: ty, 'text-anchor': anchor, class: cls }), { textContent: str }));

  // price grid: hairlines with $ labels in the left gutter
  for (const price of [140, 150, 160, 170]) {
    svg.appendChild(svgEl('line', { class: 'grid', x1: PLOT.x0, y1: y(price), x2: AH_X, y2: y(price) }));
    text(PLOT.x0 - 12, y(price) + 4, '$' + price, 'end');
  }

  // the delayed open: a shaded "no prints" panel from the bell to 11:55
  svg.appendChild(svgEl('rect', { class: 'void-zone', x: x(570), y: PLOT.y0,
    width: x(715) - x(570), height: PLOT.y1 - PLOT.y0 }));
  text((x(570) + x(715)) / 2, PLOT.y0 + 24, 'NO PRINTS', 'middle');
  text((x(570) + x(715)) / 2, PLOT.y0 + 42, 'OPEN DELAYED 2H 25M', 'middle');

  // $135 pricing baseline, dashed across everything
  svg.appendChild(svgEl('line', { class: 'baseline', x1: PLOT.x0, y1: y(ipoPrice), x2: AH_X, y2: y(ipoPrice) }));
  text(PLOT.x0 - 12, y(ipoPrice) + 4, `$${ipoPrice}`, 'end', 'em');
  text(x(570) + 12, y(ipoPrice) + 20, 'PRICED · 11 JUNE, AFTER THE CLOSE');

  // session clock along the base
  for (const [label, mins] of [['09:30', 570], ['11:00', 660], ['12:00', 720], ['13:00', 780], ['14:00', 840], ['15:00', 900], ['16:00', 960]]) {
    svg.appendChild(svgEl('line', { class: 'tick', x1: x(mins), y1: PLOT.y1, x2: x(mins), y2: PLOT.y1 + 6 }));
    text(x(mins), PLOT.y1 + 24, label, 'middle');
  }

  // the gain area: between the $135 baseline and the traded line
  const linePts = [[x(715), y(d.open)], [x(960), y(d.close)]];
  svg.appendChild(svgEl('path', { class: 'gain-area',
    d: pathFrom([[x(715), y(ipoPrice)], ...linePts, [x(960), y(ipoPrice)]]) + ' Z' }));

  // the traded line: first trade 11:55 -> close 16:00 (the reported prints)
  const line = svgEl('path', { class: 'line', d: pathFrom(linePts) });
  svg.appendChild(line);

  // anchor prints + labels
  svg.appendChild(svgEl('circle', { class: 'anchor', cx: x(715), cy: y(d.open), r: 4.5 }));
  text(x(715) - 8, y(d.open) + 26, `FIRST TRADE ${fmt.usd2(d.open)} · 11:55 (${fmt.pct1(d.open_gain_pct)})`); // below-left, clear of the head
  svg.appendChild(svgEl('circle', { class: 'anchor', cx: x(960), cy: y(d.close), r: 4.5 }));
  text(x(960) - 12, y(d.close) - 16, `CLOSE ${fmt.usd2(d.close)} (${fmt.pct1(d.gain_pct)})`, 'end', 'em');

  // the closing bell, then the after-hours print in its own zone
  svg.appendChild(svgEl('line', { class: 'bell', x1: PLOT.x1, y1: PLOT.y0, x2: PLOT.x1, y2: PLOT.y1 }));
  text((PLOT.x1 + AH_X) / 2, PLOT.y0 + 24, 'AFTER', 'middle');
  text((PLOT.x1 + AH_X) / 2, PLOT.y0 + 42, 'HOURS', 'middle');
  svg.appendChild(svgEl('circle', { class: 'anchor anchor--hollow', cx: (PLOT.x1 + AH_X) / 2, cy: y(d.after_hours), r: 4.5 }));
  text((PLOT.x1 + AH_X) / 2, y(d.after_hours) + 26, fmt.usd2(d.after_hours), 'middle'); // below the dot, clear of the zone caption

  // honesty note: the line is the reported prints, nothing invented
  text(PLOT.x0, H - 6, 'REPORTED PRINTS ONLY — NO INTRADAY PATH IS INVENTED BETWEEN THEM');

  // the head the counters are keyed to: a soft glow under a solid dot
  const headGlow = svgEl('circle', { class: 'head-glow', r: 16, cx: x(715), cy: y(d.open) });
  const head = svgEl('circle', { class: 'head', r: 5.5, cx: x(715), cy: y(d.open) });
  svg.appendChild(headGlow);
  svg.appendChild(head);

  c5.querySelector('#c5-chart').appendChild(svg);

  /* ---- counters: derived from the head's price so line and numbers agree ---- */
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
    scrollTrigger: { trigger: c5, start: 'top top', end: '+=150%', pin: true, scrub: 1, anticipatePin: 1 },
    onUpdate: () => {
      line.style.strokeDashoffset = length * (1 - proxy.p);
      const pt = line.getPointAtLength(length * proxy.p);
      head.setAttribute('cx', pt.x);
      head.setAttribute('cy', pt.y);
      headGlow.setAttribute('cx', pt.x);
      headGlow.setAttribute('cy', pt.y);
      setReadout(priceFromY(pt.y));
    },
  });
}
