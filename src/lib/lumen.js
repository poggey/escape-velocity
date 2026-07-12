/* ============================================================
   LUMEN — the hero's luminescence, packaged for the rest of the
   page (redesign, July 2026). Two pieces:

   mountSky(section)  — injects a full-bleed backdrop into a dark
   section: the CSS dawn gradient (styles/components.css,
   .lumen-sky) plus a field of procedurally-placed stars that
   twinkle on a slow CSS animation. Pure DOM — no canvas, no
   per-frame JS — so it costs nothing after mount.

   The star positions are seeded from the section's id, so a
   given chapter's sky is identical on every visit (and in every
   screenshot) — decorative, but deterministic.
   ============================================================ */

/* tiny deterministic PRNG (mulberry32) — Math.random would reshuffle
   the sky on every load */
function seeded(seedStr) {
  let h = 1779033703;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function mountSky(section, { stars = 90, horizon = true } = {}) {
  const sky = document.createElement('div');
  sky.className = 'lumen-sky' + (horizon ? ' lumen-sky--horizon' : '');
  sky.setAttribute('aria-hidden', 'true');

  const rand = seeded(section.id || 'lumen');
  const field = document.createElement('div');
  field.className = 'lumen-stars';
  for (let i = 0; i < stars; i++) {
    const star = document.createElement('i');
    const bright = rand();                       // most stars dim, a few bright
    star.style.left = (rand() * 100).toFixed(2) + '%';
    star.style.top = (rand() * 100).toFixed(2) + '%';
    star.style.opacity = (0.12 + bright * bright * 0.75).toFixed(2);
    star.style.animationDelay = (-rand() * 7).toFixed(2) + 's';
    star.style.animationDuration = (4 + rand() * 6).toFixed(2) + 's';
    if (bright > 0.92) star.classList.add('is-bright');
    field.appendChild(star);
  }
  sky.appendChild(field);

  // behind the section's .container (which is z-index 1)
  section.prepend(sky);
  return sky;
}
