'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center">
      <div className="bg-white rounded-xl border border-[#C8DCE8] p-10 flex flex-col items-center gap-6 w-80">
        <div className="w-full h-12 flex items-center justify-center">
          <img src="/logo.png" alt="5S株式会社" className="h-10 object-contain" />
        </div>
        <p className="text-sm text-[#5A7A8A]">レポートダッシュボード</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/summary' })}
          className="w-full bg-[#7BB8D4] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#5A9DBF] transition-colors"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}