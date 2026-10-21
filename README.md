# Escape Velocity — The $1.77 Trillion Offering

> I built this because the SpaceX listing was the biggest IPO there has ever been, and it was happening while I watched, so I could follow the fixed $135 price, the first trade and the slide afterwards as they happened rather than reading about them years later. My own read, on the record in C7.5, is that the valuation rests largely on promises, and whether Musk keeps them is unknown given his track record. As a piece of execution the $135 was roughly right, but the aftermarket traded the 'Musk Story' rather than the business, and outside Starlink not much of the price is 'real' yet. If I did it again, I'd wire in live prices from the first day instead of building on stub figures shaped to news reports; when the real data arrived, the peak turned out to be an intraday print from three sessions in, not the slow climb I'd sketched. The view stays up, dated 11 July 2026, whether it ages well or not.

A scroll-driven editorial site about the SpaceX IPO of June 2026 — the mechanics, the numbers, the aftermath, and my own view of it. Built to the spec in `the-offering-whitepaper.md` with Vite, vanilla JavaScript and GSAP. No framework, no chart library: every line is meant to be explainable in an interview.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173
npm run build      # production build into /dist
```

## File map

```
index.html                  All the words and structure. One <section> per chapter.
data/                       Every figure on the site. Each JSON has "source" + "as_of".
  facts.json                Headline numbers ($135, 94x, +19.2%...) — edit here, site updates
  spcx_daily.json           Daily SPCX prices, live from yfinance, 12 Jun – 10 Jul
  events.json               Deal timeline + chart flags + upcoming events
  supply.json, money_left.json, drawdown.json, implied_growth.json   Analysis outputs
  day_one_pops.json, ipo_records.json, sources.json                  Reference tables
src/main.js                 Entry point: fonts, styles, then each chapter in order
src/chapters/               One file per chapter, each exporting one initChapter()
  c0-hero.js … c8-colophon.js, c75-position.js, interludes.js
src/lib/                    Small shared pieces (each used by 2+ chapters):
  motion.js                 GSAP + ScrollTrigger setup, the reduced-motion switch
  facts.js                  Fills <span data-fact="ipo.price"> from facts.json
  format.js                 "$1.77T", "94×", "+19.2%" — one formatter per shape
  counter.js                The count-up numeral
  reveal.js                 Mask-reveal headlines + backdrop parallax
  chart.js                  Hand-rolled SVG helpers + the scrubbed line-draw
  ascent-scene.js           The hero's shader dawn: Earth's limb + the ascent spark (raw WebGL, no library)
  progress.js               The 1px chapter meter (also keyboard nav)
  images.js                 THE image manifest — the only file that knows image paths
styles/                     tokens.css (ALL colours/type/spacing) + base + components
                            + one small css file per chapter
analysis/                   escape-velocity-analysis.ipynb + requirements.txt
public/images/              The six generated §12.5 images
```

## How one chapter works, end to end (C3 · Breaking the Playbook)

1. **The words** live in `index.html` under `<section id="c3">`: a five-row table. Convention column vs SpaceX column. The figures are *not* typed in — cells contain `<span data-fact="ipo.price" data-format="usd0"></span>`.
2. **The numbers** arrive when `src/chapters/c3-playbook.js` calls `fillFacts(c3)` (from `src/lib/facts.js`), which walks `"ipo.price"` into `data/facts.json` and writes `$135` in, formatted by `src/lib/format.js`.
3. **The timeline strip** under the table is built from `data/events.json` in a plain loop — dates have exactly one home.
4. **The motion**: each row gets its own ScrollTrigger. When the row's top clears the lower 15% of the viewport (`start: 'top 85%'`, `once: true`), a small timeline fades the row up and draws its hairline across (`scaleX: 0 → 1`).
5. **The look** comes from `styles/c3-playbook.css`, which uses only variables from `styles/tokens.css`.

Every other chapter is the same pattern: HTML for words, `/data` for numbers, one JS file for behaviour, one CSS file for looks.

## How to refresh the data

```bash
cd analysis
pip install -r requirements.txt
jupyter lab escape-velocity-analysis.ipynb   # Run All
```

The notebook fetches SPCX (and QQQ) via yfinance and rewrites the five analysis JSONs in `/data`. Reload the dev server — done.

The price series stops at `SNAPSHOT_END = "2026-07-10"`, the last close before The Position's 11 July byline, so the piece stays a dated July snapshot. Move that one constant to extend it.

If the fetch fails (no network, or a Jupyter kernel without `yfinance` installed), the notebook falls back to a stub series and marks it `"is_stub": true`, and the site labels every stub-derived figure on screen. Check that the first code cell prints `stub=False`.

## How to swap in an image

1. Generate the image with its prompt + style suffix from whitepaper §12.5 (grade: desaturate, crush shadows to `#0A0A0C`, +4% grain, export 2400px AVIF/WebP).
2. Drop the file into `public/images/`.
3. In `src/lib/images.js`, point that image's `file` at it: `file: '/images/your-file.avif'`.

That's the whole job — nothing else in the codebase references image paths.

## GSAP ScrollTrigger in 10 lines

1. GSAP animates properties over time: `gsap.from(el, { y: 40, opacity: 0, duration: 1 })`.
2. ScrollTrigger decides *when*, based on scroll position.
3. `trigger: el` — the element whose position is watched.
4. `start: 'top 80%'` — "when the trigger's **top** hits **80%** down the viewport".
5. `end: 'top 35%'` — same grammar, for where the trigger range finishes.
6. Without `scrub`: reaching `start` just plays the animation once.
7. With `scrub: true`, the animation's progress IS the scroll position between start and end.
8. `scrub: 1` adds ~1s of smoothing, so it trails the wheel slightly.
9. `pin: true` freezes the trigger element on screen for the start→end distance (only C5 does this).
10. `once: true` means fire once and never rewind — right for reveals, wrong for scrubs.

## What's deliberately NOT here

React, chart libraries, CSS frameworks, literal hex colours outside `tokens.css`, and numbers typed into code. If a figure is wrong, fix it in `/data`. If a colour is wrong, fix it in `tokens.css`.

**One knowing deviation from the whitepaper's §14 rules, for the hero:** it uses colour (the sunrise palette, defined as tokens). The hero backdrop is a single hand-written WebGL fragment shader (`src/lib/ascent-scene.js`) — no three.js, no library — so the whole site stays well inside the 200KB JS budget. Everything after C0 is monochrome, GSAP-only, and hand-drawn.
