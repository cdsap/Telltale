---
layout: post
title: "Ei it will work now?"
date: 2025-03-16
report_link: /Telltale/reports/experiment_results_20250316011557.html
description: " 
The Gradle build performance comparison between `varianta_main_4g` and `variantb_main_6g` shows minor differences. The overall build time is marginally faster in `variantb_main_6g` by about 0.7%. The most time-consuming tasks are similar across both variants, with minor differences in execution times. CPU usage is slightly higher in `variantb_main_6g` for all processes, but memory usage is lower. For the build process, CPU usage is slightly lower in `variantb_main_6g`, and memory usage is significantly lower by about 13.3%. For build child processes, CPU usage is slightly lower in `variantb_main_6g`, but memory usage is higher."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250316011557.html)
## Summary
The Gradle build performance comparison between `varianta_main_4g` and `variantb_main_6g` shows minor differences. The overall build time is marginally faster in `variantb_main_6g` by about 0.7%. The most time-consuming tasks are similar across both variants, with minor differences in execution times. CPU usage is slightly higher in `variantb_main_6g` for all processes, but memory usage is lower. For the build process, CPU usage is slightly lower in `variantb_main_6g`, and memory usage is significantly lower by about 13.3%. For build child processes, CPU usage is slightly lower in `variantb_main_6g`, but memory usage is higher.

## Detailed Report

1. **Build Time Comparison**
   - The mean build time for `varianta_main_4g` is 43.961 seconds, while for `variantb_main_6g` it is 43.644 seconds, making `variantb_main_6g` about 0.7% faster.
   - The P50 build time for `varianta_main_4g` is 43.661 seconds, and for `variantb_main_6g` it is 43.332 seconds.
   - The P90 build time for `varianta_main_4g` is 47.501 seconds, and for `variantb_main_6g` it is 45.808 seconds.

2. **Task Type Differences**
   - The task "org.jetbrains.kotlin.gradle.tasks.KotlinCompile" takes slightly longer in `variantb_main_6g` (mean: 8.707 seconds) compared to `varianta_main_4g` (mean: 8.643 seconds).
   - The task ":build-logic:convention:compileKotlin" also takes slightly longer in `variantb_main_6g` (mean: 12.293 seconds) compared to `varianta_main_4g` (mean: 12.110 seconds).
   - The task ":core:model:compileKotlin" takes slightly less time in `variantb_main_6g` (mean: 5.120 seconds) compared to `varianta_main_4g` (mean: 5.175 seconds).

3. **Statistical Patterns**
   - The tasks with notable timing variations are "org.jetbrains.kotlin.gradle.tasks.KotlinCompile" and ":build-logic:convention:compileKotlin".
   - For the task "org.jetbrains.kotlin.gradle.tasks.KotlinCompile", the P50 and P90 values are slightly higher in `variantb_main_6g`.
   - For the task ":build-logic:convention:compileKotlin", the P50 value is slightly lower in `variantb_main_6g`, but the P90 value is significantly higher.

4. **CPU & Memory Usage Analysis**
   - The maximum CPU usage for all processes is slightly higher in `variantb_main_6g` (96.5%) compared to `varianta_main_4g` (96.3%).
   - The maximum memory usage for all processes is lower in `variantb_main_6g` (3.95 GB) compared to `varianta_main_4g` (4.11 GB).
   - The maximum CPU usage for the build process is slightly lower in `variantb_main_6g` (82.8%) compared to `varianta_main_4g` (83.1%).
   - The maximum memory usage for the build process is significantly lower in `variantb_main_6g` (1.56 GB) compared to `varianta_main_4g` (1.8 GB).
   - The maximum CPU usage for build child processes is slightly lower in `variantb_main_6g` (87.1%) compared to `varianta_main_4g` (87.7%).
   - The maximum memory usage for build child processes is higher in `variantb_main_6g` (1.37 GB) compared to `varianta_main_4g` (1.29 GB).
