'use client';

import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Hook up to auth API once available.
    console.log('Attempt sign-in', { email, password });
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow">
      <header className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-600">Sign in</p>
        <h2 className="text-2xl font-semibold">Continue your DSIM journey</h2>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
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
          Password
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-white shadow-brand-500/40"
        >
          Sign in
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        No account yet? <a className="text-brand-600" href="/signup">Join DSIM</a>
      </p>
    </section>
  );
}
