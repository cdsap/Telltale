#!/usr/bin/env python3
"""Publish workbench/Hugo chrome onto gh-pages without rewriting experiment JSON."""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

from stage_published_report import StageError, copy_viewer_assets, rewrite_viewer_html

DATA_URL_RE = re.compile(r'data-(?P<kind>report|html|csv)-url="(?P<url>[^"]*)"')


def copy_tree(source: Path, destination_root: Path) -> int:
    if not source.is_dir():
        raise StageError(f"Missing source tree: {source}")
    copied = 0
    for path in source.rglob("*"):
        if not path.is_file():
            continue
        destination = destination_root / path.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)
        copied += 1
    return copied


def mount_urls(html: str) -> dict[str, str]:
    found = {match.group("kind"): match.group("url") for match in DATA_URL_RE.finditer(html)}
    return {
        "json_url": found.get("report", ""),
        "html_url": found.get("html", ""),
        "csv_url": found.get("csv", ""),
    }


def refresh_experiment_shells(site: Path, viewer_dist: Path, site_base: str) -> list[str]:
    template = (viewer_dist / "index.html").read_text()
    experiments = site / "static" / "experiments"
    if not experiments.is_dir():
        return []
    updated: list[str] = []
    for index in sorted(experiments.glob("*/index.html")):
        existing = index.read_text()
        urls = mount_urls(existing)
        if not urls["json_url"]:
            continue
        report_id = index.parent.name
        index.write_text(
            rewrite_viewer_html(
                template,
                report_id=report_id,
                site_base=site_base,
                json_url=urls["json_url"],
                html_url=urls["html_url"] or None,
                csv_url=urls["csv_url"] or None,
            )
        )
        updated.append(report_id)
    return updated


def stage(args: argparse.Namespace) -> dict:
    site = Path(args.site).resolve()
    site_base = args.site_base.rstrip("/")
    result: dict = {
        "viewer_assets": [],
        "experiment_shells": [],
        "hugo_layout_files": 0,
        "hugo_asset_files": 0,
    }
    if args.viewer_dist:
        viewer_dist = Path(args.viewer_dist).resolve()
        result["viewer_assets"] = copy_viewer_assets(
            viewer_dist,
            site / "static" / "assets" / "report-viewer",
        )
        result["experiment_shells"] = refresh_experiment_shells(site, viewer_dist, site_base)
    if args.layouts_src:
        result["hugo_layout_files"] = copy_tree(Path(args.layouts_src).resolve(), site / "layouts")
    if args.assets_src:
        result["hugo_asset_files"] = copy_tree(Path(args.assets_src).resolve(), site / "assets")
    if (
        not result["viewer_assets"]
        and not result["experiment_shells"]
        and result["hugo_layout_files"] == 0
        and result["hugo_asset_files"] == 0
    ):
        raise StageError("Nothing to publish: enable viewer and/or Hugo chrome")
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", required=True)
    parser.add_argument("--site-base", default="/Telltale")
    parser.add_argument("--viewer-dist")
    parser.add_argument("--layouts-src")
    parser.add_argument("--assets-src")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    print(json.dumps(stage(args), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
