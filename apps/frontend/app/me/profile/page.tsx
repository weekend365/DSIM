'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtPayload, Profile } from '@dsim/shared';
import { apiFetch, fetchSession } from '../../../src/lib/api';

type FollowEntry = {
  followerId: string;
  followingId: string;
  follower?: { id: string; email?: string; name?: string };
  following?: { id: string; email?: string; name?: string };
};

const emptyProfile: Partial<Profile> = {
  bio: '',
  location: '',
  interests: '',
  languages: '',
  avatarUrl: '',
  travelStyles: [],
  travelPace: '',
  budgetPreference: ''
};

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [authChecked, setAuthChecked] = useState(false);
  const [followers, setFollowers] = useState<FollowEntry[]>([]);
  const [following, setFollowing] = useState<FollowEntry[]>([]);

  useEffect(() => {
    void fetchSession<JwtPayload>().then((session) => {
      if (!session) {
        alert('로그인 후 이용해주세요.');
        router.replace('/signin');
        return;
      }
      setUser(session);
      if (session.sub) {
        void apiFetch<Profile>(`/profiles/${session.sub}`, { method: 'GET' })
          .then((data) =>
            setProfile({
              bio: data.bio ?? '',
              location: data.location ?? '',
              interests: data.interests ?? '',
              languages: data.languages ?? '',
              avatarUrl: data.avatarUrl ?? '',
              travelStyles: data.travelStyles ?? [],
              travelPace: data.travelPace ?? '',
              budgetPreference: data.budgetPreference ?? ''
            })
          )
          .catch(() => setProfile({ ...emptyProfile }))
          .finally(() => setLoadingProfile(false));
        void apiFetch<FollowEntry[]>('/follows/followers')
          .then((data) => setFollowers(data))
          .catch(() => setFollowers([]));
        void apiFetch<FollowEntry[]>('/follows/following')
          .then((data) => setFollowing(data))
          .catch(() => setFollowing([]));
      }
      setAuthChecked(true);
    });
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
        body: JSON.stringify({
          userId: user.sub,
          ...profile,
          travelStyles: Array.isArray(profile.travelStyles)
            ? profile.travelStyles
            : typeof profile.travelStyles === 'string' && profile.travelStyles
            ? profile.travelStyles.split(',').map((s) => s.trim()).filter(Boolean)
            : []
        })
      });
      setMessage('프로필이 저장되었습니다.');
    } catch (error) {
      console.error(error);
      setMessage('프로필 저장에 실패했습니다.');
    }
  };

  const handleAvatarFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setProfile((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!authChecked || !user) return null;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-white/40 bg-white/10">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold">🙂</div>
            )}
          </div>
          <div>
            <p className="text-sm text-white/80">어서 오세요</p>
            <h1 className="text-3xl font-semibold">내 프로필</h1>
            <p className="text-white/80">여행 스타일을 동행자에게 알려주세요.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-xs">
              팔로워 {followers.length} • 팔로잉 {following.length}
            </div>
            {!isEditing ? (
              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm"
                onClick={() => setIsEditing(true)}
                disabled={loadingProfile}
              >
                프로필 수정하기
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-600">Overview</p>
              <h2 className="text-xl font-semibold">프로필 정보</h2>
            </div>
            <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
              최근 업데이트: {profile.updatedAt ? new Date(profile.updatedAt as string).toLocaleDateString() : '알 수 없음'}
            </div>
          </div>
          {loadingProfile ? (
            <p className="text-sm text-slate-500">불러오는 중...</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-medium">소개:</span> {profile.bio || '작성된 소개가 없습니다.'}</p>
              <p><span className="font-medium">거주/출발지:</span> {profile.location || '미입력'}</p>
              <p><span className="font-medium">관심사:</span> {profile.interests || '미입력'}</p>
              <p><span className="font-medium">언어:</span> {profile.languages || '미입력'}</p>
              <p><span className="font-medium">여행 스타일:</span> {Array.isArray(profile.travelStyles) && profile.travelStyles.length ? profile.travelStyles.join(', ') : '미입력'}</p>
              <p><span className="font-medium">여행 페이스:</span> {profile.travelPace || '미입력'}</p>
              <p><span className="font-medium">예산 선호:</span> {profile.budgetPreference || '미입력'}</p>
              {profile.avatarUrl ? (
                <div>
                  <span className="font-medium">프로필 사진:</span>
                  <div className="mt-2 h-24 w-24 overflow-hidden rounded-full border border-slate-200">
                    <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : null}
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-700">팔로우</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>팔로워 {followers.length}명</span>
                  <span>팔로잉 {following.length}명</span>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">팔로워</p>
                    <ul className="mt-1 space-y-1">
                      {followers.slice(0, 5).map((f) => (
                        <li key={`${f.followerId}-${f.followingId}`} className="rounded border border-slate-200 bg-white px-2 py-1">
                          {f.follower?.name || f.follower?.email || f.followerId}
                        </li>
                      ))}
                      {followers.length === 0 ? <li className="text-xs text-slate-500">아직 없습니다.</li> : null}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">팔로잉</p>
                    <ul className="mt-1 space-y-1">
                      {following.slice(0, 5).map((f) => (
                        <li key={`${f.followerId}-${f.followingId}`} className="rounded border border-slate-200 bg-white px-2 py-1">
                          {f.following?.name || f.following?.email || f.followingId}
                        </li>
                      ))}
                      {following.length === 0 ? <li className="text-xs text-slate-500">아직 없습니다.</li> : null}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isEditing ? (
          <form className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                소개
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  거주/출발지
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                    value={profile.location}
                    onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Seoul, KR"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  관심사
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                    value={profile.interests}
                    onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
                    placeholder="Hiking, cafes"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                사용하는 언어
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                  value={profile.languages}
                  onChange={(e) => setProfile((prev) => ({ ...prev, languages: e.target.value }))}
                  placeholder="Korean, English"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                프로필 사진 업로드
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-none file:bg-slate-100 file:px-3 file:py-2 focus:border-brand-400 focus:ring-brand-200"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-slate-500">이미지는 로컬에서 읽어 Base64로 저장됩니다. 용량이 큰 경우 저장 시간이 길어질 수 있습니다.</p>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                여행 스타일 (쉼표로 구분)
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                  value={Array.isArray(profile.travelStyles) ? profile.travelStyles.join(', ') : ''}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, travelStyles: e.target.value.split(',').map((s) => s.trim()) }))
                  }
                  placeholder="힐링, 미식, 하이킹"
              />
            </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  여행 페이스
                  <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                  value={profile.travelPace ?? ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev, travelPace: e.target.value }))}
                >
                  <option value="">선택하세요</option>
                  <option value="slow">여유롭게</option>
                  <option value="balanced">적당히</option>
                  <option value="fast">타이트하게</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                예산 선호
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-400 focus:ring-brand-200"
                  value={profile.budgetPreference ?? ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev, budgetPreference: e.target.value }))}
                >
                  <option value="">선택하세요</option>
                  <option value="budget">가성비 중심</option>
                  <option value="mid">중간</option>
                  <option value="premium">프리미엄</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
              >
                프로필 저장
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700"
                onClick={() => {
                  setIsEditing(false);
                  setMessage('');
                }}
              >
                취소
              </button>
            </div>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        ) : null}
      </div>
    </section>
  );
}
