import type { Warning } from "../../domain/types";

export function WarningBanner({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) {
    return null;
  }
  return (
    <section className="warning-list" aria-label="Report warnings">
      <strong>
        {warnings.length} warning{warnings.length === 1 ? "" : "s"}
      </strong>
      <ul>
        {warnings.map((warning, index) => (
          <li key={`${warning.code}-${index}`}>
            {warning.message || warning.code}
          </li>
        ))}
      </ul>
    </section>
  );
}
