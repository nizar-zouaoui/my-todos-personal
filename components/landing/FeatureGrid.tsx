import Card from "../ui/Card";

const features = [
  {
    title: "Gentle reminders",
    body: "See what's coming up without the stress.",
  },
  {
    title: "Cozy notes",
    body: "Add little details, lists, or thoughts right where you need them.",
  },
  {
    title: "Easy sign-in",
    body: "A quick email code and you're ready to plan.",
  },
  {
    title: "Simple views",
    body: "Switch between what’s next, what’s done, and what’s due soon.",
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
