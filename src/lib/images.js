/* ============================================================
   THE IMAGE MANIFEST — the only place in the codebase that knows
   about image files (build instruction 1).

   Every image is currently a placeholder. To swap in a real one:
     1. generate it per whitepaper §12.5 (prompt + style suffix),
     2. drop the file into /public/images/,
     3. change that image's `file: null` to e.g. '/images/img-01-hero.avif'.
   One line. Nothing else references image paths.
   ============================================================ */
export const IMAGES = {
  'IMG-01': { file: null, aspect: '16 / 9', alt: 'Stainless-steel super-heavy rocket stacked on its launch tower at pre-dawn, low fog' },
  'IMG-02': { file: null, aspect: '16 / 9', alt: 'A train of flat satellites in low Earth orbit above the glowing limb of Earth' },
  'IMG-03': { file: null, aspect: '16 / 9', alt: 'Grid of rocket engine nozzles seen directly from below in a dark hangar' },
  'IMG-04': { file: null, aspect: '21 / 9', alt: 'Rocket booster descending between two tower catch-arms, motion-blurred plume' },
  'IMG-05': { file: null, aspect: '21 / 9', alt: 'Vast dark server hall receding to a vanishing point' },
  'IMG-06': { file: null, aspect: '16 / 9', alt: 'A city exchange tower at night displaying a rocket launch on its curved screen' },
};

/* Fills every <div data-img="IMG-xx"> on the page.
   Real file  -> an <img> with proper alt text.
   No file    -> a token-styled placeholder panel with a mono label
                 (aspect-ratio applied unless the holder is a full-bleed
                 cover, which sizes itself from the chapter). */
export function mountAllImages() {
  for (const holder of document.querySelectorAll('[data-img]')) {
    const id = holder.dataset.img;
    const spec = IMAGES[id];
    if (!spec) {
      console.warn(`No manifest entry for ${id}`);
      continue;
    }
    if (spec.file) {
      const img = document.createElement('img');
      img.src = spec.file;
      img.alt = spec.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      holder.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'img-placeholder';
      if (!holder.classList.contains('media--cover')) {
        placeholder.style.aspectRatio = spec.aspect;
      }
      const label = document.createElement('span');
      label.className = 'mono';
      label.textContent = `${id} · PENDING GENERATION — SEE WHITEPAPER §12.5`;
      placeholder.appendChild(label);
      holder.appendChild(placeholder);
    }
  }
}
