#!/usr/bin/env python3
"""Stage one experiment onto the gh-pages working tree without deleting others."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

from experiment_snapshot_from_csv import summary_from_snapshot_yaml

REPORT_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
ASSET_PREFIX_RE = re.compile(r"""(?P<attr>src|href)=(?P<quote>['"])(?P<path>\./assets/[^'"]+)(?P=quote)""")


class StageError(SystemExit):
    pass


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def first_file(directory: Path, pattern: str, exclude: str | None = None) -> Path | None:
    matches = sorted(directory.glob(pattern))
    for path in matches:
        if exclude and exclude in path.name:
            continue
        if path.is_file():
            return path
    return None


def find_existing_post(posts_dir: Path, experiment_id: str) -> Path | None:
    if not posts_dir.is_dir() or not experiment_id:
        return None
    needle = f"-{experiment_id}-"
    matches = sorted(path for path in posts_dir.glob("*.md") if needle in path.name)
    if not matches:
        return None
    if len(matches) > 1:
        without_viewer = [path for path in matches if "viewer_link:" not in path.read_text()]
        matches = without_viewer or matches
    if len(matches) > 1:
        raise StageError(
            f"Multiple posts match experiment-id {experiment_id!r}: "
            + ", ".join(path.name for path in matches)
        )
    return matches[0]


def attach_viewer_to_post(path: Path, *, viewer_link: str, json_link: str) -> None:
    text = path.read_text()
    if not text.startswith("---"):
        raise StageError(f"{path.name} is missing YAML front matter")
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise StageError(f"{path.name} is missing a closing front matter fence")
    lines = parts[1].splitlines()

    def upsert(key: str, value: str) -> None:
        prefix = f"{key}:"
        replacement = f"{key}: {value}"
        for index, line in enumerate(lines):
            if line.startswith(prefix):
                lines[index] = replacement
                return
        insert_at = next((i + 1 for i, line in enumerate(lines) if line.startswith("report_link:")), len(lines))
        lines.insert(insert_at, replacement)

    upsert("viewer_link", viewer_link)
    upsert("json_link", json_link)
    upsert("report_data", json_link)
    body = parts[2]
    marker = f"[Interactive report]({viewer_link})"
    if marker not in body:
        body = "\n" + marker + "\n" + body.lstrip("\n")
    path.write_text("---" + "\n".join(lines) + "\n---" + body)


def load_experiment_result(json_path: Path) -> dict:
    try:
        payload = json.loads(json_path.read_text())
    except json.JSONDecodeError as exc:
        raise StageError(f"experiment-result.json is not valid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise StageError("experiment-result.json is missing report identity")
    return payload


def identity_from_payload(payload: dict) -> tuple[str, str]:
    report = payload.get("report")
    if not isinstance(report, dict):
        raise StageError("experiment-result.json is missing report identity")
    report_id = str(report.get("id") or "")
    schema = str(payload.get("schemaVersion") or "")
    if not REPORT_ID_RE.match(report_id):
        raise StageError(f"Unsafe or missing report.id: {report_id!r}")
    if not schema.startswith("1."):
        raise StageError(f"Unsupported schemaVersion for publication: {schema!r}")
    return report_id, schema


def load_report_id(json_path: Path) -> tuple[str, str]:
    return identity_from_payload(load_experiment_result(json_path))


def write_compact_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n")


def rewrite_viewer_html(
    template: str,
    *,
    report_id: str,
    site_base: str,
    json_url: str,
    html_url: str | None,
    csv_url: str | None,
) -> str:
    html = template
    html = html.replace(
        'data-report-url="./data/sample.json"',
        f'data-report-url="{json_url}"',
    )
    html = html.replace(
        "data-report-url='./data/sample.json'",
        f"data-report-url='{json_url}'",
    )
    if "data-report-url=" not in html:
        raise StageError("Viewer index.html is missing data-report-url")
    mount = f'id="telltale-report" data-report-url="{json_url}"'
    if html_url:
        mount += f' data-html-url="{html_url}"'
    if csv_url:
        mount += f' data-csv-url="{csv_url}"'
    html = re.sub(r'id="telltale-report"[^>]*>', mount + ">", html, count=1)
    asset_root = f"{site_base}/assets/report-viewer/"
    html = ASSET_PREFIX_RE.sub(
        lambda match: f"{match.group('attr')}={match.group('quote')}{asset_root}{Path(match.group('path')).name}{match.group('quote')}",
        html,
    )
    html = html.replace("<title>Telltale experiment report</title>", f"<title>{report_id}</title>")
    return html


def copy_viewer_assets(viewer_dist: Path, destination: Path) -> list[str]:
    assets = viewer_dist / "assets"
    if not assets.is_dir():
        raise StageError(f"Viewer dist is missing assets/: {assets}")
    destination.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    for path in assets.iterdir():
        if path.is_file():
            shutil.copy2(path, destination / path.name)
            copied.append(path.name)
    if not copied:
        raise StageError("Viewer dist assets/ is empty")
    return copied


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def write_post(
    path: Path,
    *,
    title: str,
    date: str,
    report_id: str,
    schema: str,
    report_kind: str,
    viewer_link: str | None,
    json_link: str | None,
    html_filename: str,
    site_base: str,
    summary: str,
    tags: str,
    snapshot: str | None,
    body: str,
) -> None:
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "---",
        "layout: post",
        f"title: {yaml_quote(title)}",
        f"date: {date}",
        f"report_id: {yaml_quote(report_id)}",
        f"report_kind: {yaml_quote(report_kind)}",
        f"report_schema_version: {yaml_quote(schema)}",
        f"report_link: {site_base}/reports/{html_filename}",
    ]
    if viewer_link:
        lines.append(f"viewer_link: {viewer_link}")
    if json_link:
        lines.append(f"json_link: {json_link}")
        lines.append(f"report_data: {json_link}")
    lines.append(f"summary: {summary}")
    lines.append(f"tags: [\"{tags}\"]")
    if snapshot:
        lines.append(snapshot.rstrip("\n"))
    lines.append("---")
    if viewer_link:
        lines.append(f"[Interactive report]({viewer_link})")
    lines.append(f"[Report 📊](../../reports/{html_filename})")
    if body:
        lines.append(body.rstrip("\n"))
    path.write_text("\n".join(lines) + "\n")


def stage(args: argparse.Namespace) -> dict:
    results = Path(args.results).resolve()
    site = Path(args.site).resolve()
    viewer_dist = Path(args.viewer_dist).resolve() if args.viewer_dist else None
    layouts_src = Path(args.layouts_src).resolve() if args.layouts_src else None
    site_base = args.site_base.rstrip("/")

    json_path = results / "experiment-result.json"
    html_path = first_file(results, "*.html")
    csv_path = first_file(results, "experiment_results_*.csv", exclude="filtered")
    if html_path is None:
        raise StageError("No legacy HTML report found in results")
    if csv_path is None:
        csv_path = first_file(results, "*.csv", exclude="filtered")

    reports_dir = site / "static" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    for source in results.glob("experiment_results*"):
        if source.is_file():
            shutil.copy2(source, reports_dir / source.name)
    payload = load_experiment_result(json_path) if json_path.is_file() else None
    if payload is not None:
        write_compact_json(
            reports_dir / f"experiment-result-{args.experiment_id}-{args.report_kind}.json",
            payload,
        )
    diagnostics = results / "diagnostics-package.json"
    if diagnostics.is_file():
        shutil.copy2(
            diagnostics,
            reports_dir / f"diagnostics-package-{args.experiment_id}-{args.report_kind}.json",
        )

    report_id = None
    schema = "1.0.0"
    viewer_link = None
    json_link = None
    copied_assets: list[str] = []
    if payload is not None and viewer_dist is not None:
        report_id, schema = identity_from_payload(payload)
        data_dir = site / "static" / "data" / "experiments"
        data_dir.mkdir(parents=True, exist_ok=True)
        published_json = data_dir / f"{report_id}.json"
        if published_json.exists():
            existing = json.loads(published_json.read_text())
            existing_id = str((existing.get("report") or {}).get("id") or "")
            if existing_id and existing_id != report_id:
                raise StageError(
                    f"Refusing to overwrite {published_json.name}: existing report.id={existing_id}"
                )
        write_compact_json(published_json, payload)
        json_link = f"{site_base}/data/experiments/{report_id}.json"
        html_url = f"{site_base}/reports/{html_path.name}"
        csv_url = f"{site_base}/reports/{csv_path.name}" if csv_path else None
        template = (viewer_dist / "index.html").read_text()
        page = rewrite_viewer_html(
            template,
            report_id=report_id,
            site_base=site_base,
            json_url=json_link,
            html_url=html_url,
            csv_url=csv_url,
        )
        experiment_dir = site / "static" / "experiments" / report_id
        experiment_dir.mkdir(parents=True, exist_ok=True)
        (experiment_dir / "index.html").write_text(page)
        copied_assets = copy_viewer_assets(viewer_dist, site / "static" / "assets" / "report-viewer")
        viewer_link = f"{site_base}/experiments/{report_id}/"
        manifest = {
            "report_id": report_id,
            "schema_version": schema,
            "files": {
                "json": f"data/experiments/{report_id}.json",
                "viewer": f"experiments/{report_id}/index.html",
                "legacy_html": f"reports/{html_path.name}",
                "legacy_csv": f"reports/{csv_path.name}" if csv_path else None,
            },
            "checksums": {
                "json": sha256_file(published_json),
                "legacy_html": sha256_file(reports_dir / html_path.name),
            },
        }
        (data_dir / f"{report_id}.manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    if layouts_src and layouts_src.is_dir():
        for source in layouts_src.rglob("*"):
            if source.is_file():
                destination = site / "layouts" / source.relative_to(layouts_src)
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)

    if getattr(args, "assets_src", None):
        assets_src = Path(args.assets_src).resolve()
        if assets_src.is_dir():
            for source in assets_src.rglob("*"):
                if source.is_file():
                    destination = site / "assets" / source.relative_to(assets_src)
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(source, destination)

    tags = "gradle-profiler" if args.profile else args.mode or "experiment"
    snapshot = None
    snap_file = results / "experiment_snapshot.yaml"
    if snap_file.is_file():
        snapshot = snap_file.read_text()
    title = args.title
    summary = args.summary
    if snapshot:
        parsed_summary = summary_from_snapshot_yaml(snapshot)
        if parsed_summary:
            summary = json.dumps(parsed_summary)
    analysis = ""
    posts_dir = site / "content" / "posts"
    existing_post = find_existing_post(posts_dir, args.experiment_id)
    if existing_post is not None and viewer_link:
        attach_viewer_to_post(existing_post, viewer_link=viewer_link, json_link=json_link or "")
        post_name = existing_post.name
    else:
        post_name = f"{args.date}-{args.experiment_id}-{args.report_kind}-experiment.md"
        write_post(
            posts_dir / post_name,
            title=title,
            date=args.date,
            report_id=report_id or f"{args.experiment_id}-{args.report_kind}",
            schema=schema,
            report_kind=args.report_kind,
            viewer_link=viewer_link,
            json_link=json_link,
            html_filename=html_path.name,
            site_base=site_base,
            summary=summary,
            tags=tags,
            snapshot=snapshot,
            body=analysis,
        )
    result = {
        "report_id": report_id,
        "viewer_url": viewer_link,
        "data_url": json_link,
        "legacy_html": f"{site_base}/reports/{html_path.name}",
        "legacy_csv": f"{site_base}/reports/{csv_path.name}" if csv_path else None,
        "post": f"content/posts/{post_name}",
        "assets": copied_assets,
    }
    if json_path.is_file() and viewer_dist is None:
        raise StageError("experiment-result.json is present but --viewer-dist was not provided")
    if viewer_link and "data-report-url" not in (site / "static" / "experiments" / report_id / "index.html").read_text():
        raise StageError("Staged viewer page is missing data-report-url")
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--results", required=True)
    parser.add_argument("--site", required=True)
    parser.add_argument("--viewer-dist")
    parser.add_argument("--layouts-src")
    parser.add_argument("--assets-src")
    parser.add_argument("--site-base", default="/Telltale")
    parser.add_argument("--experiment-id", required=True)
    parser.add_argument("--report-kind", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--mode", default="")
    parser.add_argument("--profile", action="store_true")
    return parser


def main() -> None:
    result = stage(build_parser().parse_args())
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
