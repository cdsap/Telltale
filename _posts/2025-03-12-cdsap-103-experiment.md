---
layout: post
title: "Comparing G1 vs Parallel in nowinandroid"
date: 2025-03-12
report_link: /Telltale/reports/experiment_results_20250312033850.html
description: " 
The analysis of the Gradle build performance comparison data reveals several key differences between the two variants, `varianta_main_g1` and `variantb_main_parallel`. Overall, `variantb_main_parallel` had a faster build time, with a mean build time of 200,583ms compared to `varianta_main_g1`'s 213,976ms. The most time-consuming tasks across both variants were `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, `com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask`, and `com.google.devtools.ksp.gradle.KspTaskJvm`. In terms of resource usage, both variants had a maximum CPU usage of 100%, but `varianta_main_g1` used more memory, with a maximum of 11.17GB compared to `variantb_main_parallel`'s 9.58GB. Finally, `varianta_main_g1` had more total garbage collections than `variantb_main_parallel`."
tags: "Variants running with dependencies cache"
---
[📊 View Full Report]({{ page.report_link }}){: .report-link}
## Summary
The analysis of the Gradle build performance comparison data reveals several key differences between the two variants, `varianta_main_g1` and `variantb_main_parallel`. Overall, `variantb_main_parallel` had a faster build time, with a mean build time of 200,583ms compared to `varianta_main_g1`'s 213,976ms. The most time-consuming tasks across both variants were `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, `com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask`, and `com.google.devtools.ksp.gradle.KspTaskJvm`. In terms of resource usage, both variants had a maximum CPU usage of 100%, but `varianta_main_g1` used more memory, with a maximum of 11.17GB compared to `variantb_main_parallel`'s 9.58GB. Finally, `varianta_main_g1` had more total garbage collections than `variantb_main_parallel`.

## Detailed Report

1. **Build Time Comparison**
   - The mean build time for `varianta_main_g1` was 213.976 seconds, while for `variantb_main_parallel` it was 200.583 seconds. This indicates that `variantb_main_parallel` was approximately 6.27% faster.
   - The P50 (median) build times were 213.017 seconds for `varianta_main_g1` and 198.736 seconds for `variantb_main_parallel`, a difference of approximately 6.69%.
   - The P90 build times were 221.042 seconds for `varianta_main_g1` and 207.289 seconds for `variantb_main_parallel`, a difference of approximately 6.22%.

2. **Task Type Differences**
   - The top 3 most time-consuming tasks for both variants were `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, `com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask`, and `com.google.devtools.ksp.gradle.KspTaskJvm`.
   - For `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, the mean execution times were 3.925 seconds for `varianta_main_g1` and 3.668 seconds for `variantb_main_parallel`, a difference of approximately 6.55%.
   - For `com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask`, the mean execution times were 1.453 seconds for `varianta_main_g1` and 1.358 seconds for `variantb_main_parallel`, a difference of approximately 6.54%.
   - For `com.google.devtools.ksp.gradle.KspTaskJvm`, the mean execution times were 3.676 seconds for `varianta_main_g1` and 3.501 seconds for `variantb_main_parallel`, a difference of approximately 4.76%.

3. **Statistical Patterns**
   - The tasks with notable timing variations (>10% difference) between the two variants include `com.android.build.gradle.internal.tasks.DexMergingTask`, `com.android.build.gradle.internal.tasks.JacocoTask`, `com.android.build.gradle.internal.tasks.DexArchiveBuilderTask`, and `com.android.build.gradle.tasks.PackageApplication`.
   - For these tasks, `variantb_main_parallel` consistently performed better, with faster execution times.

4. **Process State Analysis**
   - The data for Kotlin Process State and Gradle Process State is not available.

5. **CPU & Memory Usage Analysis**
   - For all processes, both variants had a maximum CPU usage of 100%.
   - The maximum memory usage for all processes was higher for `varianta_main_g1` at 11.17GB, compared to 9.58GB for `variantb_main_parallel`.
   - For the build process, both variants had a maximum CPU usage of 93.25%. The maximum memory usage was slightly higher for `varianta_main_g1` at 5.38GB, compared to 5.19GB for `variantb_main_parallel`.
   - For build child processes, both variants had a maximum CPU usage of 92.32%. However, `varianta_main_g1` had a significantly higher maximum memory usage at 4.78GB, compared to 3.36GB for `variantb_main_parallel`.

6. **Garbage Collection Analysis**
   - `varianta_main_g1` had more total garbage collections than `variantb_main_parallel`, with 69 collections compared to 58 collections in `gc-gradle_gc.log`, and 43 collections compared to 34 collections in `gc-kotlin_gc.log`.

7. **Kotlin Build Reports Analysis**
   - The data for Kotlin Build Reports Analysis is not available.

8. **Summary and Formatting Requirements**
   - This report has been formatted according to the provided requirements, with tasks and task types in quotes for better readability. The observations are factual, numerical, and focus on differences between the two variants.
