/* The bridge between /data/facts.json (the only home of headline figures,
   §14.5) and the HTML.

   index.html never contains a hard-coded number. Instead it writes:
       <span data-fact="ipo.price" data-format="usd0"></span>
   and each chapter calls fillFacts(itsSection) once, which walks the path
   "ipo.price" into facts.json and writes the formatted value in.
   To change a number on the site: edit facts.json, nothing else. */
import facts from '../../data/facts.json';
import { fmt } from './format.js';

export { facts };

export function fillFacts(scope = document) {
  for (const el of scope.querySelectorAll('[data-fact]')) {
    const path = el.dataset.fact;
    const value = path.split('.').reduce((obj, key) => obj?.[key], facts);
    if (value === undefined) {
      console.warn(`facts.json has no entry for "${path}"`);
      continue;
    }
    const format = fmt[el.dataset.format || 'raw'];
    el.textContent = format(value);
  }
}
