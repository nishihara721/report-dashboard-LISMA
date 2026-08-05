'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/client/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // 最初に許可されたページへリダイレクト
    const firstPage = data.user.pages[0] ?? 'shared';
    router.push(`/client/${firstPage}`);
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#C8DCE8] p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="ロゴ" className="h-10 object-contain" />
        </div>
        <h1 className="text-lg font-semibold text-[#3A5A6A] text-center mb-6">
          レポートダッシュボード
        </h1>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#3A5A6A] block mb-1">ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
              placeholder="ログインIDを入力"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#3A5A6A] block mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
              placeholder="パスワードを入力"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              loading || !username || !password
                ? 'bg-[#EEF3F6] text-[#A0B8C4] cursor-not-allowed'
                : 'bg-[#7BB8D4] text-white hover:bg-[#5A9DBF]'
            }`}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}