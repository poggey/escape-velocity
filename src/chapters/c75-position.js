/* ============================================================
   C7.5 · THE POSITION (light) — required by whitepaper §0.5-R1/R2.
   What it looks like: a chapter that reads as writing. Padraig's
   position paragraphs (his words, on the record 11 July 2026),
   the implied-growth interactive (exit-multiple slider → required
   2030 EBITDA and CAGR), and The Watch — dated predictions on
   the live events, rendered from data/watch.json.
   What it does: almost nothing moves (§13: "reads as writing,
   not spectacle"). The slider runs the real §10.3 maths live.
   ============================================================ */
import { fillFacts, facts } from '../lib/facts.js';
import { fmt } from '../lib/format.js';
import daily from '../../data/spcx_daily.json';
import watch from '../../data/watch.json';

export function initChapter() {
  const c75 = document.querySelector('#c75');
  fillFacts(c75); // the position paragraphs quote figures via data-fact spans
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

  // ---- The Position's on-record numbers (§0.5-R1) ----
  // The paragraphs quote the same maths as the slider, computed here so
  // they update when the data does. UNDERWRITE_* is Padraig's stated
  // assumption ("50 to 55% a year" in the text): the most EBITDA growth
  // he will pay for. If the view changes, change it in BOTH places.
  const UNDERWRITE_LOW = 0.50;
  const UNDERWRITE_HIGH = 0.55;
  const EXIT_MULTIPLE = 25;
  const priceFor = (cagr) =>
    ipoPrice * ((EXIT_MULTIPLE * ebitdaBn * Math.pow(1 + cagr, years)) / (facts.ipo.valuation_tn * 1000));
  const put = (id, text) => { c75.querySelector(id).textContent = text; };
  put('#c75-p-price', fmt.usd2(lastClose));
  put('#c75-p-ev', fmt.tn(evBn / 1000));
  put('#c75-p-ebitda', fmt.bn1(evBn / EXIT_MULTIPLE));
  put('#c75-p-cagr', fmt.pct1((Math.pow(evBn / EXIT_MULTIPLE / ebitdaBn, 1 / years) - 1) * 100).replace('+', ''));
  put('#c75-p-low', fmt.usd0(priceFor(UNDERWRITE_LOW)));
  put('#c75-p-high', fmt.usd0(priceFor(UNDERWRITE_HIGH)));

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
    // prediction_made is IMMUTABLE once set (whitepaper §0.5-R2): the site
    // only ever displays it, and outcomes are appended — never edited in
    const status = item.outcome ? 'resolved' : item.prediction_made ? 'dated' : 'pending';
    row.className = `watch-item watch-item--${status}`;
    // editor notes ([PADRAIG: ...]) never reach the page
    const prediction = item.prediction.startsWith('[PADRAIG')
      ? '<p class="prediction prediction--tbd">Prediction to be entered — it will be date-stamped before the event.</p>'
      : `<p class="prediction">${item.prediction}</p>`;
    const dated = item.prediction_made
      ? `<span class="watch-chip watch-chip--dated mono">PREDICTED ${item.prediction_made}</span>`
      : '<span class="watch-chip mono">AWAITING PREDICTION</span>';
    const outcome = item.outcome
      ? `<span class="watch-chip watch-chip--dated mono">OUTCOME (${item.outcome_date})</span><p class="outcome">${item.outcome}</p>`
      : '<span class="watch-chip mono">OUTCOME · PENDING</span>';
    row.innerHTML =
      `<p class="mono">${item.event_date}</p>` +
      `<div><h3>${item.event}</h3>` +
      prediction +
      `<div class="watch-item__chips">${dated}${outcome}</div></div>`;
    wrap.appendChild(row);
  }
}
