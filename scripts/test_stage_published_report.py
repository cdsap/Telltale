#!/usr/bin/env python3
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from stage_published_report import StageError, stage, load_report_id, rewrite_viewer_html


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
            json_url="/Telltale/data/experiments/run-1-caching-attempt-1.json",
            html_url="/Telltale/reports/legacy.html",
            csv_url="/Telltale/reports/legacy.csv",
        )
        self.assertIn('data-report-url="/Telltale/data/experiments/run-1-caching-attempt-1.json"', html)
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
                    }
                )
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div><script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("console.log(1)")
            (dist / "assets" / "report-viewer.css").write_text("body{}")
            existing = site / "static" / "reports" / "experiment_results_keep.html"
            existing.parent.mkdir(parents=True)
            existing.write_text("keep-me")
            staged = stage(_args(results=str(results), site=str(site), viewer_dist=str(dist)))
            self.assertEqual(staged["report_id"], "run-1-caching-attempt-1")
            self.assertTrue((site / "static" / "reports" / "experiment_results_keep.html").exists())
            self.assertTrue((site / "static" / "data" / "experiments" / "run-1-caching-attempt-1.json").exists())
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


if __name__ == "__main__":
    unittest.main()
