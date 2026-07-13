/* ============================================================
   ENTRY POINT — fonts, styles, shared chrome, then every chapter
   in page order. Each chapter file owns exactly one <section> of
   index.html and exports a single initChapter() (§14.2).
   ============================================================ */

// Self-hosted fonts (§12, amended): Space Grotesk for display AND labels
// (typewriter faces removed sitewide), Inter for body
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

// Styles: tokens first (everything else consumes them), then base,
// shared components, and one small file per scene (§14.6)
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/c0-hero.css';
import '../styles/c1-machine.css';
import '../styles/c2-engines.css';
import '../styles/c3-playbook.css';
import '../styles/c4-belief.css';
import '../styles/c5-listing-day.css';
import '../styles/c6-aftermath.css';
import '../styles/c7-verdict.css';
import '../styles/c75-position.css';
import '../styles/c8-colophon.css';
import '../styles/interludes.css';

import { ScrollTrigger } from './lib/motion.js';
import { mountAllImages } from './lib/images.js';
import { buildProgressMeter } from './lib/progress.js';

import { initChapter as initC0 } from './chapters/c0-hero.js';
import { initChapter as initC1 } from './chapters/c1-machine.js';
import { initChapter as initC2 } from './chapters/c2-engines.js';
import { initChapter as initC3 } from './chapters/c3-playbook.js';
import { initChapter as initC4 } from './chapters/c4-belief.js';
import { initChapter as initC5 } from './chapters/c5-listing-day.js';
import { initChapter as initC6 } from './chapters/c6-aftermath.js';
import { initChapter as initC7 } from './chapters/c7-verdict.js';
import { initChapter as initC75 } from './chapters/c75-position.js';
import { initChapter as initC8 } from './chapters/c8-colophon.js';
import { initChapter as initInterludes } from './chapters/interludes.js';

// Images first: placeholders/images affect layout, and ScrollTrigger
// measures the page when triggers are created
mountAllImages();

initC0();
initC1();
initC2();
initC3();
initC4();
initC5();
initC6();
initC7();
initC75();
initC8();
initInterludes();

buildProgressMeter();

// Everything above may have changed section heights (charts, rendered
// registers, placeholders) — re-measure all trigger positions once at the end
ScrollTrigger.refresh();

// dev-only: ?at=c3 brings a section into the viewport AFTER layout settles —
// lets headless screenshot tooling capture any chapter deterministically.
// Uses a transform, not scrolling: headless Chrome paints black at real
// scroll offsets, and a transform sidesteps the compositor entirely.
if (import.meta.env.DEV) {
  const at = new URLSearchParams(location.search).get('at');
  const el = at && document.getElementById(at);
  if (el) document.body.style.transform = `translateY(${-el.offsetTop}px)`;
}
