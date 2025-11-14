---
layout: post
title: "AGP9-beta01 without builtInKotlin"
date: 2025-11-14
report_link: /Telltale/reports/experiment_results_20251114180631.html
summary: " 
The analysis of the Gradle build performance data reveals modest differences between the two variants, `varianta_agp_9_0_0_beta01` and `variantb_agp_9_0_0_beta01_no_builtInKotlin`. The overall build time for `varianta` averaged 560.768 seconds, slightly higher than `variantb` at 555.408 seconds, showing a minor improvement of about 0.96%. Configuration times were also close, with `varianta` averaging 56.552 seconds compared to `variantb` at 57.775 seconds. Notably, `variantb` shows a slight increase in configuration time by about 2.16%.

In terms of resource usage, `variantb` consistently used less memory across all processes, with a maximum of 11.71 GB compared to `varianta`'s 12.82 GB. CPU usage was nearly identical for both variants, maxing out at 100% for overall processes and hovering around 97% for the main build process.

The most time-consuming tasks across both variants included `:core:cart:kspDebugKotlin`, `:core:contact:kspDebugKotlin`, and `:core:comment:kspDebugKotlin`, with `varianta` generally taking slightly longer to execute these tasks."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20251114180631.html)
## Summary
The analysis of the Gradle build performance data reveals modest differences between the two variants, `varianta_agp_9_0_0_beta01` and `variantb_agp_9_0_0_beta01_no_builtInKotlin`. The overall build time for `varianta` averaged 560.768 seconds, slightly higher than `variantb` at 555.408 seconds, showing a minor improvement of about 0.96%. Configuration times were also close, with `varianta` averaging 56.552 seconds compared to `variantb` at 57.775 seconds. Notably, `variantb` shows a slight increase in configuration time by about 2.16%.

In terms of resource usage, `variantb` consistently used less memory across all processes, with a maximum of 11.71 GB compared to `varianta`'s 12.82 GB. CPU usage was nearly identical for both variants, maxing out at 100% for overall processes and hovering around 97% for the main build process.

The most time-consuming tasks across both variants included `:core:cart:kspDebugKotlin`, `:core:contact:kspDebugKotlin`, and `:core:comment:kspDebugKotlin`, with `varianta` generally taking slightly longer to execute these tasks.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** `varianta` 560.768s vs. `variantb` 555.408s (0.96% faster in `variantb`)
  - **P50:** `varianta` 554.198s vs. `variantb` 551.645s
  - **P90:** `varianta` 583.428s vs. `variantb` 585.019s

- **Configuration Time:**
  - **Mean:** `varianta` 56.552s vs. `variantb` 57.775s (2.16% slower in `variantb`)
  - **P50:** `varianta` 53.009s vs. `variantb` 56.424s
  - **P90:** `varianta` 69.263s vs. `variantb` 67.221s

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: `varianta` mean 2.067s vs. `variantb` mean 2.036s
  - `"com.google.devtools.ksp.gradle.KspAATask"`: `varianta` mean 3.501s vs. `variantb` mean 3.474s
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: `varianta` mean 2.172s vs. `variantb` mean 2.134s

### 3. Statistical Patterns
- Tasks with notable timing variations include `"com.android.build.gradle.internal.tasks.DexMergingTask"` and `"com.android.build.gradle.internal.tasks.DexArchiveBuilderTask"`, showing slight improvements in `variantb`.

### 4. CPU & Memory Usage Analysis
- **CPU Usage:**
  - **All processes:** Max 100% for both variants.
  - **Build process:** `varianta` max 97.02% vs. `variantb` max 97.06%.
  - **Build child processes:** `varianta` max 93.58% vs. `variantb` max 94.26%.

- **Memory Usage:**
  - **All processes:** `varianta` max 12.82 GB vs. `variantb` max 11.71 GB.
  - **Build process:** `varianta` max 8.31 GB vs. `variantb` max 7.43 GB.
  - **Build child processes:** `varianta` max 3.59 GB vs. `variantb` max 3.36 GB.

### 5. Garbage Collection Analysis
- **Gradle Process GC Time:** `varianta` mean 0.53 vs. `variantb` mean 0.54.
- **Kotlin Process GC Time:** `varianta` mean 0.20 vs. `variantb` mean 0.21.

The data suggests that while `variantb` offers slight improvements in build time and memory usage, the differences are relatively minor, indicating that both variants are optimized similarly with only marginal efficiency gains in `variantb`.
