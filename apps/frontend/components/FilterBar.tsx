'use client';

import { useState } from 'react';

export default function FilterBar() {
  const [destination, setDestination] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <label className="flex flex-col text-sm font-medium text-slate-700">
        목적지
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="도쿄, 리스본..."
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-700">
        출발
        <input
          type="date"
          className="mt-1 rounded-lg border border-slate-200 px-3 py-2"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-700">
        복귀
        <input
          type="date"
          className="mt-1 rounded-lg border border-slate-200 px-3 py-2"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      <button
        className="rounded-lg bg-brand-600 px-4 py-2 text-white"
        type="button"
        onClick={() => console.log('TODO: 클라이언트 필터 적용', { destination, from, to })}
      >
        필터 적용
      </button>
    </div>
  );
}
