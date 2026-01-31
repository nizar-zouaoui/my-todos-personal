import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="bg-hero-gradient border border-border rounded-xl p-8 shadow-hero">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-2xl font-semibold text-text-primary">
            Start the week with a cozy plan
          </h3>
          <p className="mt-2 text-text-secondary max-w-2xl">
            My Todos Personal turns scattered thoughts into a warm, simple day
            plan. Keep life organized without making it feel like work.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/login" variant="primary">
            Start planning
          </Button>
          <Button href="/todos" variant="secondary">
            See my tasks
          </Button>
        </div>
      </div>
    </section>
  );
}
