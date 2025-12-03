'use client';

import { useEffect, useState } from 'react';
import type { JwtPayload, Profile, TravelPost } from '@dsim/shared';
import { apiBase, apiFetch, fetchSession } from '../src/lib/api';
import ProfileModal from './ProfileModal';

type Props = { postId: string; isOpen: boolean; onClose: () => void };
type FollowEntry = { followingId: string; followerId: string; following?: { id: string } };

export default function TravelPostModal({ postId, isOpen, onClose }: Props) {
  const [post, setPost] = useState<TravelPost | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession<JwtPayload>().then((s) => setSession(s));
  }, []);

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
          if (session?.sub && postData.creatorId !== session.sub) {
            try {
              const following = await apiFetch<FollowEntry[]>('/follows/following');
              if (!isCancelled) {
                setIsFollowing(
                  following.some((f) => f.followingId === postData.creatorId || f.following?.id === postData.creatorId)
                );
              }
            } catch {
              if (!isCancelled) setIsFollowing(false);
            }
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
  }, [isOpen, postId, session?.sub]);

  const toggleFollow = async () => {
    if (!post?.creatorId || !session) {
      alert('로그인 후 이용해주세요.');
      window.location.href = '/signin';
      return;
    }
    if (post.creatorId === session.sub) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiFetch(`/follows/${post.creatorId}`, { method: 'DELETE' });
        setIsFollowing(false);
      } else {
        await apiFetch(`/follows/${post.creatorId}`, { method: 'POST' });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
      alert('팔로우 처리에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!post?.creatorId || !session) {
      alert('로그인 후 이용해주세요.');
      window.location.href = '/signin';
      return;
    }
    try {
      await apiFetch('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: post.creatorId,
          type: 'join_request',
          title: post.title ?? '여행 동행 요청',
          message: `${session.email}님이 이 여정에 참여를 요청했습니다.`
        })
      });
      setActionMessage('참여 요청을 보냈습니다.');
    } catch (err) {
      console.error(err);
      alert('요청을 보내지 못했습니다.');
    }
  };

  const handleOpenChat = async () => {
    if (!session) {
      alert('로그인 후 이용해주세요.');
      window.location.href = '/signin';
      return;
    }
    if (!post?.creatorId) return;
    try {
      const room = await apiFetch<{ id: string }>('/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({
          title: post.title ? `여행 채팅 - ${post.title}` : '여행 채팅',
          participantIds: post.creatorId === session.sub ? [] : [post.creatorId]
        })
      });
      window.location.href = `/chat?room=${room.id}`;
    } catch (err) {
      console.error(err);
      alert('채팅방을 만들지 못했습니다.');
    }
  };

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
              {post?.creatorId && session?.sub !== post.creatorId ? (
                <button
                  className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                  onClick={toggleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? '팔로우 취소' : '팔로우'}
                </button>
              ) : null}
              <p className="mt-2 text-sm text-slate-600">
                {creatorProfile?.bio ?? '프로필을 불러오거나 찾을 수 없습니다.'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-lg bg-brand-600 px-4 py-2 text-white"
                onClick={handleJoinRequest}
              >
                참여 요청하기
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2"
                onClick={handleOpenChat}
              >
                채팅 열기
              </button>
              {actionMessage ? <p className="text-sm text-slate-600">{actionMessage}</p> : null}
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
