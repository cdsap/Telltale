interface EmptyStateProps {
  title: string;
  detail: string;
}

export function EmptyState({ title, detail }: EmptyStateProps) {
  return (
    <section className="empty-state card" role="status">
      <h1>{title}</h1>
      <p>{detail}</p>
    </section>
  );
}

export function ErrorState({ title, detail }: EmptyStateProps) {
  return (
    <section className="error-state card" role="alert">
      <h1>{title}</h1>
      <p>{detail}</p>
    </section>
  );
}
