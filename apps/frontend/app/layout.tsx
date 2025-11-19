import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../src/app/globals.css';

export const metadata: Metadata = {
  title: 'DSIM | Dream Same, Travel Together',
  description: 'Travel companion matching service built with DSIM.',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
              <span className="text-xl font-semibold tracking-tight text-brand-600">DSIM</span>
              <div className="space-x-3 text-sm font-medium text-slate-600">
                <a href="/explore">Explore</a>
                <a href="/signin">Sign in</a>
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
          <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} DSIM. Dream Same, Travel Together.
          </footer>
        </div>
      </body>
    </html>
  );
}
