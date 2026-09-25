# NCRB Crime in India 2024 — provenance

- **Source of record:** National Crime Records Bureau, *Crime in India 2024*, Volume I — https://ncrb.gov.in/en/crime-india
- **Copy used:** mirror at OpenCity (https://data.opencity.in/dataset/crime-in-india-2024), retrieved 2026-09-25 in a browser.
- **SHA-256 of the Vol. I PDF:** see `pipeline/config/tables.yaml` (editions.2024.notes) — full hash below.
- **Method:** the PDF's text layer was read with pdf.js; table rows were rebuilt from text positions; each printed table was saved as one CSV in `extracted/` with NCRB's own column order. No values were typed or edited by hand.
- **Checks:** every numeric column of every extracted State/UT table sums exactly to NCRB's "TOTAL ALL INDIA" row (see pipeline/validate/report.md).
- **To audit:** download the Vol. I PDF from NCRB, confirm the hash, and compare the pages listed in `tables.yaml`. Commit the PDF here as `vol1.pdf` if you want the raw file in the repo (≈18 MB).
- 2024: 75b827bdcfcd5e641984d7fb549aaa2f3cdf030caace2d93853e450ee236bb4c
