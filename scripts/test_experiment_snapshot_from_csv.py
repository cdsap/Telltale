#!/usr/bin/env python3
from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

from experiment_snapshot_from_csv import (
    _emit_yaml,
    metric_insights,
    metric_summary,
    percent_change,
    summary_from_snapshot_yaml,
)


BUILD_A = {"mean": 252.297, "p50": 270.300, "p90": 290.586}
BUILD_B = {"mean": 251.097, "p50": 272.264, "p90": 300.622}
CFG_A = {"mean": 41.187, "p50": 43.322, "p90": 48.090}
CFG_B = {"mean": 41.038, "p50": 41.233, "p90": 50.570}


class ExperimentSnapshotTest(unittest.TestCase):
    def test_percent_change_matches_homepage_build_mean(self) -> None:
        pct = percent_change(BUILD_A["mean"], BUILD_B["mean"])
        self.assertIsNotNone(pct)
        self.assertAlmostEqual(pct, -0.4756, places=3)

    def test_metric_summary_covers_build_and_configuration_percentiles(self) -> None:
        summary = metric_summary(BUILD_A, BUILD_B, CFG_A, CFG_B)
        self.assertIn("Build mean -0.48%", summary)
        self.assertIn("Build median +0.73%", summary)
        self.assertIn("Build P90 +3.45%", summary)
        self.assertIn("Configuration mean -0.36%", summary)
        self.assertIn("Configuration median -4.82%", summary)
        self.assertIn("Configuration P90 +5.16%", summary)

    def test_insights_flag_mean_p90_disagreement_and_material_config_p90(self) -> None:
        insights = metric_insights(BUILD_A, BUILD_B, CFG_A, CFG_B)
        self.assertIn("Build mean and P90 moved in opposite directions.", insights)
        self.assertIn("Configuration P90 changed +5.16%.", insights)
        self.assertTrue(all("caused by" not in item.lower() for item in insights))

    def test_sub_five_percent_changes_do_not_emit_material_insights(self) -> None:
        quiet_a = {"mean": 100.0, "p50": 100.0, "p90": 100.0}
        quiet_b = {"mean": 104.0, "p50": 103.0, "p90": 102.0}
        self.assertEqual(metric_insights(quiet_a, quiet_b, quiet_a, quiet_b), [])

    def test_emit_yaml_includes_summary_and_insights_not_openai_prose(self) -> None:
        yaml_text = _emit_yaml("9.8.1", "9.8.2", BUILD_A, BUILD_B, CFG_A, CFG_B)
        self.assertIn("summary:", yaml_text)
        self.assertIn("insights:", yaml_text)
        self.assertNotIn("performance analysis", yaml_text.lower())
        self.assertEqual(summary_from_snapshot_yaml(yaml_text), metric_summary(BUILD_A, BUILD_B, CFG_A, CFG_B))

    def test_cli_writes_snapshot_from_csv(self) -> None:
        from experiment_snapshot_from_csv import main
        import sys

        with tempfile.TemporaryDirectory() as tmp:
            csv_path = Path(tmp) / "experiment_results.csv"
            with csv_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=[
                        "Category",
                        "Metric",
                        "Unit",
                        "varianta_baseline Mean",
                        "varianta_baseline P50",
                        "varianta_baseline P90",
                        "variantb_gradle-9.8.2 Mean",
                        "variantb_gradle-9.8.2 P50",
                        "variantb_gradle-9.8.2 P90",
                    ],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "Category": "Build",
                        "Metric": "Build time",
                        "Unit": "ms",
                        "varianta_baseline Mean": "252297",
                        "varianta_baseline P50": "270300",
                        "varianta_baseline P90": "290586",
                        "variantb_gradle-9.8.2 Mean": "251097",
                        "variantb_gradle-9.8.2 P50": "272264",
                        "variantb_gradle-9.8.2 P90": "300622",
                    }
                )
            previous = sys.argv
            sys.argv = ["experiment_snapshot_from_csv.py", str(csv_path), "--label-a", "9.8.1", "--label-b", "9.8.2"]
            try:
                from io import StringIO
                from unittest.mock import patch

                with patch("sys.stdout", new=StringIO()) as stdout:
                    self.assertEqual(main(), 0)
                    output = stdout.getvalue()
            finally:
                sys.argv = previous
            self.assertIn('label: "9.8.1"', output)
            self.assertIn("Build mean", summary_from_snapshot_yaml(output) or "")


if __name__ == "__main__":
    unittest.main()
