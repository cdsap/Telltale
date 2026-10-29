#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from stage_site_chrome import StageError, stage


def _args(**overrides):
    defaults = {
        "site": "",
        "site_base": "/Telltale",
        "viewer_dist": None,
        "layouts_src": None,
        "assets_src": None,
    }
    defaults.update(overrides)
    return type("Args", (), defaults)()


class StageSiteChromeTest(unittest.TestCase):
    def test_updates_viewer_without_touching_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            site = root / "site"
            dist = root / "dist"
            data = site / "static" / "data" / "experiments"
            experiment = site / "static" / "experiments" / "experiment-cdsap-430-caching"
            data.mkdir(parents=True)
            experiment.mkdir(parents=True)
            gzip_path = data / "experiment-cdsap-430-caching.json.gz"
            gzip_path.write_bytes(b"gzip-bytes")
            (experiment / "index.html").write_text(
                '<div id="telltale-report" data-report-url="/Telltale/data/experiments/experiment-cdsap-430-caching.json.gz" data-html-url="/Telltale/reports/old.html"></div>'
                '<script src="/Telltale/assets/report-viewer/report-viewer.js"></script>'
            )
            dist.mkdir()
            (dist / "index.html").write_text(
                '<div id="telltale-report" data-report-url="./data/sample.json"></div>'
                '<link href="./assets/index.css" rel="stylesheet">'
                '<script src="./assets/report-viewer.js"></script>'
            )
            (dist / "assets").mkdir()
            (dist / "assets" / "report-viewer.js").write_text("new-js")
            (dist / "assets" / "index.css").write_text("body{font-family:Roboto}")
            result = stage(_args(site=str(site), viewer_dist=str(dist)))
            self.assertEqual(gzip_path.read_bytes(), b"gzip-bytes")
            self.assertIn("index.css", result["viewer_assets"])
            html = (experiment / "index.html").read_text()
            self.assertIn(
                'data-report-url="/Telltale/data/experiments/experiment-cdsap-430-caching.json.gz"',
                html,
            )
            self.assertIn('data-html-url="/Telltale/reports/old.html"', html)
            self.assertIn('href="/Telltale/assets/report-viewer/index.css"', html)
            self.assertEqual(
                (site / "static" / "assets" / "report-viewer" / "index.css").read_text(),
                "body{font-family:Roboto}",
            )

    def test_copies_hugo_layouts_and_assets(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            site = root / "site"
            layouts = root / "layouts"
            assets = root / "assets"
            (layouts / "partials").mkdir(parents=True)
            (layouts / "partials" / "home-experiment-snapshot.html").write_text("snapshot")
            (assets / "css" / "extended").mkdir(parents=True)
            (assets / "css" / "extended" / "home-experiment-cards.css").write_text(".grid{}")
            result = stage(_args(site=str(site), layouts_src=str(layouts), assets_src=str(assets)))
            self.assertEqual(result["hugo_layout_files"], 1)
            self.assertEqual(result["hugo_asset_files"], 1)
            self.assertEqual(
                (site / "layouts" / "partials" / "home-experiment-snapshot.html").read_text(),
                "snapshot",
            )
            self.assertEqual(
                (site / "assets" / "css" / "extended" / "home-experiment-cards.css").read_text(),
                ".grid{}",
            )

    def test_requires_at_least_one_component(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(StageError):
                stage(_args(site=tmp))


if __name__ == "__main__":
    unittest.main()
