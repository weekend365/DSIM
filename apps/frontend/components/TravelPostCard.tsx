'use client';

import { useState } from 'react';
import type { TravelPost } from '@dsim/shared';
import TravelPostModal from './TravelPostModal';

type Props = { post: TravelPost };

const formatDate = (value: string | Date) => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD, timezone agnostic for SSR/CSR
};

export default function TravelPostCard({ post }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <p className="text-xs uppercase text-slate-500">{post.destination}</p>
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className="mt-1 text-sm text-slate-600 line-clamp-3">
          {post.description || '아직 설명이 없습니다.'}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {post.creator?.name ?? '알 수 없음'} • {formatDate(post.createdAt)}
        </p>
      </article>
      <TravelPostModal postId={post.id} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
