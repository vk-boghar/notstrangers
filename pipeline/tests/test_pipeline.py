"""Tests for the pipeline machinery.  Run:  python -m pytest pipeline/tests -q

The NCRB fixture below is SYNTHETIC (made-up numbers, shaped like an NCRB state table). It exists
only to prove the extractor, normaliser and validators work. It is never exported to the site.
"""
from __future__ import annotations

import pandas as pd
import pytest

import pipeline.extract.ncrb as ncrb
from pipeline.common import StateIndex, TNDistrictIndex
from pipeline.run import main
from pipeline.transform.tidy import build, load_manual, normalise
from pipeline.validate.checks import run as validate

EDITION = {"title": "Crime in India TEST", "url": "https://example.org/test"}


def test_state_aliases():
    s = StateIndex()
    assert s.resolve("Tamilnadu") == ("TN", "Tamil Nadu")
    assert s.resolve("  A & N Islands* ") == ("AN", "Andaman & Nicobar")
    assert s.resolve("Delhi UT")[0] == "DL"
    assert s.resolve("Total (All India)")[0] == "IN"
    assert s.resolve("Atlantis") is None


def test_tn_district_mapping():
    d = TNDistrictIndex()
    assert d.resolve("Tuticorin") == "Thoothukkudi"
    assert d.resolve("Kanyakumari") == "Kanniyakumari"
    assert d.boundary_parent("Kallakurichi") == "Viluppuram"
    assert d.boundary_parent("Mayiladuthurai") == "Nagappattinam"
    assert d.boundary_parent("Virudhunagar") == "Virudunagar"


def test_indian_number_parsing():
    assert ncrb._to_number("1,87,702") == 187702
    assert ncrb._to_number("42.3*") == 42.3
    assert ncrb._to_number("-") is None


def test_extract_synthetic_xlsx(tmp_path, monkeypatch):
    raw = tmp_path / "ncrb" / "2099"
    raw.mkdir(parents=True)
    grid = [
        ["Table X", None, None, None, None, None],
        ["Sl", "State/UT", "Family", "Family friends etc", "Friends/online", "Unknown"],
        [1, "Tamil Nadu", "10", "20", "30", "4"],
        [2, "Kerala", "1", "2", "3", "0"],
        [3, "Total (All India)", "11", "22", "33", "4"],
    ]
    pd.DataFrame(grid).to_excel(raw / "t.xlsx", header=False, index=False)
    monkeypatch.setattr(ncrb, "RAW", tmp_path)
    spec = {
        "file": "t.xlsx", "format": "xlsx", "sheet": 0, "header_rows": 2, "geo_col": 1, "geo_level": "state",
        "dataset": "pocso_relationship", "metric": "cases", "unit": "cases", "dimension": "relationship",
        "columns": {2: "family_members", 3: "family_friends_neighbours_known", 4: "friends_online_partners", 5: "unknown"},
        "source_table": "Table X",
    }
    rows, warnings = ncrb.extract_table(2099, "t", spec, EDITION)
    assert len(rows) == 12
    tn = {r["dimension_value"]: r["value"] for r in rows if r["geo_code"] == "TN"}
    assert tn == {"family_members": 10, "family_friends_neighbours_known": 20, "friends_online_partners": 30, "unknown": 4}
    assert all(r["source_table"] == "Table X" and r["tier"] == 1 for r in rows)
    assert {r["geo_level"] for r in rows} == {"state", "country"}


def test_extract_requires_source_table(tmp_path, monkeypatch):
    (tmp_path / "ncrb" / "2099").mkdir(parents=True)
    pd.DataFrame([["a"]]).to_excel(tmp_path / "ncrb" / "2099" / "t.xlsx", header=False, index=False)
    monkeypatch.setattr(ncrb, "RAW", tmp_path)
    with pytest.raises(ncrb.ExtractError):
        ncrb.extract_table(2099, "t", {"file": "t.xlsx", "format": "xlsx", "columns": {1: "value"}, "source_table": ""}, EDITION)


def test_real_manual_data_passes_validation():
    tidy, _ = build([])
    res = validate(tidy, parsed_count=0)
    assert res.errors == []
    assert sum("anchor ✓" in p for p in res.passed) == 13


def test_anchor_mismatch_fails():
    tidy, _ = build([])
    m = (tidy.dataset == "pocso_total") & (tidy.metric == "cases") & (tidy.geo_code == "IN")
    tidy.loc[m, "value"] = 69190
    assert any("anchor mismatch" in e for e in validate(tidy, 0).errors)


def test_sum_rule_fails():
    tidy, _ = build([])
    m = (tidy.dataset == "pocso_relationship") & (tidy.dimension_value == "unknown")
    tidy.loc[m, "value"] = 1
    errs = validate(tidy, 0).errors
    assert any("sum mismatch" in e for e in errs)


def test_missing_source_fails():
    tidy, _ = build([])
    tidy.loc[0, "source_url"] = ""
    assert any("source_url" in e for e in validate(tidy, 0).errors)


def test_parsed_supersedes_hand_entered():
    manual = normalise(load_manual())
    row = manual[(manual.dataset == "pocso_relationship") & (manual.dimension_value == "total")].iloc[0].to_dict()
    row.update({"notes": "parsed", "source_table": "Table 4A.1", "_file": None})
    row.pop("_file")
    tidy, log = build([row])
    hit = tidy[(tidy.dataset == "pocso_relationship") & (tidy.dimension_value == "total") & (tidy.geo_code == "IN") & (tidy.year == 2024)]
    assert len(hit) == 1 and hit.iloc[0]["source_table"] == "Table 4A.1"
    assert any("superseded" in l for l in log)


def test_strict_mode_passes_once_ncrb_tables_are_parsed():
    # Every anchor now comes from a parsed NCRB table, so --strict must pass.
    assert main(["--strict"]) == 0


def test_parsed_tamil_nadu_relationship_2024():
    tidy, _ = build(ncrb.extract_all()[0])
    tn = tidy[(tidy.dataset == "pocso_relationship") & (tidy.geo_code == "TN") & (tidy.year == 2024)]
    v = dict(zip(tn.dimension_value, tn.value))
    assert v["total"] == 5320 and v["known_total"] == 5297 and v["unknown"] == 23
