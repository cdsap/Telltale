# Action Inputs Documentation

This document describes the inputs required for each action in the Telltale framework.

## Workflow Inputs (`experiment.yaml`)

Inputs for the main experiment workflow.

- **Inputs**:
  - `repository`: GitHub repository to run the experiment (default: "cdsap/ExperimentGradle8.9")
  - `variantA`: Experiment branch name for variant A (default: "gradle_8_9_no_caching_transforms")
  - `variantB`: Experiment branch name for variant B (default: "gradle_8_9_no_caching_transforms")
  - `task`: Gradle task to be executed (default: ":core:model:compileKotlin")
  - `iterations`: Number of iterations for the experiment (default: 10)
  - `mode`: Type of execution relative to caching (default: 'dependencies cache')
    - Options:
      - 'no caching'
      - 'dependencies cache'
      - 'dependencies cache - transforms cache'
      - 'local task cache'
      - 'local task cache + dependencies cache'
      - 'local task cache - transforms cache'
      - 'local task cache + dependencies cache - transforms cache'
      - 'remote task cache'
      - 'remote task cache + dependencies cache'
      - 'remote task cache - transforms cache'
      - 'remote task cache + dependencies cache - transforms cache'
  - `os_args`: Operating system configurations for variants (JSON string)
    - Default: `{variantA:'ubuntu-latest',variantB:'ubuntu-latest'}`
  - `java_args`: JDK vendor and version for each variant (JSON string)
    - Default: `{javaVersionVariantA:'17',javaVersionVariantB:'17',javaVendorVariantA:'zulu',javaVendorVariantB:'zulu'}`
  - `extra_build_args`: Extra build arguments for each variant (JSON string)
    - Default: `{extraArgsVariantA:' ',extraArgsVariantB:' '}`
  - `extra_report_args`: Configuration for generating reports (JSON string)
    - Default: `{deploy_results:'false',experiment_title:'', open_ai_request:'true', report_enabled:'true',tasktype_report:'true',taskpath_report:'true',kotlin_build_report:'false',process_report:'false',resource_usage_report:'true',gc_report:'false',only_cacheable_outcome:'false',threshold_task_duration:'1000'}`

## Report Action Inputs (`report/action.yaml`)

Inputs for generating and processing experiment reports.

- **Inputs**:
  - `task`: Gradle task that was executed
  - `experiment-id`: Unique identifier for the experiment
  - `tags`: Comma-separated list of experiment tags
  - `api-key`: Develocity API key
  - `url`: Develocity server URL
  - `gh_token`: GitHub token for repository access
  - `profile`: Whether this is a profile run (default: false)
  - `mode`: Type of execution mode used
  - `repository`: GitHub repository name
  - `run_id`: GitHub Actions run ID
  - `experiment_title`: Title for the experiment
  - `taskpathreport`: Enable task path report (true/false)
  - `tasktypereport`: Enable task type report (true/false)
  - `processreport`: Enable process report (true/false)
  - `gcreport`: Enable garbage collection report (true/false)
  - `kotlinreport`: Enable Kotlin build report (true/false)
  - `resourceusagereport`: Enable resource usage report (true/false)
  - `onlycacheableoutcome`: Include only cacheable outcomes (true/false)
  - `thresholdtaskduration`: Threshold for task duration in ms
  - `deploy_results`: Enable results deployment (true/false)
  - `open-ai-request`: Enable OpenAI request (true/false)
  - `open-ai-api-key`: OpenAI API key

## Runner Action Inputs (`runner/action.yaml`)

Inputs for executing Gradle builds in the experiment environment.

- **Inputs**:
  - `task`: Gradle task to execute
  - `mode`: Type of execution mode
  - `experiment-id`: Unique identifier for the experiment
  - `execution-number`: Execution number
  - `variant`: Branch name for the variant
  - `api-key`: Develocity API key
  - `cache-excludes`: Cache exclusion patterns
  - `cache-url`: Cache server URL
  - `repository`: GitHub repository name
  - `variant-prefix`: Prefix for variant identification
  - `extra-args`: Additional Gradle arguments
  - `jdk_version`: Java version to use
  - `jdk_vendor`: Java vendor to use

## Gradle Profiler Runner Action Inputs (`runner-gradle-profiler/action.yaml`)

Inputs for executing experiments using Gradle Profiler.

- **Inputs**:
  - `task`: Gradle task to execute
  - `mode`: Type of execution mode
  - `experiment-id`: Unique identifier for the experiment
  - `execution-number`: Execution number
  - `variant`: Branch name for the variant
  - `api-key`: Develocity API key
  - `repository`: GitHub repository name
  - `variant-prefix`: Prefix for variant identification
  - `extra-args`: Additional Gradle arguments
  - `jdk_version`: Java version to use
  - `jdk_vendor`: Java vendor to use
  - `class`: Classes to apply ABI changes

## JSON Format Examples

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
```json
{
  "extraArgsVariantA": "--no-daemon",
  "extraArgsVariantB": "--no-daemon --parallel"
}
```

### Extra Report Arguments (`extra_report_args`)
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