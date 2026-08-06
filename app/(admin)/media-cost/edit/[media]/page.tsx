'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '../../../../components/Loading';

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

export default function MediaCostEditPage({
  params,
}: {
  params: Promise<{ media: string }>;
}) {
  const [media, setMedia] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.email?.endsWith('@5s-inc.jp') ?? false;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      if (!isAdmin) {
        router.push('/summary');
        return;
      }
      params.then(({ media: mediaParam }) => {
        const decodedMedia = decodeURIComponent(mediaParam);
        setMedia(decodedMedia);
        Promise.resolve().then(() => { setMounted(true); setLoading(true); });
        fetch('/api/media-cost-settings')
          .then((res) => res.json())
          .then((data) => {
            setRules(data[decodedMedia] ?? []);
            setLoading(false);
          });
      });
    }
  }, [status]);

  if (!mounted) return null;
  if (loading) return <Loading />;

  function addRule() {
    const today = new Date().toISOString().slice(0, 10);
    setRules((prev) => [...prev, { from_date: today, type: 'budget', rate: 1 }]);
  }

  function updateRule(index: number, key: string, value: string | number) {
    setRules((prev) => prev.map((r, i) => i === index ? { ...r, [key]: value } : r));
  }

  async function handleSave(index: number) {
    const rule = rules[index];
    setSaving(rule.from_date);
    await fetch('/api/media-cost-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media, ...rule }),
    });
    setSaving(null);
    setSaved(rule.from_date);
    setTimeout(() => setSaved(null), 2000);
  }

  async function handleDelete(index: number) {
    const rule = rules[index];
    if (!confirm(`${rule.from_date} の設定を削除しますか？`)) return;
    await fetch('/api/media-cost-settings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media, from_date: rule.from_date }),
    });
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#3A5A6A]">{media} の広告費設定</h1>
        <Link href="/media-cost" className="text-sm text-[#5A7A8A] hover:text-[#3A5A6A]">
          ← 一覧に戻る
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {rules.length === 0 && (
          <p className="text-sm text-[#5A7A8A]">設定がありません。追加してください。</p>
        )}

        {rules
          .sort((a, b) => b.from_date.localeCompare(a.from_date))
          .map((rule, index) => (
          <div key={index} className="bg-white rounded-xl border border-[#C8DCE8] p-6">
            <div className="flex flex-col gap-4">
              {/* 適用開始日 */}
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-1">適用開始日</label>
                <input
                  type="date"
                  value={rule.from_date}
                  onChange={(e) => updateRule(index, 'from_date', e.target.value)}
                  className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
                />
              </div>

              {/* 計算方式 */}
              <div>
                <label className="text-sm font-medium text-[#3A5A6A] block mb-1">計算方式</label>
                <select
                  value={rule.type}
                  onChange={(e) => updateRule(index, 'type', e.target.value)}
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
                    onChange={(e) => updateRule(index, 'rate', parseFloat(e.target.value))}
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
                    value={rule.cpf ?? 0}
                    onChange={(e) => updateRule(index, 'cpf', parseInt(e.target.value))}
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
                    value={rule.cpa ?? 0}
                    onChange={(e) => updateRule(index, 'cpa', parseInt(e.target.value))}
                    className="w-full border border-[#C8DCE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7BB8D4]"
                  />
                </div>
              )}

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(index)}
                  disabled={saving === rule.from_date}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    saving === rule.from_date
                      ? 'bg-[#EEF3F6] text-[#A0B8C4] cursor-not-allowed'
                      : saved === rule.from_date
                      ? 'bg-green-400 text-white'
                      : 'bg-[#7BB8D4] text-white hover:bg-[#5A9DBF]'
                  }`}
                >
                  {saving === rule.from_date ? '保存中...' : saved === rule.from_date ? '保存しました！' : '保存'}
                </button>
                
                <button
                  onClick={() => handleDelete(index)}
                  className="px-4 py-2 rounded-lg text-sm text-red-400 bg-[#EEF3F6] hover:bg-red-50"
                >
                  削除
                </button>
                
              </div>
                {saved && (
                    <p className="text-sm text-[#5A7A8A] mt-2">
                        ⚠️ 設定を保存しました。新しい期間のデータに反映するにはGASを再実行してください。
                    </p>
                )}
            </div>
          </div>
        ))}

        
      </div>
    </div>
  );
}