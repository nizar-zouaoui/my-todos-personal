const stats = [
  { label: "Lists made", value: "12k+" },
  { label: "Little wins", value: "4k+" },
  { label: "Happy weeks", value: "95%" },
];

export default function Stats() {
  return (
    <section className="bg-soft-gradient rounded-xl p-6 border border-border shadow-card">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-semibold text-text-primary">
              {stat.value}
            </div>
            <div className="text-sm text-text-secondary mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
