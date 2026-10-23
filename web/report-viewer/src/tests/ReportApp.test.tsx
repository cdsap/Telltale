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

describe("ReportApp", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("renders overview values from the sample report", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { name: "cpu_test vs cpu2" })).toBeInTheDocument();
    expect(screen.getByText("Build duration")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build duration distribution" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Histogram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Box + points" })).not.toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Tail latency (P90)")).toBeInTheDocument();
    expect(screen.getByLabelText("Headline comparisons")).toBeInTheDocument();
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

  it("filters the task list from search without inventing a CPU timeline", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { name: "cpu_test vs cpu2" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Tasks",
      }),
    );
    expect(await screen.findByRole("heading", { name: "Task paths" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByText(":app:app:dexBuilderDebug")).toBeInTheDocument();
    expect(screen.queryByText(":app:app:compileDebugKotlin")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), { target: { value: "" } });
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Module")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ":app:app:compileDebugKotlin" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: ":app:app:compileDebugKotlin" }));
    expect(screen.getByRole("dialog", { name: ":app:app:compileDebugKotlin timeline" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Builds",
      }),
    );
    expect(screen.queryByRole("heading", { name: "Build observations" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Build duration distribution" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Histogram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Box + points" })).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: "Diagnostics",
      }),
    );
    expect(await screen.findByText(/pooled diagnostic samples/i)).toBeInTheDocument();
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
    expect(await screen.findByRole("heading", { name: "cpu_test vs cpu2" })).toBeInTheDocument();
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
    expect(await screen.findByRole("heading", { name: "baseline vs candidate" })).toBeInTheDocument();
    const nav = within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!);
    fireEvent.click(nav.getByRole("button", { name: "Tasks" }));
    expect(await screen.findByRole("heading", { name: "Task paths" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByText(":app:app:dexBuilderDebug")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Module"), { target: { value: ":core:network" } });
    expect(screen.getByText(":core:network:compileDebugKotlin")).toBeInTheDocument();
    expect(screen.queryByText(":app:compileDebugKotlin")).not.toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Task types" }));
    expect(await screen.findByRole("heading", { name: "Task types" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Module")).not.toBeInTheDocument();
    expect(screen.getByText("org.jetbrains.kotlin.gradle.tasks.KotlinCompile")).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Kotlin reports" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Kotlin Build Reports" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Resources" }));
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
    fireEvent.click(nav.getByRole("button", { name: "Runtime" }));
    expect(await screen.findByRole("heading", { name: "Processes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Timeline")).toBeInTheDocument();
  });
});
