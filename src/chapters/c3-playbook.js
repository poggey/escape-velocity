/* ============================================================
   C3 · BREAKING THE PLAYBOOK (light) — the centrepiece, redesigned.
   What it looks like: the five deviations as an instrument board.
   Five tabs run down the left (PRICING, FEES, RETAIL, CONDITIONS,
   INDEX), each carrying a one-line chip of how far convention was
   broken. The display is a dark, star-lit panel — the hero's sky
   in miniature — where a fork diagram shows the conventional
   track running straight and dashed while the SpaceX track burns
   away from it in dawn amber, harder or softer per deviation
   (data-diverge). Right of the fork, the two readings: convention
   muted, SpaceX luminous, with the sourced note beneath.
   What it does: tabs select (click, or roving arrow keys); left
   alone, the board runs itself every few seconds until first
   touched. The fork redraws with a scrub-style dash animation.
   Beneath: the deal timeline as a dotted amber strip.
   All content lives in the hidden #c3-deviations ledger in
   index.html, figures via data-fact (§14.5).
   ============================================================ */
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { svgEl } from '../lib/chart.js';
import events from '../../data/events.json';

const CYCLE_S = 6; // auto-advance while unattended

export function initChapter() {
  const c3 = document.querySelector('#c3');
  fillFacts(c3); // $135, <0.75%, 30%… all from facts.json

  const items = [...c3.querySelectorAll('#c3-deviations li')].map((li) => {
    const role = (name) => li.querySelector(`[data-role="${name}"]`);
    return {
      name: li.dataset.name,
      diverge: Number(li.dataset.diverge),
      chip: role('chip').innerHTML,
      convStat: role('conv-stat').innerHTML,
      conv: role('conv').innerHTML,
      spcxStat: role('spcx-stat').innerHTML,
      spcx: role('spcx').innerHTML,
      note: role('note').innerHTML,
    };
  });

  /* ---- the fork diagram, built once, redrawn per selection ---- */
  const svg = c3.querySelector('#c3-fork');
  const W = 560, H = 236, X0 = 26, X1 = 534, Y = 168;
  svg.appendChild(svgEl('line', { class: 'c3__fork-conv', x1: X0, y1: Y, x2: X1, y2: Y }));
  const forkGlow = svgEl('path', { class: 'c3__fork-glow', d: '' });
  const forkCore = svgEl('path', { class: 'c3__fork-core', d: '' });
  const tipHalo = svgEl('circle', { class: 'c3__fork-halo', r: 11 });
  const tipCore = svgEl('circle', { class: 'c3__fork-tip', r: 3.5 });
  const origin = svgEl('circle', { class: 'c3__fork-origin', cx: X0, cy: Y, r: 4 });
  const convLabel = svgEl('text', { x: X1, y: Y + 22, 'text-anchor': 'end', class: 'c3__fork-label' });
  convLabel.textContent = 'CONVENTION';
  const spcxLabel = svgEl('text', { 'text-anchor': 'end', class: 'c3__fork-label c3__fork-label--spcx' });
  spcxLabel.textContent = 'SPACEX';
  for (const el of [forkGlow, forkCore, tipHalo, tipCore, origin, convLabel, spcxLabel]) svg.appendChild(el);

  const forkPath = (d) => {
    const yEnd = Y - d * 128;
    return `M ${X0} ${Y} C ${X0 + 170} ${Y}, ${X0 + 260} ${Y - d * 46}, ${X1} ${yEnd}`;
  };

  /* ---- selection ---- */
  const tabs = [];
  const put = (id, html) => { c3.querySelector(id).innerHTML = html; };
  let selected = -1;

  function select(i, { animate = !reducedMotion } = {}) {
    if (i === selected) return;
    selected = i;
    const item = items[i];
    tabs.forEach((tab, j) => {
      tab.classList.toggle('is-selected', j === i);
      tab.setAttribute('aria-selected', j === i);
      tab.tabIndex = j === i ? 0 : -1;
    });
    put('#c3-conv-stat', item.convStat);
    put('#c3-conv-text', item.conv);
    put('#c3-spcx-stat', item.spcxStat);
    put('#c3-spcx-text', item.spcx);
    put('#c3-note', item.note);

    const d = forkPath(item.diverge);
    forkCore.setAttribute('d', d);
    forkGlow.setAttribute('d', d);
    const yEnd = Y - item.diverge * 128;
    for (const el of [tipHalo, tipCore]) { el.setAttribute('cx', X1); el.setAttribute('cy', yEnd); }
    spcxLabel.setAttribute('x', X1);
    spcxLabel.setAttribute('y', yEnd - 14);

    if (!animate) return;
    const length = forkCore.getTotalLength();
    gsap.fromTo([forkCore, forkGlow],
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.9, overwrite: true });
    gsap.fromTo([tipHalo, tipCore, spcxLabel], { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.55, overwrite: true });
    gsap.fromTo(c3.querySelectorAll('.c3__side'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, overwrite: true });
  }

  /* ---- tabs: click, or roving arrow keys (a real tablist) ---- */
  const tablist = c3.querySelector('#c3-tabs');
  items.forEach((item, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'c3__tab';
    tab.setAttribute('role', 'tab');
    tab.innerHTML =
      `<span class="mono c3__tab-name">${item.name}</span>` +
      `<span class="c3__tab-chip">${item.chip}</span>`;
    tab.addEventListener('click', () => { attend(); select(i); });
    tablist.appendChild(tab);
    tabs.push(tab);
  });
  tablist.addEventListener('keydown', (e) => {
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    attend();
    const next = (selected + delta + items.length) % items.length;
    select(next);
    tabs[next].focus();
  });

  /* ---- the unattended cycle: runs only while on screen, stops for good
     the moment the reader takes over ---- */
  let attended = reducedMotion;
  let timer = null;
  const attend = () => { attended = true; clearTimeout(timer); };
  const tick = () => {
    if (attended) return;
    select((selected + 1) % items.length);
    timer = setTimeout(tick, CYCLE_S * 1000);
  };
  ScrollTrigger.create({
    trigger: c3.querySelector('#c3-board'),
    start: 'top 80%', end: 'bottom 20%',
    onEnter: () => { if (!attended && !timer) timer = setTimeout(tick, CYCLE_S * 1000); },
    onToggle: (self) => { if (!self.isActive) { clearTimeout(timer); timer = null; } },
  });

  select(0, { animate: false });

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
