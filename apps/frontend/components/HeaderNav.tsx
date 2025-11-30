'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '../src/lib/api';

export default function HeaderNav() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthed(Boolean(token));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dsim:accessToken');
    setIsAuthed(false);
    router.push('/');
  };

  return (
    <nav className="flex items-center justify-between">
      <a href="/" className="text-xl font-semibold tracking-tight text-brand-600">
        DSIM
      </a>
      <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <a href="/home">홈</a>
        <a href="/explore">여행 탐색</a>
        <a href="/me/profile">마이페이지</a>
        <a href="/travel/new" className="rounded-full bg-brand-600 px-3 py-1 text-white">
          새 여행 만들기
        </a>
        {isAuthed ? (
          <button
            className="text-red-600 hover:text-red-700"
            type="button"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        ) : (
          <a href="/signin" className="text-brand-600">
            로그인
          </a>
        )}
      </div>
    </nav>
  );
}
