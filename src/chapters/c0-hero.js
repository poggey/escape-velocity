/* ============================================================
   C0 · HERO (dark, full-bleed shader)
   What it looks like: the limb of Earth at pre-dawn fills the
   viewport (src/lib/ascent-scene.js) — amber atmosphere shell,
   stars, and every ~19s a single spark lifting away on a
   gravity-turn arc. The masthead runs along the top hairline,
   the headline "The $1.77 Trillion / Offering." stands centred
   like a title page, and a telemetry strip of the deal's four
   defining numbers closes the frame at the bottom.
   What it does: the dawn "turns on" as the page loads; the
   pointer parallaxes the sky a few pixels; scrolling away pans
   the camera up past the limb while the content lifts and fades.
   Reduced motion: one still frame, fully dawned.
   ============================================================ */
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion.js';
import { fillFacts } from '../lib/facts.js';
import { createAscentScene } from '../lib/ascent-scene.js';

const STILL_TIME = 5.4;   // a moment where two ascent sparks read well at once

export function initChapter() {
  const c0 = document.querySelector('#c0');
  fillFacts(c0);

  const canvas = c0.querySelector('#c0-canvas');
  const scene = createAscentScene(canvas);   // null (no WebGL) -> CSS sky fallback
  if (!scene) canvas.remove();

  if (scene) {
    scene.resize();
    addEventListener('resize', scene.resize);
  }

  if (reducedMotion) {
    if (scene) {
      scene.setDawn(1);
      scene.renderAt(STILL_TIME);
      addEventListener('resize', () => { scene.resize(); scene.renderAt(STILL_TIME); });
    }
    return;
  }

  // Render loop, gated to the hero being on screen — the ScrollTrigger
  // animates nothing, it just stops the GPU drawing a sky nobody sees.
  let active = true;
  ScrollTrigger.create({
    trigger: c0, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { active = self.isActive; },
  });
  if (scene) {
    gsap.ticker.add(() => {
      if (active) scene.tick(Math.min(gsap.ticker.deltaRatio(60), 3) / 60);
    });
  }

  // Pointer parallax: the sky shifts a little, the type a couple of pixels
  // less — enough depth to feel alive, never enough to notice as an effect.
  const centre = c0.querySelector('.c0__centre');
  const nudgeX = gsap.quickTo(centre, 'x', { duration: 1.4, ease: 'power3.out' });
  const nudgeY = gsap.quickTo(centre, 'y', { duration: 1.4, ease: 'power3.out' });
  c0.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = (e.clientY / innerHeight) * 2 - 1;
    scene?.setPointer(nx, ny);
    nudgeX(nx * -5);
    nudgeY(ny * -3);
  });

  // Leaving the hero: the camera pans up past the limb while the words rise
  // and thin out — scroll reads as the beginning of the ascent.
  const frame = c0.querySelector('.c0__frame');
  ScrollTrigger.create({
    trigger: c0, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => scene?.setScroll(self.progress),
    animation: gsap.to(frame, { yPercent: -7, autoAlpha: 0.15, ease: 'none' }),
  });

  /* --- entrance: night first, then the dawn comes up under the words --- */
  const dawn = { v: 0 };
  const tl = gsap.timeline();
  if (scene) {
    tl.from(canvas, { opacity: 0, duration: 1.0 }, 0);
    tl.to(dawn, { v: 1, duration: 2.6, onUpdate: () => scene.setDawn(dawn.v) }, 0.15);
  }
  tl.from(c0.querySelector('.c0__mast'), { opacity: 0, y: -12, duration: 0.8 }, 0.3);
  tl.from(c0.querySelector('.c0__kicker'), { opacity: 0, duration: 0.6 }, 0.5);
  tl.fromTo(
    c0.querySelectorAll('.mask-line'),
    { clipPath: 'inset(0 0 100% 0)', yPercent: 30 },
    { clipPath: 'inset(0 0 -10% 0)', yPercent: 0, duration: 1.0, stagger: 0.14 },
    0.6
  );
  tl.from(c0.querySelector('.c0__sub'), { opacity: 0, y: 12, duration: 0.7 }, 1.25);
  tl.from(c0.querySelector('.c0__rule'), { scaleX: 0, transformOrigin: 'left center', duration: 1.1 }, 1.3);
  tl.from(c0.querySelectorAll('.c0__stat'), { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, 1.45);
  tl.from(c0.querySelector('.c0__cue'), { opacity: 0, duration: 0.6 }, 1.8);

  // dev-only: lets tooling freeze the frame loop to capture stable screenshots
  if (import.meta.env.DEV) {
    window.__c0 = {
      freeze(t = STILL_TIME) { active = false; scene?.renderAt(t); },
      thaw() { active = true; },
    };
  }
}
