# Telltale report viewer

Standalone React viewer for BuildExperimentResults `experiment-result.json` files. It does not call Develocity or GitHub.

## Run locally

```bash
cd web/report-viewer
npm install
npm test
npm run dev
```

The local page loads `public/data/sample.json` through `#telltale-report[data-report-url]`. Point `data-report-url` at another same-origin JSON file to try a larger report.

```bash
npm run build
npm run preview
```

## Scope

Included now: schema 1.x validation; overview KPIs; per-build duration/configuration series; searchable task paths with a selected-task series; resource/process/Kotlin/GC sections when those families exist; CPU/JFR diagnostic cards and coverage (aggregates only, no invented timelines); Mean/P50/P90 switching; filterable all-metrics table.

Not in this slice: Hugo/GitHub Pages publication, or replacing the existing HTML reports.
