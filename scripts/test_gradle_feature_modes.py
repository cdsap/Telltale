#!/usr/bin/env python3
from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = (ROOT / ".github/workflows/runner-seed/action.yaml").read_text(encoding="utf-8")
RUNNER = (ROOT / ".github/workflows/runner/action.yaml").read_text(encoding="utf-8")
PROFILER = (ROOT / ".github/workflows/runner-gradle-profiler/action.yaml").read_text(
    encoding="utf-8"
)
EXPERIMENT = (ROOT / ".github/workflows/experiment.yaml").read_text(encoding="utf-8")
PROFILER_WORKFLOW = (
    ROOT / ".github/workflows/experiment-with-gradle-profiler.yaml"
).read_text(encoding="utf-8")


class GradleFeatureModesTest(unittest.TestCase):
    def test_seed_maps_read_only_to_writable_configuration_cache(self) -> None:
        self.assertIn(
            '"read-only"|"read-only-no-entry")\n            echo "args=--configuration-cache"',
            SEED.replace("\r\n", "\n"),
        )
        self.assertNotIn(
            "args=--configuration-cache -Dorg.gradle.configuration-cache.read-only=true",
            SEED,
        )

    def test_execution_keeps_read_only_flag(self) -> None:
        self.assertIn(
            "args=--configuration-cache -Dorg.gradle.configuration-cache.read-only=true",
            RUNNER,
        )

    def test_restore_fails_on_cache_miss(self) -> None:
        self.assertIn("fail-on-cache-miss: true", RUNNER)
        self.assertNotIn("fail-on-cache-miss: false", RUNNER)
        self.assertIn("Reusing configuration cache", RUNNER)
        self.assertIn("inputs.mode != 'no caching'", RUNNER)

    def test_no_caching_execution_omits_configuration_cache_key(self) -> None:
        no_caching = EXPERIMENT.split("execution-no-caching:")[1].split("report-no-caching:")[0]
        self.assertNotIn("configuration-cache-key:", no_caching)

    def test_path_helper_is_invoked_with_env_not_interpolation(self) -> None:
        for source in (SEED, RUNNER):
            self.assertIn("INCLUDED_BUILDS_RAW: ${{ inputs.configuration-cache-included-builds }}", source)
            self.assertIn("configuration-cache-paths.sh", source)
            self.assertNotIn(
                '<<< "${{ inputs.configuration-cache-included-builds }}"',
                source,
            )

    def test_cc_bundle_does_not_overlay_dependency_caches(self) -> None:
        helper = (
            ROOT / ".github/workflows/lib/configuration-cache-paths.sh"
        ).read_text(encoding="utf-8")
        self.assertNotIn("modules-2", helper)
        self.assertNotIn("jars-*", helper)

    def test_profiler_rejects_no_entry_and_read_only(self) -> None:
        self.assertIn("cannot honor", PROFILER)
        self.assertNotIn('"on"|"on-no-entry")', PROFILER)
        for option in ("on-no-entry", "warn-no-entry", "read-only", "read-only-no-entry"):
            self.assertNotIn(f"- '{option}'", PROFILER_WORKFLOW)

    def test_mode_to_args_table_in_runner_and_seed(self) -> None:
        expected = {
            '"on"|"on-no-entry")': "args=--configuration-cache",
            '"warn"|"warn-no-entry")': "args=--configuration-cache --configuration-cache-problems=warn",
            '"disabled")': "args=--no-configuration-cache -Dorg.gradle.unsafe.isolated-projects=false",
        }
        for source in (SEED, RUNNER):
            for case, args in expected.items():
                self.assertIn(case, source)
                self.assertIn(args, source)


if __name__ == "__main__":
    unittest.main()
