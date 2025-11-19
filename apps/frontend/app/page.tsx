const features = [
  'Match by shared travel styles and dream destinations',
  'Coordinate itineraries, budgets, and safety preferences',
  'Chat, split expenses, and plan memorable routes together'
];

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-600">DSIM</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Dream Same, Travel Together</h1>
        <p className="text-lg text-slate-600">
          Your travel companion hub for finding people who share the same adventures, pace, and
          expectations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature}
            className="rounded-xl border border-slate-200 bg-white/90 p-5 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">Feature Preview</p>
            <p className="mt-2 text-base font-medium text-slate-800">{feature}</p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <a
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40"
          href="/dashboard"
        >
          Open Dashboard
        </a>
        <a className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold" href="/explore">
          Explore Trips
        </a>
      </div>
    </section>
  );
}
