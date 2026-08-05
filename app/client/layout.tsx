'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const ALL_PAGES = [
  
  {
    key: 'summary',
    label: 'サマリ',
    href: '/client/summary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'shared',
    label: '期間別(共有用)',
    href: '/client/shared',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    key: 'period',
    label: '期間別',
    href: '/client/period',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: 'popup',
    label: 'ポップアップ別',
    href: '/client/popup',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="8" y1="17" x2="8" y2="21" /><line x1="16" y1="17" x2="16" y2="21" />
      </svg>
    ),
  },
  {
    key: 'scenario',
    label: 'シナリオ別',
    href: '/client/scenario',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    key: 'exit',
    label: '離脱地点別',
    href: '/client/exit',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    key: 'appeal',
    label: '訴求別',
    href: '/client/appeal',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/client/login') {
      setLoading(false);
      return;
    }

    fetch('/api/client/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push('/client/login');
          return;
        }
        setPages(data.pages ?? []);
        setDisplayName(data.displayName ?? '');
        setLoading(false);
      })
      .catch(() => router.push('/client/login'));
  }, [pathname]);

  if (pathname === '/client/login') {
    return <>{children}</>;
  }

  const showShared = process.env.NEXT_PUBLIC_ENABLE_SHARED_REPORT === 'true';
  const visiblePages = ALL_PAGES.filter((p) => {
    if (p.key === 'shared' && !showShared) return false;
    return pages.includes(p.key);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
    </div>
  );

  return (
  <div className="min-h-screen flex flex-col bg-[#F5F8FA]">
    {/* スマホ：トップロゴバー */}
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#EEF3F6] border-b border-[#C8DCE8] h-14 flex items-center px-4">
      <img src="/logo.png" alt="ロゴ" className="h-8 object-contain" />
    </header>

    <div className="flex flex-1">
      {/* PC：左サイドバー */}
      <aside className="hidden md:flex h-screen sticky top-0 bg-[#EEF3F6] flex-col border-r border-[#C8DCE8] shrink-0 overflow-y-auto w-52">
        {/* ロゴ */}
        <div className="h-24 flex items-center justify-center border-b border-[#C8DCE8] px-3 shrink-0">
          <img src="/logo.png" alt="ロゴ" className="h-8 object-contain" />
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-col gap-1 p-2 mt-2 flex-1">
          {visiblePages.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-[#7BB8D4] text-white'
                  : 'text-[#5A7A8A] hover:bg-[#D6E8F2] hover:text-[#3A5A6A]'
              }`}
            >
              <span className="shrink-0">{icon}</span>
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          ))}
        </nav>

        {/* クライアント名・ログアウト */}
        <div className="p-2 mb-2">
          {displayName && (
            <div className="text-xs text-[#A0B8C4] px-4 py-2 truncate">{displayName} 様</div>
          )}
          <button
            onClick={async () => {
              await fetch('/api/client/logout', { method: 'POST' });
              router.push('/client/login');
            }}
            className="flex items-center gap-3 rounded-lg transition-colors text-[#5A7A8A] hover:bg-[#D6E8F2] hover:text-[#3A5A6A] px-4 py-3 w-full"
          >
            <span className="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="text-sm font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8 pt-20 md:pt-8 pb-20 md:pb-8 overflow-auto bg-[#FFF]">
        {children}
      </main>
    </div>

    {/* スマホ：下部固定ナビ */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EEF3F6] border-t border-[#C8DCE8] flex items-center justify-around px-2 py-2">
      {visiblePages.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          title={label}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            pathname === href
              ? 'text-[#7BB8D4]'
              : 'text-[#5A7A8A]'
          }`}
        >
          {icon}
        </Link>
      ))}
      <button
        onClick={async () => {
          await fetch('/api/client/logout', { method: 'POST' });
          router.push('/client/login');
        }}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-[#5A7A8A]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </nav>
  </div>
);
}