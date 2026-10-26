import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportApp } from "../app/ReportApp";

vi.mock("react-chartjs-2", () => ({
  Bar: () => <canvas data-testid="chart" />,
  Line: () => <canvas data-testid="chart" />,
  Scatter: () => <canvas data-testid="chart" />,
}));

const sampleText = readFileSync(resolve("public/data/sample.json"), "utf8");

function mockReport(bodyText = sampleText) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const body = new TextEncoder().encode(bodyText);
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
      };
    }),
  );
}

function mountRoot() {
  const root = document.createElement("div");
  root.dataset.reportUrl = "./data/sample.json";
  root.dataset.htmlUrl = "/Telltale/reports/legacy.html";
  root.dataset.csvUrl = "/Telltale/reports/legacy.csv";
  return root;
}

function showAllTaskDurations() {
  fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));
  fireEvent.change(screen.getByLabelText("Mean duration floor"), { target: { value: "0" } });
}

describe("ReportApp", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("renders overview values from the sample report", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { level: 1, name: "ber-v1.2.0-json-test" })).toBeInTheDocument();
    expect(screen.getByText("cpu_test vs cpu2")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Telltale" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Baseline")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Candidate")).not.toBeInTheDocument();
    expect(screen.getByText("Build duration")).toBeInTheDocument();
    expect(screen.getByLabelText("Experiment outcome")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Distribution" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Execution order" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(/sequence numbers are per variant/i)).toBeInTheDocument();
    expect(screen.queryByText(/median \(solid\) and p90 \(dashed\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/median and P90 reference lines/i)).not.toBeInTheDocument();
    const overviewNav = within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!);
    expect(overviewNav.queryByRole("button", { name: "Kotlin reports" })).not.toBeInTheDocument();
    expect(overviewNav.queryByRole("button", { name: "Runtime" })).not.toBeInTheDocument();
    expect(overviewNav.queryByRole("button", { name: "Task types" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Findings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Histogram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Box + points" })).not.toBeInTheDocument();
    expect(overviewNav.getByRole("button", { name: "Configuration" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Configuration" })).toBeInTheDocument();
    const baselineScans = screen.getByRole("link", { name: "Build Scans · cpu_test" });
    expect(baselineScans).toHaveAttribute(
      "href",
      expect.stringContaining("https://ge.solutions-team.gradle.com/scans?"),
    );
    expect(baselineScans).toHaveAttribute(
      "href",
      expect.stringContaining("search.tags=cdsap-431_varianta_cpu_test"),
    );
    expect(screen.getByRole("link", { name: "Build Scans · cpu2" })).toHaveAttribute(
      "href",
      expect.stringContaining("search.tags=cdsap-431_variantb_cpu2"),
    );
    expect(screen.getByRole("link", { name: "Workflow" })).toHaveAttribute(
      "href",
      "https://github.com/cdsap/Telltale/actions/runs/39611234158",
    );
    expect(screen.queryByText("Tail latency (P90)")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Headline comparisons")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Summary")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
    expect(screen.queryByText("Latest experiment")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(screen.getByRole("menuitem", { name: "Download CSV" })).toHaveAttribute(
      "href",
      "/Telltale/reports/legacy.csv",
    );
    expect(screen.getByRole("menuitem", { name: "Legacy HTML" })).toHaveAttribute(
      "href",
      "/Telltale/reports/legacy.html",
    );
    expect(screen.queryByRole("heading", { name: "Processes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kotlin" })).not.toBeInTheDocument();
  });

  it("keeps missing families out of nav and does not treat them as zero", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { level: 1, name: "ber-v1.2.0-json-test" })).toBeInTheDocument();
    const nav = within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!);
    expect(nav.queryByRole("button", { name: "Kotlin reports" })).not.toBeInTheDocument();
    window.location.hash = "#kotlin";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(await screen.findByRole("heading", { name: "Kotlin Build Reports" })).toBeInTheDocument();
    expect(screen.getByText(/were not exported in this report/i)).toBeInTheDocument();
    expect(screen.getByText(/missing is not zero/i)).toBeInTheDocument();
  });

  it("filters the task list from search without inventing a CPU timeline", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { level: 1, name: "ber-v1.2.0-json-test" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Task paths",
      }),
    );
    expect(await screen.findByRole("heading", { name: "Task paths" })).toBeInTheDocument();
    expect(screen.getByText(/mean ≥ 1 s/)).toBeInTheDocument();
    showAllTaskDurations();
    fireEvent.change(screen.getByLabelText("Search path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByRole("button", { name: ":app:app:dexBuilderDebug" })).toBeInTheDocument();
    expect(screen.queryByText(":app:app:compileDebugKotlin")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search path"), { target: { value: "" } });
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Module")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ":app:app:compileDebugKotlin" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: ":app:app:compileDebugKotlin" }));
    expect(screen.getByRole("heading", { level: 3, name: ":app:app:compileDebugKotlin" })).toBeInTheDocument();
    expect(screen.getByText("Selected task")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Custom mean floor (ms)"), {
      target: { value: "999999999" },
    });
    expect(screen.getByText(/outside the current filters/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: ":app:app:compileDebugKotlin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ":app:app:compileDebugKotlin" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Δ%" })).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Builds",
      }),
    );
    expect(screen.getAllByRole("link", { name: "Build Scans · cpu_test" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Build duration" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Configuration time" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mean")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Metric")).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Configuration",
      }),
    );
    expect(await screen.findByRole("heading", { name: "Configuration time" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build duration" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mean")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Per-build measurements" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Scan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build observations" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build duration distribution" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Histogram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Box + points" })).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Findings",
      }),
    );
    expect(await screen.findByRole("heading", { name: "Findings" })).toBeInTheDocument();
    expect(screen.getByText(/pooled diagnostic samples/i)).toBeInTheDocument();
    expect(screen.queryByText(/Median build duration/i)).not.toBeInTheDocument();
    expect(screen.getByText(/experiment warnings/i)).toBeInTheDocument();
  });

  it("shows a loading dialog while the report download is in flight", async () => {
    let release!: () => void;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        await hold;
        const body = new TextEncoder().encode(sampleText);
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
        };
      }),
    );
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("dialog", { name: "Loading experiment report" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Report download" })).toBeInTheDocument();
    expect(screen.getByText("Downloading report JSON…")).toBeInTheDocument();
    release();
    expect(await screen.findByRole("heading", { level: 1, name: "ber-v1.2.0-json-test" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Loading experiment report" })).not.toBeInTheDocument();
  });

  it("shows a validation error for unsupported schema versions", async () => {
    const invalid = JSON.parse(sampleText) as { schemaVersion: string };
    invalid.schemaVersion = "9.0.0";
    mockReport(JSON.stringify(invalid));
    const root = document.createElement("div");
    root.dataset.reportUrl = "./data/sample.json";
    render(<ReportApp root={root} />);
    expect(
      await screen.findByRole("heading", { name: "This report cannot be shown" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Unsupported schemaVersion/)).toBeInTheDocument();
  });

  it("shows task types, kotlin reports, and family timelines from published series", async () => {
    const gapsText = readFileSync(resolve("src/tests/fixtures/viewer-gaps.json"), "utf8");
    mockReport(gapsText);
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { level: 1, name: "gaps" })).toBeInTheDocument();
    expect(screen.getByText("baseline vs candidate")).toBeInTheDocument();
    const nav = within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!);
    fireEvent.click(nav.getByRole("button", { name: "Task paths" }));
    expect(await screen.findByRole("heading", { name: "Task paths" })).toBeInTheDocument();
    showAllTaskDurations();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByRole("button", { name: ":app:app:dexBuilderDebug" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search path"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Module"), { target: { value: ":core:network" } });
    expect(screen.getByRole("button", { name: ":core:network:compileDebugKotlin" })).toBeInTheDocument();
    expect(screen.queryByText(":app:compileDebugKotlin")).not.toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Task types" }));
    expect(await screen.findByRole("heading", { name: "Task types" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.queryByLabelText("Module")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mean duration floor")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "KotlinCompile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "KotlinCompile" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View task paths" }));
    expect(await screen.findByRole("heading", { name: "Task paths" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ":app:compileDebugKotlin" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ":app:app:dexBuilderDebug" })).not.toBeInTheDocument();
    expect(nav.getByRole("button", { name: "Kotlin reports" })).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Kotlin reports" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Kotlin Build Reports" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/were not exported in this report/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Resources" }));
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
    expect(screen.getByLabelText("Group")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "CPU" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Memory" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Build processes memory · Max" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Build processes CPU · Mean" })).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Runtime" }));
    expect(await screen.findByRole("heading", { name: "Processes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
  });
});
