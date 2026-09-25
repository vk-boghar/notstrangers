"""Validation — the build fails if any `errors` are returned (spec §8.4)."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from pipeline.common import GEO_LEVELS, RAW, SOURCE_ORGS, load_yaml

# Known disagreements between sources, discovered while building. Shown in report.md and on the
# methodology page. They are not failures; they are open questions for the owner (spec §12).
KNOWN_DISCREPANCIES = [
    "RESOLVED — NCRB 2024 POCSO total: Table 4A.2(ii) col. 228 prints 69,191 cases (70,132 victims). "
    "Dataful's article cites 67,809; that figure does not appear in the NCRB table and is not used.",
    "RESOLVED — Tamil Nadu POCSO 2023/2024: the Policy Note totals (4,581 / 6,969) match NCRB exactly. The smaller "
    "pair reported by DT Next (3,407 / 5,319) is the Section 4 & 6 subset (NCRB: 3,407 / 5,320).",
    "FTSC pendency: spec lists ~2,02,175 pending as of 30 Apr 2026; the Rajya Sabha reply reported "
    "2,45,579 pending at 31 Dec 2025. The Apr-2026 figure is held in data/raw/manual/_held.csv until confirmed.",
    "NCRB's conviction rate is convicted ÷ cases in which trials were completed (convicted + discharged + acquitted), "
    "per the column formula printed in Tables 4A.5/4A.6 — not convicted ÷ (convicted + acquitted).",
]


@dataclass
class Result:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    passed: list[str] = field(default_factory=list)
    crosscheck: list[str] = field(default_factory=list)


def _find(df, dataset, metric, geo, year, dim=""):
    m = (df.dataset == dataset) & (df.metric == metric) & (df.geo_code == geo) & (df.year == year) & (df.dimension_value == dim)
    return df[m]


def run(df: pd.DataFrame, parsed_count: int, strict: bool = False) -> Result:
    res = Result()
    cfg = load_yaml("anchors.yaml")

    # 1. Schema / provenance on every row
    for i, r in df.iterrows():
        where = f"row {i} ({r['dataset']} {r['geo_code']} {r['year']})"
        if not r["source_table"]:
            res.errors.append(f"{where}: empty source_table")
        if not r["source_url"].startswith("http"):
            res.errors.append(f"{where}: missing/invalid source_url")
        if r["tier"] not in (1, 2, 3):
            res.errors.append(f"{where}: tier must be 1, 2 or 3")
        if r["source_org"] not in SOURCE_ORGS:
            res.errors.append(f"{where}: unknown source_org {r['source_org']!r}")
        if r["geo_level"] not in GEO_LEVELS | {"aggregate"}:
            res.errors.append(f"{where}: unknown geo_level {r['geo_level']!r}")
        if not r["as_of_date"]:
            res.errors.append(f"{where}: empty as_of_date")
    if not any(e for e in res.errors if "source" in e):
        res.passed.append(f"All {len(df)} rows carry source_table, source_url, tier and as_of_date")

    # 2. Anchor checksums
    for a in cfg["anchors"]:
        hit = _find(df, a["dataset"], a["metric"], a["geo"], a["year"], str(a.get("dim", "")))
        label = f"{a['dataset']}/{a['metric']} {a['geo']} {a['year']} {a.get('dim', '')}".strip()
        if hit.empty:
            res.errors.append(f"anchor missing: {label}")
        elif len(hit) > 1:
            res.errors.append(f"anchor ambiguous ({len(hit)} rows): {label}")
        elif float(hit["value"].iloc[0]) != float(a["value"]):
            res.errors.append(f"anchor mismatch: {label} expected {a['value']} got {hit['value'].iloc[0]}")
        else:
            src = hit["source_org"].iloc[0]
            res.passed.append(f"anchor ✓ {label} = {a['value']}")
            if strict and "Hand-entered" in hit["notes"].iloc[0]:
                res.errors.append(f"--strict: anchor {label} is still hand-entered; parse the NCRB table")

    # 3. Sum rules (exact) for every geo/year where the total and all parts exist
    for rule in cfg["sum_rules"]:
        sub = df[df.dataset == rule["dataset"]]
        for (geo, year, metric), g in sub.groupby(["geo_code", "year", "metric"]):
            vals = dict(zip(g.dimension_value, g.value))
            if rule["total"] in vals and all(p in vals for p in rule["parts"]):
                s = sum(vals[p] for p in rule["parts"])
                label = f"{rule['dataset']} {geo} {year}: {' + '.join(rule['parts'])} = {rule['total']}"
                if s != vals[rule["total"]]:
                    res.errors.append(f"sum mismatch — {label}: {s:g} ≠ {vals[rule['total']]:g}")
                else:
                    res.passed.append(f"sum ✓ {label} ({s:g})")

    # 4. State totals vs national (log NCRB's own inconsistencies, don't fail)
    states = df[(df.geo_level == "state") & (df.source_org == "NCRB")]
    for (dataset, metric, dim, year), g in states.groupby(["dataset", "metric", "dimension_value", "year"]):
        if "rate" in metric or "pct" in metric:
            continue
        nat = _find(df, dataset, metric, "IN", year, dim)
        if nat.empty:
            continue
        s, n = g.value.sum(), float(nat.value.iloc[0])
        if s != n:
            res.warnings.append(f"NCRB inconsistency: Σ states {dataset}/{metric}/{dim or '—'} {year} = {s:g} vs All-India {n:g}")
        else:
            res.passed.append(f"Σ states = All-India ✓ {dataset}/{dim or '—'} {year}")

    # 5. Cross-check against mirrors (data/raw/crosscheck/*.csv, same schema). NCRB wins; log diffs.
    for f in sorted((RAW / "crosscheck").glob("*.csv")):
        cc = pd.read_csv(f, dtype=str, keep_default_na=False)
        cc["value"] = pd.to_numeric(cc["value"], errors="coerce")
        for _, r in cc.iterrows():
            hit = _find(df, r["dataset"], r["metric"], r["geo_code"], int(r["year"]), r.get("dimension_value", ""))
            if hit.empty:
                continue
            ours = float(hit.value.iloc[0])
            if ours != r["value"]:
                res.crosscheck.append(f"{f.name}: {r['dataset']} {r['geo_code']} {r['year']} {r.get('dimension_value','')} mirror={r['value']:g} ours={ours:g}")

    if parsed_count == 0:
        res.warnings.append("No NCRB raw tables parsed yet — anchor figures are hand-entered from the published "
                            "edition (data/raw/manual/ncrb_published_figures.csv). Commit raw files and mark "
                            "entries `ready` in tables.yaml.")
    return res
