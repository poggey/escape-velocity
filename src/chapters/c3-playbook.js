/* ============================================================
   C3 · BREAKING THE PLAYBOOK (light) — the centrepiece.
   What it looks like: a five-row comparison table. CONVENTION
   column muted, SPACEX column full ink in larger type. Beneath
   it, the deal timeline as a mono strip (filed → priced → traded).
   What it does: each row fades up as it enters the viewport while
   its bottom hairline draws across — typographic hierarchy does
   the work, no gimmicks (§13).
   This file is the README's worked example — read them together.
   ============================================================ */
import { gsap, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import events from '../../data/events.json';

export function initChapter() {
  const c3 = document.querySelector('#c3');
  fillFacts(c3); // $135, <0.75%, 30%… all from facts.json

  // Deal timeline strip: dates from events.json so the site's chronology
  // has exactly one source
  const timeline = c3.querySelector('#c3-timeline');
  for (const event of events.deal_timeline) {
    const item = document.createElement('p');
    item.className = 'mono';
    item.textContent = `${event.date} — ${event.label}`;
    timeline.appendChild(item);
  }

  if (reducedMotion) return;

  // Per-row reveal. Each row gets its OWN ScrollTrigger (rather than one
  // staggered timeline) so a reader scrolling slowly sees rows arrive as
  // they reach them — the reveal is tied to reading pace, not to the first
  // row's position.
  for (const row of c3.querySelectorAll('tbody tr')) {
    // the hairline that draws across under the row
    const rule = document.createElement('span');
    rule.className = 'row-rule';
    row.querySelector('td:last-child').appendChild(rule);

    gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: 'top 85%', // fire when the row's top clears the lower 15% of the viewport
        once: true,
      },
    })
      .from(row.children, { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 })
      .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, '<0.2');
  }

  gsap.from(timeline.children, {
    opacity: 0,
    y: 16,
    duration: 0.6,
    stagger: 0.06,
    scrollTrigger: { trigger: timeline, start: 'top 90%', once: true },
  });
}
