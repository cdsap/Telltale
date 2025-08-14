---
layout: post
title: "AGP 9.0.0-alpha01 vs AGP 8.12"
date: 2025-08-14
report_link: /Telltale/reports/experiment_results_20250814234144.html
summary: " 
The analysis of Gradle build performance between two variants, `varianta_agp_8.12` and `variantb_agp_9-alpha01`, reveals a slight increase in overall build time in the newer variant by approximately 0.35 seconds (0.35% increase). The configuration time also shows a minor increase by about 0.09 seconds (2.15% increase). The most time-consuming tasks across both variants include `:core:cart:compileDebugKotlin`, `:core:identity:compileDebugKotlin`, and `:core:contact:compileDebugKotlin`, with marginal differences in execution times between the variants. Memory usage is slightly higher in `variantb_agp_9-alpha01` for all processes and specifically for build child processes. CPU usage remains nearly identical across both variants. The total garbage collection counts are slightly reduced in the newer variant."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250814234144.html)
## Summary
The analysis of Gradle build performance between two variants, `varianta_agp_8.12` and `variantb_agp_9-alpha01`, reveals a slight increase in overall build time in the newer variant by approximately 0.35 seconds (0.35% increase). The configuration time also shows a minor increase by about 0.09 seconds (2.15% increase). The most time-consuming tasks across both variants include `:core:cart:compileDebugKotlin`, `:core:identity:compileDebugKotlin`, and `:core:contact:compileDebugKotlin`, with marginal differences in execution times between the variants. Memory usage is slightly higher in `variantb_agp_9-alpha01` for all processes and specifically for build child processes. CPU usage remains nearly identical across both variants. The total garbage collection counts are slightly reduced in the newer variant.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - `varianta_agp_8.12`: 375.672 seconds
  - `variantb_agp_9-alpha01`: 376.991 seconds
  - Difference: +0.35 seconds (+0.35%)

- **P50 Build Time:**
  - `varianta_agp_8.12`: 372.095 seconds
  - `variantb_agp_9-alpha01`: 373.656 seconds
  - Difference: +1.561 seconds (+0.42%)

- **P90 Build Time:**
  - `varianta_agp_8.12`: 392.681 seconds
  - `variantb_agp_9-alpha01`: 398.487 seconds
  - Difference: +5.806 seconds (+1.48%)

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  1. `:core:cart:compileDebugKotlin`
     - Mean: `varianta_agp_8.12`: 10.081 seconds, `variantb_agp_9-alpha01`: 10.022 seconds
     - P50: `varianta_agp_8.12`: 10.039 seconds, `variantb_agp_9-alpha01`: 9.891 seconds
     - P90: `varianta_agp_8.12`: 10.771 seconds, `variantb_agp_9-alpha01`: 10.820 seconds

  2. `:core:identity:compileDebugKotlin`
     - Mean: `varianta_agp_8.12`: 9.627 seconds, `variantb_agp_9-alpha01`: 9.561 seconds
     - P50: `varianta_agp_8.12`: 9.580 seconds, `variantb_agp_9-alpha01`: 9.524 seconds
     - P90: `varianta_agp_8.12`: 10.202 seconds, `variantb_agp_9-alpha01`: 10.145 seconds

  3. `:core:contact:compileDebugKotlin`
     - Mean: `varianta_agp_8.12`: 8.134 seconds, `variantb_agp_9-alpha01`: 8.067 seconds
     - P50: `varianta_agp_8.12`: 8.144 seconds, `variantb_agp_9-alpha01`: 8.048 seconds
     - P90: `varianta_agp_8.12`: 8.654 seconds, `variantb_agp_9-alpha01`: 8.405 seconds

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU Usage: Max 100% for both variants.
  - Memory Usage: Max 10.64 GB for `varianta_agp_8.12`, 10.6 GB for `variantb_agp_9-alpha01`.

- **Build Process:**
  - CPU Usage: Max 96.5% for both variants.
  - Memory Usage: Max 5.31 GB for `varianta_agp_8.12`, 5.07 GB for `variantb_agp_9-alpha01`.

- **Build Child Processes:**
  - CPU Usage: Max 95.225% for `varianta_agp_8.12`, 95.275% for `variantb_agp_9-alpha01`.
  - Memory Usage: Max 4.41 GB for `varianta_agp_8.12`, 4.61 GB for `variantb_agp_9-alpha01`.

### 6. Garbage Collection Analysis
- Total GC collections:
  - `varianta_agp_8.12`: 148.0
  - `variantb_agp_9-alpha01`: 144.0
  - Difference: -4 collections

The analysis highlights a minimal increase in build and configuration times in the newer variant, with a slight reduction in garbage collection activities. Memory usage is marginally higher in the newer variant, while CPU usage remains consistent.
