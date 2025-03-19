---
title: "About This Site"
layout: "page"
url: "/info/"
summary: "Learn about how we use Telltale to run and share Gradle build experiments"
---

This site showcases build optimization experiments conducted using [Telltale](https://github.com/cdsap/Telltale), an automated framework for running and analyzing Gradle builds. Here's what you need to know:

## How It Works

1. **Experiment Execution**: Telltale automates:
   - Setting up experimental environments
   - Running different build variants
   - Collecting performance metrics
   - Visualizing results

2. **Data Collection**: 
   - All builds are tracked in Develocity
   - [Build Experiment Results](https://github.com/cdsap/BuildExperimentResults) tool aggregates data
   - Generates comprehensive CSV and HTML reports
   ![Experiment Results](../html_output.png)

3. **AI-Powered Analysis**:
   - OpenAI analyzes experiment results
   - Provides detailed summaries and insights
   - Helps identify performance patterns and improvements

## Publishing Process

### When Do We Publish?
Experiments are published when:
- They are triggered by main workflows
- The `extra_report_args.deploy_results` is set to `'true'`
- Results are validated and ready for sharing

### What's in Each Post?
Each experiment post includes:
- Detailed performance comparisons
- CPU and memory usage analysis
- Build time metrics
- Task execution statistics
- Gradle User Home environment tags (e.g., #dependencies cache)

![Example Post Layout](../examplepost.png)

## Technology Stack

- **[Develocity](https://gradle.com/develocity/)**: Build performance monitoring
- **[setup-gradle action](https://github.com/gradle/actions/tree/main/setup-gradle/)**: Seeding Gradle User home for experiments
- **[Hugo](https://gohugo.io/)**: Static site generation
- **[Hugo PaperMod](https://github.com/adityatelange/hugo-PaperMod/)**: Theme and styling
- **[Build Experiment Results](https://github.com/cdsap/BuildExperimentResults)**: Data aggregation and analysis

## Contribute Your Experiments

Have an open-source project? We welcome new experiments!

**Requirements**:
- Open source project
- Compatible with GitHub Actions free runners
- Interesting build configuration scenarios to test

**Interested?** Get in touch to start experimenting with your builds!

![Telltale](../telltale.png)
