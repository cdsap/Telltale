import type { ReportSection } from "../../domain/coverage";

export function SectionNav({ sections }: { sections: ReportSection[] }) {
  const visible = sections.filter((section) => section.available);
  if (visible.length === 0) {
    return null;
  }
  return (
    <nav className="report-sections" aria-label="Report sections">
      {visible.map((section) => (
        <a key={section.id} href={`#${section.id}`}>
          {section.title}
        </a>
      ))}
    </nav>
  );
}
