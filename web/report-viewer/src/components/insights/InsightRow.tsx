interface InsightRowProps {
  title: string;
  detail?: string;
  action?: string;
  onSelect: () => void;
}

export function InsightRow({ title, detail, action, onSelect }: InsightRowProps) {
  return (
    <li className="insight-row">
      <button type="button" onClick={onSelect}>
        <span className="insight-title">{title}</span>
        {detail ? <span className="insight-detail">{detail}</span> : null}
        {action ? <span className="insight-action">{action}</span> : null}
      </button>
    </li>
  );
}
