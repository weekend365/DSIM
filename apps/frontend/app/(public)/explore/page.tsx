import type { TravelPost } from '@dsim/shared';
import TravelPostCard from '../../../components/TravelPostCard';
import FilterBar from '../../../components/FilterBar';

async function fetchPosts(): Promise<TravelPost[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/travel-posts`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function ExplorePage() {
  const posts = await fetchPosts();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">탐색</p>
        <h1 className="text-3xl font-semibold">여행 피드</h1>
        <p className="text-slate-600">여행 계획을 둘러보고 어울리는 동행을 찾아보세요.</p>
      </header>

      <FilterBar />

      <div className="grid gap-4 md:grid-cols-3">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-600">아직 등록된 여행이 없습니다.</p>
        ) : (
          posts.map((post) => <TravelPostCard key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
}
