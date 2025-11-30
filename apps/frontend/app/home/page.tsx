'use client';

import { useEffect, useState } from 'react';
import type { JwtPayload, TravelPost } from '@dsim/shared';
import { apiFetch, decodeJwt, getAccessToken } from '../../src/lib/api';
import TravelPostCard from '../../components/TravelPostCard';

export default function HomePage() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [posts, setPosts] = useState<TravelPost[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const decoded = decodeJwt(token);
    setUser(decoded);
    if (decoded?.sub) {
      void apiFetch<TravelPost[]>('/travel-posts').then((data) => {
        setPosts(data.filter((p) => p.creatorId === decoded.sub));
      });
    }
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">다시 만나 반가워요</p>
        <h1 className="text-3xl font-semibold">{user?.email ?? '여행자'}</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <a className="rounded-full bg-brand-600 px-4 py-2 text-white" href="/me/profile">
            프로필 완성/수정
          </a>
          <a className="rounded-full border border-slate-200 px-4 py-2" href="/travel/new">
            새 여행 만들기
          </a>
          <a className="rounded-full border border-slate-200 px-4 py-2" href="/explore">
            동행자 찾아보기
          </a>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 올린 여행</h2>
          <a className="text-sm text-brand-600" href="/travel/new">
            새 여행 계획
          </a>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-600">아직 게시한 여행이 없습니다. 첫 계획을 만들어보세요.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {posts.map((post) => (
              <TravelPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
