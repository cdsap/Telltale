import type { ReactNode } from "react";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  size?: "primary" | "secondary";
  legend?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function ChartPanel({
  title,
  subtitle,
  size = "primary",
  legend,
  actions,
  children,
}: ChartPanelProps) {
  return (
    <section className={`chart-panel chart-panel--${size}`}>
      <div className="chart-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="chart-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="chart-panel-actions">{actions}</div> : null}
      </div>
      {legend}
      {children}
    </section>
  );
}
