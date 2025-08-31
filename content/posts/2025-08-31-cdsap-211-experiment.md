---
layout: post
title: "JDK 17 vs 21"
date: 2025-08-31
report_link: /Telltale/reports/experiment_results_20250831165451.html
summary: " 
The analysis of the Gradle build performance between `varianta_jdk_17` and `variantb_jdk_21` reveals several key insights. The overall build time for `varianta_jdk_17` averages 396.626 seconds, while `variantb_jdk_21` is slightly faster at 381.929 seconds, showing a reduction of approximately 14.697 seconds (3.7%). The configuration times are very close, with `varianta_jdk_17` averaging 44.278 seconds and `variantb_jdk_21` at 43.845 seconds. Notably, the most time-consuming tasks across both variants include `:core:cart:compileDebugKotlin`, `:core:identity:compileDebugKotlin`, and `:core:contact:compileDebugKotlin`, with `variantb_jdk_21` generally performing better in these areas. Memory usage is higher in `variantb_jdk_21` across all processes, with a maximum of 10.84 GB compared to 10.31 GB in `varianta_jdk_17`. CPU usage is nearly maxed out for both variants. The total garbage collection counts are slightly higher in `variantb_jdk_21` with 139 collections compared to 131 in `varianta_jdk_17`."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250831165451.html)
## Summary
The analysis of the Gradle build performance between `varianta_jdk_17` and `variantb_jdk_21` reveals several key insights. The overall build time for `varianta_jdk_17` averages 396.626 seconds, while `variantb_jdk_21` is slightly faster at 381.929 seconds, showing a reduction of approximately 14.697 seconds (3.7%). The configuration times are very close, with `varianta_jdk_17` averaging 44.278 seconds and `variantb_jdk_21` at 43.845 seconds. Notably, the most time-consuming tasks across both variants include `:core:cart:compileDebugKotlin`, `:core:identity:compileDebugKotlin`, and `:core:contact:compileDebugKotlin`, with `variantb_jdk_21` generally performing better in these areas. Memory usage is higher in `variantb_jdk_21` across all processes, with a maximum of 10.84 GB compared to 10.31 GB in `varianta_jdk_17`. CPU usage is nearly maxed out for both variants. The total garbage collection counts are slightly higher in `variantb_jdk_21` with 139 collections compared to 131 in `varianta_jdk_17`.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - `varianta_jdk_17`: Mean = 396.626s, P50 = 391.789s, P90 = 424.128s
  - `variantb_jdk_21`: Mean = 381.929s, P50 = 379.035s, P90 = 403.575s
  - **Reduction**: Mean = 14.697s (3.7%), P50 = 12.754s (3.3%), P90 = 20.553s (4.8%)

- **Configuration Time:**
  - `varianta_jdk_17`: Mean = 44.278s, P50 = 44.064s, P90 = 47.542s
  - `variantb_jdk_21`: Mean = 43.845s, P50 = 42.937s, P90 = 47.701s
  - **Reduction**: Mean = 0.433s (0.98%), P50 = 1.127s (2.6%), P90 = -0.159s (-0.33%)

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `:core:cart:compileDebugKotlin`: 
    - `varianta_jdk_17`: Mean = 11.258s, P50 = 11.109s, P90 = 12.065s
    - `variantb_jdk_21`: Mean = 10.356s, P50 = 10.329s, P90 = 10.775s
    - **Reduction**: Mean = 0.902s (8.0%), P50 = 0.780s (7.0%), P90 = 1.290s (10.7%)
  - `:core:identity:compileDebugKotlin`: 
    - `varianta_jdk_17`: Mean = 10.645s, P50 = 10.471s, P90 = 11.436s
    - `variantb_jdk_21`: Mean = 9.950s, P50 = 9.817s, P90 = 10.593s
    - **Reduction**: Mean = 0.695s (6.5%), P50 = 0.654s (6.2%), P90 = 0.843s (7.4%)
  - `:core:contact:compileDebugKotlin`: 
    - `varianta_jdk_17`: Mean = 9.323s, P50 = 9.184s, P90 = 9.947s
    - `variantb_jdk_21`: Mean = 8.785s, P50 = 8.687s, P90 = 9.260s
    - **Reduction**: Mean = 0.538s (5.8%), P50 = 0.497s (5.4%), P90 = 0.687s (6.9%)

### 3. Statistical Patterns
- Tasks with notable timing variations include `:core:cart:compileDebugKotlin`, `:core:identity:compileDebugKotlin`, and `:core:contact:compileDebugKotlin`, all showing better performance in `variantb_jdk_21` by over 5%.

### 4. Process State Analysis
- **Kotlin Process State:**
  - `varianta_jdk_17`: Mean GC Time = 0.3s
  - `variantb_jdk_21`: Mean GC Time = 0.4s
  - **Increase in GC Time**: 0.1s (33.3%)

- **Gradle Process State:**
  - `varianta_jdk_17`: Mean GC Time = 0.12s
  - `variantb_jdk_21`: Mean GC Time = 0.14s
  - **Increase in GC Time**: 0.02s (16.7%)

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU: Maxed at 100% for both variants.
  - Memory: `varianta_jdk_17` = Max 10.31 GB, `variantb_jdk_21` = Max 10.84 GB

- **Build Process:**
  - CPU: `varianta_jdk_17` = 96.23%, `variantb_jdk_21` = 96.4%
  - Memory: `varianta_jdk_17` = Max 5.16 GB, `variantb_jdk_21` = Max 5.27 GB

- **Build Child Processes:**
  - CPU: `varianta_jdk_17` = 95.23%, `variantb_jdk_21` = 95.3%
  - Memory: `varianta_jdk_17` = Max 4.23 GB, `variantb_jdk_21` = Max 4.67 GB

### 6. Garbage Collection Analysis
- Total GC collections: `varianta_jdk_17` = 131, `variantb_jdk_21` = 139
- **Increase in Collections**: 8 collections (6.1%)

The performance improvements in `variantb_jdk_21` are evident in reduced build times and better handling of key tasks, despite slightly higher memory usage and garbage collection activities.
