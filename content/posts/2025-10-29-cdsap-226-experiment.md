---
layout: post
title: "Gradle 9.2.0"
date: 2025-10-29
report_link: /Telltale/reports/experiment_results_20251029195925.html
summary: " 
The analysis of Gradle build performance between `varianta_gradle_9_2_0` and `variantb_gradle_9_1_0` reveals minor differences in build times, with `varianta_gradle_9_2_0` showing a slight improvement. The mean build time for `varianta` is approximately 539.9 seconds compared to `variantb` at 542.4 seconds, a decrease of about 0.47%. Configuration times also show a marginal improvement in `varianta` with a mean time of 64.49 seconds versus 65.92 seconds for `variantb`, reflecting a 2.17% decrease. The most time-consuming tasks across both variants include `:build-logic:convention:compileKotlin`, `:core:account:kspDebugKotlin`, and `:core:analytics:kspDebugKotlin`, with `varianta` generally performing slightly better. Memory and CPU usage are nearly identical for both variants, with maximum values reaching up to 11.59 GB and 100% CPU usage respectively. Garbage collection activities are also comparable, with total collections close between the two variants."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20251029195925.html)
## Summary
The analysis of Gradle build performance between `varianta_gradle_9_2_0` and `variantb_gradle_9_1_0` reveals minor differences in build times, with `varianta_gradle_9_2_0` showing a slight improvement. The mean build time for `varianta` is approximately 539.9 seconds compared to `variantb` at 542.4 seconds, a decrease of about 0.47%. Configuration times also show a marginal improvement in `varianta` with a mean time of 64.49 seconds versus 65.92 seconds for `variantb`, reflecting a 2.17% decrease. The most time-consuming tasks across both variants include `:build-logic:convention:compileKotlin`, `:core:account:kspDebugKotlin`, and `:core:analytics:kspDebugKotlin`, with `varianta` generally performing slightly better. Memory and CPU usage are nearly identical for both variants, with maximum values reaching up to 11.59 GB and 100% CPU usage respectively. Garbage collection activities are also comparable, with total collections close between the two variants.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** `varianta`: 539.9s, `variantb`: 542.4s (0.47% faster in `varianta`)
  - **P50:** `varianta`: 537.0s, `variantb`: 541.8s
  - **P90:** `varianta`: 560.1s, `variantb`: 566.9s

- **Configuration Time:**
  - **Mean:** `varianta`: 64.49s, `variantb`: 65.92s (2.17% faster in `varianta`)
  - **P50:** `varianta`: 63.81s, `variantb`: 65.60s
  - **P90:** `varianta`: 69.06s, `variantb`: 70.41s

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean times are identical at 1604ms for both variants.
  - `"com.google.devtools.ksp.gradle.KspTaskJvm"`: Slightly longer in `variantb` with a mean of 2727ms compared to 2719ms in `varianta`.
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: `varianta` is slightly faster with a mean of 2135ms compared to 2107ms in `variantb`.

### 3. Statistical Patterns
- Tasks such as `:build-logic:convention:compileKotlin` and `:core:account:kspDebugKotlin` show better performance in `varianta` across mean, P50, and P90 metrics, suggesting more consistent build times in `varianta`.

### 4. Process State Analysis
- **Kotlin Process State:**
  - **GC Time:** Both variants show minimal differences, with `varianta` at 0.49 and `variantb` at 0.50.

- **Gradle Process State:**
  - **GC Time:** Identical at 0.21 for both variants, with a slight increase at P90 for `variantb`.

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - **CPU Usage:** Maxed at 100% for both variants.
  - **Memory Usage:** Max of 11.59 GB for both, with slight variations in P50 and P90 values.

- **Build Process:**
  - **CPU Usage:** Slightly higher in `varianta` with a max of 97% compared to 96% in `variantb`.
  - **Memory Usage:** `varianta` uses slightly more, peaking at 5.84 GB compared to 5.80 GB in `variantb`.

- **Build Child Processes:**
  - **CPU Usage:** Nearly identical, peaking at 96%.
  - **Memory Usage:** `varianta` uses slightly less, with a max of 4.81 GB compared to 4.86 GB in `variantb`.

### 6. Garbage Collection Analysis
- **Total GC Collections:** Very close, with `varianta` at 165 and `variantb` at 168 collections.

This analysis highlights the minor improvements in build performance and efficiency in `varianta_gradle_9_2_0` compared to `variantb_gradle_9_1_0`, particularly in configuration times and some key tasks, although both variants show similar resource usage and garbage collection metrics.
