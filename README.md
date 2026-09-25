# Not Strangers — notstrangers.org

A free, public, non-commercial website that shows parents — in plain language, in Tamil and English — how common child sexual abuse is in India and Tamil Nadu, who the offenders usually are, how slowly justice moves, and what to do about it.

> **In about 97 of every 100 POCSO cases, the child knew the person.**

Working title. Swap the name and domain in `site/src/config/site.ts`.

**Status: Phase 1 MVP, built and passing all checks. The site is `noindex` until the content has been reviewed.** Launch steps are in [`docs/LAUNCH.md`](docs/LAUNCH.md).

---

## What's in the box

```
pipeline/                 Python data pipeline (spec §8.2)
  config/tables.yaml      per-year NCRB table mapping (status: todo → ready)
  config/anchors.yaml     published checksums; the build fails if they aren't reproduced
  config/states.yaml      state/UT name normalisation (36 States/UTs + aggregates)
  config/districts_tn.yaml  TN district aliases + 2019–20 new-district → 2011-parent mapping
  extract/ transform/ validate/ export/
  tests/                  pytest (11 tests, synthetic NCRB fixture)
  validate/report.md      written on every run: errors, warnings, discrepancies, todo tables
data/
  raw/ncrb/<year>/        ← commit NCRB files here (never edited, never scraped in CI)
  raw/tn_scrb/            ← commit TN SCRB Crime Review PDFs here (download by hand)
  raw/tn_policy_note/     ← commit TN Police Policy Note PDFs here
  raw/manual/*.csv        hand-entered figures, full provenance per row
  raw/manual/_held.csv    unconfirmed figures, never published
  processed/              tidy CSVs (also published as downloads)
site/                     Astro static site (TypeScript, no client framework)
  src/config/site.ts      ← name, domain, contact email, NOINDEX, review flags
  src/i18n/{en,ta}.json   all copy; Tamil is a DRAFT pending native review
  src/data/               pipeline output consumed at build time
  src/geo/                DataMeet boundaries → simplified TopoJSON
  public/share/           generated share cards (12 PNGs)
  scripts/check-dist.mjs  post-build guardrails (fails the build)
  scripts/share-cards.mjs share-card generator (headless Chromium)
.github/workflows/ci.yml  tests → pipeline → "committed data is current" → build + guardrails
```

## Run it

```bash
# data (Python 3.11+)
pip install -r pipeline/requirements.txt
python -m pytest pipeline/tests -q
python -m pipeline.run              # writes site/src/data, site/public/data, data/processed
python -m pipeline.run --strict     # also fails while any anchor is still hand-entered

# site (Node 22+)
cd site
npm install
npm run dev                         # http://localhost:4321/en/
npm run build                       # static output in site/dist + guardrail checks
npm run cards                       # regenerate share cards (needs Chromium; set CHROME_PATH)
```

## Pages

| Route | What it is |
|---|---|
| `/en/` `/ta/` | The six-section story: hook → scale → who → age → justice → what you can do (+ helplines) |
| `/…/explore/india/` | National figures, state map (fills in when state tables are parsed), sortable state table, online-exploitation context |
| `/…/explore/tamil-nadu/` | Policy Note trend 2020–24, press-reported 2026 YTD (tier 3, clearly labelled), Madras HC pendency, Chennai convictions, district map |
| `/…/help/` | Helplines & official reporting channels, with last-verified date |
| `/…/methodology/` | Honesty rules, relationship-category explainer, tiers, auto-generated source register, pipeline, boundaries, open questions, changelog |
| `/…/data/` | Every dataset as CSV with provenance columns |
| `/…/about/` | Why, rules, partner slot, contact |

## Guardrails that fail the build

**Pipeline** (`python -m pipeline.run`): all 14 anchor figures from spec §3.1 reproduced exactly · relationship groups sum to the Sec 4 & 6 total · the three "known" groups sum to known_total · age bands sum to the total · every row has `source_table`, `source_url`, `tier`, `as_of_date` · state totals checked against All-India (NCRB's own inconsistencies are logged).

**Site** (`npm run build` → `check-dist.mjs`): `noindex` on every page while `NOINDEX` · robots.txt disallows all · no trackers, cookies, storage, external scripts/fonts/images · no `<img>` at all (no photos) · inline JS ≤ 6 KB per page · story page has ≥3 "only reported cases" caveats, the relationship explainer, DRAFT marking on prevention copy, the helplines "last verified" date, ≥6 source citations, ≥3 accessible data tables.

## Design choices worth knowing

- **Charts are HTML/CSS bars, not canvas or SVG text**, so labels stay real text at 360 px, wrap properly in Tamil, work with screen readers and need no JavaScript. Maps are SVG rendered at build time (d3-geo). Total client JS is a few hundred bytes of inline script per page.
- **Every number comes from `src/data/tidy.json`.** Components call `one({...})`, which *throws at build time* if a figure is missing or ambiguous, so the page can't quietly render a blank.
- **Missing data is shown as missing.** The state map, TN districts, TN relationship breakdown and police-to-court funnel show "pending" states until the NCRB tables are parsed. Nothing is estimated or interpolated.
- **Palette** (warm neutrals + deep teal) passes CVD-separation and contrast checks in both light and dark mode.
- **Fonts** (Noto Sans + Noto Sans Tamil) are self-hosted and subset by unicode-range.
