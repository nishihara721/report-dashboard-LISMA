'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const links = [
  {
    href: '/summary',
    label: 'サマリ',
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/period',
    label: '期間別',
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/shared',
    label: '期間別(共有用)',
    adminOnly: false,
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
    href: '/exit',
    label: '離脱地点別',
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/popup',
    label: 'ポップアップ別',
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="8" y1="17" x2="8" y2="21" /><line x1="16" y1="17" x2="16" y2="21" />
      </svg>
    ),
  },
  {
    href: '/scenario',
    label: 'シナリオ',
    adminOnly: false,
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
    href: '/appeal',
    label: '訴求別',
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  // {
  //   href: '/scenario-steps',
  //   label: 'シナリオ通数別',
  //   adminOnly: false,
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <line x1="8" y1="6" x2="21" y2="6" />
  //       <line x1="8" y1="12" x2="21" y2="12" />
  //       <line x1="8" y1="18" x2="21" y2="18" />
  //       <line x1="3" y1="6" x2="3.01" y2="6" />
  //       <line x1="3" y1="12" x2="3.01" y2="12" />
  //       <line x1="3" y1="18" x2="3.01" y2="18" />
  //     </svg>
  //   ),
  // },
  {
    href: '/admin',
    label: 'ユーザー管理',
    adminOnly: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();
  const isAdmin = session?.user?.email?.endsWith('@5s-inc.jp') ?? false;

  const showShared = process.env.NEXT_PUBLIC_ENABLE_SHARED_REPORT === 'true';

  const visibleLinks = links.filter((link) => {
    if (link.adminOnly && !isAdmin) return false;
    if (link.href === '/shared' && !showShared) return false;
    return true;
  });

  return (
    <>
      {/* PC：左サイドバー */}
      <aside className={`hidden md:flex h-screen sticky top-0 bg-[#EEF3F6] flex-col border-r border-[#C8DCE8] shrink-0 transition-all duration-300 overflow-y-auto ${isOpen ? 'w-52' : 'w-14'}`}>
        {/* ロゴ＋開閉ボタン */}
        <div className="h-24 flex items-center justify-between border-b border-[#C8DCE8] px-3 shrink-0">
          {isOpen && (
            <div className="flex-1 h-12 flex items-center justify-center mr-2">
              <img src="/logo.png" alt="ロゴ" className="h-8 object-contain" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D6E8F2] text-[#5A7A8A] transition-colors shrink-0"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-col gap-1 p-2 mt-2 flex-1">
          {visibleLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-lg transition-colors ${
                isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'
              } ${
                pathname === href
                  ? 'bg-[#7BB8D4] text-white'
                  : 'text-[#5A7A8A] hover:bg-[#D6E8F2] hover:text-[#3A5A6A]'
              }`}
            >
              <span className="shrink-0">{icon}</span>
              {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* ログアウト */}
        <div className="p-2 mb-2">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="ログアウト"
            className={`flex items-center gap-3 rounded-lg transition-colors text-[#5A7A8A] hover:bg-[#D6E8F2] hover:text-[#3A5A6A] px-4 py-3 w-full ${!isOpen && 'justify-center'}`}
          >
            <span className="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {isOpen && <span className="text-sm font-medium">ログアウト</span>}
          </button>
        </div>
      </aside>

      {/* スマホ：下部固定ナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EEF3F6] border-t border-[#C8DCE8] flex items-center justify-around px-2 py-2">
        {visibleLinks.map(({ href, label, icon }) => (
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
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="ログアウト"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-[#5A7A8A]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </nav>
    </>
  );
}