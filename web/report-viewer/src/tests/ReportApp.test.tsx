import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportApp } from "../app/ReportApp";

vi.mock("react-chartjs-2", () => ({
  Bar: () => <canvas data-testid="chart" />,
  Line: () => <canvas data-testid="chart" />,
}));

const sampleText = readFileSync(resolve("public/data/sample.json"), "utf8");

describe("ReportApp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders overview values from the sample report", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const body = new TextEncoder().encode(sampleText);
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () =>
            body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
        };
      }),
    );
    const root = document.createElement("div");
    root.dataset.reportUrl = "./data/sample.json";
    root.dataset.htmlUrl = "/Telltale/reports/legacy.html";
    root.dataset.csvUrl = "/Telltale/reports/legacy.csv";
    render(<ReportApp root={root} />);
    expect(await screen.findByRole("heading", { name: "cpu_test vs cpu2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overall build time" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build time by build" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build scans" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CPU / JFR" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download CSV" })).toHaveAttribute(
      "href",
      "/Telltale/reports/legacy.csv",
    );
    expect(screen.getByRole("link", { name: "Legacy HTML" })).toHaveAttribute(
      "href",
      "/Telltale/reports/legacy.html",
    );
    expect(screen.getByRole("heading", { name: "All metrics" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Processes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kotlin" })).not.toBeInTheDocument();
    expect(screen.getByText(/pooled diagnostic samples/i)).toBeInTheDocument();
  });

  it("filters the task list from search without inventing a CPU timeline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const body = new TextEncoder().encode(sampleText);
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () =>
            body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
        };
      }),
    );
    const root = document.createElement("div");
    root.dataset.reportUrl = "./data/sample.json";
    render(<ReportApp root={root} />);
    expect(await screen.findByRole("heading", { name: "Tasks" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search task path"), {
      target: { value: "dexBuilder" },
    });
    expect(screen.getByRole("button", { name: ":app:app:dexBuilderDebug" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ":app:app:compileDebugKotlin" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/No per-build series is available/i)).toBeInTheDocument();
  });

  it("shows a validation error for unsupported schema versions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const invalid = JSON.parse(sampleText) as { schemaVersion: string };
        invalid.schemaVersion = "9.0.0";
        const body = new TextEncoder().encode(JSON.stringify(invalid));
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () =>
            body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
        };
      }),
    );
    const root = document.createElement("div");
    root.dataset.reportUrl = "./data/sample.json";
    render(<ReportApp root={root} />);
    expect(
      await screen.findByRole("heading", { name: "This report cannot be shown" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Unsupported schemaVersion/)).toBeInTheDocument();
  });
});
