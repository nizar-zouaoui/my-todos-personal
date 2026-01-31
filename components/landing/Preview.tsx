import Card from "../ui/Card";

const previewItems = [
  {
    title: "Product review",
    meta: "Due tomorrow",
    status: "Priority",
  },
  {
    title: "Customer onboarding",
    meta: "Due in 3 days",
    status: "Pending",
  },
  {
    title: "Release follow-up",
    meta: "Completed today",
    status: "Completed",
  },
];

export default function Preview() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
      <div>
        <h3 className="text-2xl font-semibold text-text-primary">
          A dashboard that keeps you in flow
        </h3>
        <p className="mt-3 text-text-secondary max-w-2xl">
          See urgent work at a glance, track progress across your team, and keep
          context close with markdown notes.
        </p>
      </div>
      <Card className="p-5 bg-surface">
        <div className="text-sm text-text-secondary">Preview</div>
        <div className="mt-3 space-y-3">
          {previewItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {item.title}
                </div>
                <div className="text-xs text-text-secondary">{item.meta}</div>
              </div>
              <span className="text-xs text-text-secondary">{item.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
