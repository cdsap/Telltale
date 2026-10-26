import type { WorkbenchSection } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { reportSections } from "../../domain/coverage";

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: WorkbenchSection; label: string }>;
}> = [
  {
    label: "Experiment",
    items: [
      { id: "overview", label: "Overview" },
      { id: "details", label: "Details" },
    ],
  },
  {
    label: "Builds",
    items: [
      { id: "builds", label: "Builds" },
      { id: "configuration", label: "Configuration" },
    ],
  },
  {
    label: "Tasks",
    items: [
      { id: "tasks", label: "Task paths" },
      { id: "task-types", label: "Task types" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "resources", label: "Resources" },
      { id: "runtime", label: "Runtime" },
    ],
  },
  { label: "Compiler", items: [{ id: "kotlin", label: "Kotlin reports" }] },
  {
    label: "Diagnostics",
    items: [
      { id: "diagnostics", label: "Findings" },
      { id: "metrics", label: "Metric catalog" },
    ],
  },
];

export function WorkbenchNav() {
  const { report, selection, update } = useDashboard();
  const sections = reportSections(report);
  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));
  return (
    <nav className="workbench-nav" aria-label="Report sections">
      {NAV_GROUPS.map((group, index) => {
        const items = group.items.filter((item) => byId[item.id]?.available ?? true);
        if (items.length === 0) {
          return null;
        }
        return (
          <div key={`${group.label}-${index}`} className="nav-group">
            <p className="nav-group-label">{group.label}</p>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nav-item"
                aria-current={selection.section === item.id ? "page" : undefined}
                onClick={() => update({ section: item.id })}
              >
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
