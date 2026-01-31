import Card from "../ui/Card";

const previewItems = [
  {
    title: "Pick up groceries",
    meta: "Do by tomorrow",
    status: "Do soon",
  },
  {
    title: "Plan weekend brunch",
    meta: "Do by this weekend",
    status: "In progress",
  },
  {
    title: "Text Alex back",
    meta: "Done today",
    status: "Done",
  },
];

export default function Preview() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
      <div>
        <h3 className="text-2xl font-semibold text-text-primary">
          Your day at a glance
        </h3>
        <p className="mt-3 text-text-secondary max-w-2xl">
          See what’s next, what’s done, and what needs a little nudge. Keep
          notes close and your day feeling calm.
        </p>
      </div>
      <Card className="p-5 bg-surface">
        <div className="text-sm text-text-secondary">Sample day</div>
        <div className="mt-3 space-y-3">
          {previewItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-3 py-2"
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
