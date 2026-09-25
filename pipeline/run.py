"""Run the whole pipeline:  python -m pipeline.run [--strict]

  extract   parse `ready` NCRB tables from data/raw/ncrb/<year>/ (config: tables.yaml)
  transform merge with hand-entered sources in data/raw/manual/ into one tidy long table
  validate  anchor checksums, sum rules, provenance, cross-checks  -> pipeline/validate/report.md
  export    data/processed/*.csv, site/public/data/*.csv, site/src/data/{tidy,meta}.json

Exit code 1 if validation fails (so CI and `npm run build` fail too).
--strict additionally fails while any anchor figure is still hand-entered rather than parsed.
"""
from __future__ import annotations

import argparse
import sys
from datetime import date

from pipeline.common import REPORT, ROOT
from pipeline.export.site import export
from pipeline.extract.ncrb import ExtractError, extract_all
from pipeline.transform.tidy import build, load_held
from pipeline.validate.checks import KNOWN_DISCREPANCIES, run as validate


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args(argv)

    try:
        parsed, extract_warnings, todo = extract_all()
    except ExtractError as e:
        print(f"✗ extract failed: {e}", file=sys.stderr)
        return 1

    tidy, merge_log = build(parsed)
    res = validate(tidy, parsed_count=len(parsed), strict=args.strict)
    res.warnings = extract_warnings + res.warnings
    held = load_held()

    lines = [
        "# Validation report", "",
        f"Generated {date.today().isoformat()} by `python -m pipeline.run{' --strict' if args.strict else ''}`.", "",
        f"**Status: {'FAILED' if res.errors else 'PASSED'}** — {len(tidy)} rows · "
        f"{len(parsed)} parsed from NCRB raw files · {len(res.errors)} errors · {len(res.warnings)} warnings", "",
    ]
    def section(title, items):
        lines.extend([f"## {title}", ""] + ([f"- {x}" for x in items] or ["- (none)"]) + [""])
    section("Errors (build fails)", res.errors)
    section("Warnings", res.warnings)
    section("Known source discrepancies (open questions — see spec §12)", KNOWN_DISCREPANCIES)
    section("Held rows (data/raw/manual/_held.csv — not published)",
            [f"{r['dataset']} {r['geo_code']} {r['as_of_date']} {r['dimension_value']} = {r['value']} — {r['notes']}" for _, r in held.iterrows()])
    section("Cross-check vs mirrors (NCRB wins)", res.crosscheck)
    section("Outstanding NCRB tables (status: todo in tables.yaml)", todo)
    section("Merge log", merge_log)
    section("Checks passed", res.passed)
    REPORT.write_text("\n".join(lines), encoding="utf-8")

    if res.errors:
        print("✗ validation failed:", *res.errors, sep="\n  ", file=sys.stderr)
        print(f"  see {REPORT.relative_to(ROOT)}", file=sys.stderr)
        return 1

    meta = {
        "parsed_ncrb_rows": len(parsed),
        "outstanding_tables": todo,
        "warnings": res.warnings,
        "known_discrepancies": KNOWN_DISCREPANCIES,
        "checks_passed": len(res.passed),
    }
    export(tidy, meta)
    print(f"✓ {len(tidy)} rows · {len(res.passed)} checks passed · {len(res.warnings)} warnings · report: {REPORT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
