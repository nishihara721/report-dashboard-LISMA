'use client';

import { useEffect, useState } from 'react';
import Loading from './Loading';
import { calcRate } from '../lib/utils';

type SummaryRow = {
  label: string;
  pv: number;
  imp: number;
  impRate: string;
  cl: number;
  ctr: string;
  friend: number;
  friendRate: string;
  cv: number;
  cvr: string;
  billing: number;
};

type SummaryData = {
  byMonth: SummaryRow[];
  byP: SummaryRow[];
  byS: SummaryRow[];
};

function SummaryTableBlock({
  title,
  rows,
  firstColLabel,
  hidePv = false,
}: {
  title: string;
  rows: SummaryRow[];
  firstColLabel: string;
  hidePv?: boolean;
}) {
  const headers = [
    firstColLabel,
    ...(!hidePv ? ['PV数'] : []),
    'imp数',
    ...(!hidePv ? ['imp率'] : []),
    'CL数', 'CTR', '友だち追加数', '友だち追加率', 'CV数', 'CVR', '請求額'
  ];

  // 総計計算
  const total = rows.reduce(
    (acc, r) => ({
      pv: acc.pv + r.pv,
      imp: acc.imp + r.imp,
      cl: acc.cl + r.cl,
      friend: acc.friend + r.friend,
      cv: acc.cv + r.cv,
      billing: acc.billing + r.billing,
    }),
    { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 }
  );

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[#3A5A6A] mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-[#C8DCE8]">
        <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
          <thead>
            {/* ヘッダー行 */}
            <tr className="bg-[#7BB8D4]">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap border-r border-[#5A9DBF] last:border-r-0 text-white bg-[#7BB8D4]">
                  {h}
                </th>
              ))}
            </tr>
            {/* 総計行 */}
            <tr className="bg-[#D6E8F2] border-b-2 border-[#C8DCE8] font-semibold">
              <td className="px-4 py-2 whitespace-nowrap border-r border-[#C8DCE8] bg-[#D6E8F2]">総計</td>
              {!hidePv && <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{total.pv.toLocaleString()}</td>}
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{total.imp.toLocaleString()}</td>
              {!hidePv && <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{calcRate(total.imp, total.pv)}</td>}
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{total.cl.toLocaleString()}</td>
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{calcRate(total.cl, total.imp)}</td>
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{total.friend.toLocaleString()}</td>
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{calcRate(total.friend, total.cl)}</td>
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{total.cv.toLocaleString()}</td>
              <td className="px-4 py-2 text-right border-r border-[#C8DCE8] bg-[#D6E8F2]">{calcRate(total.cv, total.friend)}</td>
              <td className="px-4 py-2 text-right bg-[#D6E8F2]">¥{total.billing.toLocaleString()}</td>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                <td className="px-4 py-2 whitespace-nowrap border-r border-[#EEF3F6] font-medium">{row.label}</td>
                {!hidePv && <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.pv.toLocaleString()}</td>}
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.imp.toLocaleString()}</td>
                {!hidePv && <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.impRate}</td>}
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.cl.toLocaleString()}</td>
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.ctr}</td>
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.friend.toLocaleString()}</td>
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.friendRate}</td>
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.cv.toLocaleString()}</td>
                <td className="px-4 py-2 text-right border-r border-[#EEF3F6]">{row.cvr}</td>
                <td className="px-4 py-2 text-right">¥{row.billing.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SummaryTable() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/summary')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError('データの取得に失敗しました'); setLoading(false); });
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : loading ? (
        <Loading />
      ) : !data ? null : (
        <>
          {data.byMonth && <SummaryTableBlock title="月別レポート" rows={data.byMonth} firstColLabel="年月" />}
          {data.byP && <SummaryTableBlock title="ポップアップ別レポート" rows={data.byP} firstColLabel="ポップアップ" hidePv={true} />}
          {data.byS && <SummaryTableBlock title="シナリオ別レポート" rows={data.byS} firstColLabel="シナリオ" hidePv={true} />}
        </>
      )}
    </div>
  );
}