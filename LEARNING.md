# LEARNING.md — five proof-of-understanding exercises (whitepaper §14.8)

Do these in order. Each one touches a different layer of the project; when you can do all five without re-reading the README, you can defend the codebase in an interview.

## 1 · Change the headline reveal duration

**File:** `src/chapters/c0-hero.js`
The hero headline rises out of a clip mask in **0.9s**. Make it lazier — say 1.6s — and watch what it does to the feel (the whitepaper caps entrances at 1.2s for a reason; see how right that cap is, then put it back).
*Hint:* find `duration: 0.9` in the `.mask-line` tween. Bonus: the same 0.9s lives in `src/lib/reveal.js` for every other headline — why is the hero's version written out separately? (The comment in the file answers this.)

## 2 · Add an annotation to the aftermath chart

**Files:** `data/events.json` + nothing else.
Add a flag to the C6 price chart for **2 July** (say, `"HALF THE PEAK GAIN GONE"`). Add an entry to `chart_flags` with that date and label, reload, and it appears — `c6-aftermath.js` loops over that array. Now delete the flag from the JSON and confirm it vanishes.
*The lesson:* content changes shouldn't require code changes.

## 3 · Retune the C5 scrub speed

**File:** `src/chapters/c5-listing-day.js`
Listing Day pins for `end: '+=150%'` — one-and-a-half viewport-heights of scrolling while the line draws. Try `'+=300%'` (slow, cinematic) and `'+=60%'` (blink and it's done). Then try `scrub: 3` instead of `scrub: 1` and feel the difference between *distance* (how much scroll the pin consumes) and *smoothing* (how far the line trails your wheel).

## 4 · Swap an image and regrade it

**Files:** `public/images/` + `src/lib/images.js`
Regenerate IMG-04 (the booster catch — prompt in whitepaper §12.5, including the style suffix), grade it (desaturate, shadows to `#0A0A0C`, +4% grain), drop it in `public/images/`, and point IMG-04's `file` in `images.js` at the new path. Reload: the interlude shows your version, parallax and all. Then set it to `file: null` and watch the slot fall back to a labelled placeholder — that fallback is why a missing image never breaks the layout.

## 5 · Move the snapshot date

**Files:** `analysis/escape-velocity-analysis.ipynb` + nothing in `/src`.
The site's prices stop at the 10 July close because The Position is on the record as of 11 July. Change `SNAPSHOT_END` to a later date, Run All, and reload: the C6 chart's date ticks, peak and last-close labels, the drawdown and volatility notes, and the C7.5 "last close" all follow, with no code edited. Now read the C7.5 byline next to that new last close and you'll see why it's pinned: a dated view has to sit next to the data it was written against. Put `SNAPSHOT_END` back to `"2026-07-10"` and re-run.
*The lesson:* one date in one place, and the whole site follows it.
