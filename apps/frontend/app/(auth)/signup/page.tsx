'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SignUpResponse } from '@dsim/shared';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Sign-up failed');
      }

      const data = (await response.json()) as SignUpResponse;
      if (data.data?.accessToken) {
        // TODO: Move to httpOnly cookie flow when backend supports it.
        localStorage.setItem('dsim:accessToken', data.data.accessToken);
      }
      setStatus('success');
      setMessage(data.message ?? 'Welcome to DSIM!');
      setTimeout(() => router.push('/dashboard'), 150);
    } catch (error) {
      console.error('Sign-up error', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Sign-up failed');
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Create account</p>
        <h1 className="text-3xl font-semibold">Join DSIM</h1>
        <p className="text-slate-600">Build a traveler profile to get better companion matches.</p>
      </header>
      <form
        className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow"
        onSubmit={handleSubmit}
      >
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Traveler Kim"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="traveler@example.com"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-white shadow-brand-500/40 disabled:opacity-60"
          disabled={status === 'loading'}
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? 'Creating account...' : 'Create account'}
        </button>
        {message ? (
          <p className={`text-center text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        ) : null}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a className="text-brand-600" href="/signin">
            Sign in
          </a>
        </p>
      </form>
    </section>
  );
}
