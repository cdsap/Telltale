# Telltale Action Inputs Documentation

This document describes the inputs for the GitHub Actions used within the Telltale framework.

## Main Workflow Inputs (`.github/workflows/experiment.yaml` and `.github/workflows/experiment-with-gradle-profiler.yaml`)

This section details the inputs for the primary dispatchable workflows: `experiment.yaml` and `experiment-with-gradle-profiler.yaml`. Common inputs are listed first, followed by those specific to each workflow.

**Common Inputs for Both Workflows:**

- **`repository`**:
  - Description: GitHub repository to run the experiment on.
  - Required: `true` (for both workflows).
  - Default: `"cdsap/ExperimentGradle8.9"` (for both workflows).
- **`variantA`**:
  - Description: Experiment branch name for variant A.
  - Required: `true` (for both workflows).
  - Default: `"gradle_8_9_no_caching_transforms"` (for both workflows).
- **`variantB`**:
  - Description: Experiment branch name for variant B.
  - Required: `true` (for both workflows).
  - Default: `"gradle_8_9_no_caching_transforms"` (for both workflows).
- **`task`**:
  - Description: Gradle task to be executed.
  - Required: `true` (for both workflows).
  - Default: `":core:model:compileKotlin"` (for both workflows).
- **`os_args`**:
  - Description: A JSON string defining the operating system for each variant.
  - `experiment.yaml`: Required: `true`. Default: `"{variantA:'ubuntu-latest',variantB:'ubuntu-latest'}"`.
  - `experiment-with-gradle-profiler.yaml`: Required: `false`. Default: `"{variantA:'ubuntu-latest',variantB:'ubuntu-latest'}"`.
- **`java_args`**:
  - Description: A JSON string specifying the JDK version and vendor for each variant.
  - `experiment.yaml`: Required: `true`. Default: `"{javaVersionVariantA:'17',javaVersionVariantB:'17',javaVendorVariantA:'zulu',javaVendorVariantB:'zulu'}"`.
  - `experiment-with-gradle-profiler.yaml`: Required: `false`. Default: `"{javaVersionVariantA:'17',javaVersionVariantB:'17',javaVendorVariantA:'zulu',javaVendorVariantB:'zulu'}"`.
- **`extra_build_args`**:
  - Description: A JSON string providing additional Gradle arguments for each variant.
  - `experiment.yaml`: Required: `true`. Default: `"{extraArgsVariantA:' ',extraArgsVariantB:' '}"`.
  - `experiment-with-gradle-profiler.yaml`: Required: `false`. Default: `"{extraArgsVariantA:' ',extraArgsVariantB:' '}"`.
- **`extra_report_args`**:
  - Description: A JSON string to configure report generation. See the "Extra Report Arguments (`extra_report_args`)" section under "JSON Format Examples" for details on the keys.
  - `experiment.yaml`: Required: `true`. Default: `"{deploy_results:'false',experiment_title:'', open_ai_request:'true', report_enabled:'true',tasktype_report:'true',taskpath_report:'true',kotlin_build_report:'false',process_report:'false',resource_usage_report:'true',gc_report:'false',only_cacheable_outcome:'false',threshold_task_duration:'1000'}"`.
  - `experiment-with-gradle-profiler.yaml`: Required: `false`. Default: `"{deploy_results:'false',experiment_title:'',open_ai_request:'true',report_enabled:'true',tasktype_report:'true',taskpath_report:'true',kotlin_build_report:'false',process_report:'false',resource_usage_report:'true',gc_report:'false',only_cacheable_outcome:'false',threshold_task_duration:'1000'}"`.

**Inputs Specific to `experiment.yaml`:**

- **`iterations`**:
  - Description: Number of iterations for the experiment.
  - Required: `true`.
  - Default: `10`.
- **`mode`**:
  - Description: Specifies the caching mode for the experiment.
  - Required: `true`.
  - Type: `choice`.
  - Default: `'dependencies cache'`.
  - Options:
    - `'no caching'`
    - `'dependencies cache'`
    - `'dependencies cache - transforms cache'`
    - `'local task cache'`
    - `'local task cache + dependencies cache'`
    - `'local task cache - transforms cache'`
    - `'local task cache + dependencies cache - transforms cache'`
    - `'remote task cache'`
    - `'remote task cache + dependencies cache'`
    - `'remote task cache - transforms cache'`
    - `'remote task cache + dependencies cache - transforms cache'`

**Inputs Specific to `experiment-with-gradle-profiler.yaml`:**

- **`iterations`**:
  - Description: Number of iterations for the experiment.
  - Required: `false`.
  - Default: `5`.
- **`class`**:
  - Description: List of classes separated by ',' to be applied as an ABI (Application Binary Interface) scenario by Gradle Profiler.
  - Required: `false`.
  - Default: (empty string)

## Reusable Workflow: Report Action (`.github/workflows/report/action.yaml`)

This section describes the inputs for the reusable `report/action.yaml` workflow, responsible for generating and processing experiment reports.

- **`api-key`**:
  - Description: Your Develocity API key.
  - Required: `true`.
- **`url`**:
  - Description: The URL of your Develocity server.
  - Required: `true`.
- **`task`**:
  - Description: The Gradle task that was executed in the experiment.
  - Required: `true`.
- **`max-builds`**:
  - Description: Maximum number of builds to fetch for the comparison.
  - Required: `false`.
  - Default: `200`.
- **`experiment-id`**:
  - Description: A unique identifier for the experiment run.
  - Required: `true`.
- **`tags`**:
  - Description: Comma-separated list of tags used to identify and group builds in Develocity.
  - Required: `true`.
- **`profile`**:
  - Description: Indicates if the report is for a Gradle Profiler run.
  - Required: `true`. (Note: Default is `false` in the action if not provided by caller for some reason, but main workflows always pass it).
  - Type: String (`'true'` or `'false'`).
- **`gh_token`**:
  - Description: A GitHub token, typically `secrets.GITHUB_TOKEN`, for accessing repository data or APIs.
  - Required: `true`.
- **`taskpathreport`**:
  - Description: Enable or disable the task path report.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`processreport`**:
  - Description: Enable or disable the process information report.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`kotlinreport`**:
  - Description: Enable or disable the Kotlin build statistics report.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`tasktypereport`**:
  - Description: Enable or disable the task type report.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`resourceusagereport`**:
  - Description: Enable or disable the resource usage report.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`gcreport`**:
  - Description: Enable or disable the garbage collection report. (Note: This input is used by the action's script but not formally defined in its `inputs:` block in `action.yaml`. It's passed from main workflows via `extra_report_args`).
  - Required: `true` (as passed by main workflows).
  - Type: String (`'true'` or `'false'`).
- **`onlycacheableoutcome`**:
  - Description: Filter report to include only cacheable task outcomes.
  - Required: `true`.
  - Type: String (`'true'` or `'false'`).
- **`thresholdtaskduration`**:
  - Description: Minimum duration (in milliseconds) for a task to be included in certain reports.
  - Required: `true`.
  - Default: `1000`.
- **`repository`**:
  - Description: The name of the GitHub repository where the experiment was run (e.g., `owner/repo`).
  - Required: `true`.
- **`run_id`**:
  - Description: The ID of the GitHub Actions workflow run.
  - Required: `false`.
- **`mode`**:
  - Description: The caching mode used during the experiment (e.g., `no caching`, `local task cache`).
  - Required: `false`.
- **`experiment_title`**:
  - Description: A custom title for the experiment report.
  - Required: `false`.
- **`open-ai-request`**:
  - Description: Enable or disable requesting analysis from OpenAI.
  - Required: `true`.
  - Default: `false`.
  - Type: String (`'true'` or `'false'`).
- **`open-ai-api-key`**:
  - Description: Your OpenAI API key, required if `open-ai-request` is `'true'`.
  - Required: `false`.
  - Default: `""`.
- **`deploy_results`**:
  - Description: Enable or disable deployment of the report to GitHub Pages.
  - Required: `true`.
  - Default: `false`.
  - Type: String (`'true'` or `'false'`).
- **`deployment-key`**:
  - Description: GitHub token or PAT for triggering deployment, if `deploy_results` is `'true'`.
  - Required: `true` (conditionally, if deploying).
  - Default: `""`.

## Reusable Workflow: Runner Action (`.github/workflows/runner/action.yaml`)

This section details inputs for the reusable `runner/action.yaml` workflow, which executes a single Gradle build iteration for the standard experiment.

- **`task`**:
  - Description: The Gradle task to execute.
  - Required: `true`.
- **`variant`**:
  - Description: The Git branch name representing the variant being tested.
  - Required: `true`.
- **`variant-prefix`**:
  - Description: A prefix used in Develocity tags to identify the variant (e.g., `varianta_`).
  - Required: `true`.
- **`experiment-id`**:
  - Description: A unique identifier for the experiment.
  - Required: `true`.
- **`api-key`**:
  - Description: Your Develocity API key for publishing build scans.
  - Required: `true`.
- **`repository`**:
  - Description: The name of the GitHub repository to check out (e.g., `owner/repo`).
  - Required: `true`.
- **`jdk_version`**:
  - Description: The JDK version to use for the build.
  - Required: `false`.
  - Default: `17`.
- **`jdk_vendor`**:
  - Description: The JDK vendor (e.g., `zulu`, `temurin`).
  - Required: `false`.
  - Default: `'zulu'`.
- **`execution-number`**:
  - Description: The iteration number for the current execution, used for cache seed management.
  - Required: `true`.
- **`mode`**:
  - Description: Specifies the caching mode for this run (e.g., `no caching`, `local task cache`).
  - Required: `true`.
- **`extra-args`**:
  - Description: Any additional arguments to pass to the Gradle command.
  - Required: `true`.
- **`cache-url`**:
  - Description: URL of the remote build cache node, if used.
  - Required: `false`.
- **`cache-excludes`**:
  - Description: Patterns for excluding files/directories from Gradle's home cache.
  - Required: `true`.

## Reusable Workflow: Gradle Profiler Runner Action (`.github/workflows/runner-gradle-profiler/action.yaml`)

This section describes inputs for the reusable `runner-gradle-profiler/action.yaml` workflow, used for experiments involving Gradle Profiler.

- **`task`**:
  - Description: The Gradle task to execute within the Gradle Profiler scenario.
  - Required: `true`.
- **`warmups`**:
  - Description: Number of warmup builds before performance measurement.
  - Required: `false`.
  - Default: `1`.
- **`iterations`**:
  - Description: Number of measurement iterations to run.
  - Required: `false`.
  - Default: `5`.
- **`class`**:
  - Description: Comma-separated list of classes to which ABI (Application Binary Interface) changes will be applied by Gradle Profiler.
  - Required: `false`.
  - Default: (empty string, not explicitly defined in YAML but effectively).
- **`variant`**:
  - Description: The Git branch name representing the variant being tested.
  - Required: `true`.
- **`variant-prefix`**:
  - Description: A prefix used in Develocity tags to identify the variant (e.g., `varianta_`).
  - Required: `true`.
- **`experiment-id`**:
  - Description: A unique identifier for the experiment.
  - Required: `true`.
- **`api-key`**:
  - Description: Your Develocity API key for publishing build scans.
  - Required: `true`.
- **`repository`**:
  - Description: The name of the GitHub repository to check out (e.g., `owner/repo`).
  - Required: `true`.
- **`jdk_version`**:
  - Description: The JDK version to use for the build.
  - Required: `true`.
  - Default: `17`.
- **`jdk_vendor`**:
  - Description: The JDK vendor (e.g., `zulu`, `temurin`).
  - Required: `true`.
  - Default: `'zulu'`.
- **`extra-args`**:
  - Description: Any additional arguments to pass to the Gradle command.
  - Required: `true`.
- **`cache-url`**:
  - Description: URL of the remote build cache node, if used.
  - Required: `true`.


## JSON Format Examples for Workflow Inputs

These examples show the expected JSON string format for complex inputs used in the main workflow dispatch configuration.

### OS Arguments (`os_args`)
```json
{
  "variantA": "ubuntu-latest",
  "variantB": "ubuntu-latest"
}
```

### Java Arguments (`java_args`)
```json
{
  "javaVersionVariantA": "17",
  "javaVersionVariantB": "17",
  "javaVendorVariantA": "zulu",
  "javaVendorVariantB": "zulu"
}
```

### Extra Build Arguments (`extra_build_args`)
The example shows how to pass different arguments to each variant.
```json
{
  "extraArgsVariantA": "--no-daemon",
  "extraArgsVariantB": "--no-daemon --parallel"
}
```

### Extra Report Arguments (`extra_report_args`)
This JSON string configures various aspects of the reporting process. The example below shows the default structure.
```json
{
  "deploy_results": "false",
  "experiment_title": "",
  "open_ai_request": "true",
  "report_enabled": "true",
  "tasktype_report": "true",
  "taskpath_report": "true",
  "kotlin_build_report": "false",
  "process_report": "false",
  "resource_usage_report": "true",
  "gc_report": "false",
  "only_cacheable_outcome": "false",
  "threshold_task_duration": "1000"
}
```