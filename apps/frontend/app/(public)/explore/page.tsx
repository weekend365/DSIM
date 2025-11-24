import type { TravelPost } from '@dsim/shared';

async function fetchTravelPosts(): Promise<TravelPost[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/travel-posts`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) {
    console.error('Failed to load travel posts', await res.text());
    return [];
  }
  return res.json();
}

export default async function ExplorePage() {
  const posts = await fetchTravelPosts();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Explore</p>
        <h1 className="text-3xl font-semibold">Public itineraries from early adopters</h1>
        <p className="text-slate-600">See how travelers pair up before onboarding launches.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.length === 0 ? (
          <article className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
            No travel posts yet. Be the first to create one from your dashboard.
          </article>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-slate-500">{post.destination}</p>
              <p className="mt-2 text-sm text-slate-700">
                {post.description || 'No description yet.'}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {post.creator?.name ?? 'Anonymous'} •{' '}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
