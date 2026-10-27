#!/usr/bin/env python3
from __future__ import annotations

import gzip
import json
import tempfile
import unittest
from pathlib import Path

from stage_published_report import StageError, stage, load_report_id, rewrite_viewer_html


def read_gz_json(path: Path) -> str:
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        return handle.read()


def _args(**overrides):
    class Args:
        pass

    args = Args()
    args.results = overrides["results"]
    args.site = overrides["site"]
    args.viewer_dist = overrides.get("viewer_dist")
    args.layouts_src = overrides.get("layouts_src")
    args.site_base = "/Telltale"
    args.experiment_id = "cdsap-430"
    args.report_kind = "caching"
    args.date = "2026-10-21"
    args.title = "Gradle 9.8.2"
    args.summary = '"variants: baseline, gradle-9.8.2"'
    args.mode = "dependencies cache"
    args.profile = False
    return args


class StagePublishedReportTest(unittest.TestCase):
    def test_rejects_unsafe_report_id(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "experiment-result.json"
            path.write_text(json.dumps({"schemaVersion": "1.0.0", "report": {"id": "../evil"}}))
            with self.assertRaises(StageError):
                load_report_id(path)

    def test_rewrite_injects_json_and_legacy_urls(self) -> None:
        html = rewrite_viewer_html(
            '<div id="telltale-report" data-report-url="./data/sample.json"></div>\n<script src="./assets/report-viewer.js"></script>',
            report_id="run-1-caching-attempt-1",
            site_base="/Telltale",
            json_url="/Telltale/data/experiments/run-1-caching-attempt-1.json.gz",
            html_url="/Telltale/reports/legacy.html",
            csv_url="/Telltale/reports/legacy.csv",
        )
        self.assertIn('data-report-url="/Telltale/data/experiments/run-1-caching-attempt-1.json.gz"', html)
        self.assertIn('data-html-url="/Telltale/reports/legacy.html"', html)
        self.assertIn('src="/Telltale/assets/report-viewer/report-viewer.js"', html)
        self.assertNotIn("../", html)

    def test_stages_viewer_without_removing_existing_reports(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            results = root / "results"
            site = root / "site"
            dist = root / "dist"
            results.mkdir()
            (results / "experiment_results_old.html").write_text("<html>legacy</html>")
            (results / "experiment_results_old.csv").write_text("Category,Metric\n")
            (results / "experiment-result.json").write_text(
                json.dumps(
                    {
                        "schemaVersion": "1.0.0",
                        "report": {"id": "run-1-caching-attempt-1"},
                    },
                    indent=2,
                )
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div><script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("console.log(1)")
            (dist / "assets" / "report-viewer.css").write_text("body{}")
            leftover = site / "static" / "data" / "experiments" / "run-1-caching-attempt-1.json"
            leftover.parent.mkdir(parents=True)
            leftover.write_text(
                json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-1-caching-attempt-1"}})
            )
            existing = site / "static" / "reports" / "experiment_results_keep.html"
            existing.parent.mkdir(parents=True)
            existing.write_text("keep-me")
            staged = stage(_args(results=str(results), site=str(site), viewer_dist=str(dist)))
            self.assertEqual(staged["report_id"], "run-1-caching-attempt-1")
            self.assertTrue((site / "static" / "reports" / "experiment_results_keep.html").exists())
            published = site / "static" / "data" / "experiments" / "run-1-caching-attempt-1.json.gz"
            self.assertTrue(published.exists())
            self.assertEqual(published.read_bytes()[:2], b"\x1f\x8b")
            compact = read_gz_json(published)
            self.assertNotIn("\n  ", compact)
            self.assertEqual(
                compact,
                json.dumps(json.loads(compact), separators=(",", ":"), ensure_ascii=False) + "\n",
            )
            archive = site / "static" / "reports" / "experiment-result-cdsap-430-caching.json.gz"
            self.assertEqual(read_gz_json(archive), compact)
            self.assertFalse((site / "static" / "data" / "experiments" / "run-1-caching-attempt-1.json").exists())
            self.assertTrue((site / "static" / "experiments" / "run-1-caching-attempt-1" / "index.html").exists())
            post = (site / "content" / "posts" / "2026-10-21-cdsap-430-caching-experiment.md").read_text()
            self.assertIn("viewer_link: /Telltale/experiments/run-1-caching-attempt-1/", post)
            self.assertIn("report_link: /Telltale/reports/experiment_results_old.html", post)

    def test_refuses_to_clobber_a_different_report_id(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            results = root / "results"
            site = root / "site"
            dist = root / "dist"
            results.mkdir()
            (results / "a.html").write_text("<html></html>")
            (results / "experiment-result.json").write_text(
                json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-new"}})
            )
            published = site / "static" / "data" / "experiments" / "run-new.json"
            published.parent.mkdir(parents=True)
            published.write_text(json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-old"}}))
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("x")
            with self.assertRaises(StageError):
                stage(_args(results=str(results), site=str(site), viewer_dist=str(dist)))

    def test_attaches_viewer_to_an_existing_experiment_post(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            results = root / "results"
            site = root / "site"
            dist = root / "dist"
            results.mkdir()
            (results / "experiment_results_old.html").write_text("<html>legacy</html>")
            (results / "experiment_results_old.csv").write_text("Category,Metric\n")
            (results / "experiment-result.json").write_text(
                json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-cdsap-309-caching-attempt-1"}})
            )
            posts = site / "content" / "posts"
            posts.mkdir(parents=True)
            existing = posts / "2026-04-28-cdsap-309-experiment.md"
            existing.write_text(
                "---\n"
                "layout: post\n"
                'title: "Gradle 9.5.0 vs 9.4.1"\n'
                "date: 2026-04-28\n"
                "report_link: /Telltale/reports/experiment_results_20260428174824.html\n"
                "tags: [\"dependencies cache\"]\n"
                "experiment_snapshot:\n"
                '  metric: "Overall build time"\n'
                "---\n"
                "[Report 📊](../../reports/experiment_results_20260428174824.html)\n"
                "## Summary\nOld analysis remains.\n"
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div><script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("console.log(1)")
            args = _args(results=str(results), site=str(site), viewer_dist=str(dist))
            args.experiment_id = "cdsap-309"
            staged = stage(args)
            self.assertEqual(staged["post"], "content/posts/2026-04-28-cdsap-309-experiment.md")
            self.assertFalse((posts / "2026-10-21-cdsap-309-caching-experiment.md").exists())
            post = existing.read_text()
            self.assertIn("viewer_link: /Telltale/experiments/run-cdsap-309-caching-attempt-1/", post)
            self.assertIn("json_link: /Telltale/data/experiments/run-cdsap-309-caching-attempt-1.json.gz", post)
            self.assertIn("[Interactive report](/Telltale/experiments/run-cdsap-309-caching-attempt-1/)", post)
            self.assertIn("Old analysis remains.", post)
            self.assertIn('title: "Gradle 9.5.0 vs 9.4.1"', post)

    def test_copies_hugo_assets_onto_the_site_tree(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            results = root / "results"
            site = root / "site"
            dist = root / "dist"
            assets = root / "assets"
            results.mkdir()
            (results / "experiment_results_old.html").write_text("<html>legacy</html>")
            (results / "experiment_results_old.csv").write_text("Category,Metric\n")
            (results / "experiment-result.json").write_text(
                json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-assets"}})
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div><script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("console.log(1)")
            (assets / "css" / "extended").mkdir(parents=True)
            (assets / "css" / "extended" / "home-experiment-cards.css").write_text(".experiment-delta-grid{}")
            args = _args(results=str(results), site=str(site), viewer_dist=str(dist))
            args.assets_src = str(assets)
            stage(args)
            copied = site / "assets" / "css" / "extended" / "home-experiment-cards.css"
            self.assertTrue(copied.is_file())
            self.assertEqual(copied.read_text(), ".experiment-delta-grid{}")

    def test_ignores_openai_analysis_and_uses_snapshot_metrics(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            results = root / "results"
            site = root / "site"
            dist = root / "dist"
            results.mkdir()
            (results / "experiment_results_old.html").write_text("<html>legacy</html>")
            (results / "experiment_results_old.csv").write_text("Category,Metric\n")
            (results / "experiment-result.json").write_text(
                json.dumps({"schemaVersion": "1.0.0", "report": {"id": "run-metrics"}})
            )
            (results / "experiment_results_openai_analysis_old.md").write_text(
                "The performance analysis of the Gradle build variants reveals a bottleneck."
            )
            (results / "experiment_results_openai_title_old.txt").write_text("Ignore this title")
            (results / "experiment_snapshot.yaml").write_text(
                'experiment_snapshot:\n  summary: "Build mean -0.48%; Configuration P90 +5.16%."\n'
                '  insights:\n    - "Build mean and P90 moved in opposite directions."\n'
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div><script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("console.log(1)")
            staged = stage(_args(results=str(results), site=str(site), viewer_dist=str(dist)))
            post = (site / "content" / "posts" / "2026-10-21-cdsap-430-caching-experiment.md").read_text()
            self.assertEqual(staged["report_id"], "run-metrics")
            self.assertIn("Build mean -0.48%", post)
            self.assertIn("insights:", post)
            self.assertNotIn("performance analysis", post)
            self.assertNotIn("Ignore this title", post)
            self.assertIn("title: \"Gradle 9.8.2\"", post)


if __name__ == "__main__":
    unittest.main()
