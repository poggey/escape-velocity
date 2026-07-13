/* ============================================================
   C7 · THE VERDICT (dark) — the orbit map.
   Earth sits at the centre of one screen, dashed altitude rings
   around it: LOW ORBIT, DECAYING, STABLE ORBIT, ESCAPE VELOCITY.
   The Moon hangs in the top-right corner. Each of the six
   constituencies flies its verdict as one slow orbit:
     company    — a clean circle on the stable ring
     holders    — a spiral that sits lower on every pass
     day-one    — suborbital: up, over, and back down; forever
     banks      — a tight, fast circle just above the surface
     retail     — an eccentric ellipse swinging across the rings
     structure  — the showpiece: out to the Moon and back
   Altitude IS the outcome. Beside the map, a readout card and
   the six legend chips — the whole verdict on one screen. Tap a
   flight or a chip: it brightens, the rest dim, the readout
   shows the verdict + evidence (from the hidden #c7-ledger,
   figures via data-fact). Then the thesis viewport:
   "Priced efficiently. Traded emotionally."
   ============================================================ */
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { maskReveal } from '../lib/reveal.js';
import { svgEl } from '../lib/chart.js';
import { mountSky } from '../lib/lumen.js';

const W = 1000, H = 640;
const EARTH = { x: 430, y: 320, r: 78 };
const MOON = { x: 880, y: 104, r: 20 };
const TRAIL = 80; // bright exhaust behind each spark, in px

const RINGS = [
  { r: 270, name: 'ESCAPE VELOCITY' },
  { r: 215, name: 'STABLE ORBIT' },
  { r: 165, name: 'DECAYING ORBIT' },
  { r: 120, name: 'LOW ORBIT' },
];

/* an ellipse around a centre, optionally rotated — returns [x, y] for
   s ∈ [0,1]. Pass cx/cy off Earth to put Earth at a focus. */
const orbit = ({ rx, ry = rx, rot = 0, cx = EARTH.x, cy = EARTH.y, phase = 0 }) => {
  const cosR = Math.cos(rot), sinR = Math.sin(rot);
  return (s) => {
    const t = 2 * Math.PI * (s + phase);
    const ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    return [cx + ex * cosR - ey * sinR, cy + ex * sinR + ey * cosR];
  };
};

/* retail's ellipse: Earth at a focus — perigee 140, apogee 252 */
const RETAIL_A = 196, RETAIL_C = 56, RETAIL_ROT = -0.45;
const retailOrbit = orbit({
  rx: RETAIL_A,
  ry: Math.sqrt(RETAIL_A ** 2 - RETAIL_C ** 2),
  rot: RETAIL_ROT,
  cx: EARTH.x - RETAIL_C * Math.cos(RETAIL_ROT),
  cy: EARTH.y - RETAIL_C * Math.sin(RETAIL_ROT),
});

/* Flight shapes: each is [x, y] for s ∈ [0,1] — or a hand-authored path
   `d` for the one flight that leaves the map's orbital grammar. `dead` is
   the silent fraction of the cycle after the flight (relaunch pause);
   `labelAt` the s-position where the name tag sits. */
const FLIGHTS = {
  stable: {
    period: 26, dead: 0, labelAt: 0.13,
    shape: orbit({ rx: 215, phase: 0.62 }),
  },
  decay: {
    // two passes, each sitting lower: stable-adjacent down into the decay band
    period: 30, dead: 0.08, labelAt: 0.30,
    shape: (s) => {
      const t = 4 * Math.PI * s - Math.PI / 2;
      const r = 222 - 62 * s;
      return [EARTH.x + r * Math.cos(t), EARTH.y + r * Math.sin(t)];
    },
  },
  fall: {
    // suborbital: off the surface, over the top, back down — never an orbit
    period: 16, dead: 0.22, labelAt: 0.50,
    shape: (s) => {
      const a = -Math.PI + 0.55 + (Math.PI - 1.1) * s;
      const r = EARTH.r + 2 + 105 * Math.sin(Math.PI * s);
      return [EARTH.x + r * Math.cos(a), EARTH.y + r * Math.sin(a)];
    },
  },
  tiny: {
    period: 11, dead: 0, labelAt: 0.86,
    shape: orbit({ rx: 104, phase: 0.30 }),
  },
  eccentric: {
    period: 24, dead: 0, labelAt: 0.55,
    shape: retailOrbit,
  },
  moon: {
    // the figure-eight, exactly: a crossed belt around the two bodies.
    // 213° of low Earth orbit (r 110), a straight transfer leg out, 213°
    // round the far side of the Moon (r 34), and the return leg — the two
    // legs are the circles' internal tangents, so they cross between the
    // bodies and every joint is tangency-smooth. One closed loop.
    period: 42, dead: 0, labelAt: 0.15,
    d: 'M 413.0 211.3 L 885.2 137.6 A 34 34 0 1 0 857.1 78.9 L 504.2 401.2 A 110 110 0 1 1 413.0 211.3 Z',
  },
};

export function initChapter() {
  const c7 = document.querySelector('#c7');
  fillFacts(c7);
  mountSky(c7, { stars: 130, horizon: false });
  maskReveal(c7.querySelectorAll('.c7__thesis .mask-line'), {
    trigger: c7.querySelector('.c7__thesis'), start: 'top 60%', stagger: 0.35,
  });

  const svg = c7.querySelector('#c7-orbit');
  const readout = c7.querySelector('#c7-readout');
  const legend = c7.querySelector('#c7-legend');

  buildScene(svg);

  /* ---- one rocket per ledger row; the hidden <ul> is the single source ---- */
  const rockets = [...c7.querySelectorAll('#c7-ledger li')].map((li, i) => {
    const spec = FLIGHTS[li.dataset.orbit];
    const group = svgEl('g', {
      class: `rocket rocket--${li.dataset.tone}`,
      tabindex: 0, role: 'button',
      'aria-label': `${li.dataset.name}: ${li.dataset.verdict}`,
    });

    // the full flight, sampled from the shape (or hand-authored for the Moon)
    const d = spec.d ?? pathFromShape(spec.shape);
    const trace = svgEl('path', { class: 'rocket-trace', d });
    const hit = svgEl('path', { class: 'rocket-hit', d });
    const live = svgEl('g', { class: 'rocket-live' });
    const trail = svgEl('path', { class: 'rocket-trail', d });
    const halo = svgEl('circle', { class: 'rocket-halo', r: 10 });
    const spark = svgEl('circle', { class: 'rocket-spark', r: 4 });
    live.append(trail, halo, spark);
    group.append(trace, hit, live);
    svg.appendChild(group);

    const len = trace.getTotalLength();
    const lp = trace.getPointAtLength(spec.labelAt * len);
    const label = svgEl('text', {
      class: 'rocket-label', x: lp.x + 12, y: lp.y - 12,
      'text-anchor': lp.x > W - 230 ? 'end' : 'start',
    });
    label.textContent = li.dataset.name;
    group.appendChild(label);

    trail.style.strokeDasharray = `${TRAIL} ${len + TRAIL}`;
    trail.style.strokeDashoffset = TRAIL; // nothing painted until the loop runs

    return { li, spec, group, trace, trail, spark, halo, live, len, phase: i * 3.1 };
  });

  /* ---- selection: rocket, trajectory, label or legend chip ---- */
  let selected = null;
  function select(rocket) {
    selected?.group.classList.remove('is-selected');
    selected?.chip.classList.remove('is-selected');
    selected = rocket;
    for (const r of rockets) r.group.classList.toggle('is-dim', r !== rocket);
    rocket.group.classList.add('is-selected');
    rocket.chip.classList.add('is-selected');
    readout.innerHTML =
      `<p class="mono readout__name">${rocket.li.dataset.name}</p>` +
      `<p class="mono readout__verdict readout__verdict--${rocket.li.dataset.tone}">${rocket.li.dataset.verdict}</p>` +
      `<p class="readout__desc">${rocket.li.querySelector('[data-role="desc"]').innerHTML}</p>` +
      `<p class="readout__evidence">${rocket.li.querySelector('[data-role="evidence"]').innerHTML}</p>`;
  }

  // The map cycles through the flights on its own until the reader takes
  // over — the readout always shows a live verdict, never a prompt.
  let userChose = false;
  const choose = (rocket) => { userChose = true; select(rocket); };

  for (const rocket of rockets) {
    rocket.group.addEventListener('pointerenter', () => choose(rocket));
    rocket.group.addEventListener('click', () => choose(rocket));
    rocket.group.addEventListener('focus', () => choose(rocket));
    rocket.group.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(rocket); }
    });
  }

  // The manifest reads top-down like the map does: highest flight first
  const ALTITUDE = { moon: 0, stable: 1, decay: 2, eccentric: 3, tiny: 4, fall: 5 };
  const ranked = [...rockets].sort((a, b) => ALTITUDE[a.li.dataset.orbit] - ALTITUDE[b.li.dataset.orbit]);
  ranked.forEach((rocket, i) => {
    const chip = document.createElement('button');
    chip.className = 'mono c7__flight';
    chip.type = 'button';
    chip.innerHTML =
      `<span class="chip__idx">0${i + 1}</span>` +
      `<span class="chip__name">${rocket.li.dataset.name}</span>` +
      `<span class="chip__badge chip__badge--${rocket.li.dataset.tone}">${rocket.li.dataset.badge}</span>`;
    chip.addEventListener('click', () => choose(rocket));
    legend.appendChild(chip);
    rocket.chip = chip;
  });

  /* ---- flight: place a rocket at cycle position u ∈ [0,1) ---- */
  function place(rocket, u) {
    const vis = 1 - rocket.spec.dead;
    if (u >= vis) { rocket.live.style.opacity = 0; return; }
    const s = u / vis;
    // ease the loop seams: launches/entries fade in, exits/impacts fade out
    const fade = Math.min(1, s / 0.08, (1 - s) / 0.08);
    rocket.live.style.opacity = Math.max(0, fade).toFixed(3);
    const head = s * rocket.len;
    const p = rocket.trace.getPointAtLength(head);
    rocket.spark.setAttribute('cx', p.x);
    rocket.spark.setAttribute('cy', p.y);
    rocket.halo.setAttribute('cx', p.x);
    rocket.halo.setAttribute('cy', p.y);
    // slide the painted dash so it ends at the head — the exhaust trail.
    // pattern is [TRAIL painted, len+TRAIL gap]; offset o paints [-o, TRAIL-o],
    // so o = TRAIL - head puts the painted segment at [head-TRAIL, head]
    rocket.trail.style.strokeDashoffset = TRAIL - head;
  }

  if (reducedMotion) {
    // a still of the map: every rocket parked at its label position,
    // every name shown
    svg.classList.add('is-static');
    for (const rocket of rockets) place(rocket, rocket.spec.labelAt * (1 - rocket.spec.dead));
    select(rockets[0]);
    return;
  }

  // Traces draw themselves in as the map arrives — the six orbits
  // etched before the sparks fly them
  gsap.from(rockets.map((r) => r.trace), {
    strokeDashoffset: (i, el) => el.getTotalLength(),
    strokeDasharray: (i, el) => `${el.getTotalLength()} ${el.getTotalLength()}`,
    duration: 1.6, stagger: 0.12, ease: 'power2.inOut',
    scrollTrigger: { trigger: svg, start: 'top 70%', once: true },
    onComplete: () => rockets.forEach((r) => r.trace.style.removeProperty('stroke-dasharray')),
  });

  select(rockets[0]); // never show an empty readout

  // Only fly while the map is on screen (the trigger animates nothing —
  // it just stops the ticker doing work the reader can't see)
  let active = false;
  ScrollTrigger.create({
    trigger: svg, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { active = self.isActive; },
  });

  let time = 0;
  let nextAuto = 7; // first hand-off a beat after the traces finish drawing
  gsap.ticker.add(() => {
    if (!active) return;
    time += Math.min(gsap.ticker.deltaRatio(60), 3) / 60;
    if (!userChose && time >= nextAuto) {
      select(rockets[(rockets.indexOf(selected) + 1) % rockets.length]);
      nextAuto = time + 6;
    }
    for (const rocket of rockets) {
      place(rocket, ((time + rocket.phase) / rocket.spec.period) % 1);
    }
  });
}

/* sample a flight shape into an SVG path */
function pathFromShape(shape, steps = 160) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const [x, y] = shape(i / steps);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

/* the static scenery: Earth at the centre with its atmosphere shell, the
   dashed altitude rings with their names, and the Moon in the corner */
function buildScene(svg) {
  const earth = (cls, width) => svgEl('circle', {
    class: cls, cx: EARTH.x, cy: EARTH.y, r: EARTH.r, 'stroke-width': width,
  });
  svg.appendChild(earth('c7-atmo c7-atmo--plum', 70));
  svg.appendChild(earth('c7-atmo c7-atmo--amber', 24));
  svg.appendChild(svgEl('circle', { class: 'c7-earth', cx: EARTH.x, cy: EARTH.y, r: EARTH.r }));
  svg.appendChild(earth('c7-rim', 2));

  // ring names ladder up the north-west diagonal, clear of the Moon
  const NW = -3 * Math.PI / 4;
  for (const ring of RINGS) {
    svg.appendChild(svgEl('circle', { class: 'c7-band', cx: EARTH.x, cy: EARTH.y, r: ring.r }));
    const label = svgEl('text', {
      class: 'c7-band-label', 'text-anchor': 'end',
      x: EARTH.x + ring.r * Math.cos(NW) - 6,
      y: EARTH.y + ring.r * Math.sin(NW) - 6,
    });
    label.textContent = ring.name;
    svg.appendChild(label);
  }

  svg.appendChild(svgEl('circle', { class: 'c7-moon', cx: MOON.x, cy: MOON.y, r: MOON.r }));
  // label clear of the free-return swing that wraps the Moon
  const moonLabel = svgEl('text', {
    class: 'c7-band-label', 'text-anchor': 'middle', x: MOON.x + 58, y: MOON.y - 36,
  });
  moonLabel.textContent = 'THE MOON';
  svg.appendChild(moonLabel);
}
