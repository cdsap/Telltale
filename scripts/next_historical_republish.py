#!/usr/bin/env python3
"""Pick the next gh-pages experiment that still needs an interactive report."""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path

EXPERIMENT_ID_RE = re.compile(r"cdsap-\d+")
DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-")
SKIP_FILE = Path("static/data/experiments/republish-skip.txt")


class PickError(SystemExit):
    pass


def parse_front_matter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    values: dict[str, str] = {}
    for line in parts[1].splitlines():
        if ":" not in line:
            continue
        key, raw = line.split(":", 1)
        values[key.strip()] = raw.strip().strip('"')
    return values


def nested(text: str, parent: str, child: str) -> str:
    """Read a one-level YAML nested scalar: parent:\\n    child: value."""
    lines = text.splitlines()
    in_parent = False
    parent_indent = 0
    for line in lines:
        stripped = line.lstrip(" ")
        indent = len(line) - len(stripped)
        if stripped.startswith(f"{parent}:") and not stripped.startswith(f"{parent}: "):
            in_parent = True
            parent_indent = indent
            continue
        if in_parent:
            if stripped and indent <= parent_indent and not stripped.startswith("#"):
                in_parent = False
                continue
            if stripped.startswith(f"{child}:"):
                return stripped.split(":", 1)[1].strip().strip('"')
    return ""


def experiment_id_from_name(name: str) -> str:
    match = EXPERIMENT_ID_RE.search(name)
    return match.group(0) if match else ""


def csv_from_report_link(report_link: str) -> str:
    name = Path(report_link).name
    if name.endswith(".html"):
        return f"static/reports/{name[:-5]}.csv"
    return ""


def variant_slugs(csv_path: Path) -> tuple[str, str] | None:
    if not csv_path.is_file():
        return None
    with csv_path.open(newline="") as handle:
        header = next(csv.reader(handle), [])
    means = [col[: -len(" Mean")] for col in header if col.endswith(" Mean")]
    a = next((slug for slug in means if slug.startswith("varianta_")), "")
    b = next((slug for slug in means if slug.startswith("variantb_")), "")
    if not a or not b:
        return None
    return a, b


def label_from_slug(slug: str) -> str:
    for prefix in ("varianta_", "variantb_"):
        if slug.startswith(prefix):
            rest = slug[len(prefix) :]
            return rest.replace("_", ".") if re.match(r"^\d", rest.replace("_", ".")) else rest
    return slug


def load_skip_ids(site: Path) -> set[str]:
    path = site / SKIP_FILE
    if not path.is_file():
        return set()
    return {line.strip() for line in path.read_text().splitlines() if line.strip() and not line.startswith("#")}


def posts_newest_first(site: Path) -> list[Path]:
    posts = (site / "content" / "posts").glob("*.md")
    dated = []
    for path in posts:
        if path.name.startswith("_"):
            continue
        match = DATE_RE.match(path.name)
        dated.append((match.group(1) if match else "", path.name, path))
    dated.sort(reverse=True)
    return [path for _, _, path in dated]


def describe_post(site: Path, path: Path) -> dict | None:
    text = path.read_text()
    front = parse_front_matter(text)
    if front.get("viewer_link"):
        return None
    experiment_id = experiment_id_from_name(path.name)
    if not experiment_id:
        return None
    profiler = "profiler" in path.name or "gradle-profiler" in front.get("tags", "")
    csv_rel = csv_from_report_link(front.get("report_link", ""))
    slugs = variant_slugs(site / csv_rel) if csv_rel else None
    if slugs is None:
        return None
    prefix = f"profiler-{experiment_id}" if profiler else experiment_id
    label_a = nested(text, "variant_a", "label") or label_from_slug(slugs[0])
    label_b = nested(text, "variant_b", "label") or label_from_slug(slugs[1])
    return {
        "experiment_id": experiment_id,
        "tags": f"{prefix}_{slugs[0]},{prefix}_{slugs[1]}",
        "experiment_title": front.get("title") or experiment_id,
        "snapshot_label_a": label_a,
        "snapshot_label_b": label_b,
        "report_kind": "profiler" if profiler else "caching",
        "profile": "true" if profiler else "false",
        "post": str(path.relative_to(site)),
        "csv": csv_rel,
    }


def iter_pending(site: Path, skip_ids: set[str] | None = None):
    skip = skip_ids if skip_ids is not None else load_skip_ids(site)
    for path in posts_newest_first(site):
        item = describe_post(site, path)
        if item is None or item["experiment_id"] in skip:
            continue
        yield item


def pick_next(site: Path, skip_ids: set[str] | None = None) -> dict | None:
    return next(iter_pending(site, skip_ids), None)


def remaining_count(site: Path, skip_ids: set[str] | None = None) -> int:
    return sum(1 for _ in iter_pending(site, skip_ids))


def write_github_output(payload: dict) -> None:
    target = os.environ.get("GITHUB_OUTPUT")
    if not target:
        raise PickError("GITHUB_OUTPUT is not set")
    with Path(target).open("a", encoding="utf-8") as handle:
        for key, value in payload.items():
            handle.write(f"{key}={value}\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", required=True, help="gh-pages working tree")
    parser.add_argument("--skip-id", action="append", default=[], help="Experiment id to skip")
    parser.add_argument("--github-output", action="store_true")
    parser.add_argument("--json", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    site = Path(args.site).resolve()
    skip = load_skip_ids(site)
    skip.update(item for item in args.skip_id if item)
    remaining = remaining_count(site, skip)
    chosen = pick_next(site, skip)
    payload = {
        "experiment_id": chosen["experiment_id"] if chosen else "",
        "tags": chosen["tags"] if chosen else "",
        "experiment_title": chosen["experiment_title"] if chosen else "",
        "snapshot_label_a": chosen["snapshot_label_a"] if chosen else "",
        "snapshot_label_b": chosen["snapshot_label_b"] if chosen else "",
        "report_kind": chosen["report_kind"] if chosen else "",
        "profile": chosen["profile"] if chosen else "false",
        "remaining": str(remaining),
        "post": chosen["post"] if chosen else "",
    }
    if args.github_output:
        write_github_output(payload)
    if args.json or not args.github_output:
        print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
