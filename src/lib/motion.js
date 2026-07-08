/* Central GSAP setup (§14.1, §14.9).
   Every chapter imports gsap from HERE, so ScrollTrigger is registered
   exactly once and everyone shares the same reduced-motion flag.
   When the user prefers reduced motion, chapters skip their animations
   entirely — the page is authored in its final state, so skipping simply
   leaves everything fully rendered. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// §15.7: easing consistency — expo.out everywhere unless a tween overrides it
gsap.defaults({ ease: 'expo.out' });

export const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };
