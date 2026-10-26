import { useState } from "react";
import { useDashboard } from "../../app/DashboardState";
import { TASK_CATEGORIES } from "../../domain/taskCategories";
import {
  DEFAULT_TASK_MIN_DURATION_MS,
  TASK_DURATION_PRESETS_MS,
  type TaskChangeFilter,
} from "../../domain/taskTableFilters";
import { formatDurationMs } from "../../domain/units";

interface TaskFilterPanelProps {
  isTypes: boolean;
  modules: string[];
  activeModule: string;
  showing: number;
  total: number;
}

export function TaskFilterPanel({
  isTypes,
  modules,
  activeModule,
  showing,
  total,
}: TaskFilterPanelProps) {
  const { selection, update } = useDashboard();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const durationPreset = TASK_DURATION_PRESETS_MS.some(
    (item) => item.value === selection.taskMinDurationMs,
  )
    ? String(selection.taskMinDurationMs)
    : "custom";
  const advancedActive =
    selection.category !== "all" ||
    selection.taskMinDeltaMs > 0 ||
    (!isTypes && selection.taskMinDurationMs !== DEFAULT_TASK_MIN_DURATION_MS) ||
    selection.taskExtendedStats ||
    Boolean(selection.taskType);

  const resetFilters = () => {
    update({
      query: "",
      module: "all",
      category: "all",
      taskFilter: "all",
      taskMinDeltaMs: 0,
      taskMinDurationMs: DEFAULT_TASK_MIN_DURATION_MS,
      taskExtendedStats: false,
      taskType: "",
    });
  };

  return (
    <div className="analysis-toolbar">
      <div className="analysis-toolbar-row">
        <label>
          {isTypes ? "Search type" : "Search path"}
          <input
            type="search"
            value={selection.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder={isTypes ? "KotlinCompile" : "compileDebugKotlin"}
          />
        </label>
        {isTypes ? null : (
          <label>
            Module
            <select
              value={activeModule}
              onChange={(event) => update({ module: event.target.value })}
            >
              <option value="all">All modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module === ":" ? ": (root)" : module}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Direction
          <select
            value={selection.taskFilter}
            onChange={(event) => update({ taskFilter: event.target.value as TaskChangeFilter })}
          >
            <option value="all">All changes</option>
            <option value="regressions">Regressions only</option>
            <option value="improvements">Improvements only</option>
          </select>
        </label>
        <button
          type="button"
          className="wb-btn"
          aria-expanded={advancedOpen}
          aria-label="Advanced filters"
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          Filters{advancedActive ? " · on" : ""}
        </button>
        <span className="analysis-count" aria-live="polite">
          {showing} of {total}
        </span>
        <button type="button" className="linkish" onClick={resetFilters}>
          Reset
        </button>
      </div>
      {advancedActive ? (
        <div className="filter-chips">
          {selection.category !== "all" ? (
            <button type="button" className="filter-chip" onClick={() => update({ category: "all" })}>
              {selection.category} ×
            </button>
          ) : null}
          {!isTypes && selection.taskMinDurationMs !== DEFAULT_TASK_MIN_DURATION_MS ? (
            <button
              type="button"
              className="filter-chip"
              onClick={() => update({ taskMinDurationMs: DEFAULT_TASK_MIN_DURATION_MS })}
            >
              mean ≥ {formatDurationMs(selection.taskMinDurationMs).text} ×
            </button>
          ) : !isTypes ? (
            <span className="filter-chip is-passive">
              mean ≥ {formatDurationMs(DEFAULT_TASK_MIN_DURATION_MS).text}
            </span>
          ) : null}
          {selection.taskMinDeltaMs > 0 ? (
            <button
              type="button"
              className="filter-chip"
              onClick={() => update({ taskMinDeltaMs: 0 })}
            >
              |Δ| ≥ {selection.taskMinDeltaMs} ms ×
            </button>
          ) : null}
          {selection.taskType ? (
            <button type="button" className="filter-chip" onClick={() => update({ taskType: "" })}>
              type {selection.taskType} ×
            </button>
          ) : null}
        </div>
      ) : isTypes ? null : (
        <p className="task-filter-hint">
          Default size filter: mean ≥ {formatDurationMs(DEFAULT_TASK_MIN_DURATION_MS).text}.
        </p>
      )}
      {advancedOpen ? (
        <div className="advanced-filters">
          <label>
            Category
            <select
              value={selection.category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option value="all">All categories</option>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          {isTypes ? null : (
            <>
              <label>
                Mean duration floor
                <select
                  value={durationPreset}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "custom") {
                      return;
                    }
                    update({ taskMinDurationMs: Number(value) });
                  }}
                >
                  {TASK_DURATION_PRESETS_MS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                  <option value="custom">Custom (ms)…</option>
                </select>
              </label>
              <label>
                Custom mean floor (ms)
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={selection.taskMinDurationMs}
                  onChange={(event) => {
                    const parsed = Number(event.target.value);
                    update({
                      taskMinDurationMs: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
                    });
                  }}
                />
              </label>
            </>
          )}
          <label>
            Min mean |Δ| (ms)
            <input
              type="number"
              min={0}
              step={1}
              value={selection.taskMinDeltaMs || ""}
              placeholder="0"
              onChange={(event) => {
                const parsed = Number(event.target.value);
                update({
                  taskMinDeltaMs: Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
                });
              }}
            />
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selection.taskExtendedStats}
              onChange={(event) => update({ taskExtendedStats: event.target.checked })}
            />
            Table: median &amp; P90
          </label>
        </div>
      ) : null}
    </div>
  );
}
