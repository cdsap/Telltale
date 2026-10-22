import type { CoverageChip } from "../../domain/viewModels";

export function DataCoverage({ chips }: { chips: CoverageChip[] }) {
  return (
    <div className="coverage-strip" aria-label="Analysis coverage">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="coverage-chip"
          data-state={chip.state}
          title={chip.reason}
        >
          {chip.label}: {chip.state.replace("-", " ")}
        </span>
      ))}
    </div>
  );
}
