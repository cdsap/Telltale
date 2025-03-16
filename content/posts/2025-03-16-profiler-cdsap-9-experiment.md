---
layout: post
title: "Testing changes on nowinandroid with 4G and 6G"
date: 2025-03-16
report_link: /Telltale/reports/experiment_results_20250316212727.html
summary: " 
The build time for `varianta_main_6g` is slightly longer than `variantb_main_4g` by 586ms (2.5%). The most time-consuming tasks are `:app:hiltJavaCompileDemoDebug`, `:feature:foryou:kspProdDebugKotlin`, and `:feature:foryou:compileProdDebugKotlin`. The CPU usage is similar for both variants, but `varianta_main_6g` uses significantly more memory (up to 2.8GB more) in all processes."
tags: ["gradle-profiler"]
---
[Report 📊](../../reports/experiment_results_20250316212727.html)
## Summary
The build time for `varianta_main_6g` is slightly longer than `variantb_main_4g` by 586ms (2.5%). The most time-consuming tasks are `:app:hiltJavaCompileDemoDebug`, `:feature:foryou:kspProdDebugKotlin`, and `:feature:foryou:compileProdDebugKotlin`. The CPU usage is similar for both variants, but `varianta_main_6g` uses significantly more memory (up to 2.8GB more) in all processes.

## Detailed Report

**1. Build Time Comparison**
- `varianta_main_6g` has a mean build time of 23.49s, P50 of 23.63s, and P90 of 25.15s.
- `variantb_main_4g` has a mean build time of 22.90s, P50 of 22.79s, and P90 of 24.71s.
- `varianta_main_6g` takes 2.5% longer to build on average than `variantb_main_4g`.

**2. Task Type Differences**
- The three most time-consuming tasks for `varianta_main_6g` are `:app:hiltJavaCompileDemoDebug` (mean: 4.88s), `:feature:foryou:kspProdDebugKotlin` (mean: 2.91s), and `:feature:foryou:compileProdDebugKotlin` (mean: 3.09s).
- The three most time-consuming tasks for `variantb_main_4g` are `:app:hiltJavaCompileDemoDebug` (mean: 4.67s), `:feature:search:compileProdDebugKotlin` (mean: 3.11s), and `:feature:foryou:kspDemoDebugKotlin` (mean: 2.64s).
- `:app:hiltJavaCompileDemoDebug` and `:feature:foryou:kspProdDebugKotlin` take longer in `varianta_main_6g`, while `:feature:search:compileProdDebugKotlin` takes longer in `variantb_main_4g`.

**3. Statistical Patterns**
- The task `:feature:search:compileProdDebugKotlin` shows a notable timing variation, taking 32.7% longer in `variantb_main_4g`.
- `:feature:foryou:kspProdDebugKotlin` performs better in `variantb_main_4g`, with a 12.5% shorter execution time.

**5. CPU & Memory Usage Analysis**
- Both variants reach 100% CPU usage for all processes.
- `varianta_main_6g` uses more memory for all processes (max: 14.3GB) compared to `variantb_main_4g` (max: 11.5GB), a difference of 24.3%.
- The main Gradle process in `varianta_main_6g` uses up to 8.21GB of memory, while `variantb_main_4g` uses up to 5.9GB, a difference of 39.2%.
- For build child processes, `varianta_main_6g` uses up to 5.11GB of memory, while `variantb_main_4g` uses up to 4.41GB, a difference of 15.9%.
