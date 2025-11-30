'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtPayload, Profile } from '@dsim/shared';
import { apiFetch, decodeJwt, getAccessToken } from '../../../src/lib/api';

const emptyProfile: Partial<Profile> = {
  bio: '',
  location: '',
  interests: '',
  languages: ''
};

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>(emptyProfile);
  const [message, setMessage] = useState<string>('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 이용해주세요.');
      router.replace('/signin');
      return;
    }
    const decoded = decodeJwt(token);
    setUser(decoded);
    if (decoded?.sub) {
      void apiFetch<Profile>(`/profiles/${decoded.sub}`, { method: 'GET' })
        .then((data) =>
          setProfile({
            bio: data.bio ?? '',
            location: data.location ?? '',
            interests: data.interests ?? '',
            languages: data.languages ?? ''
          })
        )
        .catch(() => setProfile({ ...emptyProfile }));
    }
    setAuthChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.sub) {
      setMessage('로그인이 필요합니다.');
      return;
    }
    try {
      await apiFetch('/profiles', {
        method: 'POST',
        body: JSON.stringify({ userId: user.sub, ...profile })
      });
      setMessage('프로필이 저장되었습니다.');
    } catch (error) {
      console.error(error);
      setMessage('프로필 저장에 실패했습니다.');
    }
  };

  if (!authChecked || !user) return null;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">내 프로필</h1>
        <p className="text-slate-600">여행 스타일을 동행자에게 알려주세요.</p>
      </header>

      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          소개
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={3}
            value={profile.bio}
            onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            거주/출발지
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={profile.location}
              onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Seoul, KR"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            관심사
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={profile.interests}
              onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
              placeholder="Hiking, cafes"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          사용하는 언어
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={profile.languages}
            onChange={(e) => setProfile((prev) => ({ ...prev, languages: e.target.value }))}
            placeholder="Korean, English"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
        >
          프로필 저장
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </section>
  );
}
