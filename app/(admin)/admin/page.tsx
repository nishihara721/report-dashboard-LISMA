'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ClientUser = {
  id: string;
  username: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  pages: string[];
};

const ALL_PAGE_OPTIONS = [
  { key: 'shared', label: '期間別（共有用）' },
  { key: 'summary', label: 'サマリ' },
  { key: 'period', label: '期間別' },
  { key: 'popup', label: 'ポップアップ別' },
  { key: 'scenario', label: 'シナリオ別' },
  { key: 'exit', label: '離脱地点別' },
  { key: 'appeal', label: '訴求別' },
];

const showShared = process.env.NEXT_PUBLIC_ENABLE_SHARED_REPORT === 'true';

const PAGE_OPTIONS = ALL_PAGE_OPTIONS.filter((p) =>
  p.key !== 'shared' || showShared
);

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<ClientUser | null>(null);

  // フォームの状態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const showShared = process.env.NEXT_PUBLIC_ENABLE_SHARED_REPORT === 'true';
  const [selectedPages, setSelectedPages] = useState<string[]>(
    showShared ? ['shared'] : ['period']
  );
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
        router.push('/summary');
        return;
      }
      fetchUsers();
    }
  }, [status, session]);

  async function fetchUsers() {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function resetForm() {
    setUsername('');
    setPassword('');
    setDisplayName('');
    setSelectedPages(['shared']);
    setIsActive(true);
    setEditUser(null);
    setShowForm(false);
  }

  function openEditForm(user: ClientUser) {
    setEditUser(user);
    setUsername(user.username);
    setDisplayName(user.display_name);
    setPassword('');
    setSelectedPages(user.pages ?? []);
    setIsActive(user.is_active);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (editUser) {
      // 更新
      await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password || undefined,
          displayName,
          pages: selectedPages,
          isActive,
        }),
      });
    } else {
      // 新規作成
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName, pages: selectedPages }),
      });
    }
    resetForm();
    fetchUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm('このユーザーを削除しますか？')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-[#3A5A6A]">ユーザー一覧</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#7BB8D4] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5A9DBF]"
          >
            ＋ ユーザーを追加
          </button>
        </div>

        {/* ログインURL表示 */}
        <div className="bg-white rounded-xl border border-[#C8DCE8] p-4 mb-6">
          <p className="text-sm font-semibold text-[#3A5A6A] mb-1">クライアント用ログインURL</p>
          <p className="text-sm text-[#5A7A8A] font-mono">
            {typeof window !== 'undefined' ? `${window.location.origin}/client/login` : ''}
          </p>
        </div>

        {/* ユーザー追加・編集フォーム */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#C8DCE8] p-6 mb-6">
            <h2 className="text-base font-semibold text-[#3A5A6A] mb-4">
              {editUser ? 'ユーザーを編集' : 'ユーザーを追加'}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-1">クライアント名</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
                  placeholder="例: ○○株式会社"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-1">
                  ログインID
                  {editUser && <span className="text-[#A0B8C4] ml-2 font-normal">（変更不可）</span>}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editUser}
                  className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4] disabled:bg-[#EEF3F6]"
                  placeholder="例: client01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-1">
                  パスワード
                  {editUser && <span className="text-[#A0B8C4] ml-2 font-normal">（空欄の場合は変更しない）</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
                  placeholder="パスワードを入力"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-2">閲覧可能ページ</label>
                <div className="flex flex-wrap gap-3">
                  {PAGE_OPTIONS.map((page) => (
                    <label key={page.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.key)}
                        onChange={() => setSelectedPages((prev) =>
                          prev.includes(page.key)
                            ? prev.filter((p) => p !== page.key)
                            : [...prev, page.key]
                        )}
                        className="accent-[#7BB8D4]"
                      />
                      <span className="text-sm text-[#3A5A6A]">{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {editUser && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-[#7BB8D4]"
                    />
                    <span className="text-sm text-[#3A5A6A]">有効</span>
                  </label>
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!displayName || (!editUser && (!username || !password))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !displayName || (!editUser && (!username || !password))
                      ? 'bg-[#EEF3F6] text-[#A0B8C4] cursor-not-allowed'
                      : 'bg-[#7BB8D4] text-white hover:bg-[#5A9DBF]'
                  }`}
                >
                  {editUser ? '更新' : '作成'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-sm text-[#5A7A8A] bg-[#EEF3F6] hover:bg-[#D6E8F2]"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-xl border border-[#C8DCE8] overflow-hidden">
          <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
            <thead>
              <tr className="bg-[#7BB8D4]">
                <th className="px-4 py-3 text-left font-semibold text-white">クライアント名</th>
                <th className="px-4 py-3 text-left font-semibold text-white">ログインID</th>
                <th className="px-4 py-3 text-left font-semibold text-white">閲覧可能ページ</th>
                <th className="px-4 py-3 text-left font-semibold text-white">状態</th>
                <th className="px-4 py-3 text-left font-semibold text-white">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#A0B8C4]">
                    ユーザーがいません
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                    <td className="px-4 py-3">{user.display_name}</td>
                    <td className="px-4 py-3 font-mono">{user.username}</td>
                    <td className="px-4 py-3">
                      {(user.pages ?? []).map((page: string) =>
                        PAGE_OPTIONS.find((o) => o.key === page)?.label ?? page
                      ).join('、')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.is_active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(user)}
                          className="text-xs text-[#7BB8D4] hover:text-[#5A9DBF]"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}