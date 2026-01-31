import Button from "./Button";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-6 text-center shadow-card">
      <h3 className="text-h2 text-text-primary">{title}</h3>
      <p className="mt-2 text-text-secondary max-w-xl mx-auto">{body}</p>
      {actionLabel && actionHref && (
        <div className="mt-4 flex justify-center">
          <Button href={actionHref} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
