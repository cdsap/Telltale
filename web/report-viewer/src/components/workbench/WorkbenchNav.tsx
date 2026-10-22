import { SECTION_LABELS, WORKBENCH_SECTIONS, type WorkbenchSection } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { reportSections } from "../../domain/coverage";

export function WorkbenchNav() {
  const { report, selection, update } = useDashboard();
  const sections = reportSections(report);
  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));
  return (
    <>
      <label className="mobile-section">
        Section
        <select
          value={selection.section}
          onChange={(event) =>
            update({ section: event.target.value as WorkbenchSection })
          }
        >
          {WORKBENCH_SECTIONS.map((id) => (
            <option key={id} value={id}>
              {SECTION_LABELS[id]}
              {byId[id] && !byId[id]?.available ? " (unavailable)" : ""}
            </option>
          ))}
        </select>
      </label>
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
    </>
  );
}
