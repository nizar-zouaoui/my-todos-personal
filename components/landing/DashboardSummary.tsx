import type { Doc } from "../../convex/_generated/dataModel";
import Button from "../ui/Button";
import Card from "../ui/Card";

type DashboardSummaryProps = {
  total: number;
  pending: number;
  priority: number;
  completed: number;
  priorityItems: Doc<"todos">[];
};

export default function DashboardSummary({
  total,
  pending,
  priority,
  completed,
  priorityItems,
}: DashboardSummaryProps) {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-end gap-3">
        <Button href="/todos" variant="secondary">
          My tasks
        </Button>
        <Button href="/todos/create" variant="primary">
          Add task
        </Button>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Coming up soon
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Due in the next two days
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {priorityItems.length === 0 ? (
            <p className="text-sm text-text-secondary">
              You're all caught up for now.
            </p>
          ) : (
            priorityItems.slice(0, 3).map((item) => (
              <div
                key={String(item._id)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {item.title}
                  </div>
                  {item.expiresAt && (
                    <div className="text-xs text-text-secondary">
                      Do by {new Date(item.expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <span className="text-xs text-text-secondary">Do soon</span>
              </div>
            ))
          )}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "All tasks", value: total },
          { label: "In progress", value: pending },
          { label: "Do soon", value: priority },
          { label: "Done", value: completed },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <div className="text-sm text-text-secondary">{card.label}</div>
            <div className="text-2xl font-semibold text-text-primary mt-2">
              {card.value}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
