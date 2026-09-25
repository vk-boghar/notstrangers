"""Config-driven extraction of NCRB tables (xlsx / csv / pdf) into tidy rows.

Nothing here knows NCRB table numbers — those live in pipeline/config/tables.yaml, per year,
because NCRB renumbers tables between editions. Only entries with `status: ready` are parsed.
The raw files are committed to data/raw/ncrb/<year>/ and never edited; we never fetch from
ncrb.gov.in in CI.
"""
from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

from pipeline.common import RAW, StateIndex, TNDistrictIndex, load_yaml


class ExtractError(Exception):
    pass


def _to_number(v) -> float | None:
    if v is None:
        return None
    if isinstance(v, (int, float)) and not pd.isna(v):
        return float(v)
    s = str(v).strip()
    if s in {"", "-", "–", "—", "NA", "N.A.", "nan", "None"}:
        return None
    s = re.sub(r"[,\s]", "", s)          # Indian digit grouping: 1,87,702
    s = re.sub(r"[\*#@]+$", "", s)      # trailing footnote marks
    try:
        return float(s)
    except ValueError:
        return None


def _read_grid(path: Path, spec: dict) -> list[list]:
    fmt = spec["format"]
    if fmt == "xlsx":
        df = pd.read_excel(path, sheet_name=spec.get("sheet", 0), header=None, dtype=object)
        return df.values.tolist()
    if fmt == "csv":
        df = pd.read_csv(path, header=None, dtype=object)
        return df.values.tolist()
    if fmt == "pdf":
        import pdfplumber

        first, last = (int(x) for x in str(spec["pages"]).split("-")) if "-" in str(spec["pages"]) else (int(spec["pages"]),) * 2
        grid: list[list] = []
        with pdfplumber.open(path) as pdf:
            for p in range(first, last + 1):
                for table in pdf.pages[p - 1].extract_tables():
                    grid.extend(table)
        return grid
    raise ExtractError(f"unknown format {fmt!r}")


def _extract_long(year: int, name: str, spec: dict, edition: dict, path: Path) -> tuple[list[dict], list[str]]:
    """Long-format extract (one value per row) for national crime-head rows, e.g. POCSO police/court disposal.
    spec.map: {column_label_in_file: {dataset, metric, dim, unit}}"""
    df = pd.read_csv(path, dtype=str)
    rows = []
    for _, r in df.iterrows():
        m = spec["map"].get(r[spec["label_col"]])
        if not m:
            continue
        rows.append({
            "year": year, "period_start": f"{year}-01-01", "period_end": f"{year}-12-31",
            "geo_level": "country", "geo_code": "IN", "geo_name": "India",
            "dataset": m["dataset"], "metric": m["metric"], "dimension": "stage" if m.get("dim") else "none",
            "dimension_value": m.get("dim", ""), "value": float(r[spec["value_col"]]), "unit": m["unit"],
            "source_org": "NCRB", "tier": 1, "as_of_date": f"{year}-12-31", "retrieved_on": spec.get("retrieved_on", ""),
            "source_table": f"Table {r['table']} (row 25, POCSO Act total)",
            "source_edition": edition["title"], "source_url": spec.get("source_url") or edition["url"],
            "notes": edition.get("notes", "") + f" Column {r['col']}, PDF page {r['pdf_page']}.",
        })
    return rows, []


def extract_table(year: int, name: str, spec: dict, edition: dict) -> tuple[list[dict], list[str]]:
    """Return (rows, warnings) for one tables.yaml entry."""
    warnings: list[str] = []
    path = RAW / "ncrb" / str(year) / spec["file"]
    if not path.exists():
        raise ExtractError(f"{year}/{name}: raw file not found: {path.relative_to(RAW.parent.parent)}")
    if spec["format"] == "long_csv":
        return _extract_long(year, name, spec, edition, path)
    if not spec.get("columns"):
        raise ExtractError(f"{year}/{name}: `columns` mapping is empty")
    if not spec.get("source_table"):
        raise ExtractError(f"{year}/{name}: `source_table` is empty — every row must cite its table")

    grid = _read_grid(path, spec)[int(spec.get("header_rows", 0)):]
    states = StateIndex()
    districts = TNDistrictIndex()
    level = spec["geo_level"]
    rows: list[dict] = []
    for r in grid:
        if not r or len(r) <= spec["geo_col"]:
            continue
        raw_geo = r[spec["geo_col"]]
        if raw_geo is None or (isinstance(raw_geo, float) and pd.isna(raw_geo)) or str(raw_geo).strip() == "":
            continue
        raw_geo = str(raw_geo).replace("\n", " ").strip()

        if level == "state":
            hit = states.resolve(raw_geo)
            if not hit:
                warnings.append(f"{year}/{name}: unrecognised state row {raw_geo!r} (skipped)")
                continue
            code, gname = hit
            glevel = "country" if code == "IN" else ("aggregate" if code.startswith("IN-") else "state")
        elif level == "district":
            if spec.get("state_filter"):
                st = r[spec.get("state_col", 0)]
                if str(st).strip().lower() != spec["state_filter"].lower():
                    continue
            if districts.is_non_district(raw_geo):
                code, gname, glevel = f"TN-X-{raw_geo}", raw_geo, "district"
            else:
                canon = districts.resolve(raw_geo)
                if not canon:
                    if "total" in raw_geo.lower():
                        continue
                    warnings.append(f"{year}/{name}: unrecognised TN district {raw_geo!r} (skipped)")
                    continue
                code, gname, glevel = f"TN-{canon}", canon, "district"
        else:  # city
            if raw_geo.upper().startswith("TOTAL"):
                continue
            gname = re.sub(r"\s*\(.*\)$", "", raw_geo).replace(" City", "").strip()
            code, glevel = f"CITY-{gname}", "city"

        for col, cspec in spec["columns"].items():
            col = int(col)
            # A column spec is either a dimension value (str) or a dict overriding any of:
            # dim, dataset, metric, unit, year, dimension
            c = cspec if isinstance(cspec, dict) else {"dim": cspec}
            dim_value = c.get("dim", "")
            yr = int(c.get("year", year))
            val = _to_number(r[col]) if col < len(r) else None
            if val is None:
                warnings.append(f"{year}/{name}: blank/non-numeric value for {gname} col {col} ({r[col] if col < len(r) else '—'!r})")
                continue
            rows.append({
                "year": yr,
                "period_start": f"{yr}-01-01",
                "period_end": f"{yr}-12-31",
                "geo_level": glevel,
                "geo_code": code,
                "geo_name": gname,
                "dataset": c.get("dataset", spec["dataset"]),
                "metric": c.get("metric", spec["metric"]),
                "dimension": c.get("dimension", spec.get("dimension", "none")) if dim_value not in ("", "value") else "none",
                "dimension_value": "" if dim_value in ("", "value") else dim_value,
                "value": val,
                "unit": c.get("unit", spec["unit"]),
                "source_org": "NCRB",
                "tier": 1,
                "as_of_date": f"{yr}-12-31",
                "retrieved_on": spec.get("retrieved_on", ""),
                "source_table": spec["source_table"],
                "source_edition": edition["title"],
                "source_url": spec.get("source_url") or edition["url"],
                "notes": spec.get("notes", edition.get("notes", "")),
            })
    if not rows:
        raise ExtractError(f"{year}/{name}: parsed 0 rows — check header_rows / geo_col / columns")
    return rows, warnings


def extract_all() -> tuple[list[dict], list[str], list[str]]:
    """Parse every `ready` table. Returns (rows, warnings, todo_list)."""
    cfg = load_yaml("tables.yaml")
    rows: list[dict] = []
    warnings: list[str] = []
    todo: list[str] = []
    for year, tables in (cfg.get("tables") or {}).items():
        edition = cfg["editions"][year]
        for name, spec in (tables or {}).items():
            if spec.get("status") != "ready":
                todo.append(f"{year} · {name} ({spec.get('dataset')})")
                continue
            r, w = extract_table(int(year), name, spec, edition)
            rows.extend(r)
            warnings.extend(w)
    return rows, warnings, todo
