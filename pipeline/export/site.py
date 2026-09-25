"""Write processed CSVs (public downloads) and the JSON the site imports at build time."""
from __future__ import annotations

import json
from datetime import date

import pandas as pd

from pipeline.common import PROCESSED, SCHEMA, SITE_DATA_PUBLIC, SITE_DATA_SRC


def export(df: pd.DataFrame, meta: dict) -> list[str]:
    written: list[str] = []
    for d in (PROCESSED, SITE_DATA_PUBLIC, SITE_DATA_SRC):
        d.mkdir(parents=True, exist_ok=True)

    out = df[SCHEMA].copy()
    out["value"] = out["value"].map(lambda v: int(v) if float(v).is_integer() else v)

    for target in (PROCESSED, SITE_DATA_PUBLIC):
        # clear old per-dataset files so removed datasets don't linger
        for old in target.glob("*.csv"):
            old.unlink()
        p = target / "all_data.csv"
        out.to_csv(p, index=False)
        written.append(str(p))
        for ds, g in out.groupby("dataset"):
            p = target / f"{ds}.csv"
            g.to_csv(p, index=False)
            written.append(str(p))

    rows = json.loads(out.to_json(orient="records", force_ascii=False))
    (SITE_DATA_SRC / "tidy.json").write_text(json.dumps(rows, ensure_ascii=False, indent=0), encoding="utf-8")
    meta = {**meta, "generated_on": max(out["retrieved_on"].astype(str)), "row_count": len(rows),
            "datasets": sorted(out["dataset"].unique().tolist())}
    (SITE_DATA_SRC / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    written += [str(SITE_DATA_SRC / "tidy.json"), str(SITE_DATA_SRC / "meta.json")]
    return written
