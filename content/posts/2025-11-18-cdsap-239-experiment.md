---
layout: post
title: "AGP9-beta01 with builtInKotlin"
date: 2025-11-18
report_link: /Telltale/reports/experiment_results_20251118202114.html
summary: " 
The performance comparison between two Gradle build variants, `varianta_agp_9_0_0_beta01_no_builtInKotlin` and `variantb_agp_9_0_0_beta01_builtInKotlin`, reveals minor differences in build times and task execution. The overall build time for variant A averages 555.578 seconds, slightly longer than variant B's 551.235 seconds. Notably, the configuration time for variant A is also higher at 55.243 seconds compared to 52.432 seconds for variant B. The most time-consuming tasks across both variants include `:core:cart:kspDebugKotlin`, `:core:contact:kspDebugKotlin`, and `:core:comment:kspDebugKotlin`, with marginal differences in execution times between the two variants. CPU and memory usage are nearly identical for both variants, with maximum values reaching up to 100% CPU usage and 11.78 GB of memory for all processes."
tags: ["dependencies cache"]
components: ["agp"]
---
[Report 📊](../../reports/experiment_results_20251118202114.html)
## Summary
The performance comparison between two Gradle build variants, `varianta_agp_9_0_0_beta01_no_builtInKotlin` and `variantb_agp_9_0_0_beta01_builtInKotlin`, reveals minor differences in build times and task execution. The overall build time for variant A averages 555.578 seconds, slightly longer than variant B's 551.235 seconds. Notably, the configuration time for variant A is also higher at 55.243 seconds compared to 52.432 seconds for variant B. The most time-consuming tasks across both variants include `:core:cart:kspDebugKotlin`, `:core:contact:kspDebugKotlin`, and `:core:comment:kspDebugKotlin`, with marginal differences in execution times between the two variants. CPU and memory usage are nearly identical for both variants, with maximum values reaching up to 100% CPU usage and 11.78 GB of memory for all processes.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** Variant A: 555.578s, Variant B: 551.235s (0.78% faster)
  - **P50:** Variant A: 555.926s, Variant B: 548.106s
  - **P90:** Variant A: 577.289s, Variant B: 578.102s

- **Configuration Time:**
  - **Mean:** Variant A: 55.243s, Variant B: 52.432s (5.08% faster)
  - **P50:** Variant A: 55.285s, Variant B: 52.452s
  - **P90:** Variant A: 58.788s, Variant B: 55.780s

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean times are 2058ms for Variant A and 2051ms for Variant B.
  - `"com.google.devtools.ksp.gradle.KspAATask"`: Mean times are 3476ms for Variant A and 3462ms for Variant B.
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: Mean times are 2187ms for Variant A and 2170ms for Variant B.

### 3. Statistical Patterns
- Tasks like `:core:cart:kspDebugKotlin`, `:core:contact:kspDebugKotlin`, and `:core:comment:kspDebugKotlin` show marginal differences in execution times between the two variants, with all differences below 10%.

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - **CPU Usage:** Max 100% for both variants.
  - **Memory Usage:** Max 11.78 GB for Variant A and 11.73 GB for Variant B.

- **Build Process:**
  - **CPU Usage:** Max 97.1% for Variant A and 97.04% for Variant B.
  - **Memory Usage:** Max 7.43 GB for Variant A and 7.42 GB for Variant B.

- **Build Child Processes:**
  - **CPU Usage:** Max 94.04% for Variant A and 93.82% for Variant B.
  - **Memory Usage:** Max 3.42 GB for Variant A and 3.40 GB for Variant B.

The analysis indicates that both variants perform similarly with slight advantages in build and configuration times for variant B. The differences in task execution times are minimal, suggesting that both configurations are optimized similarly for performance.
