#!/usr/bin/env python3
from __future__ import annotations

import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"


def load_gha(path: Path) -> dict:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise AssertionError(f"{path} did not parse as a mapping")
    if True in data and "on" not in data:
        data["on"] = data.pop(True)
    return data


def workflow_files() -> list[Path]:
    return sorted([*WORKFLOWS.glob("*.yaml"), *WORKFLOWS.glob("*.yml")])


def action_files() -> list[Path]:
    return sorted([*WORKFLOWS.glob("*/action.yaml"), *WORKFLOWS.glob("*/action.yml")])


def job_steps(job: dict) -> list[dict]:
    steps = job.get("steps") or []
    return [step for step in steps if isinstance(step, dict)]


def all_run_scripts(data: dict) -> str:
    scripts: list[str] = []
    for job in (data.get("jobs") or {}).values():
        if not isinstance(job, dict):
            continue
        for step in job_steps(job):
            run = step.get("run")
            if isinstance(run, str):
                scripts.append(run)
    return "\n".join(scripts)


class WorkflowsYamlTest(unittest.TestCase):
    def test_discovers_workflow_and_composite_action_files(self) -> None:
        self.assertTrue(workflow_files(), "expected workflow YAML under .github/workflows")
        self.assertTrue(action_files(), "expected composite action.yaml files")

    def test_workflows_parse_and_declare_jobs(self) -> None:
        for path in workflow_files():
            with self.subTest(path=str(path.relative_to(ROOT))):
                data = load_gha(path)
                self.assertTrue(data.get("name"), f"{path.name} needs a name")
                self.assertTrue(data.get("on"), f"{path.name} needs an on trigger")
                jobs = data.get("jobs")
                self.assertIsInstance(jobs, dict)
                self.assertTrue(jobs, f"{path.name} needs at least one job")
                for job_id, job in jobs.items():
                    self.assertIsInstance(job, dict, job_id)
                    self.assertTrue(
                        job.get("runs-on") or job.get("uses"),
                        f"{path.name} job {job_id} needs runs-on or uses",
                    )
                    if "uses" not in job:
                        self.assertTrue(job_steps(job), f"{path.name} job {job_id} needs steps")

    def test_composite_actions_parse_and_use_composite_runner(self) -> None:
        for path in action_files():
            with self.subTest(path=str(path.relative_to(ROOT))):
                data = load_gha(path)
                self.assertTrue(data.get("name"), f"{path} needs a name")
                runs = data.get("runs")
                self.assertIsInstance(runs, dict)
                self.assertEqual(runs.get("using"), "composite")
                steps = runs.get("steps")
                self.assertIsInstance(steps, list)
                self.assertTrue(steps, f"{path} needs at least one composite step")
                for step in steps:
                    self.assertIsInstance(step, dict)
                    self.assertTrue(
                        step.get("uses") or step.get("run"),
                        f"{path} has a step without uses or run",
                    )
                    if step.get("run"):
                        self.assertTrue(step.get("shell"), f"{path} run steps need a shell")
                inputs = data.get("inputs") or {}
                self.assertIsInstance(inputs, dict)
                for input_id, spec in inputs.items():
                    self.assertIsInstance(spec, dict, input_id)
                    self.assertTrue(spec.get("description"), f"{path} input {input_id} needs a description")

    def test_local_composite_uses_paths_exist(self) -> None:
        for path in workflow_files():
            data = load_gha(path)
            for job in (data.get("jobs") or {}).values():
                if not isinstance(job, dict):
                    continue
                for step in job_steps(job):
                    uses = step.get("uses")
                    if not isinstance(uses, str) or not uses.startswith("./"):
                        continue
                    local = (ROOT / uses).resolve()
                    action = local / "action.yaml" if local.is_dir() else local
                    self.assertTrue(action.is_file(), f"{path.name} uses missing {uses}")

    def test_experiment_workflows_wire_report_and_runners(self) -> None:
        experiment = load_gha(WORKFLOWS / "experiment.yaml")
        uses = [
            step.get("uses")
            for job in experiment["jobs"].values()
            for step in job_steps(job)
        ]
        self.assertIn("./.github/workflows/runner", uses)
        self.assertIn("./.github/workflows/runner-seed", uses)
        self.assertIn("./.github/workflows/report", uses)
        self.assertIn("workflow_dispatch", experiment["on"])

        profiler = load_gha(WORKFLOWS / "experiment-with-gradle-profiler.yaml")
        profiler_uses = [
            step.get("uses")
            for job in profiler["jobs"].values()
            for step in job_steps(job)
        ]
        self.assertIn("./.github/workflows/runner-gradle-profiler", profiler_uses)
        self.assertIn("./.github/workflows/report", profiler_uses)

    def test_report_action_emits_experiment_result_json(self) -> None:
        report = load_gha(WORKFLOWS / "report" / "action.yaml")
        self.assertIn("ber-release", report["inputs"])
        self.assertIn("deploy_results", report["inputs"])
        scripts = "\n".join(
            step.get("run", "")
            for step in report["runs"]["steps"]
            if isinstance(step, dict) and isinstance(step.get("run"), str)
        )
        self.assertIn("--output-json=experiment-result.json", scripts)
        self.assertIn("stage_published_report.py", scripts)
        self.assertIn("--assets-src", scripts)
        self.assertIn("npm run build", scripts)

    def test_ci_workflow_runs_tsx_and_yaml_tests(self) -> None:
        ci = load_gha(WORKFLOWS / "tests.yaml")
        self.assertIn("pull_request", ci["on"])
        scripts = all_run_scripts(ci)
        self.assertIn("npm test", scripts)
        self.assertIn("unittest", scripts)
        working_dirs = []
        for job in ci["jobs"].values():
            defaults = job.get("defaults") or {}
            run_defaults = defaults.get("run") if isinstance(defaults, dict) else {}
            if isinstance(run_defaults, dict) and run_defaults.get("working-directory"):
                working_dirs.append(run_defaults["working-directory"])
            for step in job_steps(job):
                if step.get("working-directory"):
                    working_dirs.append(step["working-directory"])
        self.assertIn("web/report-viewer", working_dirs)


if __name__ == "__main__":
    unittest.main()
