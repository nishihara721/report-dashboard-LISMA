'use client';

import { useEffect, useState } from 'react';
import Loading from './Loading';

type SummaryRow = {
  label: string;
  cl: number;
  friend: number;
  friendRate: string;
  cv: number;
  cvr: string;
  adCost: number;
  cpf: number;
  cpa: number;
};

export default function SummaryTable() {
  const [data, setData] = useState<{ byMonth: SummaryRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => { setMounted(true); setLoading(true); });
    fetch('/api/summary')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError('データの取得に失敗しました'); setLoading(false); });
  }, []);

  if (!mounted) return null;

  if (loading) return <Loading />;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return null;

  const total = (data.byMonth ?? []).reduce(
    (acc, r) => ({
      cl: acc.cl + r.cl,
      friend: acc.friend + r.friend,
      cv: acc.cv + r.cv,
      adCost: acc.adCost + (r.adCost ?? 0),
    }),
    { cl: 0, friend: 0, cv: 0, adCost: 0 }
  );

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[#3A5A6A] mb-3">月別レポート</h2>
      <div className="overflow-x-auto rounded-xl border border-[#C8DCE8]">
        <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
          <thead>
            <tr className="bg-[#7BB8D4]">
              {['年月', 'CL数', '友だち追加数', '友だち追加率', 'CV数', 'CVR', 'CPF', 'CPA', '広告費'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap text-white bg-[#7BB8D4]" style={{ boxShadow: 'inset -1px 0 0 #5A9DBF' }}>
                  {h}
                </th>
              ))}
            </tr>
            {/* 総計行 */}
            <tr className="bg-[#D6E8F2] font-semibold" style={{ boxShadow: '0 2px 0 #C8DCE8' }}>
              <td className="px-4 py-2 bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>総計</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.cl.toLocaleString()}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.friend.toLocaleString()}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.cl > 0 ? ((total.friend / total.cl) * 100).toFixed(2) + '%' : '-'}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.cv.toLocaleString()}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.friend > 0 ? ((total.cv / total.friend) * 100).toFixed(2) + '%' : '-'}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.friend > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.friend).toLocaleString()}` : '-'}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.cv > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.cv).toLocaleString()}` : '-'}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.adCost > 0 ? `¥${total.adCost.toLocaleString()}` : '-'}</td>
            </tr>
          </thead>
          <tbody>
            {(data.byMonth ?? []).map((row) => (
              <tr key={row.label} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                <td className="px-4 py-2 border-r border-[#EEF3F6] whitespace-nowrap font-medium">{row.label}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cl.toLocaleString()}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.friend.toLocaleString()}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.friendRate}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cv.toLocaleString()}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cvr}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cpf > 0 ? `¥${row.cpf.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cpa > 0 ? `¥${row.cpa.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.adCost > 0 ? `¥${row.adCost.toLocaleString()}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}