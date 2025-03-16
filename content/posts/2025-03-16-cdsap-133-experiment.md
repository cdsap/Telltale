---
layout: post
title: "Comparing 4g vs 3g in nowinandroid without transforms"
date: 2025-03-16
report_link: /Telltale/reports/experiment_results_20250316184243.html
summary: " 
The build performance comparison between the two variants, `varianta_main_4g` and `variantb_main_3g`, shows minor differences. The overall build time is slightly higher in `variantb_main_3g` by 0.48%. The task `org.jetbrains.kotlin.gradle.tasks.KotlinCompile` has a negligible difference in execution time between the two variants. The most time-consuming task `:build-logic:convention:compileKotlin` also shows a marginal difference in execution times. In terms of CPU and memory usage, both variants have similar CPU usage, but `varianta_main_4g` uses more memory across all processes, the build process, and build child processes."
tags: ["dependencies cache - transforms cache"]
---
[Report 📊](../../reports/experiment_results_20250316184243.html)
## Summary
The build performance comparison between the two variants, `varianta_main_4g` and `variantb_main_3g`, shows minor differences. The overall build time is slightly higher in `variantb_main_3g` by 0.48%. The task `org.jetbrains.kotlin.gradle.tasks.KotlinCompile` has a negligible difference in execution time between the two variants. The most time-consuming task `:build-logic:convention:compileKotlin` also shows a marginal difference in execution times. In terms of CPU and memory usage, both variants have similar CPU usage, but `varianta_main_4g` uses more memory across all processes, the build process, and build child processes.

## Detailed Report

1. **Build Time Comparison**
   - The mean build time for `varianta_main_4g` is 66.938 seconds and for `variantb_main_3g` is 67.261 seconds, showing a slight increase of 0.48% in `variantb_main_3g`.
   - The P50 build time for `varianta_main_4g` is 67.118 seconds and for `variantb_main_3g` is 67.152 seconds.
   - The P90 build time for `varianta_main_4g` is 69.035 seconds and for `variantb_main_3g` is 70.419 seconds, indicating a higher build time in the 90th percentile for `variantb_main_3g`.

2. **Task Type Differences**
   - The most time-consuming tasks are `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, `:build-logic:convention:compileKotlin`, and `:core:model:compileKotlin`.
   - The `org.jetbrains.kotlin.gradle.tasks.KotlinCompile` task shows a negligible difference in execution times between the two variants.
   - The `:build-logic:convention:compileKotlin` task takes slightly longer in `variantb_main_3g` with a mean time of 17.575 seconds compared to 17.493 seconds in `varianta_main_4g`.
   - The `:core:model:compileKotlin` task shows a marginal difference in execution times between the two variants.

3. **CPU & Memory Usage Analysis**
   - The maximum CPU usage is the same for both variants at 100% for all processes.
   - `varianta_main_4g` uses more memory across all processes, with a maximum of 5.9GB compared to 5.2GB in `variantb_main_3g`.
   - The build process also consumes more memory in `varianta_main_4g` with a maximum of 3.58GB compared to 2.9GB in `variantb_main_3g`.
   - The build child processes in `varianta_main_4g` use slightly more memory with a maximum of 1.29GB compared to 1.25GB in `variantb_main_3g`.

Please note that the above analysis is based on the provided metrics. Additional metrics like Kotlin process state, Gradle process state, total GC collections, and Kotlin Build Reports were not provided and hence not included in the analysis.
