#!/usr/bin/env python3
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from next_historical_republish import pick_next, remaining_count


def _write_csv(path: Path, slug_a: str, slug_b: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"Category,Metric,{slug_a} Mean,{slug_b} Mean\nBuild,Duration,1,2\n"
    )


def _write_post(
    path: Path,
    *,
    title: str,
    report: str,
    viewer: str = "",
    snapshot_a: str = "",
    snapshot_b: str = "",
    tags: str = '["dependencies cache"]',
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "---",
        f'title: "{title}"',
        f"report_link: {report}",
        f"tags: {tags}",
    ]
    if viewer:
        lines.append(f"viewer_link: {viewer}")
    if snapshot_a:
        lines.extend(
            [
                "experiment_snapshot:",
                "  variant_a:",
                f'    label: "{snapshot_a}"',
                "  variant_b:",
                f'    label: "{snapshot_b}"',
            ]
        )
    lines.extend(["---", "", "body\n"])
    path.write_text("\n".join(lines))


class NextHistoricalRepublishTest(unittest.TestCase):
    def test_picks_newest_post_without_viewer(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp)
            _write_csv(
                site / "static/reports/experiment_results_old.csv",
                "varianta_9.8.1",
                "variantb_9.8.2",
            )
            _write_csv(
                site / "static/reports/experiment_results_new.csv",
                "varianta_baseline",
                "variantb_gradle-9.8.2",
            )
            _write_post(
                site / "content/posts/2026-03-17-cdsap-275-experiment.md",
                title="KGP 2.3.20 vs 2.3.10",
                report="/Telltale/reports/experiment_results_old.html",
                viewer="/Telltale/experiments/experiment-cdsap-275-caching/",
            )
            _write_post(
                site / "content/posts/2026-09-24-cdsap-408-experiment.md",
                title="Older leftover",
                report="/Telltale/reports/experiment_results_old.html",
                snapshot_a="9.8.1",
                snapshot_b="9.8.2",
            )
            _write_post(
                site / "content/posts/2026-10-21-cdsap-430-experiment.md",
                title="Gradle 9.8.2 vs 9.8.1",
                report="/Telltale/reports/experiment_results_new.html",
                snapshot_a="9.8.1",
                snapshot_b="9.8.2",
            )
            picked = pick_next(site)
            self.assertIsNotNone(picked)
            assert picked is not None
            self.assertEqual(picked["experiment_id"], "cdsap-430")
            self.assertEqual(
                picked["tags"],
                "cdsap-430_varianta_baseline,cdsap-430_variantb_gradle-9.8.2",
            )
            self.assertEqual(picked["snapshot_label_a"], "9.8.1")
            self.assertEqual(picked["snapshot_label_b"], "9.8.2")
            self.assertEqual(picked["report_kind"], "caching")
            self.assertEqual(picked["profile"], "false")
            self.assertEqual(remaining_count(site), 2)

    def test_skips_failed_ids_and_handles_profiler_prefix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp)
            _write_csv(
                site / "static/reports/experiment_results_prof.csv",
                "varianta_anvil",
                "variantb_metro_0_3_2",
            )
            _write_post(
                site / "content/posts/2025-05-18-profiler-cdsap-18-experiment.md",
                title="anvil vs metro",
                report="/Telltale/reports/experiment_results_prof.html",
                tags='["gradle-profiler"]',
            )
            skip = site / "static/data/experiments/republish-skip.txt"
            skip.parent.mkdir(parents=True)
            skip.write_text("cdsap-18\n")
            self.assertIsNone(pick_next(site))
            skip.write_text("")
            picked = pick_next(site)
            self.assertIsNotNone(picked)
            assert picked is not None
            self.assertEqual(picked["experiment_id"], "cdsap-18")
            self.assertEqual(
                picked["tags"],
                "profiler-cdsap-18_varianta_anvil,profiler-cdsap-18_variantb_metro_0_3_2",
            )
            self.assertEqual(picked["report_kind"], "profiler")
            self.assertEqual(picked["profile"], "true")

    def test_cli_json(self) -> None:
        from next_historical_republish import main

        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp)
            _write_csv(
                site / "static/reports/experiment_results_new.csv",
                "varianta_baseline",
                "variantb_gradle-9.8.2",
            )
            _write_post(
                site / "content/posts/2026-10-21-cdsap-430-experiment.md",
                title="Gradle 9.8.2 vs 9.8.1",
                report="/Telltale/reports/experiment_results_new.html",
            )
            from io import StringIO
            import sys

            buf = StringIO()
            old = sys.stdout
            sys.stdout = buf
            try:
                code = main(["--site", str(site), "--json"])
            finally:
                sys.stdout = old
            self.assertEqual(code, 0)
            payload = json.loads(buf.getvalue())
            self.assertEqual(payload["experiment_id"], "cdsap-430")
            self.assertEqual(payload["remaining"], "1")


if __name__ == "__main__":
    unittest.main()
