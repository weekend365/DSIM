'use client';

import { useEffect, useState } from 'react';
import type { Profile, TravelPost } from '@dsim/shared';
import { apiBase } from '../src/lib/api';
import ProfileModal from './ProfileModal';

type Props = { postId: string; isOpen: boolean; onClose: () => void };

export default function TravelPostModal({ postId, isOpen, onClose }: Props) {
  const [post, setPost] = useState<TravelPost | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setCreatorProfile(null);
      try {
        const postRes = await fetch(`${apiBase}/travel-posts/${postId}`);
        if (!postRes.ok) throw new Error(await postRes.text());
        const postData = (await postRes.json()) as TravelPost;
        if (!isCancelled) setPost(postData);

        if (postData.creatorId) {
          const profileRes = await fetch(`${apiBase}/profiles/${postData.creatorId}`);
          if (profileRes.ok) {
            const profileData = (await profileRes.json()) as Profile;
            if (!isCancelled) setCreatorProfile(profileData);
          }
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setError('여행 글을 불러오지 못했습니다.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
          <p className="text-xs uppercase text-slate-500">{post?.destination}</p>
          <h3 className="text-2xl font-semibold">{post?.title}</h3>
            <p className="text-sm text-slate-500">
              {post?.startDate ? new Date(post.startDate).toLocaleDateString() : '일정 미정'} —{' '}
              {post?.endDate ? new Date(post.endDate).toLocaleDateString() : '일정 미정'}
            </p>
        </div>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">불러오는 중...</p>
        ) : error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            <p className="mt-4 text-slate-700">{post?.description || '작성된 설명이 없습니다.'}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>예산: {post?.budget ? `$${post.budget}` : '미정'}</p>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">작성자</p>
                  <p className="text-base font-semibold">{post?.creator?.name ?? '알 수 없음'}</p>
                  <p className="text-xs text-slate-500">{creatorProfile?.location ?? ''}</p>
                </div>
                <button
                  className="text-sm font-medium text-brand-600"
                  onClick={() => setProfileOpen(true)}
                  disabled={!post?.creator?.id}
                >
                  프로필 전체 보기
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {creatorProfile?.bio ?? '프로필을 불러오거나 찾을 수 없습니다.'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-lg bg-brand-600 px-4 py-2 text-white"
                onClick={() => console.log('TODO: matching request')}
              >
                참여 요청하기
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2"
                onClick={() => console.log('TODO: open chat')}
              >
                채팅 열기
              </button>
            </div>
          </>
        )}
      </div>
      {post?.creator?.id ? (
        <ProfileModal userId={post.creator.id} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      ) : null}
    </div>
  );
}
