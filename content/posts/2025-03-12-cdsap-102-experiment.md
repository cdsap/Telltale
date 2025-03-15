---
layout: post
title: "Comparing G1 vs Parallel in nowinandroid"
date: 2025-03-12
tags: ["Variants running with dependencies cache"]
report_link: /Telltale/reports/experiment_results_20250312033850.html
summary: "The analysis reveals that variantb_main_parallel was 6.27% faster (200.6s vs 214.0s) than varianta_main_g1. Key performance differences include lower memory usage (9.58GB vs 11.17GB) and fewer garbage collections. The most time-consuming tasks were KotlinCompile, LinkApplicationAndroidResourcesTask, and KspTaskJvm. Both variants showed 100% max CPU usage, but varianta_main_g1 used more memory across all processes. Garbage collection was more frequent in varianta_main_g1 with 69 vs 58 collections in gradle_gc.log."
---

## Benchmarks
[Report 🔍](../../reports/experiment_results_20250312033850.html)


## Detailed Report

The analysis of the Gradle build performance comparison data reveals several key differences between the two variants, `varianta_main_g1` and `variantb_main_parallel`. Overall, `variantb_main_parallel` had a faster build time, with a mean build time of 200,583ms compared to `varianta_main_g1`'s 213,976ms. The most time-consuming tasks across both variants were `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, `com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask`, and `com.google.devtools.ksp.gradle.KspTaskJvm`. In terms of resource usage, both variants had a maximum CPU usage of 100%, but `varianta_main_g1` used more memory, with a maximum of 11.17GB compared to `variantb_main_parallel`'s 9.58GB. Finally, `varianta_main_g1` had more total garbage collections than `variantb_main_parallel`.

<!--more--> 