import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("renders overview values from the sample report", async () => {
    mockReport();
    render(<ReportApp root={mountRoot()} />);
    expect(await screen.findByRole("heading", { name: "cpu_test vs cpu2" })).toBeInTheDocument();
    expect(screen.getByText("Build duration")).toBeInTheDocument();
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Tail latency (P90)")).toBeInTheDocument();
    expect(screen.getByLabelText("Headline comparisons")).toBeInTheDocument();
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
        name: /^Tasks/,
      }),
    );
    expect(await screen.findByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByRole("button", { name: ":app:app:dexBuilderDebug" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ":app:app:compileDebugKotlin" }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getAllByRole("navigation", { name: "Report sections" })[0]!).getByRole("button", {
        name: /^Diagnostics/,
      }),
    );
    expect(await screen.findByText(/pooled diagnostic samples/i)).toBeInTheDocument();
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
});
