"""Shared paths, schema and name normalisation for the data pipeline."""
from __future__ import annotations

import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "pipeline" / "config"
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
SITE_DATA_SRC = ROOT / "site" / "src" / "data"        # JSON imported at build time
SITE_DATA_PUBLIC = ROOT / "site" / "public" / "data"  # CSV/JSON offered as public downloads
REPORT = ROOT / "pipeline" / "validate" / "report.md"

# Tidy long-format schema (spec §8.3). Order matters: it is the CSV column order.
SCHEMA = [
    "year", "period_start", "period_end",
    "geo_level", "geo_code", "geo_name",
    "dataset", "metric", "dimension", "dimension_value", "value", "unit",
    "source_org", "tier", "as_of_date", "retrieved_on",
    "source_table", "source_edition", "source_url", "notes",
]
KEY = ["year", "period_start", "period_end", "geo_code", "dataset", "metric", "dimension_value", "source_org"]

SOURCE_ORGS = {
    "NCRB", "TN_SCRB", "TN_POLICY_NOTE", "TN_POLICE", "MoLJ", "MADRAS_HC", "NJDG",
    "NCMEC", "KERALA_POLICE", "PRESS", "VIDHI",
}
GEO_LEVELS = {"country", "state", "district", "city"}


def load_yaml(name: str) -> dict:
    with open(CONFIG / name, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _norm(s: str) -> str:
    s = str(s).strip().lower()
    s = re.sub(r"[\*†‡#@]+", "", s)       # footnote marks
    s = re.sub(r"\([^)]*\bunion territor(y|ies)\b[^)]*\)", "", s)
    s = s.replace("&", " and ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


class StateIndex:
    """Resolve any state/UT spelling to (code, display name)."""

    def __init__(self) -> None:
        cfg = load_yaml("states.yaml")
        self.by_code = {s["code"]: s for s in cfg["states"]}
        self._lookup: dict[str, tuple[str, str]] = {}
        for s in cfg["states"]:
            for n in [s["name"], *s.get("aliases", [])]:
                self._lookup[_norm(n)] = (s["code"], s["name"])
        for code, names in cfg["aggregates"].items():
            for n in names:
                self._lookup[_norm(n)] = (code, {"IN": "India", "IN-STATES": "Total (States)", "IN-UTS": "Total (UTs)"}[code])

    def resolve(self, raw: str) -> tuple[str, str] | None:
        return self._lookup.get(_norm(raw))


class TNDistrictIndex:
    def __init__(self) -> None:
        cfg = load_yaml("districts_tn.yaml")
        self.cfg = cfg
        self._lookup: dict[str, str] = {}
        for canon, aliases in cfg["districts"].items():
            for n in [canon, *(aliases or [])]:
                self._lookup[_norm(n)] = canon
        self.non_district = {_norm(n) for n in cfg.get("non_district_units", [])}

    def resolve(self, raw: str) -> str | None:
        return self._lookup.get(_norm(raw))

    def is_non_district(self, raw: str) -> bool:
        return _norm(raw) in self.non_district

    def boundary_parent(self, canon: str) -> str:
        """Name of the polygon in the shipped boundary file that this district is drawn in."""
        if self.cfg.get("boundary_set") == "census2011":
            nd = self.cfg.get("new_districts", {}).get(canon)
            if nd:
                canon = nd["parent"]
        return self.cfg.get("boundary_file_names", {}).get(canon, canon)


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")
