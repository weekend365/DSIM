export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.method && options.method.toUpperCase() !== 'GET') {
    const csrf = getCsrfToken();
    if (csrf) headers.set('x-csrf-token', csrf);
  }

  const response = await fetch(`${apiBase}${path}`, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  return (await response.json()) as T;
}

export async function fetchSession<T = unknown>(): Promise<T | null> {
  try {
    let res = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
    if (res.status === 401) {
      const csrf = getCsrfToken();
      await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrf ? { 'x-csrf-token': csrf } : undefined
      });
      res = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
    }
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as T) ?? null;
  } catch (error) {
    console.error('Failed to fetch session', error);
    return null;
  }
}

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )dsim_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
