---
layout: post
title: "Gradle 8.14-rc2 in Nowinandroid"
date: 2025-04-21
report_link: /Telltale/reports/experiment_results_20250421224012.html
summary: " 
The analysis of the Gradle build performance between two variants, `varianta_gradle_8_13` and `variantb_gradle_8_14_rc2`, reveals minor differences in build times and task execution. The mean build time for `varianta` is 215.687 seconds, slightly higher than `variantb` at 215.076 seconds, showing a marginal improvement of 0.28%. Key tasks such as `KotlinCompile`, `LinkApplicationAndroidResourcesTask`, and `KspTaskJvm` show minor fluctuations in execution times between the two variants, with differences generally under 10%. Memory and CPU usage for all processes and specifically for the build process are nearly identical across variants, with maximum CPU usage hitting 100% for all processes in both variants. The total garbage collection counts in Gradle and Kotlin processes are also similar, indicating consistent memory management behavior between the two variants."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250421224012.html)
## Summary
The analysis of the Gradle build performance between two variants, `varianta_gradle_8_13` and `variantb_gradle_8_14_rc2`, reveals minor differences in build times and task execution. The mean build time for `varianta` is 215.687 seconds, slightly higher than `variantb` at 215.076 seconds, showing a marginal improvement of 0.28%. Key tasks such as `KotlinCompile`, `LinkApplicationAndroidResourcesTask`, and `KspTaskJvm` show minor fluctuations in execution times between the two variants, with differences generally under 10%. Memory and CPU usage for all processes and specifically for the build process are nearly identical across variants, with maximum CPU usage hitting 100% for all processes in both variants. The total garbage collection counts in Gradle and Kotlin processes are also similar, indicating consistent memory management behavior between the two variants.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:** `varianta` 215.687s vs. `variantb` 215.076s (0.28% faster in `variantb`).
- **P50 Build Time:** `varianta` 215.252s vs. `variantb` 213.252s.
- **P90 Build Time:** `varianta` 222.627s vs. `variantb` 224.655s.

### 2. Task Type Differences
- **`KotlinCompile`**
  - Mean: `varianta` 3.934s vs. `variantb` 3.918s.
  - P50: `varianta` 2.804s vs. `variantb` 2.804s.
  - P90: `varianta` 10.565s vs. `variantb` 10.090s.
- **`LinkApplicationAndroidResourcesTask`**
  - Mean: `varianta` 1.495s vs. `variantb` 1.487s.
  - P50: `varianta` 1.314s vs. `variantb` 1.346s.
  - P90: `varianta` 2.356s vs. `variantb` 2.222s.
- **`KspTaskJvm`**
  - Mean: `varianta` 3.713s vs. `variantb` 3.672s.
  - P50: `varianta` 3.017s vs. `variantb` 2.969s.
  - P90: `varianta` 6.625s vs. `variantb` 6.497s.

### 3. Statistical Patterns
- Minor timing variations are observed in tasks like `KotlinCompile` and `KspTaskJvm`, with `variantb` generally performing slightly better.
- The P90 values for `Build time` show `variantb` taking longer, suggesting potential variability under heavier loads.

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU: Max 100% for both variants.
  - Memory: Max 11.02 GB (`varianta`) vs. 11.04 GB (`variantb`).
- **Build Process:**
  - CPU: Max 93.48% (`varianta`) vs. 93.66% (`variantb`).
  - Memory: Max 5.37 GB (`varianta`) vs. 5.38 GB (`variantb`).
- **Build Child Processes:**
  - CPU: Max 92.02% (`varianta`) vs. 92.1% (`variantb`).
  - Memory: Max 4.65 GB (`varianta`) vs. 4.66 GB (`variantb`).

### 6. Garbage Collection Analysis
- **Gradle Process GC Collections:**
  - Total: 68 for both variants.
- **Kotlin Process GC Collections:**
  - `varianta`: 45 vs. `variantb`: 44.

The performance metrics indicate that the updates in `variantb_gradle_8_14_rc2` offer slight improvements in build time and task execution efficiency, albeit with minor variations in some areas. The consistency in CPU and memory usage, along with garbage collection activities, suggests stable performance across both variants.
