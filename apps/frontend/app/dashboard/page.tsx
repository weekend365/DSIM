'use client';

import { useEffect, useState } from 'react';
import type { JwtPayload, Profile, TravelPost } from '@dsim/shared';
import { apiFetch, decodeJwt, getAccessToken } from '../../src/lib/api';

const emptyProfile: Partial<Profile> = {
  bio: '',
  location: '',
  interests: '',
  languages: ''
};

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>(emptyProfile);
  const [profileMessage, setProfileMessage] = useState<string>('');
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [postForm, setPostForm] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: ''
  });
  const [postMessage, setPostMessage] = useState<string>('');

  useEffect(() => {
    const stored = getAccessToken();
    setToken(stored);
    if (stored) {
      const decoded = decodeJwt(stored);
      setUser(decoded);
    }
  }, []);

  useEffect(() => {
    if (user?.sub) {
      void loadProfile(user.sub);
    }
    void loadPosts();
  }, [user?.sub]);

  const loadPosts = async () => {
    try {
      const data = await apiFetch<TravelPost[]>('/travel-posts', { method: 'GET' });
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts', error);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const data = await apiFetch<Profile>(`/profiles/${userId}`, { method: 'GET' });
      setProfile({
        bio: data.bio ?? '',
        interests: data.interests ?? '',
        languages: data.languages ?? '',
        location: data.location ?? ''
      });
      setProfileMessage('Profile loaded');
    } catch {
      setProfile({ ...emptyProfile });
      setProfileMessage('No profile yet. Create one below.');
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.sub) {
      setProfileMessage('Please sign in first.');
      return;
    }
    try {
      await apiFetch('/profiles', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.sub,
          bio: profile.bio,
          interests: profile.interests,
          languages: profile.languages,
          location: profile.location
        })
      });
      setProfileMessage('Profile saved.');
      await loadProfile(user.sub);
    } catch (error) {
      console.error('Failed to save profile', error);
      setProfileMessage('Failed to save profile');
    }
  };

  const handlePostSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.sub) {
      setPostMessage('Please sign in first.');
      return;
    }
    try {
      await apiFetch('/travel-posts', {
        method: 'POST',
        body: JSON.stringify({
          title: postForm.title,
          destination: postForm.destination,
          description: postForm.description || undefined,
          startDate: postForm.startDate || undefined,
          endDate: postForm.endDate || undefined,
          budget: postForm.budget ? Number(postForm.budget) : undefined,
          creatorId: user.sub
        })
      });
      setPostMessage('Travel post created.');
      setPostForm({ title: '', destination: '', description: '', startDate: '', endDate: '', budget: '' });
      await loadPosts();
    } catch (error) {
      console.error('Failed to create post', error);
      setPostMessage('Failed to create post');
    }
  };

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-slate-600">Manage your profile and share travel posts.</p>
        <p className="text-sm text-slate-500">
          Status: {token ? 'Authenticated' : 'Sign in required'}{user?.email ? ` as ${user.email}` : ''}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Your profile</h2>
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Location
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={profile.location}
                  onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Seoul, KR"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Interests
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={profile.interests}
                  onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
                  placeholder="Hiking, cafes"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Languages
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={profile.languages}
                  onChange={(e) => setProfile((prev) => ({ ...prev, languages: e.target.value }))}
                  placeholder="Korean, English"
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
              disabled={!user?.sub}
            >
              Save profile
            </button>
            {profileMessage ? <p className="text-sm text-slate-600">{profileMessage}</p> : null}
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Share a travel post</h2>
          <form className="space-y-4" onSubmit={handlePostSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={postForm.title}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Destination
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={postForm.destination}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, destination: e.target.value }))}
                  required
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                value={postForm.description}
                onChange={(e) => setPostForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Start date
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={postForm.startDate}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                End date
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={postForm.endDate}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Budget (USD)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={postForm.budget}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, budget: e.target.value }))}
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50"
              disabled={!user?.sub}
            >
              Create post
            </button>
            {postMessage ? <p className="text-sm text-slate-600">{postMessage}</p> : null}
          </form>
        </section>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest travel posts</h2>
          <button
            className="text-sm font-medium text-brand-600"
            onClick={() => loadPosts()}
            type="button"
          >
            Refresh
          </button>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-600">No posts yet. Create the first one!</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <h3 className="text-base font-semibold">{post.title}</h3>
                <p className="text-sm text-slate-500">{post.destination}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {post.description || 'No description provided.'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {post.creator?.name ?? 'Unknown'} •{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
