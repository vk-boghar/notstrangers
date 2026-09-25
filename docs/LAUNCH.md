# Launch checklist & owner tasks

Everything below needs a person: a browser download, a judgement call, or a relationship. Work top to bottom.

## A. Before the preview goes live (noindex) — about 30 minutes

- [ ] **Name, domain, email** → `site/src/config/site.ts`: `SITE_NAME`, `SITE_NAME_TA`, `SITE_URL`, `CONTACT_EMAIL`. Then run `npm run cards` (share cards print the domain) and rebuild.
- [ ] **About page** → replace the `OWNER: add your name/bio here` marker in `site/src/pages/[lang]/about.astro`.
- [ ] **Git** → `git remote add origin <your repo> && git push -u origin main`.
- [ ] **Host** (both free, static):
  - *Cloudflare Pages:* root directory `site`, build command `npm run build`, output `dist`, env `NODE_VERSION=22`.
  - *Netlify:* `netlify.toml` is already set up. Just connect the repo.
  - `site/public/_headers` sets a strict CSP and no-referrer on both.
- [ ] **Analytics:** none by default. If you want aggregate counts, Cloudflare Web Analytics is cookieless. Adding its script means allowing `static.cloudflareinsights.com` in the CSP and in `check-dist.mjs`.

## B. Data you have to download by hand (the sites block bots, and we respect that)

| File | Where it comes from | Commit to |
|---|---|---|
| Crime in India 2024 (Vol. I PDF + any Excel/CSV table downloads for the Crime Against Children chapter) | https://ncrb.gov.in/en/crime-india | `data/raw/ncrb/2024/` |
| Crime in India 2017–2023 (same chapter) | same | `data/raw/ncrb/<year>/` |
| TN SCRB Crime Review 2023, 2024, 2025 | `https://eservices.tnpolice.gov.in/content/crime_review/tn_cr_compendium_<YEAR>.pdf`. Open it in a browser; robots.txt disallows automated access | `data/raw/tn_scrb/<year>/` |
| TN Home (Police) Policy Note 2025-26 and 2026-27 | TN Assembly / tn.gov.in policy notes | `data/raw/tn_policy_note/` |
| Rajya Sabha answer PDF (FTSC, Jul 2026) | sansad.in, search "Fast Track Special Courts" | `data/raw/manual/` (then update the `source_url`s in `ftsc.csv`) |
| Dataful / OpenCity mirrors (optional, for cross-checking) | dataful.in/datasets/21841, data.opencity.in/dataset/crime-in-india-2024 | `data/raw/crosscheck/*.csv` (tidy schema) |

**Wiring an NCRB table in** (about 10 minutes per table):
1. Open the file and find the table. Note its printed ID (e.g. "Table 4A.10"), the column holding the state name, and which columns hold which values.
2. Fill in its block in `pipeline/config/tables.yaml` (`file`, `sheet`/`pages`, `header_rows`, `geo_col`, `columns`, `source_table`) and set `status: ready`.
3. Run `python -m pipeline.run`, then read `pipeline/validate/report.md`. Parsed rows automatically replace the hand-entered national figures. If they don't match the published anchors, the build fails and the report tells you which figure.
4. The state map, state table, TN relationship toggle, year selector and justice funnel all switch on automatically once the data exists. No page code changes are needed.
5. When every anchor comes from a parsed table, add `--strict` to the pipeline step in CI.

## C. Open questions I flagged rather than guessed (spec §12)

1. **NCRB 2024 POCSO total.** The spec anchors it at **69,191**. Dataful's write-up of the same edition says **67,809**. This is probably "POCSO Act only" vs "POCSO read with IPC/BNS". Confirm it from the table footnotes. If 69,191 is wrong, change `anchors.yaml` and `ncrb_published_figures.csv` together.
2. **TN 2023/2024 POCSO.** The Policy Note (via The South First) gives **4,581 / 6,969**. DT Next reported **3,407 / 5,319** "presented in the Assembly", which could be a subset. Confirm from the Policy Note PDF.
3. **FTSC pendency.** The spec says ~**2,02,175** pending on 30 Apr 2026. The Rajya Sabha reply says **2,45,579** at 31 Dec 2025. The Apr-2026 figure is held in `data/raw/manual/_held.csv`, so it isn't shown yet.
4. **TN 2025 surge.** Press says Jan–Jul 2025 = 9,813, already more than full-year 2024 (6,969). It is shown only on the TN page, labelled tier 3. Once the 2026-27 Policy Note or SCRB confirms it, move it to tier 1 and it can go into headlines.
5. **Teenage-pregnancy / child-marriage detection** as a driver of TN's rise: check whether SCRB separates these cases out.
6. **NCRB table IDs per year**, TN state-level relationship table, NCRB district POCSO columns, and Dataful licence terms. All of these can only be confirmed once the raw files are in.
7. **TNCPCR phone/email**: their site blocked automated checks, so the helplines list links to their contact page instead of printing a number. Verify it by hand and add the number if you want it shown.

## D. Before public launch (Phase 2 gate)

- [ ] **Tamil review** by a native speaker: `site/src/i18n/ta.json`. It is a careful draft, but a draft. When it's done, set `TAMIL_REVIEWED = true` and delete the `_status` line.
- [ ] **Prevention content review** by an expert reviewer. The copy is in `home.act_*`, `home.*_action` and `cards.*_action` in both JSON files. After review, set `PREVENTION_CONTENT_REVIEWED = true`.
- [ ] Re-verify helplines, then update `HELPLINES_VERIFIED_ON`.
- [ ] Full 2017–2024 NCRB series and state tables parsed (section B).
- [ ] Set `NOINDEX = false`. robots.txt and meta tags flip automatically.

## E. Each new NCRB edition (annual runbook)

1. Download the edition and commit it to `data/raw/ncrb/<year>/`.
2. Copy the previous year's block in `tables.yaml`, then update file names and table IDs.
3. Add the new edition's national anchor figures to `anchors.yaml`.
4. `python -m pipeline.run`, then fix anything the report flags.
5. Add a changelog line on the methodology page (`site/src/pages/[lang]/methodology.astro`).
6. `npm run cards`, commit, push.
