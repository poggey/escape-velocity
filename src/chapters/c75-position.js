/* ============================================================
   C7.5 · THE POSITION (light) — required by whitepaper §0.5-R1/R2.
   What it looks like: a chapter that reads as writing. Padraig's
   position paragraphs (placeholder until he writes them), the
   implied-growth interactive (exit-multiple slider → required
   2030 EBITDA and CAGR), and The Watch — dated predictions on
   the live events, rendered from data/watch.json.
   What it does: almost nothing moves (§13: "reads as writing,
   not spectacle"). The slider runs the real §10.3 maths live.
   ============================================================ */
import { facts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import daily from '../../data/spcx_daily.json';
import watch from '../../data/watch.json';

export function initChapter() {
  const c75 = document.querySelector('#c75');
  initCalculator(c75);
  renderWatch(c75);
}

function initCalculator(c75) {
  // The §10.3 inversion: today's price implies an enterprise value; pick an
  // exit EV/EBITDA multiple for 2030 and the EBITDA needed to justify that
  // value follows, as does the growth rate from 2025's $6.6bn.
  const lastClose = daily.rows.at(-1).close;
  const ipoPrice = facts.ipo.price;
  // Same share base as the $1.77tn offering valuation, scaled to today's
  // price (the valuation-vs-market-cap discrepancy is declared in C8)
  const evBn = facts.ipo.valuation_tn * 1000 * (lastClose / ipoPrice);
  const ebitdaBn = facts.valuation.ebitda_2025_bn;
  const years = 5; // 2025 EBITDA -> 2030

  const slider = c75.querySelector('#c75-multiple');
  const multipleOut = c75.querySelector('#c75-multiple-out');
  const ebitdaOut = c75.querySelector('#c75-ebitda');
  const cagrOut = c75.querySelector('#c75-cagr');

  const recalc = () => {
    const multiple = Number(slider.value);
    const requiredEbitdaBn = evBn / multiple;
    const cagr = Math.pow(requiredEbitdaBn / ebitdaBn, 1 / years) - 1;
    multipleOut.textContent = fmt.x(multiple);
    ebitdaOut.textContent = fmt.bn1(requiredEbitdaBn);
    cagrOut.textContent = fmt.pct1(cagr * 100).replace('+', '');
  };
  slider.addEventListener('input', recalc);
  recalc();

  c75.querySelector('#c75-basis').textContent =
    `Basis: ${fmt.usd2(lastClose)} close (${daily.as_of}) on the $1.77tn offering share base → ` +
    `~${fmt.tn(evBn / 1000)} implied value, against ${fmt.bn1(ebitdaBn)} 2025 adjusted EBITDA, ` +
    `${years}-year horizon to 2030. See C8 for the valuation-vs-market-cap caveat.` +
    (daily.is_stub ? ' Price is STUB data until the analysis notebook is run.' : '');
}

function renderWatch(c75) {
  const wrap = c75.querySelector('#c75-watch');
  for (const item of watch.items) {
    const row = document.createElement('article');
    row.className = 'watch-item';
    // prediction_made is IMMUTABLE once set (whitepaper §0.5-R2): the site
    // only ever displays it, and outcomes are appended — never edited in
    const dated = item.prediction_made
      ? `PREDICTED ${item.prediction_made}`
      : 'PREDICTION NOT YET DATED';
    const outcome = item.outcome
      ? `OUTCOME (${item.outcome_date}): ${item.outcome}`
      : 'OUTCOME · PENDING';
    row.innerHTML =
      `<p class="mono">${item.event_date}</p>` +
      `<div><h3>${item.event}</h3>` +
      `<p class="prediction">${item.prediction}</p>` +
      `<p class="mono">${dated}</p>` +
      `<p class="outcome mono">${outcome}</p></div>`;
    wrap.appendChild(row);
  }
}
