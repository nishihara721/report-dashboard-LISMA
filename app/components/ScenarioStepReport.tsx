'use client';

import { useEffect, useState } from 'react';
import Loading from './Loading';

type StepRow = {
  step: string;
  send_count: number;
  click_count: number;
  click_rate: string;
  cv_count: number;
  cvr: string;
  block_count: number;
  block_rate: string;
};

export default function ScenarioStepReport() {
  const [sValues, setSValues] = useState<string[]>([]);
  const [selectedS, setSelectedS] = useState('');
  const [rows, setRows] = useState<StepRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [valuesLoading, setValuesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      setValuesLoading(true);
    });
    fetch('/api/s-values')
      .then((res) => res.json())
      .then((data) => {
        setSValues(Array.isArray(data) ? data : []);
        setValuesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedS) return;
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/scenario-steps?s=${encodeURIComponent(selectedS)}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedS]);

  if (!mounted) return null;

  // 総計計算
  const total = rows.reduce(
    (acc, r) => ({
      send_count: acc.send_count,
      click_count: acc.click_count + r.click_count,
      cv_count: acc.cv_count + r.cv_count,
      block_count: acc.block_count + r.block_count,
    }),
    { send_count: rows[0]?.send_count ?? 0, click_count: 0, cv_count: 0, block_count: 0 }
  );

  const firstSendCount = rows[0]?.send_count ?? 0;

  return (
    <div>
      {/* シナリオ選択 */}
      <div className="mb-4 bg-white rounded-xl border border-[#C8DCE8] p-4">
        <span className="text-sm font-semibold text-[#3A5A6A] mr-4">シナリオ選択：</span>
        {valuesLoading ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 border-2 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
            <span className="text-sm text-[#5A7A8A]">読み込み中...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {sValues.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedS(s)}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  selectedS === s
                    ? 'bg-[#7BB8D4] text-white'
                    : 'bg-[#EEF3F6] text-[#5A7A8A] hover:bg-[#D6E8F2]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* テーブル */}
      {!selectedS ? (
        <p className="text-sm text-[#5A7A8A]">シナリオを選択してください</p>
      ) : loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#C8DCE8]">
          <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
            <thead className="sticky top-0 z-10">
              {/* ヘッダー行 */}
              <tr className="bg-[#7BB8D4]">
                {['通数', '送信人数', 'クリック数', 'クリック率', 'CV数', 'CVR', 'ブロック数', 'ブロック率'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap text-white bg-[#7BB8D4]"
                    style={{ boxShadow: 'inset -1px 0 0 #5A9DBF' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
              {/* 総計行 */}
              <tr className="bg-[#D6E8F2] font-semibold" style={{ boxShadow: '0 2px 0 #C8DCE8' }}>
                <td className="px-4 py-2 bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>総計</td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.send_count.toLocaleString()}</td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.click_count.toLocaleString()}</td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>
                  {firstSendCount > 0 ? ((total.click_count / firstSendCount) * 100).toFixed(2) + '%' : '-'}
                </td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.cv_count.toLocaleString()}</td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>
                  {firstSendCount > 0 ? ((total.cv_count / firstSendCount) * 100).toFixed(2) + '%' : '-'}
                </td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>{total.block_count.toLocaleString()}</td>
                <td className="px-4 py-2 text-right bg-[#D6E8F2]" style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>
                  {firstSendCount > 0 ? ((total.block_count / firstSendCount) * 100).toFixed(2) + '%' : '-'}
                </td>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.step} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                  <td className="px-4 py-2 border-r border-[#EEF3F6] whitespace-nowrap">{row.step}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.send_count.toLocaleString()}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.click_count.toLocaleString()}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.click_rate}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cv_count.toLocaleString()}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.cvr}</td>
                  <td className="px-4 py-2 border-r border-[#EEF3F6] text-right">{row.block_count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{row.block_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}