---
layout: post
title: "Reducing parallelization of Kotlin compiler to 3 workers in nowinandroid"
date: 2025-03-18
report_link: /Telltale/reports/experiment_results_20250318005824.html
summary: " 
The Gradle build performance comparison shows that the build times between the two variants are almost identical with a mean difference of just 99ms (0.05%). The variant with the Kotlin compiler and 3 workers (variantb_kotlin_compiler_3_workers) has slightly higher P90 values in most tasks, indicating that it might be slower in worst-case scenarios. The most time-consuming tasks across both variants are `:app:l8DexDesugarLibDemoDebug`, `:app:mergeExtDexDemoDebug`, and `:core:designsystem:compileDemoDebugKotlin`. Notably, the `:app:mergeExtDexDemoDebug` task is faster in variantb_kotlin_compiler_3_workers by 10.3%. CPU and memory usage are almost identical between the two variants."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250318005824.html)
## Summary
The Gradle build performance comparison shows that the build times between the two variants are almost identical with a mean difference of just 99ms (0.05%). The variant with the Kotlin compiler and 3 workers (variantb_kotlin_compiler_3_workers) has slightly higher P90 values in most tasks, indicating that it might be slower in worst-case scenarios. The most time-consuming tasks across both variants are `:app:l8DexDesugarLibDemoDebug`, `:app:mergeExtDexDemoDebug`, and `:core:designsystem:compileDemoDebugKotlin`. Notably, the `:app:mergeExtDexDemoDebug` task is faster in variantb_kotlin_compiler_3_workers by 10.3%. CPU and memory usage are almost identical between the two variants.

## Detailed Report

- **1. Build Time Comparison**
  - The mean build time for varianata_main_4_workers is 214.811 seconds, and for variantb_kotlin_compiler_3_workers, it's 214.910 seconds, a difference of just 0.05%.
  - The P50 build time for varianata_main_4_workers is 214.793 seconds, and for variantb_kotlin_compiler_3_workers, it's 211.012 seconds.
  - The P90 build time for varianata_main_4_workers is 222.305 seconds, and for variantb_kotlin_compiler_3_workers, it's 226.064 seconds.

- **2. Task Type Differences**
  - The top 3 most time-consuming tasks for varianata_main_4_workers are `:app:l8DexDesugarLibDemoDebug` (mean: 38.913s, P50: 38.929s, P90: 40.953s), `:app:mergeExtDexDemoDebug` (mean: 42.945s, P50: 43.175s, P90: 44.574s), and `:core:designsystem:compileDemoDebugKotlin` (mean: 18.086s, P50: 18.136s, P90: 19.767s).
  - For variantb_kotlin_compiler_3_workers, the most time-consuming tasks are `:app:l8DexDesugarLibDemoDebug` (mean: 35.927s, P50: 35.193s, P90: 39.030s), `:app:mergeExtDexDemoDebug` (mean: 38.511s, P50: 38.410s, P90: 41.645s), and `:core:designsystem:compileDemoDebugKotlin` (mean: 18.658s, P50: 18.406s, P90: 19.826s).
  - Notably, the `:app:mergeExtDexDemoDebug` task is faster in variantb_kotlin_compiler_3_workers by 10.3%.

- **3. Statistical Patterns**
  - The tasks with notable timing variations (>10% difference) between the two variants are `:app:mergeExtDexDemoDebug` (10.3% faster in variantb_kotlin_compiler_3_workers), `:core:data:compileDemoDebugKotlin` (35.3% faster in variantb_kotlin_compiler_3_workers), and `:core:domain:bundleLibCompileToJarDemoDebug` (49.0% faster in variantb_kotlin_compiler_3_workers).
  - For these tasks, variantb_kotlin_compiler_3_workers generally performs better.

- **4. Process State Analysis**
  - **Kotlin Process State:** The mean GC time for varianata_main_4_workers is 0.09, and for variantb_kotlin_compiler_3_workers, it's 0.11.
  - **Gradle Process State:** The mean GC time for varianata_main_4_workers is 0.13, and for variantb_kotlin_compiler_3_workers, it's 0.13.

- **5. CPU & Memory Usage Analysis**
  - **All processes (overall system usage):** The maximum CPU usage was 100% for both variants. The maximum memory usage was 11.01GB for varianata_main_4_workers and 11.02GB for variantb_kotlin_compiler_3_workers.
  - **The build process (main Gradle process):** The maximum CPU usage was 93.5% for varianata_main_4_workers and 93.18% for variantb_kotlin_compiler_3_workers. The maximum memory usage was 5.37GB for varianata_main_4_workers and 5.33GB for variantb_kotlin_compiler_3_workers.
  - **Build child processes:** The maximum CPU usage was 92.34% for varianata_main_4_workers and 86.98% for variantb_kotlin_compiler_3_workers. The maximum memory usage was 4.61GB for varianata_main_4_workers and 4.67GB for variantb_kotlin_compiler_3_workers.

- **6. Garbage Collection Analysis**
  - The total GC collections for varianata_main_4_workers was 69, and for variantb_kotlin_compiler_3_workers, it was 72 for the Gradle process. For the Kotlin process, it was 44 for varianata_main_4_workers and 49 for variantb_kotlin_compiler_3_workers.

- **7. Kotlin Build Reports Analysis**
  - **Compiler Execution Stages Comparison:** The time spent in compiler code analysis, IR translation, and generation was generally higher for variantb_kotlin_compiler_3_workers.
  - **Incremental Compilation Insights:** The time spent in incremental compilation in the daemon and run compilation was also higher for variantb_kotlin_compiler_3_workers.
  - **Classpath and Cache Insights:** The size of the classpath snapshot was the same for both variants. The number of cache hits when loading classpath entry snapshots was also the same for both variants.
  - **Compilation Performance Metrics:** The number of lines analyzed and for code generation was the same for both variants. However, the analysis lines per second and code generation lines per second were higher for varianata_main_4_workers.
  - **Comparison Across Variants:** There are no major improvements or regressions. The differences between the two variants are minor.
