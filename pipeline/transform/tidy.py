"""Combine hand-entered sources and parsed NCRB tables into one tidy long table."""
from __future__ import annotations

import pandas as pd

from pipeline.common import KEY, RAW, SCHEMA

MANUAL_DIR = RAW / "manual"


def load_manual() -> pd.DataFrame:
    """Every data/raw/manual/*.csv except files starting with '_' (held / unconfirmed rows)."""
    frames = []
    for f in sorted(MANUAL_DIR.glob("*.csv")):
        if f.name.startswith("_"):
            continue
        df = pd.read_csv(f, dtype=str, keep_default_na=False)
        missing = set(SCHEMA) - set(df.columns)
        if missing:
            raise ValueError(f"{f.name}: missing schema columns {sorted(missing)}")
        df["_file"] = f"data/raw/manual/{f.name}"
        frames.append(df[SCHEMA + ["_file"]])
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=SCHEMA + ["_file"])


def load_held() -> pd.DataFrame:
    frames = [pd.read_csv(f, dtype=str, keep_default_na=False) for f in sorted(MANUAL_DIR.glob("_*.csv"))]
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=SCHEMA)


def normalise(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["year"] = df["year"].astype(int)
    df["tier"] = df["tier"].astype(int)
    df["value"] = pd.to_numeric(df["value"], errors="raise")
    for c in SCHEMA:
        if c not in ("year", "tier", "value"):
            df[c] = df[c].fillna("").astype(str).str.strip()
    df.loc[df["dimension"] == "", "dimension"] = "none"
    return df


def build(parsed_rows: list[dict]) -> tuple[pd.DataFrame, list[str]]:
    """Parsed NCRB rows supersede hand-entered NCRB rows with the same key. Returns (tidy, log)."""
    log: list[str] = []
    manual = normalise(load_manual())
    if parsed_rows:
        parsed = pd.DataFrame(parsed_rows)
        parsed["_file"] = "data/raw/ncrb (parsed)"
        parsed = normalise(parsed[SCHEMA + ["_file"]])
        pk = set(map(tuple, parsed[KEY].astype(str).values.tolist()))
        is_dupe = manual[KEY].astype(str).apply(tuple, axis=1).isin(pk)
        for _, r in manual[is_dupe].iterrows():
            match = parsed[(parsed[KEY].astype(str) == pd.Series(r[KEY]).astype(str).values).all(axis=1)]
            pv = match["value"].iloc[0]
            flag = "" if float(pv) == float(r["value"]) else f"  ⚠ hand-entered {r['value']} ≠ parsed {pv}"
            log.append(f"superseded by parse: {r['dataset']} {r['geo_code']} {r['year']} {r['dimension_value']}{flag}")
        manual = manual[~is_dupe]
        tidy = pd.concat([parsed, manual], ignore_index=True)
    else:
        tidy = manual
    tidy = tidy.sort_values(["dataset", "geo_level", "geo_code", "year", "metric", "dimension_value"]).reset_index(drop=True)
    return tidy, log
