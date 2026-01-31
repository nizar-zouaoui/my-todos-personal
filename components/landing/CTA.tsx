import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="bg-hero-gradient border border-border rounded-xl p-8 shadow-hero">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-2xl font-semibold text-text-primary">
            Start each week with a calm plan
          </h3>
          <p className="mt-2 text-text-secondary max-w-2xl">
            Taskflow turns scattered notes into a focused agenda. Join teams
            building consistent, sustainable productivity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/login" variant="primary">
            Get started
          </Button>
          <Button href="/todos" variant="secondary">
            View tasks
          </Button>
        </div>
      </div>
    </section>
  );
}
