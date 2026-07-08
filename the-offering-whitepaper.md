# THE OFFERING
### Anatomy of the largest IPO in history — SpaceX, June 2026
**Whitepaper v1.2 · July 2026 · Author: Padraig**

---

## 0. How to use this document

This whitepaper has two jobs, in this order:

1. **Teach Padraig the SpaceX IPO inside-out** — mechanics, players, numbers, controversies, verdicts — well enough to narrate it unprompted in an interview.
2. **Fully specify a scroll-driven website** that tells the same story visually, to be built with Claude Code.

Part I is the knowledge. Part II is the data. Part III is the site design (v1.1: "Escape Velocity" — modern aerospace editorial; the earlier prospectus concept is retired). Part IV is the engineering spec and the **code-legibility rules that Claude Code must follow** (§14). Read Part I twice before building anything — the site is only as good as the understanding behind it.

> **Accuracy note:** All figures below were verified against reporting as of 8 July 2026 (sources in §16). SPCX trades daily and lockup events land through 2026 — refresh live data at build time (§8) and re-verify any number you put on screen.

## 0.5 What this project is — purpose and positioning

**Escape Velocity** is a portfolio piece demonstrating what the author does outside academic work: following live markets, analysing a landmark deal in depth, forming defensible views, and shipping a designed product about it. It is *not* a summary of news coverage — the distinction is that the site must contain conclusions that are the author's own and could turn out to be wrong. Three requirements follow from this, and they are **build requirements, not suggestions**:

**R1 — The Position (own view, on the record).** The site must end with the author's view on fair value, not only the "priced efficiently / traded emotionally" synthesis. Minimum form: a valuation range derived from the §10.3 implied-growth analysis (e.g. "at a normalised 25× EBITDA in 2030, today's price requires ~X% EBITDA CAGR — my assessment of that requirement, and the range I'd pay"), stated in first person, with reasoning. This lives as its own chapter (insert as **C7.5 · The Position**, light register) between the verdict and the colophon. Being wrong later is acceptable; being viewless is not.

**R2 — The Watch (dated predictions on live events).** The deal is unfinished: earnings 6 Aug 2026, the $175.50/3 Aug unlock trigger, the lockup waves taking float from ~4% to ~40% by December. The site carries a small "The Watch" panel (within C6 or C7.5): each upcoming event listed with the author's expectation, **date-stamped before the event**, and left permanently on the record afterwards with an outcome note. Right or wrong, this proves live market engagement; the JSON (`data/watch.json`) must preserve original prediction dates immutably.

**R3 — The Workings (visible method).** A method section (part of C8, expanded) showing: data sources with retrieval dates, links to the `/analysis` Python scripts, key assumptions, and — explicitly — the discrepancies found between sources (oversubscription 2× vs 3.3–4×; analyst-target averages $188 vs $236; valuation vs market-cap bases). Showing where sources disagree is the clearest possible signal of rigour over aggregation.

**Supporting requirements:** the repo README opens with a short reflective note ("why I built this, what I'd do differently"); the site footer links to the author's portfolio landing page and contact. And a presentation note outside the build: the follow-up question in every interview will be *"so, would you buy it?"* — the answer should be practised, two-sided, and end in a view. The site is the prop; that answer is the performance.

---

# PART I — THE KNOWLEDGE

## 1. The baseline: how an IPO normally works

You can't appreciate how strange this IPO was without the conventional playbook. A normal large IPO works like this:

1. **The S-1.** The company files a prospectus with the SEC — the full disclosure document: financials, risks, ownership, use of proceeds. This is the public's first real look inside.
2. **The roadshow.** Management and the underwriting banks spend ~2 weeks pitching institutional investors.
3. **Bookbuilding.** The banks publish a **price range** (e.g. "$28–$32") and collect orders. Demand at each level tells them where the market clears. The final price is set the night before trading.
4. **Allocation.** The banks decide who gets shares. Institutions get the vast majority; retail typically gets 5–10%. Allocation is a favour economy — banks reward loyal clients.
5. **The greenshoe.** Underwriters get an option to buy ~15% extra shares at the IPO price, used to stabilise early trading (or to sell more if demand is hot).
6. **Fees.** Underwriters historically take ~4–7% of proceeds on ordinary deals (large deals negotiate lower, but rarely dramatically so).
7. **The lockup.** Insiders can't sell for typically 90–180 days, preventing a supply flood.
8. **The pop.** A first-day rise of 10–30% is considered a "successful" debut — though a big pop also means the company left money on the table (it sold shares cheaper than the market would have paid).

Hold that playbook in mind. SpaceX broke almost every line of it.

## 2. The company that listed (it's not the company you think)

The entity that IPO'd is **not** just the rocket company. In **February 2026, Musk merged xAI into SpaceX**, valuing the combined entity at $1.25 trillion. The listed company has three engines:

- **Space / Launch** — Falcon 9, Falcon Heavy, Starship, Dragon. The strategic moat: the most-flown, lowest-cost orbital launch system in history. Strategically vital, financially modest.
- **Connectivity (Starlink)** — the cash engine. ~$11.4bn revenue in 2025 at 60%+ EBITDA margins, subscribers passing 10 million and projected toward ~17 million during 2026. The only clearly profitable segment.
- **AI (xAI)** — Grok (the LLM), the X platform, and AI compute infrastructure. The loss engine: roughly **$2.5bn of losses per quarter**, but the segment carrying the valuation story. Backed by a headline cloud agreement with Anthropic worth ~$1.25bn/month — notably **terminable on 90 days' notice** (a detail bears love).

Group financials at listing: **$18.7bn 2025 revenue, $4.2bn operating loss; Q1 2026 net loss $4.28bn.** In 2025 the company reportedly spent $12.7bn on AI versus $3.8bn on space. A 5-for-1 stock split happened on 4 May 2026, ahead of the offering.

**Timeline into the deal:** confidential draft filed 1 April 2026 → S-1 made public 20 May → underwriters named 2 June → fixed price announced 3 June → priced 11 June → traded 12 June.

## 3. Breaking the playbook — the five deviations

This is the intellectual core of your interview answer. SpaceX didn't run an IPO; it dictated one.

**Deviation 1 — Take-it-or-leave-it pricing.** No price range, no bookbuilding discovery. SpaceX announced **$135 per share, $1.77 trillion valuation** before the roadshow even began. Price discovery — the entire point of bookbuilding — was replaced by a posted price. As IPO adviser Lise Buyer put it: "Elon has dictated the price."

**Deviation 2 — Fees crushed to <0.75%.** Roughly $500m across a 21-bank syndicate (Goldman lead-left) versus the 4–7% convention. Banks accepted a ~90% fee haircut for the prestige and the relationship. Power had fully inverted: normally banks discipline issuers; here the issuer disciplined the banks.

**Deviation 3 — Retail at ~30%.** About $22.5bn of stock earmarked for retail via Schwab, Fidelity, Robinhood, SoFi and E*Trade — triple-to-six-times the norm — plus up to 5% in a direct share program. Read cynically: retail was the most enthusiastic marginal buyer of the Musk story, so the deal was structured to reach them. Read generously: democratised access. Both readings belong on your site.

**Deviation 4 — Coercive side-conditions.** Reporting (NYT, April 2026) that banks seeking a role were required to purchase Grok subscriptions — some spending tens of millions annually — with X advertising also "requested." Separately, banks warned clients that prior IPO **flipping** (selling into the debut pop) could exclude them from allocation. Anti-flipping pressure isn't new; applying it at this scale and publicity was.

**Deviation 5 — Index fast-tracking.** SpaceX secured a Nasdaq rule change (effective 1 May 2026) enabling Nasdaq-100 inclusion as soon as ~15 trading days post-IPO — engineering forced passive demand (index funds *must* buy) into the aftermarket design. It duly joined the Nasdaq-100 on **7 July 2026**, with an estimated **$4.3bn of passive inflows**. S&P 500 inclusion remains unavailable (profitability requirement).

## 4. The valuation problem

The bear case is arithmetic; the bull case is narrative. Give both honestly.

**The arithmetic (bear):**
- $1.77tn on $18.7bn revenue ≈ **95x trailing sales-to-valuation** territory in spirit; more concretely, **~94x 2025 adjusted EBITDA of $6.6bn** — an unheard-of multiple for a mega-cap.
- Among trillion-dollar companies at the time, the smallest by revenue was Micron at $58bn — three times SpaceX's revenue.
- The company had been valued at ~$400bn thirteen months earlier and ~half the IPO valuation at the December 2025 tender. The doubling wasn't driven by revenue.
- Morningstar's pre-listing fair value: **$63/share** — less than half the offer. Senator Warren's 12-page letter to the SEC requested a delay over valuation, governance and investor protection.
- Existing shareholder Ross Gerber attributed the price "to confidence in Musk personally rather than conventional financial metrics."

**The narrative (bull):**
- The **$28.5tn TAM** framing — "the largest in human history," ~90% attributed to AI — reframes the company as orbital AI infrastructure, not launch.
- Starlink is a genuine, fast-compounding, high-margin business — the bridge that funds the dream.
- The Anthropic and Google contracts were read as third-party validation of xAI's compute relevance.
- The Musk execution record: the market has repeatedly lost money betting against it.

**Governance (belongs in both cases):** Musk holds ~42% of equity but **~82–85% of voting power** via super-voting shares. SPCX is a "controlled company" under Nasdaq rules, exempt from certain independent-board requirements. The S-1 discloses a performance grant of up to **1 billion additional shares** tied to milestones *including a million-resident Mars colony*. The IPO made Musk the first dollar trillionaire.

## 5. Listing day — 12 June 2026

- Demand: order book reported at **~$250bn vs the $75bn raise (~3.3x oversubscribed)** by 9 June (some later reporting framed it nearer 2x — flag the discrepancy rather than hide it). Orders closed a day early to give the banks a full day for the record allocation task.
- Priced **11 June at $135**: 555,555,555 shares = $75bn, plus an 83.3m-share greenshoe (~$11.2bn). With the overallotment, total proceeds reached ~$86bn — more than **triple Saudi Aramco's $29.4bn record**.
- **12 June:** open delayed to late morning while underwriters balanced the cross (projections briefly pointed at a $175 open). First trade **$150 (+11.1%)** just before noon; closed **$160.95 (+19.2%)**; market cap ≈ **$2.1tn** — instantly a top-seven US company, above Tesla. 500m+ shares traded (~$33bn), second only to Facebook's 2012 debut for IPO-day volume; continued climbing after hours.

**How to read the +19%:** big enough to call the debut "hot," small enough to argue the fixed price was roughly right — SpaceX left perhaps $14bn on the table (555.6m × $26), a *smaller* underpricing loss proportionally than most mega-IPOs. This is a genuinely good interview point: the take-it-or-leave-it price, whatever else you think of it, *priced efficiently*.

## 6. The aftermath — where the real analysis lives

- **The hype phase:** SPCX ran to a high of **$225.64** (+67% over IPO) in the initial weeks.
- **The correction:** a ~**32% drawdown** from that peak; by 7–8 July it traded around **$149–150** — still ~+11% above IPO, but *below the first day's close*. Translation: everyone who bought in the open market on day one and held is underwater; IPO-allocation recipients are still up.
- **The supply cliff (the structural story):** only ~**4% of equity floated** at IPO — a deliberately thin float that amplified early moves. But lockups release in waves: an early tranche (~20% of insider holdings) unlocks after the first earnings (6 Aug 2026), with an acceleration trigger reported around **$175.50 before 3 Aug** unlocking ~456m extra shares; Musk himself is locked for 366 days. Analysts project tradable supply could approach **~40% of shares by December 2026**. Float 4% → 40% is a supply-demand story you can chart beautifully.
- **Index mechanics:** Nasdaq-100 entry (7 July) delivered its ~$4.3bn passive bid into that thin float — into a stock already 32% off its peak.
- **The Street's verdict (7 July initiations):** overwhelmingly Buy — average targets reported between ~$188 and ~$236 depending on aggregator (targets ranged $62–$800!) — with **MoffettNathanson the lone Sell**, and analysts flagging ~$84bn/yr capital needs. CME lists single-stock futures on SPCX from 27 July.

## 7. The verdict framework — "successful for whom?"

Refuse a single verdict; the sophisticated answer is a ledger.

| Constituency | Outcome | Evidence |
|---|---|---|
| **The company** | Unambiguous win | Raised ~$86bn at a self-set price; ~$14bn left on table is small by pop standards; funding secured for AI + Starship capex |
| **IPO allocation holders** | Modest win, shrinking | +19% day one; ~+11% by early July; paper gains eroding |
| **Day-one open-market buyers** | Underwater | Bought $150–$225; price ~$149 |
| **The banks** | Pyrrhic | ~$500m fees on record deal; fee model and allocation power publicly broken; Grok-subscription optics |
| **Retail** | Genuinely included, genuinely exposed | 30% allocation was real democratisation — of a 94x-EBITDA risk |
| **Market structure** | Precedent set | Fixed pricing, sub-1% fees, engineered index inclusion — the playbook Anthropic/OpenAI IPOs may now follow |

**Overhyped?** The honest synthesis: *the offering was efficiently priced; the aftermarket was overhyped.* The +67% run to $225.64 and the 32% give-back is the signature of narrative exceeding structure — a thin float meeting unlimited enthusiasm, then supply expectations arriving. Whether $135 itself is overhype is exactly the Morningstar-$63 vs Street-$236 dispute: the widest analyst disagreement on any mega-cap, which is itself the story.

## 8. Glossary (site will surface these as margin notes)

**Bookbuilding** — collecting investor orders across a price range to discover the clearing price. **Fixed-price offering** — issuer posts one price; investors take it or leave it. **Greenshoe / overallotment** — underwriters' option to sell ~15% extra shares at the IPO price, used to stabilise trading. **Float** — the fraction of shares actually available to trade. **Lockup** — contractual ban on insider selling for a set period. **Flipping** — selling IPO allocation into the debut pop. **Controlled company** — >50% voting power held by one party; exempt from some governance rules. **Dual-class shares** — share classes with unequal votes (Musk's ~42% equity / ~85% votes). **Oversubscription** — demand exceeding shares offered (here ~3.3x). **EBITDA multiple** — valuation ÷ earnings-before-interest-tax-depreciation-amortisation; SPCX ≈ 94x. **TAM** — total addressable market; SpaceX claimed $28.5tn. **Index inclusion** — entry into an index forces tracker funds to buy. **Money left on the table** — (first-day close − IPO price) × shares sold.

---

# PART II — THE DATA

## 9. Datasets to gather

| Dataset | Source | Method | Used in |
|---|---|---|---|
| SPCX daily OHLCV, 12 Jun → present | Yahoo Finance | `yfinance` in Python: `yf.download("SPCX")`; export `spcx_daily.json` | Aftermath chart (Scene 6) |
| Day-one session anchor points | Reported figures: $135 price, $150 open, $160.95 close, $166.76 AH | Hard-coded, sourced | Listing-day scene |
| Event annotations | This whitepaper §5–6 (dates: 20 May S-1, 3 Jun price, 11 Jun pricing, 12 Jun debut, peak day, 7 Jul NDX entry, 6 Aug earnings, lockup dates) | JSON: `events.json` | Chart annotations |
| Largest IPOs ever | Aramco $29.4bn (2019), Alibaba $25bn (2014), SoftBank, AIA, Visa, Facebook… | Compile ~8 rows, verify each | Records scene |
| Famous first-day pops | e.g. Facebook ≈0%, Alibaba +38%, Airbnb +113%, Aramco +10%, Snowflake +112% | Compile ~8 rows, verify | "Was +19% hot?" comparison |
| Valuation comps | Mkt-cap/revenue & EV/EBITDA for AAPL, MSFT, NVDA, TSLA, RKLB vs SPCX | Latest figures at build time | Valuation scene |
| Supply schedule | §6 lockup waves: float % over time (4% → ~40% by Dec) | Hand-built JSON from reported terms; label as estimates | Supply-cliff scene |

## 10. Four analyses you perform yourself (and can defend)

1. **Money left on the table:** 555.6m × ($160.95 − $135) ≈ **$14.4bn**, ≈19% underpricing — then rank against the pop table. Conclusion: cheap by mega-IPO standards → evidence the fixed price worked.
2. **Drawdown & volatility:** from `spcx_daily.json`, compute peak-to-trough drawdown (~32%), daily return standard deviation, and annualised vol vs QQQ over the same window. One pandas script, ~30 lines.
3. **Multiple gap:** SPCX EV/EBITDA (~94x) vs mega-cap comps (typically 15–40x) — chart the gap; then invert it: what EBITDA growth is *implied* to normalise the multiple in 5 years? (Simple: required EBITDA = current EV ÷ target multiple; CAGR from $6.6bn.) This is a genuinely impressive artefact of understanding.
4. **The float-supply model:** chart tradable share count through Dec 2026 using the lockup schedule; annotate the $175.50/3 Aug trigger. Overlay price. The visual argument: supply is the gravity acting on the hype.

Each analysis = one small, commented Python script in `/analysis`, outputting JSON the site reads. You should be able to explain every line.

---

# PART III — THE WEBSITE

## 11. Concept: **"Escape Velocity" — modern aerospace editorial**

No conceit, no costume. The site is a contemporary editorial piece in the register of the best modern product and annual-report sites (reference points: Apple product pages, Stripe's annual letters, Studio Freight / Locomotive-grade agency work). It alternates between **two registers**, and the alternation is itself the showcase:

- **Dark cinematic chapters — the company.** Full-bleed monochrome imagery (AI-generated to spec, §12.5) of Starship, the booster catch, the constellation. Huge display type over near-black. Spectacle, restraint, atmosphere.
- **Light analytical chapters — the analysis.** Gallery-white sections where a single chart or table sits like an artwork: enormous whitespace, hairline rules, mono annotations, one idea per screen.

Dark shows *what the company is*; light shows *what you did with it*. A recruiter scrolling it should feel a premium product page that keeps resolving into rigorous analysis.

## 12. Design system — "Telemetry"

**Colour (CSS custom properties, exactly these, no others):**
```
--black:     #0A0A0C;   /* space black — dark chapter background */
--panel:     #121318;   /* elevated dark surfaces */
--white:     #FAFAF7;   /* gallery white — light chapter background */
--surface:   #F0F0EC;   /* recessed light panels, table stripes */
--ink:       #16171B;   /* text on light */
--paper-txt: #F2F2EF;   /* text on dark */
--muted:     #8A8D96;   /* captions, labels, both registers */
--hairline-d: rgba(250,250,247,.14);
--hairline-l: rgba(22,23,27,.12);
--gain:      #1E9E63;   /* market green — data only */
--loss:      #E5484D;   /* market red — data only */
```
Monochrome discipline: no accent colour anywhere except gain/loss inside data. The imagery, type scale and spacing do the aesthetic work.

**Typography:** a modern grotesk for display — *Space Grotesk* or *Neue Montreal*-class (self-hosted), weights 300/500, tracking −0.03em, line-height 0.95 for headlines; *Inter* for body at 16–17px/1.7; *JetBrains Mono* or *IBM Plex Mono* for every number, label and axis. **Oversized numerals are the signature**: key figures (`$1.77T`, `94×`, `+19.2%`, `−32%`) set at `clamp(96px, 14vw, 220px)` as standalone design objects, counted up by GSAP.

**Signature motifs:**
- **Chapter labels** — small-caps mono, letter-spaced, numbered: `01 / THE MACHINE`, with a hairline rule running to the margin.
- **Monumental stat moments** — a full viewport given to one number and one sentence. Nothing else.
- **Chart-as-artwork** — each light chapter carries exactly one chart, generously margined, hand-drawn SVG/canvas, axis text in mono, annotated with thin leader lines.
- **Duotone imagery** — all photography graded to a single treatment (near-black shadows #0A0A0C, off-white highlights, faint grain) so generated images feel like one commissioned shoot. Slow parallax (yPercent 8–12, scrubbed).
- **Progress meter** — a 1px vertical line, fixed, with chapter ticks; fills as you scroll.
- Section padding ≥ 160px desktop; max content width 1280px; 12-col grid; charts and images may go full-bleed.

**Motion language:** GSAP + ScrollTrigger. Headline mask-reveals (clip-path rise, 0.9s, `expo.out`); number counters with `snap`; chart line draws scrubbed to scroll; image parallax; one pinned chapter (Listing Day). Nothing bounces, nothing rotates, no entrance longer than 1.2s. `prefers-reduced-motion` renders everything in final state.

## 12.5 Image plan — generation prompts

Generate all images with the same style suffix so they grade as one shoot. Suffix for every prompt: *"— monochrome black-and-white photography, cinematic, dramatic single-source lighting, subtle film grain, deep blacks, ultra-detailed, no text, 16:9"*.

| ID | Placement | Prompt (before suffix) |
|---|---|---|
| IMG-01 | C0 hero | Colossal stainless-steel super-heavy rocket stacked on its launch tower at pre-dawn, low ground fog, rim-lit silhouette, seen from a low wide angle |
| IMG-02 | C2 backdrop | A train of flat satellites in low Earth orbit, Earth's limb glowing softly below, star field above |
| IMG-03 | C4 backdrop | Grid of rocket engine nozzles seen directly from below in a dark hangar, chiaroscuro industrial lighting |
| IMG-04 | Interlude | Rocket booster descending between two tower catch-arms, long-exposure motion blur on the plume |
| IMG-05 | C6 or interlude | Vast dark server hall receding to a vanishing point, single cold light source down the aisle |
| IMG-06 | C7 backdrop | A city exchange tower at night displaying a rocket launch on its curved screen, long exposure, rain-slick street reflections |

Post-process each: desaturate fully, crush shadows to #0A0A0C, +grain 4%, export 2400px AVIF/WebP with a 24px-blur placeholder. Art-direct crops: 16:9 for chapter backdrops, 21:9 for interludes.

## 13. Structure — nine chapters, alternating registers

**C0 · Hero (dark, IMG-01).** Full-bleed rocket at pre-dawn. Mono label `NASDAQ : SPCX · 12 JUNE 2026`. Headline in two lines: **"The $1.77 Trillion / Offering."** Sub-line: *The largest IPO in history — and what the market did with it.* Scroll cue; progress meter appears. *GSAP: image scale 1.06→1 on load, headline mask-reveal, label fade.*

**C1 · The Machine (light).** How an IPO normally works: a minimal five-step horizontal diagram (S-1 → roadshow → bookbuild → allocate → debut), each step a hairline card that draws in sequence. Closes: "SpaceX kept the paperwork — and threw away the machine." *GSAP: pinned, scrubbed step assembly.*

**C2 · Three Engines (dark, IMG-02).** LAUNCH / STARLINK / xAI as three columns over the constellation image: oversized numerals count up — Starlink `$11.4BN` revenue in `--gain`, xAI `−$2.5BN /qtr` in `--loss`, launch flights flown. One line each. *GSAP: counters, staggered column rise.*

**C3 · Breaking the Playbook (light).** The centrepiece analysis: a five-row comparison table, CONVENTION column in `--muted`, SPACEX column in full ink and larger type (fixed $135 · <0.75% fees · 30% retail · Grok conditions · index fast-track). Rows reveal with a hairline that draws across. No gimmicks — typographic hierarchy carries it. *GSAP: per-row reveal, rule draws.*

**C4 · The Price of Belief (dark, IMG-03).** Monumental stat sequence over the engine grid, one viewport each: `94×` (EBITDA multiple) → `$28.5T` (claimed TAM) → the duel `$63` (`--loss`, Morningstar) vs `$236` (Street average). Each with a single caption line. *GSAP: counters + mask reveals per viewport.*

**C5 · Listing Day (light, pinned).** The intraday story as one drawn line: $135 pricing → delayed open → `$150` first trade → `$160.95` close, timestamps in mono along the base, the line ticking to `--gain` above $135. Live counters for % gain and market cap ride the line's head. *GSAP: scrubbed SVG line draw, keyed counters.*

**C6 · The Aftermath (light).** Two charts as artworks: the full daily series (run to `$225.64`, the `−32%` correction shaded in `--loss`, flags for NDX entry and the $175.50 unlock trigger), then the supply-cliff bars (float 4% → ~40% by Dec). Your §10 analyses surface here as annotations. *GSAP: chart draw scrub, flag pops.*

**C7 · The Verdict (dark, IMG-06).** The six-constituency ledger as a clean table over the exchange-tower image, verdict words set in mono (`WIN`, `UNDERWATER`, `PYRRHIC`). Then the closing viewport: the thesis line alone in huge display type — *"Priced efficiently. Traded emotionally."* *GSAP: table stagger; closing line mask-reveal.*

**C7.5 · The Position (light).** Required by §0.5-R1. The author's fair-value view: the implied-growth calculation shown as a simple interactive (slider for exit multiple → required EBITDA CAGR updates), the stated range, and a first-person paragraph of reasoning. The Watch panel (§0.5-R2) sits at the foot of this chapter: dated predictions, outcomes appended as events resolve. *GSAP: minimal — this chapter reads as writing, not spectacle.*

**C8 · Colophon + Method (light).** Expanded per §0.5-R3: data sources with retrieval dates, links to the analysis scripts, assumptions, and the source-discrepancy register. Then credits, portfolio link, contact. Set like the credits page of a printed annual report.

**Interludes:** two full-bleed 21:9 image moments (IMG-04 booster catch; IMG-05 server hall) with a single pull-quote in display type ("*There's zero math that makes any sense whatsoever.*"). Pacing beats between analytical chapters.

---

# PART IV — ENGINEERING

## 14. Code-legibility criteria — **binding instructions for Claude Code**

The builder (Claude Code) must treat these as hard requirements, because the author needs to understand and defend every line in interviews:

1. **No framework.** Vite + vanilla JS + GSAP (+ ScrollTrigger). No React, no bundler magic beyond Vite defaults. Reason: every line traceable.
2. **One file per scene.** `/src/chapters/c3-playbook.js` etc., each exporting a single `initScene()` function. No file over ~150 lines.
3. **Comment the *why*, not the *what*.** Every GSAP timeline opens with a plain-English block comment describing the intended visual in one sentence, plus what `scrub`, `pin`, `start`/`end` are doing in this specific case.
4. **No clever code.** No chained ternaries, no dense one-liners, no premature abstraction. If a utility is used twice, it may live in `/src/lib/`, with a comment.
5. **Data separated from code.** All figures live in `/data/*.json` — never hard-coded into scenes — so numbers can be refreshed without touching logic. Each JSON carries a `"source"` and `"as_of"` field.
6. **Design tokens only.** All colour/type/spacing via CSS custom properties in one `tokens.css`; **zero literal hex values** anywhere else. One `styles/` folder: `tokens.css`, `base.css`, `components.css`, one small css file per scene.
7. **README as tour guide.** Explains the file map, how a scene works end-to-end (pick C3 as the worked example), how to refresh data, and a 10-line "how GSAP ScrollTrigger works" primer.
8. **A LEARNING.md** listing five exercises for the author (e.g. "change the headline reveal duration"; "add an annotation to the aftermath chart"; "retune the C5 scrub speed"; "swap an image and regrade it") — proof-of-understanding tasks.
9. **Accessibility & restraint:** `prefers-reduced-motion` disables scrubbing (content renders in final state); semantic HTML; all text real text (no text in images); keyboard-reachable nav.
10. **Performance:** charts on `<canvas>` or lightweight SVG; no library beyond GSAP and (optionally) a ~zero-dep chart drawn by hand; Lighthouse ≥ 90 across the board; total JS < 200KB gzipped.

## 15. Build plan (feed to Claude Code in this order)

1. Scaffold Vite project, tokens.css, base typography, the paper page shell + folio system.
2. Data layer: run the Python fetch/analysis scripts (§9–10), commit JSONs.
3. C0 hero + the shared components: chapter label, progress meter, mask-reveal headline, counter (perfect each once; reuse everywhere).
4. C3 playbook table + one monumental stat viewport (the typographic core — build early, they set the standard). Drop in graded imagery as it's generated (§12.5); build with blur placeholders first.
5. C5 + C6 charts (the technical heart).
6. Remaining chapters; the two image interludes; C7.5 Position + Watch panel (`data/watch.json` with immutable prediction dates); C8 colophon + method register.
7. Motion pass (easing consistency: `expo.out` everywhere; no entrance over 1.2s), reduced-motion pass, image-weight pass (AVIF/WebP + placeholders), Lighthouse pass.
8. Deploy static (Vercel/Netlify). Custom domain if desired.

## 16. Source register (verify before publishing any figure)

- CNBC — *SpaceX IPO explained* (9 Jun 2026): fixed $135 price; retail ~30% (~$22.5bn); $1.77tn; $18.7bn revenue / $4.2bn operating loss; allocation timetable.
- CNBC — *SpaceX targets $135 IPO price* (3 Jun 2026): 555.6m shares / $75bn; greenshoe 83.33m (~$11.2bn); underwriter lineup; Musk >82% voting; xAI merger at $1.25tn (Feb 2026); Tesla cross-holdings.
- Wikipedia — *Initial public offering of SpaceX*: fees <0.75% (~$500m); $28.5tn TAM (90% AI); Grok-subscription and anti-flipping reporting; ~$86bn raised; first-day ~$2.1tn cap; Nasdaq rule change; Gerber quote; Starlink quarterly figures; $400bn valuation 13 months prior.
- NPR (11 & 12 Jun 2026): pricing confirmation; Aramco comparison; +19% close $160.95.
- CNBC live blog (12 Jun 2026): $150 open; $160.95 close; $166.76 after-hours; 500m+ shares; volume vs Facebook 2012.
- Forbes live blog (12 Jun 2026): open mechanics; Warren letter; Morningstar $63; trillionaire; Shotwell stake.
- Forbes — *8 Things To Know* (4 Jun 2026): three-engine framing; Starlink $11.39bn 2025 revenue, 60%+ margins; controlled company; 1bn-share Mars performance grant; ~85%/42% split.
- BitMEX IPO guide (May 2026): 21-bank syndicate; $250bn demand (~3.3–4x); 5-for-1 split 4 May 2026; Q1 loss $4.28bn; AI losses $2.5bn/q.
- TradingView / Investing.com / Yahoo (7–8 Jul 2026): NDX inclusion + ~$4.3bn passive; ~32% correction; ~$149–150 price; 52-wk range $135–$225.64; analyst targets ($188.57 avg per Investing; ~$236 per Yahoo — note the spread, targets $62–$800).
- Benzinga (6 Jul 2026): $175.50 / 3 Aug early-unlock trigger (~456m shares). Motley Fool (6 Jul 2026): float 4% → ~40% by Dec; Musk 366-day lockup.

*Discrepancies to preserve honestly on-site: oversubscription (2x vs 3.3–4x by source/date); average analyst target (aggregator-dependent); "valuation" vs "market cap" ($1.77tn offering valuation vs ~$2.1tn day-one cap — different share-count bases).*

---

*End of whitepaper v1.2. Read Part I twice. Write your Position and first Watch entries before building C7.5. Generate the §12.5 imagery. Then build.*
