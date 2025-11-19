const widgets = [
  { title: 'Upcoming Trips', description: 'Syncing with Nest API soon' },
  { title: 'Match Suggestions', description: 'Will list high affinity travelers' },
  { title: 'Budget Boards', description: 'Plan group expenses in one place' }
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-slate-600">Central hub for planning with your matched crew.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {widgets.map((widget) => (
          <article key={widget.title} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{widget.title}</h2>
            <p className="text-sm text-slate-500">{widget.description}</p>
            <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">TODO: Hook up data</p>
          </article>
        ))}
      </div>
    </section>
  );
}
