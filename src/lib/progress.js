/* The 1px progress meter (§12): a fixed vertical hairline with one tick per
   chapter and a fill that tracks overall scroll. Each tick is a real <a>
   link, so the meter doubles as keyboard-reachable navigation (§14.9).
   Plain scroll math, no GSAP — identical behaviour under reduced motion,
   because a scroll POSITION indicator is information, not decoration. */
export function buildProgressMeter() {
  const chapters = [...document.querySelectorAll('[data-chapter]')];

  const meter = document.createElement('nav');
  meter.className = 'progress';
  meter.setAttribute('aria-label', 'Chapters');
  meter.innerHTML = '<span class="progress__fill"></span>';

  for (const chapter of chapters) {
    const tick = document.createElement('a');
    tick.className = 'progress__tick';
    tick.href = '#' + chapter.id;
    tick.setAttribute('aria-label', chapter.dataset.chapter);
    tick.title = chapter.dataset.chapter;
    meter.appendChild(tick);
  }
  document.body.appendChild(meter);

  const fill = meter.querySelector('.progress__fill');
  const ticks = [...meter.querySelectorAll('.progress__tick')];

  // Ticks sit proportionally to where their chapter starts in the document
  const placeTicks = () => {
    const docHeight = document.documentElement.scrollHeight;
    ticks.forEach((tick, i) => {
      tick.style.top = (chapters[i].offsetTop / docHeight) * 100 + '%';
    });
  };

  const fillMeter = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`;
  };

  addEventListener('scroll', fillMeter, { passive: true });
  addEventListener('resize', () => { placeTicks(); fillMeter(); });
  placeTicks();
  fillMeter();
}
