import { SECTION_LABELS, WORKBENCH_SECTIONS } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { reportSections } from "../../domain/coverage";

export function WorkbenchNav() {
  const { report, selection, update } = useDashboard();
  const sections = reportSections(report);
  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));
  return (
    <nav className="workbench-nav" aria-label="Report sections">
      {WORKBENCH_SECTIONS.map((id) => {
        const available = byId[id]?.available ?? true;
        return (
          <button
            key={id}
            type="button"
            className="nav-item"
            aria-current={selection.section === id ? "page" : undefined}
            onClick={() => update({ section: id })}
          >
            <span className="nav-label">{SECTION_LABELS[id]}</span>
            {available ? null : <span className="muted">n/a</span>}
          </button>
        );
      })}
    </nav>
  );
}
