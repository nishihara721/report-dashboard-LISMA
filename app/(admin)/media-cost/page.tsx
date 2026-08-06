'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '../../components/Loading';

type Rule = {
  from_date: string;
  type: string;
  rate?: number;
  cpf?: number;
  cpa?: number;
};

type Settings = Record<string, Rule[]>;

const TYPE_LABELS: Record<string, string> = {
  budget: '予算（消化金額×割合）',
  affi_cpf: 'アフィ（CPF）',
  affi_cpa: 'アフィ（CPA）',
  budget_cpa: '予算＋CPA',
};

function getSettingDetail(rule: Rule) {
  switch (rule.type) {
    case 'budget': return `割合: ${rule.rate ?? 1}`;
    case 'affi_cpf': return `CPF単価: ¥${(rule.cpf ?? 0).toLocaleString()}`;
    case 'affi_cpa': return `CPA単価: ¥${(rule.cpa ?? 0).toLocaleString()}`;
    case 'budget_cpa': return `割合: ${rule.rate ?? 1} / CPA単価: ¥${(rule.cpa ?? 0).toLocaleString()}`;
    default: return '-';
  }
}

export default function MediaCostPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
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
      Promise.resolve().then(() => { setMounted(true); setLoading(true); });
      fetch('/api/media-cost-settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data ?? {});
          setLoading(false);
        });
    }
  }, [status]);

  if (!mounted) return null;
  if (loading) return <Loading />;

  const mediaList = Object.keys(settings).sort();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#3A5A6A]">広告費設定</h1>
        <Link
          href="/media-cost/new"
          className="bg-[#7BB8D4] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5A9DBF]"
        >
          ＋ メディアを追加
        </Link>
      </div>

      {mediaList.length === 0 ? (
        <p className="text-sm text-[#5A7A8A]">設定がありません。「メディアを追加」から追加してください。</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#C8DCE8] overflow-hidden">
          <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
            <thead>
              <tr className="bg-[#7BB8D4]">
                <th className="px-4 py-3 text-left font-semibold text-white">メディア</th>
                <th className="px-4 py-3 text-left font-semibold text-white">適用開始日</th>
                <th className="px-4 py-3 text-left font-semibold text-white">計算方式</th>
                <th className="px-4 py-3 text-left font-semibold text-white">設定値</th>
                <th className="px-4 py-3 text-left font-semibold text-white">操作</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((media) => {
                const rules = [...(settings[media] ?? [])].sort((a, b) =>
                  b.from_date.localeCompare(a.from_date)
                );
                return rules.map((rule, index) => (
                  <tr key={`${media}-${rule.from_date}`} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                    {index === 0 ? (
                      <td className="px-4 py-3 font-medium" rowSpan={rules.length}>
                        {media}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">{rule.from_date}</td>
                    <td className="px-4 py-3">{TYPE_LABELS[rule.type] ?? '未設定'}</td>
                    <td className="px-4 py-3 text-[#5A7A8A]">{getSettingDetail(rule)}</td>
                    {index === 0 ? (
                      <td className="px-4 py-3" rowSpan={rules.length}>
                        <Link
                          href={`/media-cost/edit/${encodeURIComponent(media)}`}
                          className="text-xs text-[#7BB8D4] hover:text-[#5A9DBF]"
                        >
                          編集
                        </Link>
                      </td>
                    ) : null}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[#A0B8C4] mt-4">
        ※ 設定が未登録のメディアは広告費・CPF・CPAが0で表示されます。GASを再実行すると新しい設定が反映されます。
      </p>
    </div>
  );
}