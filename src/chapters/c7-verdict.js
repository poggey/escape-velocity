/* ============================================================
   C7 · THE VERDICT (dark) — the ascent map.
   The hero's world, revisited to carry the argument. The limb of
   Earth curves along the bottom of a full-width scene — dark
   body, razor amber rim, atmosphere glow — under the lumen star
   field. Dashed altitude bands arc above it: LOW ORBIT, DECAYING,
   STABLE ORBIT, ESCAPE VELOCITY. Each of the six constituencies
   flies its verdict as a rocket:
     company    — cruises the stable-orbit band, steady
     holders    — enters high but sinks across every pass
     day-one    — launches, arcs over, falls back; forever
     banks      — barely clears the surface, low and fast
     retail     — swings eccentrically through every band
     structure  — launches clean through the top of the frame
   Altitude IS the outcome. Tap a rocket, its trajectory, its
   label, or a legend chip: the flight brightens, the rest dim,
   and the readout shows the verdict + evidence (from the hidden
   #c7-ledger, figures via data-fact). Then the thesis viewport:
   "Priced efficiently. Traded emotionally."
   ============================================================ */
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { maskReveal } from '../lib/reveal.js';
import { svgEl } from '../lib/chart.js';
import { mountSky } from '../lib/lumen.js';

const W = 1200, H = 700;
const CX = 600, CY = 2100, R = 1500;      // Earth: centre far below, crest at y=600
const TRAIL = 110;                        // bright exhaust behind each spark, in px

/* polar helper: angle φ from the crest (radians, east positive), altitude
   above the surface -> scene coordinates */
const pt = (phi, alt) => {
  const r = R + alt;
  return [CX + r * Math.sin(phi), CY - r * Math.cos(phi)];
};
const edgePhi = (alt) => Math.asin((CX + 40) / (R + alt)); // just past the frame edge

/* Flight shapes: each returns [φ, alt] for s ∈ [0,1]; the path is sampled
   from it and sparks fly the path at constant speed. `dead` is the silent
   fraction of the cycle after the flight (relaunch pause); `label` the
   s-position where the name tag sits. */
const FLIGHTS = {
  stable: {
    period: 15, dead: 0, labelAt: 0.80,
    shape: (s) => [(-1 + 2 * s) * edgePhi(330), 330],
  },
  decay: {
    period: 12, dead: 0, labelAt: 0.26,
    shape: (s) => [(-1 + 2 * s) * edgePhi(240), 245 - 85 * s],
  },
  fall: {
    period: 9, dead: 0.18, labelAt: 0.42,
    shape: (s) => [-0.10 + 0.26 * s, 258 * Math.sin(Math.PI * s)],
  },
  tiny: {
    period: 8, dead: 0, labelAt: 0.30,
    shape: (s) => [(-1 + 2 * s) * edgePhi(90), 90],
  },
  eccentric: {
    period: 13, dead: 0, labelAt: 0.63,
    shape: (s) => [(-1 + 2 * s) * edgePhi(240), 215 + 125 * Math.sin(2 * Math.PI * 1.35 * s + 1.15)],
  },
  escape: {
    period: 11, dead: 0.22, labelAt: 0.60,
    shape: (s) => [-0.24 + 0.44 * Math.pow(s, 1.3), 640 * Math.pow(s, 1.7)],
  },
};

const BANDS = [
  { alt: 460, name: 'ESCAPE VELOCITY' },
  { alt: 330, name: 'STABLE ORBIT' },
  { alt: 210, name: 'DECAYING ORBIT' },
  { alt: 90,  name: 'LOW ORBIT' },
];

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

    // the full trajectory, sampled from the flight shape
    const d = pathFromShape(spec.shape);
    const trace = svgEl('path', { class: 'rocket-trace', d });
    const hit = svgEl('path', { class: 'rocket-hit', d });
    const live = svgEl('g', { class: 'rocket-live' });
    const trail = svgEl('path', { class: 'rocket-trail', d });
    const halo = svgEl('circle', { class: 'rocket-halo', r: 10 });
    const spark = svgEl('circle', { class: 'rocket-spark', r: 4 });
    live.append(trail, halo, spark);

    const [lx, ly] = pt(...spec.shape(spec.labelAt));
    const label = svgEl('text', {
      class: 'rocket-label', x: lx + 14, y: ly - 14,
      'text-anchor': lx > W - 260 ? 'end' : 'start',
    });
    label.textContent = li.dataset.name;

    group.append(trace, hit, live, label);
    svg.appendChild(group);

    const len = trace.getTotalLength();
    trail.style.strokeDasharray = `${TRAIL} ${len + TRAIL}`;
    trail.style.strokeDashoffset = TRAIL; // nothing painted until the loop runs

    return { li, spec, group, trace, trail, spark, halo, live, len, phase: i * 2.7 };
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

    const chip = document.createElement('button');
    chip.className = 'mono';
    chip.type = 'button';
    chip.innerHTML =
      `<span>${rocket.li.dataset.name}</span>` +
      `<span class="chip__badge chip__badge--${rocket.li.dataset.tone}">${rocket.li.dataset.badge}</span>`;
    chip.addEventListener('click', () => choose(rocket));
    legend.appendChild(chip);
    rocket.chip = chip;
  }

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
    // a still of the map: every rocket parked at its label position
    for (const rocket of rockets) place(rocket, rocket.spec.labelAt * (1 - rocket.spec.dead));
    select(rockets[0]);
    return;
  }

  // Traces draw themselves in as the map arrives — the six trajectories
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
function pathFromShape(shape, steps = 130) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const [x, y] = pt(...shape(i / steps));
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

/* the static scenery: Earth's limb with its atmosphere shell, and the
   dashed altitude bands with their names — the map's y-axis */
function buildScene(svg) {
  const limb = (cls, width) => svgEl('circle', { class: cls, cx: CX, cy: CY, r: R, 'stroke-width': width });
  svg.appendChild(limb('c7-atmo c7-atmo--plum', 150));
  svg.appendChild(limb('c7-atmo c7-atmo--amber', 44));
  svg.appendChild(svgEl('circle', { class: 'c7-earth', cx: CX, cy: CY, r: R }));
  svg.appendChild(limb('c7-rim', 2.5));

  for (const band of BANDS) {
    svg.appendChild(svgEl('circle', {
      class: 'c7-band', cx: CX, cy: CY, r: R + band.alt,
    }));
    // label where the band meets the left edge, tucked above the arc
    const y = CY - Math.sqrt((R + band.alt) ** 2 - (CX - 30) ** 2);
    const label = svgEl('text', { class: 'c7-band-label', x: 30, y: y - 10 });
    label.textContent = band.name;
    svg.appendChild(label);
  }
  const surface = svgEl('text', { class: 'c7-band-label', x: 30, y: 682 });
  surface.textContent = 'THE SURFACE';
  svg.appendChild(surface);
}
