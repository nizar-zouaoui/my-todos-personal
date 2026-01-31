import Card from "../ui/Card";

const features = [
  {
    title: "Priority alerts",
    body: "Stay ahead of deadlines with automatic priority views.",
  },
  {
    title: "Markdown notes",
    body: "Write clean specs, checklists, and context in one place.",
  },
  {
    title: "Email sign-in",
    body: "Secure 6-digit login codes keep access lightweight.",
  },
  {
    title: "Focus views",
    body: "Filter work by pending, completed, or urgent tasks.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {features.map((feature) => (
        <Card
          key={feature.title}
          className="p-5 transition-soft hover:-translate-y-0.5"
        >
          <div className="text-lg font-semibold text-text-primary">
            {feature.title}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{feature.body}</p>
        </Card>
      ))}
    </section>
  );
}
