# Telltale
Telltale is an experimentation framework for Gradle builds that automates the creation of experimental environments, the execution of different experiment variants, and the visualization of experiment results.

<img alt="Summary" src="resources/experiment-diagram.png"/>

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
  - [Experiment](#experiment)
  - [Experiment with Gradle Profiler](#experiment-with-gradle-profiler)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Overview
This repository contains GitHub Actions workflows that serve as an experimentation framework for comparing two variants executing Gradle builds.
These workflows are designed to automate the testing and reporting of Gradle builds within different caching and execution modes. They help in understanding the performance impact of various configurations by running experiments on specified branches and comparing the results.
The workflow experiment execution consists of different phases:
<img alt="Summary" src="resources/experiment_execution.png"/>

## Website

If deployment is configured (by setting `extra_report_args.deploy_results: 'true'`), the results of your experiments will be automatically published to [https://cdsap.github.io/Telltale/](https://cdsap.github.io/Telltale/).

## Workflows

### Experiment

This workflow executes Gradle tasks across two specified variants (branches) with different caching configurations. It helps to compare performance between different execution modes.

- **Inputs**:
  - `repository`:
    - **Description**: The GitHub repository where the experiment will run.
    - **Default**: `cdsap/ExperimentGradle8.9`
  - `variantA`:
    - **Description**: Experiment branch name for variant A.
    - **Default**: `gradle_8_9_no_caching_transforms`
  - `variantB`:
    - **Description**: Experiment branch name for variant B.
    - **Default**: `gradle_8_9_no_caching_transforms`
  - `task`:
    - **Description**: The Gradle task to execute.
    - **Default**: `:core:model:compileKotlin`
  - `iterations`:
    - **Description**: Number of iterations for each experiment run.
    - **Default**: `10`
  - `mode`:
    - **Description**: Specifies the level and type of caching used during the experiment to evaluate its impact on performance. Caching modes can be adjusted to test different scenarios, including no caching, dependency caching, task caching (local or remote), and combinations with transform caches.
    - **Type**: `choice`
    - **Default**: `dependencies cache`
    - **Options**:
      - `no caching`: Disables all forms of caching.
      - `dependencies cache`: Caches dependencies only, without caching task outputs.
      - `dependencies cache - transforms cache`: Caches dependencies, excluding the transforms cache.
      - `local task cache`: Enables caching of task outputs locally.
      - `local task cache + dependencies cache`: Combines local task caching with dependency caching.
      - `local task cache - transforms cache`: Caches task outputs locally, excluding transforms cache.
      - `local task cache + dependencies cache - transforms cache`: Combines local task, dependency caching, and excludes transforms.
      - `remote task cache`: Uses a remote server to cache task outputs.
      - `remote task cache + dependencies cache`: Combines remote task caching with dependency caching.
      - `remote task cache - transforms cache`: Caches task outputs remotely, excluding transforms cache.
      - `remote task cache + dependencies cache - transforms cache`: Combines remote task, dependency caching, and excludes transforms.
      
  - `os_args`:
    - **Description**: Defines the operating system settings for each variant, specifying which OS image to use during workflow execution. This is useful for testing builds across different environments.
    - **Type**: `string`
    - **Default**: `{variantA:'ubuntu-latest',variantB:'ubuntu-latest'}`
    - **Format**: A JSON string specifying the OS for each variant.

  - `java_args`:
    - **Description**: Specifies the Java Development Kit (JDK) versions and vendors for each variant, allowing testing with different Java runtime environments.
    - **Type**: `string`
    - **Default**: `{javaVersionVariantA:'17',javaVersionVariantB:'17',javaVendorVariantA:'zulu',javaVendorVariantB:'zulu'}`
    - **Format**: A JSON string with Java version and vendor settings for each variant.

  - `extra_build_args`:
    - **Description**: Allows passing extra arguments to the Gradle command for each variant, providing flexibility to modify the build configuration as needed.
    - **Type**: `string`
    - **Default**: `{extraArgsVariantA:' ',extraArgsVariantB:' '}`
    - **Format**: A JSON string with extra arguments for each variant.

  - `extra_report_args`:
    - **Description**: Configures which reports to generate after the experiment, allowing enabling or disabling specific types of reports such as task path reports, process reports, Kotlin build reports, and resource usage reports.
    - **Type**: `string`
    - **Default**: `{deploy_results:'false',experiment_title:'', open_ai_request:'true', report_enabled:'true',tasktype_report:'true',taskpath_report:'true',kotlin_build_report:'false',process_report:'false',resource_usage_report:'true',gc_report:'false',only_cacheable_outcome:'false',threshold_task_duration:'1000'}`
    - **Format**: A JSON string with boolean flags for each report type.
    - **Options (keys in the JSON string)**:
      - `deploy_results`: Enable or disable deployment of results to https://cdsap.github.io/Telltale/ (`'true'` or `'false'`).
      - `experiment_title`: Title for the experiment (string).
      - `open_ai_request`: Enable or disable OpenAI request (`'true'` or `'false'`).
      - `report_enabled`: Enable or disable report generation (`'true'` or `'false'`).
      - `tasktype_report`: Include task type reports (`'true'` or `'false'`).
      - `taskpath_report`: Include task path reports (`'true'` or `'false'`).
      - `kotlin_build_report`: Include Kotlin build reports (`'true'` or `'false'`). Requires [Kotlin Build Reports](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/).
      - `process_report`: Include process-related reports (`'true'` or `'false'`). Requires [InfoKotlinProcess](https://github.com/cdsap/InfoKotlinProcess) and [InfoGradleProcess](https://github.com/cdsap/InfoGradleProcess).
      - `resource_usage_report`: Include resource usage reports (`'true'` or `'false'`). Requires builds using Develocity 2024.2.
      - `gc_report`: Include garbage collection reports (`'true'` or `'false'`).
      - `only_cacheable_outcome`: Include only cacheable outcomes in the report (`'true'` or `'false'`).
      - `threshold_task_duration`: Threshold of task duration (ms) for the task path report (e.g., `'1000'`).

### Experiment with Gradle Profiler

Instead of using agents based on experiment iterations, the Gradle Profiler experiment uses gradle-profiler to orchestrate experiment execution, enabling benchmarking of build scenarios with customizable iterations and ABI changes. It generates a report based on the results.

- **Inputs**:
  - `repository`:
    - **Description**: The GitHub repository where the experiment will run.
    - **Required**: `true`
    - **Default**: `cdsap/ExperimentGradle8.9`
  - `variantA`:
    - **Description**: Experiment branch name for variant A.
    - **Required**: `true`
    - **Default**: `gradle_8_9_no_caching_transforms`
  - `variantB`:
    - **Description**: Experiment branch name for variant B.
    - **Required**: `true`
    - **Default**: `gradle_8_9_no_caching_transforms`
  - `task`:
    - **Description**: The Gradle task to execute.
    - **Required**: `true`
    - **Default**: `:core:model:compileKotlin`
  - `class`:
    - **Description**: List of classes separated by ',' to be applied as ABI scenario.
    - **Required**: `false`
  - `iterations`:
    - **Description**: Number of iterations for the experiment.
    - **Required**: `false`
    - **Default**: `5`
  - `os_args`:
    - **Description**: Operating system configurations for variants.
    - **Type**: `string`
    - **Required**: `false`
    - **Default**: `{variantA:'ubuntu-latest',variantB:'ubuntu-latest'}`
  - `java_args`:
    - **Description**: JDK vendor and version for each variant.
    - **Type**: `string`
    - **Required**: `false`
    - **Default**: `{javaVersionVariantA:'17',javaVersionVariantB:'17',javaVendorVariantA:'zulu',javaVendorVariantB:'zulu'}`
  - `extra_build_args`:
    - **Description**: Extra build arguments for each variant.
    - **Type**: `string`
    - **Required**: `false`
    - **Default**: `{extraArgsVariantA:' ',extraArgsVariantB:' '}`
  - `extra_report_args`:
    - **Description**: Configuration for generating reports. (See `extra_report_args` in the "Experiment" workflow section for details on sub-options.)
    - **Type**: `string`
    - **Required**: `false`
    - **Default**: `{deploy_results:'false',experiment_title:'',open_ai_request:'true',report_enabled:'true',tasktype_report:'true',taskpath_report:'true',kotlin_build_report:'false',process_report:'false',resource_usage_report:'true',gc_report:'false',only_cacheable_outcome:'false',threshold_task_duration:'1000'}`

## Individual Action Inputs
[Action inputs](docs/actions-inputs.md)

### Report
If `extra_report_args` defines `report_enabled: 'true'`, a list of reports will be generated at the end of the variant experiments. The report is generated using https://github.com/cdsap/BuildExperimentResults

<img alt="Summary" src="resources/summary.png"/>

## Setup

To use these workflows, ensure the following prerequisites are met:

1. Clone this repository

2. Configure Repository Secrets:
   To enable all features of the Telltale workflows, you may need to configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

   - **`DV_ACCESS_KEY`**:
     - **Purpose**: Access key for your Develocity server, used to publish build scans.
     - **When Needed**: Required if you are integrating your builds with Develocity.
     - **More Info**: See [Develocity Authentication](https://docs.gradle.com/develocity/gradle-plugin/current/#authenticating).

   - **`DV_URL`**:
     - **Purpose**: URL of your Develocity server (e.g., `https://yourcompany.gradle.com`).
     - **When Needed**: Required if you are integrating your builds with Develocity.

   - **`DV_API_KEY`**:
     - **Purpose**: Develocity API access key. This key is used by the reporting features to fetch build data from your Develocity server for comparison and analysis.
     - **When Needed**: Required if `extra_report_args.report_enabled: 'true'` is set in the workflow inputs.
     - **More Info**: See [Develocity API Access Control](https://docs.gradle.com/develocity/api-manual/#access_control).

   - **`OPEN_API_KEY`**:
     - **Purpose**: API key for OpenAI services.
     - **When Needed**: Optional. Used if `extra_report_args.open_ai_request: 'true'` is set in the workflow inputs to generate an AI-powered analysis and title for the experiment results.

   - **`GH_BUILD_DEPLOYMENT`**:
     - **Purpose**: GitHub Personal Access Token (PAT). This token is used to trigger a separate workflow that deploys the generated experiment report to the Telltale GitHub Pages website.
     - **When Needed**: Optional. Used if `extra_report_args.deploy_results: 'true'` is set to publish results to the central [Telltale website](https://cdsap.github.io/Telltale/). The PAT needs permissions to trigger repository dispatches on the `cdsap/Telltale` repository (typically `repo` scope, or `actions:write` if fine-grained PATs are used for this).
     - **Note**: If you are not deploying to the `cdsap/Telltale` GitHub Pages, or are using a custom deployment, this specific secret might not be applicable or might be a different token.

   - **`CI_URL_CACHE_NODE`**:
     - **Purpose**: URL of your remote build cache node (e.g., a Gradle Build Cache node or a Develocity remote cache node URL).
     - **When Needed**: Optional. Used by the workflows if your experiment `mode` involves remote caching (e.g., `remote task cache`, `remote task cache + dependencies cache`). This enables experiments to leverage a shared remote cache.

## Usage

1. Trigger any of the workflows via the GitHub Actions tab in your repository.
2. Select the desired input parameters, such as branches, tasks, iterations, and caching modes.
3. Monitor the workflow's progress in the GitHub Actions logs.
4. Review the generated reports and artifacts for insights into build performance and caching effects.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
