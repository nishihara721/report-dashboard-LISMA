'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '../../../components/Loading';
import RecalcModal from '../../../components/RecalcModal';

type Rule = {
  from_date: string;
  type: string;
  rate?: number;
  cpf?: number;
  cpa?: number;
};

const TYPE_OPTIONS = [
  { value: 'budget', label: '予算（消化金額×割合）' },
  { value: 'affi_cpf', label: 'アフィ（CPF）' },
  { value: 'affi_cpa', label: 'アフィ（CPA）' },
  { value: 'budget_cpa', label: '予算＋CPA' },
];

export default function MediaCostNewPage() {
  const [media, setMedia] = useState('');
  const [rule, setRule] = useState<Rule>({
    from_date: new Date().toISOString().slice(0, 10),
    type: 'budget',
    rate: 1,
  });
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState<'calculating' | 'done' | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.email?.endsWith('@5s-inc.jp') ?? false;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      router.push('/summary');
      return;
    }
    Promise.resolve().then(() => setMounted(true));
  }, [status]);

  if (!mounted) return null;

  function updateRule(key: string, value: string | number) {
    setRule((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!media.trim()) return;
    setSaving(true);
    setRecalcStatus('calculating');

    await fetch('/api/media-cost-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: media.trim(), ...rule }),
    });

    setSaving(false);
    setRecalcStatus('done');
    setTimeout(() => {
      setRecalcStatus(null);
      router.push('/media-cost');
    }, 2000);
  }

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#3A5A6A]">メディアを追加</h1>
        <Link href="/media-cost" className="text-sm text-[#5A7A8A] hover:text-[#3A5A6A]">
          ← 一覧に戻る
        </Link>
      </div>

      <RecalcModal status={recalcStatus} />

      <div className="bg-white rounded-xl border border-[#C8DCE8] p-6">
        <div className="flex flex-col gap-4">
          {/* メディア名 */}
          <div>
            <label className="text-sm font-medium text-[#3A5A6A] block mb-1">メディア名</label>
            <input
              type="text"
              value={media}
              onChange={(e) => setMedia(e.target.value)}
              placeholder="例: YouTube"
              className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
            />
          </div>

          {/* 適用開始日 */}
          <div>
            <label className="text-sm font-medium text-[#3A5A6A] block mb-1">適用開始日</label>
            <input
              type="date"
              value={rule.from_date}
              onChange={(e) => updateRule('from_date', e.target.value)}
              className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
            />
          </div>

          {/* 計算方式 */}
          <div>
            <label className="text-sm font-medium text-[#3A5A6A] block mb-1">計算方式</label>
            <select
              value={rule.type}
              onChange={(e) => updateRule('type', e.target.value)}
              className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 割合 */}
          {(rule.type === 'budget' || rule.type === 'budget_cpa') && (
            <div>
              <label className="text-sm font-medium text-[#3A5A6A] block mb-1">上乗せ割合（例: 1.2 = 20%上乗せ）</label>
              <input
                type="number"
                step="0.01"
                value={rule.rate ?? 1}
                onChange={(e) => updateRule('rate', parseFloat(e.target.value))}
                className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
              />
            </div>
          )}

          {/* CPF単価 */}
          {rule.type === 'affi_cpf' && (
            <div>
              <label className="text-sm font-medium text-[#3A5A6A] block mb-1">友だち追加単価（円）</label>
              <input
                type="number"
                value={rule.cpf ?? '0'}
                onChange={(e) => updateRule('cpf', parseInt(e.target.value))}
                className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
              />
            </div>
          )}

          {/* CPA単価 */}
          {(rule.type === 'affi_cpa' || rule.type === 'budget_cpa') && (
            <div>
              <label className="text-sm font-medium text-[#3A5A6A] block mb-1">成果単価（円）</label>
              <input
                type="number"
                value={rule.cpa ?? '0'}
                onChange={(e) => updateRule('cpa', parseInt(e.target.value))}
                className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
              />
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleSave}
              disabled={!media.trim() || saving}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !media.trim() || saving
                  ? 'bg-[#EEF3F6] text-[#A0B8C4] cursor-not-allowed'
                  : 'bg-[#7BB8D4] text-white hover:bg-[#5A9DBF]'
              }`}
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              href="/media-cost"
              className="flex-1 py-2 rounded-lg text-sm text-center text-[#5A7A8A] bg-[#EEF3F6] hover:bg-[#D6E8F2]"
            >
              キャンセル
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}