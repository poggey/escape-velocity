/* Number formatting shared by counters, charts and the data-fact filler.
   One place, so "$1.77T" renders identically everywhere.
   All formatters take a plain number; negatives get a true minus sign (−). */

const sign = (v) => (v < 0 ? '−' : '');

export const fmt = {
  raw:  (v) => String(v),
  usd0: (v) => sign(v) + '$' + Math.round(Math.abs(v)).toLocaleString('en-US'),
  usd2: (v) => sign(v) + '$' + Math.abs(v).toFixed(2),
  tn:   (v) => sign(v) + '$' + Math.abs(v).toFixed(2) + 'T',   // 1.77  -> $1.77T
  tn1:  (v) => sign(v) + '$' + Math.abs(v).toFixed(1) + 'T',   // 28.5  -> $28.5T
  bn0:  (v) => sign(v) + '$' + Math.round(Math.abs(v)) + 'BN', // 75    -> $75BN
  // sub-billion values read as millions ($0.5BN would look like a typo)
  bn1:  (v) => Math.abs(v) < 1
    ? sign(v) + '$' + Math.round(Math.abs(v) * 1000) + 'M'     // 0.5   -> $500M
    : sign(v) + '$' + Math.abs(v).toFixed(1) + 'BN',           // 11.4  -> $11.4BN
  x:    (v) => Math.round(v) + '×',                            // 94    -> 94×
  pct0: (v) => (v > 0 ? '+' : sign(v)) + Math.round(Math.abs(v)) + '%',  // -32 -> −32%
  pct1: (v) => (v > 0 ? '+' : sign(v)) + Math.abs(v).toFixed(1) + '%',   // 19.2 -> +19.2%
};
