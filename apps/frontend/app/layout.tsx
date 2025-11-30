import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import HeaderNav from '../components/HeaderNav';
import '../src/app/globals.css';

export const metadata: Metadata = {
  title: 'DSIM | Dream Same, Travel Together',
  description: '여행 동행자를 찾고 계획을 공유하는 DSIM',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto w-full max-w-6xl px-6 py-4">
              <HeaderNav />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} DSIM. 같은 꿈을 꾸는 여행자들의 공간.
          </footer>
        </div>
      </body>
    </html>
  );
}
