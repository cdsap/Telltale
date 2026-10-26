#!/usr/bin/env python3
"""
Emit Hugo front matter for `experiment_snapshot` from an experiment_results_*.csv
produced by BuildExperimentResults / CompareGEBuilds (two-variant compare).

Usage:
  python3 scripts/experiment_snapshot_from_csv.py path/to/experiment_results_*.csv
  python3 scripts/experiment_snapshot_from_csv.py report.csv --label-a "Gradle 9.4.1" --label-b "Gradle 9.5.0"

Pipe or redirect into a post, or merge the fragment under the YAML `---` block.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path


def _mean_headers(fieldnames: list[str]) -> list[str]:
    return [h for h in fieldnames if h.endswith(" Mean")]


def _slug_from_mean_header(h: str) -> str:
    assert h.endswith(" Mean")
    return h[: -len(" Mean")]


def _default_label(slug: str) -> str:
    """Readable label from scan tag slug (strip varianta_/variantb_ prefix)."""
    for prefix in ("varianta_", "variantb_"):
        if slug.startswith(prefix):
            rest = slug[len(prefix) :]
            if rest == "main":
                return "Gradle (main)"
            if re.match(r"^\d", rest) or re.search(r"[.\-]", rest):
                return f"Gradle {rest}"
            return rest.replace("_", " ")
    return slug


def _row(rows: list[dict], category: str, metric: str) -> dict | None:
    for r in rows:
        if r.get("Category") == category and r.get("Metric") == metric:
            return r
    return None


def _get_float(row: dict, col: str) -> float | None:
    if col not in row or row[col] is None or row[col] == "":
        return None
    try:
        return float(row[col].strip())
    except ValueError:
        return None


def _series_from_row(
    row: dict, slug_a: str, slug_b: str, strip_ms: bool
) -> tuple[dict[str, float], dict[str, float]] | None:
    def triple(prefix: str) -> dict[str, float] | None:
        m = _get_float(row, f"{prefix} Mean")
        p5 = _get_float(row, f"{prefix} P50")
        p9 = _get_float(row, f"{prefix} P90")
        if m is None or p5 is None or p9 is None:
            return None
        if strip_ms:
            m, p5, p9 = m / 1000.0, p5 / 1000.0, p9 / 1000.0
        return {"mean": m, "p50": p5, "p90": p9}

    ta = triple(slug_a)
    tb = triple(slug_b)
    if not ta or not tb:
        return None
    return ta, tb


def percent_change(baseline: float, candidate: float) -> float | None:
    if baseline == 0:
        return None
    return (candidate - baseline) / baseline * 100.0


def format_signed_percent(value: float) -> str:
    return f"{value:+.2f}%"


def metric_summary(
    build_a: dict[str, float],
    build_b: dict[str, float],
    cfg_a: dict[str, float] | None = None,
    cfg_b: dict[str, float] | None = None,
) -> str:
    parts: list[str] = []
    series = [
        ("Build mean", build_a["mean"], build_b["mean"]),
        ("Build median", build_a["p50"], build_b["p50"]),
        ("Build P90", build_a["p90"], build_b["p90"]),
    ]
    if cfg_a and cfg_b:
        series += [
            ("Configuration mean", cfg_a["mean"], cfg_b["mean"]),
            ("Configuration median", cfg_a["p50"], cfg_b["p50"]),
            ("Configuration P90", cfg_a["p90"], cfg_b["p90"]),
        ]
    for label, left, right in series:
        pct = percent_change(left, right)
        if pct is not None:
            parts.append(f"{label} {format_signed_percent(pct)}")
    return "; ".join(parts) + "." if parts else ""


def metric_insights(
    build_a: dict[str, float],
    build_b: dict[str, float],
    cfg_a: dict[str, float] | None = None,
    cfg_b: dict[str, float] | None = None,
    material_percent: float = 5.0,
) -> list[str]:
    lines: list[str] = []

    def disagree(kind: str, left: dict[str, float], right: dict[str, float]) -> None:
        mean = percent_change(left["mean"], right["mean"])
        p90 = percent_change(left["p90"], right["p90"])
        if (
            mean is not None
            and p90 is not None
            and mean != 0
            and p90 != 0
            and (mean > 0) != (p90 > 0)
        ):
            lines.append(f"{kind} mean and P90 moved in opposite directions.")

    def material(kind: str, stat: str, left: float, right: float) -> None:
        pct = percent_change(left, right)
        if pct is not None and abs(pct) >= material_percent:
            lines.append(f"{kind} {stat} changed {format_signed_percent(pct)}.")

    disagree("Build", build_a, build_b)
    material("Build", "mean", build_a["mean"], build_b["mean"])
    material("Build", "median", build_a["p50"], build_b["p50"])
    material("Build", "P90", build_a["p90"], build_b["p90"])
    if cfg_a and cfg_b:
        disagree("Configuration", cfg_a, cfg_b)
        material("Configuration", "mean", cfg_a["mean"], cfg_b["mean"])
        material("Configuration", "median", cfg_a["p50"], cfg_b["p50"])
        material("Configuration", "P90", cfg_a["p90"], cfg_b["p90"])
    return lines[:3]


def summary_from_snapshot_yaml(text: str) -> str | None:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("summary:"):
            raw = stripped.split(":", 1)[1].strip()
            if not raw:
                return None
            try:
                value = json.loads(raw)
            except json.JSONDecodeError:
                return raw.strip('"')
            return value if isinstance(value, str) else None
    return None


def _emit_yaml(
    label_a: str,
    label_b: str,
    build_a: dict[str, float],
    build_b: dict[str, float],
    cfg_a: dict[str, float] | None,
    cfg_b: dict[str, float] | None,
) -> str:
    def fmt_f(x: float, nd: int) -> str:
        return f"{x:.{nd}f}"

    lines = [
        "experiment_snapshot:",
        '  metric: "Overall build time"',
        '  unit: "seconds"',
        "  variant_a:",
        f"    label: {json.dumps(label_a)}",
        f"    mean: {fmt_f(build_a['mean'], 3)}",
        f"    p50: {fmt_f(build_a['p50'], 3)}",
        f"    p90: {fmt_f(build_a['p90'], 3)}",
        "  variant_b:",
        f"    label: {json.dumps(label_b)}",
        f"    mean: {fmt_f(build_b['mean'], 3)}",
        f"    p50: {fmt_f(build_b['p50'], 3)}",
        f"    p90: {fmt_f(build_b['p90'], 3)}",
    ]
    if cfg_a and cfg_b:
        lines += [
            '  config_metric: "Configuration time"',
            '  config_unit: "seconds"',
            "  config_variant_a:",
            f"    mean: {fmt_f(cfg_a['mean'], 3)}",
            f"    p50: {fmt_f(cfg_a['p50'], 3)}",
            f"    p90: {fmt_f(cfg_a['p90'], 3)}",
            "  config_variant_b:",
            f"    mean: {fmt_f(cfg_b['mean'], 3)}",
            f"    p50: {fmt_f(cfg_b['p50'], 3)}",
            f"    p90: {fmt_f(cfg_b['p90'], 3)}",
        ]
    summary = metric_summary(build_a, build_b, cfg_a, cfg_b)
    if summary:
        lines.append(f"  summary: {json.dumps(summary)}")
    insights = metric_insights(build_a, build_b, cfg_a, cfg_b)
    if insights:
        lines.append("  insights:")
        for item in insights:
            lines.append(f"    - {json.dumps(item)}")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("csv_path", type=Path, help="experiment_results_*.csv from the report tool")
    ap.add_argument("--label-a", default="", help="Left column label (default: derived from CSV headers)")
    ap.add_argument("--label-b", default="", help="Right column label (default: derived from CSV headers)")
    ap.add_argument(
        "--no-config",
        action="store_true",
        help="Omit configuration time block even if present in CSV",
    )
    args = ap.parse_args()

    path = args.csv_path
    if not path.is_file():
        print(f"error: not a file: {path}", file=sys.stderr)
        return 1

    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if not fieldnames:
            print("error: empty CSV", file=sys.stderr)
            return 1
        means = _mean_headers(list(fieldnames))
        if len(means) != 2:
            print(
                f"error: expected exactly 2 columns ending with ' Mean', got {means!r}",
                file=sys.stderr,
            )
            return 1
        slug_a = _slug_from_mean_header(means[0])
        slug_b = _slug_from_mean_header(means[1])
        rows = list(reader)

    build_row = _row(rows, "Build", "Build time")
    if not build_row:
        print("error: missing Build / Build time row", file=sys.stderr)
        return 1

    unit = (build_row.get("Unit") or "ms").strip().lower()
    strip_ms = unit in ("ms", "milliseconds")

    build_triple = _series_from_row(build_row, slug_a, slug_b, strip_ms=strip_ms)
    if not build_triple:
        print("error: could not read build time percentiles for both variants", file=sys.stderr)
        return 1
    build_a, build_b = build_triple

    cfg_a = cfg_b = None
    if not args.no_config:
        cfg_row = _row(rows, "Build", "Configuration time")
        if cfg_row:
            u2 = (cfg_row.get("Unit") or "ms").strip().lower()
            strip2 = u2 in ("ms", "milliseconds")
            cfg_triple = _series_from_row(cfg_row, slug_a, slug_b, strip_ms=strip2)
            if cfg_triple:
                cfg_a, cfg_b = cfg_triple

    label_a = args.label_a.strip() or _default_label(slug_a)
    label_b = args.label_b.strip() or _default_label(slug_b)

    out = _emit_yaml(label_a, label_b, build_a, build_b, cfg_a, cfg_b)
    sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
