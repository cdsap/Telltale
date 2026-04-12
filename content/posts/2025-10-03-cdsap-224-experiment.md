---
layout: post
title: "Gradle 9.2.0-rc-1 vs 9.1.0"
date: 2025-10-03
report_link: /Telltale/reports/experiment_results_20251003180446.html
summary: " 
The analysis of the Gradle build performance comparison between variant A (Gradle 9.1.0) and variant B (Gradle 9.2.0-rc-1) reveals subtle improvements in build efficiency in the newer version. The overall build time slightly decreased from 544.528 seconds in variant A to 542.012 seconds in variant B, a reduction of approximately 2.516 seconds (0.46%). Similarly, configuration time saw a reduction from 66.133 seconds to 64.152 seconds, improving by 1.981 seconds (3%). The most time-consuming tasks across both variants include `:build-logic:convention:compileKotlin`, `:core:analytics:kspDebugKotlin`, and `:core:calendar:kspDebugKotlin`, with minor variations in execution times between the variants.

CPU and memory usage remained nearly at capacity for both variants, with a maximum CPU usage of 100% and memory peaking around 11.6 GB. The garbage collection metrics indicate a slight decrease in total collections from 169 in variant A to 167 in variant B, suggesting marginally better memory management in the newer Gradle version."
tags: ["dependencies cache"]
components: ["gradle"]
---
[Report 📊](../../reports/experiment_results_20251003180446.html)
## Summary
The analysis of the Gradle build performance comparison between variant A (Gradle 9.1.0) and variant B (Gradle 9.2.0-rc-1) reveals subtle improvements in build efficiency in the newer version. The overall build time slightly decreased from 544.528 seconds in variant A to 542.012 seconds in variant B, a reduction of approximately 2.516 seconds (0.46%). Similarly, configuration time saw a reduction from 66.133 seconds to 64.152 seconds, improving by 1.981 seconds (3%). The most time-consuming tasks across both variants include `:build-logic:convention:compileKotlin`, `:core:analytics:kspDebugKotlin`, and `:core:calendar:kspDebugKotlin`, with minor variations in execution times between the variants.

CPU and memory usage remained nearly at capacity for both variants, with a maximum CPU usage of 100% and memory peaking around 11.6 GB. The garbage collection metrics indicate a slight decrease in total collections from 169 in variant A to 167 in variant B, suggesting marginally better memory management in the newer Gradle version.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Variant A: Mean = 544.528s, P50 = 543.839s, P90 = 560.934s
  - Variant B: Mean = 542.012s, P50 = 543.043s, P90 = 556.369s
  - **Reduction:** Mean = 2.516s (0.46%), P50 = 0.796s (0.15%), P90 = 4.565s (0.81%)

- **Configuration Time:**
  - Variant A: Mean = 66.133s, P50 = 64.745s, P90 = 68.875s
  - Variant B: Mean = 64.152s, P50 = 63.683s, P90 = 67.482s
  - **Reduction:** Mean = 1.981s (3%), P50 = 1.062s (1.64%), P90 = 1.393s (2.02%)

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean = 1611ms in A vs 1614ms in B
  - `"com.google.devtools.ksp.gradle.KspTaskJvm"`: Mean = 2730ms in A vs 2717ms in B
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: Mean = 2150ms in A vs 2097ms in B

### 3. Statistical Patterns
- Tasks such as `:build-logic:convention:compileKotlin` and `:core:analytics:kspDebugKotlin` show slight increases in execution time in variant B, while others like `:core:calendar:kspDebugKotlin` remain consistent across both variants.

### 4. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU: Max = 100% for both variants
  - Memory: Max = 11.54 GB in A vs 11.6 GB in B
- **Build Process:**
  - CPU: Max = 96.23% in A vs 96.37% in B
  - Memory: Max = 5.76 GB in A vs 5.83 GB in B
- **Build Child Processes:**
  - CPU: Max = 95.1% in A vs 95.22% in B
  - Memory: Max = 4.85 GB in A vs 4.84 GB in B

### 6. Garbage Collection Analysis
- Total GC collections slightly decreased from 169 in variant A to 167 in variant B, indicating a minor improvement in memory management.

Overall, the transition to Gradle 9.2.0-rc-1 shows marginal improvements in build time and configuration time, with consistent resource usage and slightly better garbage collection performance.
