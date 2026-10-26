#!/usr/bin/env python3
from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYOUTS = ROOT / "web" / "hugo" / "layouts"


class HugoHomeTemplatesTest(unittest.TestCase):
    def test_recent_experiment_cards_use_snapshot_metrics_not_openai_summary(self) -> None:
        listing = (LAYOUTS / "_default" / "list.html").read_text(encoding="utf-8")
        self.assertIn("experiment-delta-grid.html", listing)
        self.assertIn("experiment-report-href.html", listing)
        self.assertNotIn(".Params.summary", listing)
        self.assertNotIn(".Summary", listing.split("IsHome")[1].split("else")[0])

    def test_latest_snapshot_and_cards_prefer_the_interactive_report(self) -> None:
        href = (LAYOUTS / "partials" / "experiment-report-href.html").read_text(encoding="utf-8")
        snapshot = (LAYOUTS / "partials" / "home-experiment-snapshot.html").read_text(encoding="utf-8")
        listing = (LAYOUTS / "_default" / "list.html").read_text(encoding="utf-8")
        self.assertIn("viewer_link", href)
        self.assertIn("Open interactive report", snapshot)
        self.assertNotIn("Open HTML report", snapshot)
        self.assertNotIn(".Permalink", snapshot)
        self.assertIn("Params.viewer_link", listing)

    def test_experiment_data_drops_llm_analysis_column(self) -> None:
        data = (LAYOUTS / "_default" / "experiment-data.html").read_text(encoding="utf-8")
        self.assertNotIn("LLM analysis", data)
        self.assertIn("Build / configuration", data)
        self.assertIn("experiment-delta-grid.html", data)


if __name__ == "__main__":
    unittest.main()
