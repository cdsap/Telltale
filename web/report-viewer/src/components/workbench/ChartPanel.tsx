import type { ReactNode } from "react";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartPanel({ title, subtitle, children }: ChartPanelProps) {
  return (
    <section className="chart-panel">
      <h2>{title}</h2>
      {subtitle ? <p className="chart-subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}
