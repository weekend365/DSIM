const sampleTrips = [
  {
    title: 'Nordic Aurora Quest',
    companions: 4,
    style: 'Slow travel + Photography'
  },
  {
    title: 'Lisbon Remote-Work Month',
    companions: 3,
    style: 'Cowork + Surf breaks'
  },
  {
    title: 'Patagonia Expedition',
    companions: 5,
    style: 'Backpacking + Sustainability'
  }
];

export default function ExplorePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Explore</p>
        <h1 className="text-3xl font-semibold">Public itineraries from early adopters</h1>
        <p className="text-slate-600">See how travelers pair up before onboarding launches.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {sampleTrips.map((trip) => (
          <article key={trip.title} className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{trip.title}</h2>
            <p className="text-sm text-slate-500">{trip.style}</p>
            <p className="mt-2 text-sm text-slate-600">{trip.companions} companions interested</p>
          </article>
        ))}
      </div>
    </section>
  );
}
