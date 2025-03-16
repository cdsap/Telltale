---
layout: post
title: "test"
date: 2025-03-16
report_link: /Telltale/reports/experiment_results_20250316163257.html
summary: " 
The comparison between the two Gradle build variants, `varianta_main_4g` and `variantb_main_6g`, shows minor differences in build times and task execution times. However, there are noticeable differences in CPU and memory usage. The `variantb_main_6g` variant shows lower memory usage across all processes, the build process, and build child processes. However, `variantb_main_6g` has slightly higher CPU usage for build child processes."
tags: ["dependencies cache"]
---

[Report 📊](../../reports/experiment_results_20250316163257.html)
## Summary
The comparison between the two Gradle build variants, `varianta_main_4g` and `variantb_main_6g`, shows minor differences in build times and task execution times. However, there are noticeable differences in CPU and memory usage. The `variantb_main_6g` variant shows lower memory usage across all processes, the build process, and build child processes. However, `variantb_main_6g` has slightly higher CPU usage for build child processes.

## Detailed Report

1. **Build Time Comparison**
   - The mean build times for `varianta_main_4g` and `variantb_main_6g` are 43.39s and 43.26s respectively, showing a negligible difference.
   - The P50 build times are 43.16s and 43.22s, and the P90 build times are 45.28s and 44.21s for `varianta_main_4g` and `variantb_main_6g` respectively.

2. **Task Type Differences**
   - The most time-consuming task is `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, with mean times of 8.58s and 8.55s for `varianta_main_4g` and `variantb_main_6g` respectively.
   - The tasks `:build-logic:convention:compileKotlin` and `:core:model:compileKotlin` also show minor differences in execution times between the two variants.

3. **Statistical Patterns**
   - The tasks do not show notable timing variations (>10%) between the two variants.

4. **Process State Analysis**
   - The maximum CPU usage for all processes is slightly higher for `variantb_main_6g` (96.7%) compared to `varianta_main_4g` (96.5%).
   - The maximum memory usage for all processes is lower for `variantb_main_6g` (3.9GB) compared to `varianta_main_4g` (4.22GB).

5. **CPU & Memory Usage Analysis**
   - The maximum CPU usage for the build process is similar for both variants, but `variantb_main_6g` shows higher CPU usage for build child processes.
   - The maximum memory usage is lower for `variantb_main_6g` across all processes, the build process, and build child processes.

6. **Garbage Collection Analysis**
   - This data is not available in the provided metrics.

7. **Kotlin Build Reports Analysis**
   - This data is not available in the provided metrics.

The report shows that `variantb_main_6g` performs slightly better in terms of memory usage, but with a minor increase in CPU usage for build child processes. The differences in build and task execution times between the two variants are negligible.
