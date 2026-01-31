import type { Doc } from "../../convex/_generated/dataModel";
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
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "All tasks", value: total },
          { label: "Pending", value: pending },
          { label: "Priority", value: priority },
          { label: "Completed", value: completed },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <div className="text-sm text-text-secondary">{card.label}</div>
            <div className="text-2xl font-semibold text-text-primary mt-2">
              {card.value}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Priority tasks
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Expiring within 48 hours
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {priorityItems.length === 0 ? (
            <p className="text-sm text-text-secondary">
              You have no urgent tasks right now.
            </p>
          ) : (
            priorityItems.slice(0, 3).map((item) => (
              <div
                key={String(item._id)}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {item.title}
                  </div>
                  {item.expiresAt && (
                    <div className="text-xs text-text-secondary">
                      Expires {new Date(item.expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <span className="text-xs text-text-secondary">Priority</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
