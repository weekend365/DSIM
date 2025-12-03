'use client';

import { useEffect, useState } from 'react';
import type { JwtPayload, Profile } from '@dsim/shared';
import { apiBase, apiFetch, fetchSession } from '../src/lib/api';

type Props = { userId: string; isOpen: boolean; onClose: () => void };
type FollowEntry = { followingId: string; followerId: string; following?: { id: string } };

export default function ProfileModal({ userId, isOpen, onClose }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    void fetchSession<JwtPayload>().then((s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/profiles/${userId}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as Profile;
        if (!cancelled) setProfile(data);
        if (session?.sub && session.sub !== userId) {
          try {
            const following = await apiFetch<FollowEntry[]>('/follows/following');
            if (!cancelled) {
              setIsFollowing(
                following.some((f) => f.followingId === userId || f.following?.id === userId)
              );
            }
          } catch {
            if (!cancelled) setIsFollowing(false);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('프로필을 불러오지 못했습니다');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, userId, session?.sub]);

  const toggleFollow = async () => {
    if (!session) {
      alert('로그인 후 이용해주세요.');
      window.location.href = '/signin';
      return;
    }
    if (userId === session.sub) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiFetch(`/follows/${userId}`, { method: 'DELETE' });
        setIsFollowing(false);
      } else {
        await apiFetch(`/follows/${userId}`, { method: 'POST' });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
      alert('팔로우 처리에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">여행자 프로필</p>
            <h3 className="text-xl font-semibold">{profile?.userId ?? '알 수 없음'}</h3>
          </div>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>
            ✕
          </button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">불러오는 중...</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>{profile?.bio || '아직 소개글이 없습니다.'}</p>
            <p className="text-slate-500">위치: {profile?.location || '정보 없음'}</p>
            <p className="text-slate-500">관심사: {profile?.interests || '정보 없음'}</p>
            <p className="text-slate-500">언어: {profile?.languages || '정보 없음'}</p>
          </div>
        )}
        <div className="mt-5 space-x-3">
          <button
            className="rounded-lg bg-brand-600 px-4 py-2 text-white"
            onClick={() => console.log('TODO: matching request')}
          >
            매칭 요청
          </button>
          <button
            className="rounded-lg border border-slate-200 px-4 py-2"
            onClick={() => console.log('TODO: open chat')}
          >
            채팅 열기
          </button>
          {session?.sub !== userId ? (
            <button
              className="rounded-lg border border-slate-200 px-4 py-2"
              onClick={toggleFollow}
              disabled={followLoading}
            >
              {isFollowing ? '팔로우 취소' : '팔로우'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
