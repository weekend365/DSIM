'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SignInResponse } from '@dsim/shared';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/auth/signin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, rememberMe }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '로그인에 실패했습니다');
      }

      const data = (await response.json()) as SignInResponse;
      setStatus('success');
      setMessage(data.message ?? '로그인에 성공했습니다');

      // Redirect after cookie is set
      setTimeout(() => {
        router.push('/home');
      }, 150);
    } catch (error) {
      console.error('Sign-in error', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '로그인에 실패했습니다');
    } finally {
      setStatus((prev) => (prev === 'success' ? 'success' : prev === 'error' ? 'error' : 'idle'));
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow">
      <header className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-600">로그인</p>
        <h2 className="text-2xl font-semibold">DSIM 여정을 이어가세요</h2>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          이메일
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="traveler@example.com"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          비밀번호
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          자동 로그인
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-white shadow-brand-500/40 disabled:opacity-60"
          disabled={status === 'loading'}
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? '로그인 중...' : '로그인'}
        </button>
      </form>
      {message ? (
        <p
          className={`text-center text-sm ${
            status === 'error' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message}
        </p>
      ) : null}
      <p className="text-center text-sm text-slate-500">
        계정이 없나요?{' '}
        <a className="text-brand-600" href="/signup">
          가입하기
        </a>
      </p>
    </section>
  );
}
