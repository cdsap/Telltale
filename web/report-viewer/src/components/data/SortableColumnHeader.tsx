import type { SortDirection } from "../../domain/tableSort";

interface SortableColumnHeaderProps {
  label: string;
  column: string;
  activeColumn: string;
  direction: SortDirection;
  onSort: (column: string) => void;
  className?: string;
}

export function SortableColumnHeader({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  className,
}: SortableColumnHeaderProps) {
  const active = activeColumn === column;
  const ariaSort = active ? (direction === "asc" ? "ascending" : "descending") : "none";
  return (
    <th
      className={className ? `sortable-th ${className}` : "sortable-th"}
      aria-sort={ariaSort}
    >
      <button type="button" className="sortable-th-button" onClick={() => onSort(column)}>
        <span>{label}</span>
        {active ? <span className="sortable-th-indicator">{direction === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
}
