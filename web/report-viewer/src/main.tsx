import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReportApp } from "./app/ReportApp";
import { ReportErrorBoundary } from "./app/ReportErrorBoundary";
import { ErrorState } from "./components/EmptyState/EmptyState";
import "./styles/base.css";
import "./styles/workbench.css";

const root = document.getElementById("telltale-report");
if (!root) {
  document.body.replaceChildren();
  const fallback = document.createElement("div");
  fallback.id = "telltale-report";
  document.body.append(fallback);
  createRoot(fallback).render(
    <ErrorState
      title="Missing report mount"
      detail="The page needs a #telltale-report element with a data-report-url."
    />,
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <ReportErrorBoundary>
        <ReportApp root={root} />
      </ReportErrorBoundary>
    </StrictMode>,
  );
}
