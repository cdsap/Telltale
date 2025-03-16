---
layout: post
title: "Adding 4g"
date: 2025-03-16
report_link: /Telltale/reports/experiment_results_20250316023509.html
description: " 
The Gradle build performance comparison data shows minor differences between the two variants: varianata_main_4g and variantb_main_6g. The overall build time was slightly faster for variantb_main_6g. Task execution times were almost identical, with the most time-consuming tasks being the same for both variants. CPU usage was slightly higher for varianata_main_4g, while memory usage was slightly lower. "
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250316023509.html)
## Summary
The Gradle build performance comparison data shows minor differences between the two variants: varianata_main_4g and variantb_main_6g. The overall build time was slightly faster for variantb_main_6g. Task execution times were almost identical, with the most time-consuming tasks being the same for both variants. CPU usage was slightly higher for varianata_main_4g, while memory usage was slightly lower. 

## Detailed Report

1. **Build Time Comparison**
   - The mean build time for varianata_main_4g was 43.729 seconds, while for variantb_main_6g it was slightly lower at 43.477 seconds. This represents a small decrease of about 0.57%.
   - The P50 build time for varianata_main_4g was 43.810 seconds, and for variantb_main_6g it was 43.181 seconds, a decrease of 1.43%.
   - The P90 build time for varianata_main_4g was 44.807 seconds, while for variantb_main_6g it was higher at 48.178 seconds, an increase of about 7.52%.

2. **Task Type Differences**
   - The most time-consuming task for both variants was "org.jetbrains.kotlin.gradle.tasks.KotlinCompile", with mean execution times of 8.7 seconds for varianata_main_4g and 8.699 seconds for variantb_main_6g.
   - The second most time-consuming task was ":build-logic:convention:compileKotlin", with mean execution times of 12.191 seconds for varianata_main_4g and 12.226 seconds for variantb_main_6g.
   - The third most time-consuming task was ":core:model:compileKotlin", with mean execution times of 5.209 seconds for varianata_main_4g and 5.172 seconds for variantb_main_6g.

3. **CPU & Memory Usage Analysis**
   - The maximum CPU usage for all processes was slightly higher for varianata_main_4g (96.6%) compared to variantb_main_6g (96.3%).
   - The maximum memory usage for all processes was lower for varianata_main_4g (4.12 GB) compared to variantb_main_6g (3.96 GB).
   - The maximum CPU usage for the build process was slightly higher for varianata_main_4g (83.0%) compared to variantb_main_6g (82.3%).
   - The maximum memory usage for the build process was higher for varianata_main_4g (1.8 GB) compared to variantb_main_6g (1.55 GB).
   - The maximum CPU usage for build child processes was slightly higher for varianata_main_4g (87.5%) compared to variantb_main_6g (87.3%).
   - The maximum memory usage for build child processes was slightly higher for variantb_main_6g (1.37 GB) compared to varianata_main_4g (1.3 GB).
