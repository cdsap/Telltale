import { useMemo, useState, type ReactNode } from "react";

interface VirtualTableProps {
  rowCount: number;
  rowHeight?: number;
  height?: number;
  header: ReactNode;
  renderRow: (index: number) => ReactNode;
  empty: string;
}

export function VirtualTable({
  rowCount,
  rowHeight = 40,
  height = 480,
  header,
  renderRow,
  empty,
}: VirtualTableProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 6);
  const visible = Math.ceil(height / rowHeight) + 12;
  const end = Math.min(rowCount, start + visible);
  const rows = useMemo(() => {
    const items: ReactNode[] = [];
    for (let index = start; index < end; index += 1) {
      items.push(renderRow(index));
    }
    return items;
  }, [end, renderRow, start]);
  if (rowCount === 0) {
    return <p className="panel-note">{empty}</p>;
  }
  return (
    <div
      className="virtual-table"
      style={{ height }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <table>
        {header}
        <tbody>
          {start > 0 ? (
            <tr>
              <td colSpan={12} style={{ height: start * rowHeight, padding: 0, border: 0 }} />
            </tr>
          ) : null}
          {rows}
          {end < rowCount ? (
            <tr>
              <td
                colSpan={12}
                style={{ height: (rowCount - end) * rowHeight, padding: 0, border: 0 }}
              />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
