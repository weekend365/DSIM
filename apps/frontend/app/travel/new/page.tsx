'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtPayload } from '@dsim/shared';
import { apiFetch, decodeJwt, getAccessToken } from '../../../src/lib/api';

export default function TravelNewPage() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [message, setMessage] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: ''
  });
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 이용해주세요.');
      router.replace('/signin');
      return;
    }
    setUser(decodeJwt(token));
    setAuthChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.sub) {
      setMessage('로그인이 필요합니다.');
      return;
    }
    try {
      await apiFetch('/travel-posts', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          destination: form.destination,
          description: form.description || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          creatorId: user.sub
        })
      });
      setMessage('여행 계획이 등록되었습니다.');
      setForm({ title: '', destination: '', description: '', startDate: '', endDate: '', budget: '' });
    } catch (error) {
      console.error(error);
      setMessage('여행 계획 등록에 실패했습니다.');
    }
  };

  if (authChecked && !user) {
    return null;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">여행 계획 만들기</h1>
        <p className="text-slate-600">동행자를 찾을 수 있도록 여행 계획을 공유하세요.</p>
      </header>
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            제목
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            목적지
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.destination}
              onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
              required
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          설명 / 일정
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700">
            출발일
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            복귀일
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            예산 (USD)
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.budget}
              onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
        >
          발행하기
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </section>
  );
}
