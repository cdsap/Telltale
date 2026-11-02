#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / ".github" / "workflows" / "lib" / "configuration-cache-paths.sh"


def run_paths(included: str, workspace: Path) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["INCLUDED_BUILDS_RAW"] = included
    env["GITHUB_WORKSPACE"] = str(workspace)
    env.pop("GITHUB_OUTPUT", None)
    return subprocess.run(
        ["bash", str(SCRIPT)],
        cwd=workspace,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


class ConfigurationCachePathsTest(unittest.TestCase):
    def test_default_list_emits_relative_build_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)
            (workspace / "build-logic" / "convention").mkdir(parents=True)
            result = run_paths("buildSrc,build-logic,build-logic/*", workspace)
            self.assertEqual(result.returncode, 0, result.stderr)
            lines = result.stdout.splitlines()
            self.assertIn(".gradle/configuration-cache", lines)
            self.assertIn("buildSrc/build", lines)
            self.assertIn("build-logic/build", lines)
            self.assertIn("build-logic/convention/build", lines)
            self.assertTrue(any(line.endswith("/init.d") for line in lines))
            self.assertFalse(any("modules-2" in line for line in lines))
            self.assertFalse(any("jars-" in line for line in lines))

    def test_rejects_shell_metacharacters(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)
            for value in (
                'x"; printenv | base64; echo "',
                "x$(whoami)",
                "x`whoami`",
                "x;id",
            ):
                with self.subTest(value=value):
                    result = run_paths(value, workspace)
                    self.assertNotEqual(result.returncode, 0, value)
                    self.assertIn("Rejected included-build path", result.stderr)

    def test_rejects_parent_and_absolute_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)
            for value in ("../secrets", "/etc", "foo/../bar", "../*"):
                with self.subTest(value=value):
                    result = run_paths(value, workspace)
                    self.assertNotEqual(result.returncode, 0, value)
                    self.assertIn("Rejected included-build path", result.stderr)


if __name__ == "__main__":
    unittest.main()
