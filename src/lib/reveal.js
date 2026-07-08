/* The two motion primitives reused across chapters (§12 motion language).

   maskReveal — headlines rise out of a clip rectangle, 0.9s, expo.out.
   The clip is only ever APPLIED by this tween (CSS keeps the final state),
   so no-JS and reduced-motion users simply see the finished headline.

   parallax — dark-chapter backdrops drift slowly (§12: yPercent 8–12,
   scrubbed) while their chapter crosses the viewport. */
import { gsap, reducedMotion } from './motion.js';

export function maskReveal(els, { start = 'top 80%', stagger = 0.12, trigger } = {}) {
  if (reducedMotion) return;
  const lines = gsap.utils.toArray(els);
  if (!lines.length) return;
  gsap.fromTo(
    lines,
    { clipPath: 'inset(0 0 100% 0)', yPercent: 30 },
    {
      clipPath: 'inset(0 0 -10% 0)', // -10% so descenders (g, y) aren't clipped at rest
      yPercent: 0,
      duration: 0.9,
      stagger,
      scrollTrigger: { trigger: trigger || lines[0], start, once: true },
    }
  );
}

export function parallax(media, chapter) {
  if (reducedMotion || !media) return;
  const target = media.querySelector('img') || media;
  gsap.fromTo(
    target,
    { yPercent: -5 },
    {
      yPercent: 5,
      ease: 'none', // parallax must track the scrollbar linearly — easing would look like lag
      scrollTrigger: {
        trigger: chapter,
        start: 'top bottom', // begins the moment the chapter's top enters from below
        end: 'bottom top',   // ends when its bottom leaves at the top
        scrub: true,         // progress tied 1:1 to scroll position, no tween clock
      },
    }
  );
}
