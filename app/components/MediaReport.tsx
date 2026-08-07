'use client';

import { useEffect, useState } from 'react';
import { useFilterBar } from '../hooks/useFilterBar';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import FilterBar from './FilterBar';
import SelectorBar from './SelectorBar';
import Loading from './Loading';

type DailyRow = {
  date: string;
  cl: number;
  friend: number;
  friendRate: string;
  cv: number;
  cvr: string;
  adCost?: number;
  cpf?: number;
  cpa?: number;
};

const COLUMNS = [
  { key: 'date', label: '日付', visible: true },
  { key: 'cl', label: 'CL数', visible: true },
  { key: 'friend', label: '友だち追加数', visible: true },
  { key: 'friendRate', label: '友だち追加率', visible: true },
  { key: 'cv', label: 'CV数', visible: true },
  { key: 'cvr', label: 'CVR', visible: true },
  { key: 'cpf', label: 'CPF', visible: true },
  { key: 'cpa', label: 'CPA', visible: true },
  { key: 'adCost', label: '広告費', visible: true },
];

function MediaTableWrapper({
  mediaValue,
  viewMode,
  apiDateRange,
  visibleColumns,
}: {
  mediaValue: string;
  viewMode: 'daily' | 'monthly';
  apiDateRange: string;
  visibleColumns: () => { key: string; label: string; visible: boolean }[];
}) {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/report-by-media?media=${encodeURIComponent(mediaValue)}&${apiDateRange}`)
      .then((res) => res.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaValue, apiDateRange]);

  if (loading) return <Loading />;

  const monthlyRows = (() => {
    const map: Record<string, { cl: number; friend: number; cv: number; adCost?: number; cpf?: number; cpa?: number }> = {};
    for (const r of rows) {
      const month = r.date.slice(0, 7);
      if (!map[month]) map[month] = { cl: 0, friend: 0, cv: 0, adCost: 0, cpf: 0, cpa: 0 };
      map[month].cl += r.cl;
      map[month].friend += r.friend;
      map[month].cv += r.cv;
      map[month].adCost = (map[month].adCost ?? 0) + (r.adCost ?? 0);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  })();

  const total = rows.reduce(
    (acc, r) => ({
      cl: acc.cl + r.cl,
      friend: acc.friend + r.friend,
      cv: acc.cv + r.cv,
      adCost: acc.adCost + (r.adCost ?? 0),
    }),
    { cl: 0, friend: 0, cv: 0, adCost: 0 }
  );

  const displayRows = viewMode === 'daily' ? rows : monthlyRows.map(([month, d]) => ({
    date: month,
    cl: d.cl,
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    adCost: d.adCost,
    cpf: d.cpf,
    cpa: d.cpa,
  }));

  return (
    <div className="min-w-[600px]">
      <h3 className="text-sm font-semibold text-[#3A5A6A] mb-2 px-1">{mediaValue}</h3>
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-[#C8DCE8]" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#7BB8D4]">
              {visibleColumns().map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold whitespace-nowrap text-white bg-[#7BB8D4]" style={{ boxShadow: 'inset -1px 0 0 #5A9DBF' }}>
                  {col.label}
                </th>
              ))}
            </tr>
            <tr className="bg-[#D6E8F2] font-semibold" style={{ boxShadow: '0 2px 0 #C8DCE8' }}>
              {visibleColumns().map((col) => (
                <td key={col.key} className={`px-4 py-2 bg-[#D6E8F2] ${col.key === 'date' ? 'whitespace-nowrap' : 'text-right'}`} style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}>
                  {col.key === 'date' ? '総計'
                    : col.key === 'cl' ? total.cl.toLocaleString()
                    : col.key === 'friend' ? total.friend.toLocaleString()
                    : col.key === 'friendRate' ? (total.cl > 0 ? ((total.friend / total.cl) * 100).toFixed(2) + '%' : '-')
                    : col.key === 'cv' ? total.cv.toLocaleString()
                    : col.key === 'cvr' ? (total.friend > 0 ? ((total.cv / total.friend) * 100).toFixed(2) + '%' : '-')
                    : col.key === 'adCost' ? (total.adCost > 0 ? `¥${total.adCost.toLocaleString()}` : '-')
                    : col.key === 'cpf' ? (total.friend > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.friend).toLocaleString()}` : '-')
                    : col.key === 'cpa' ? (total.cv > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.cv).toLocaleString()}` : '-')
                    : '-'}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.date} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                {visibleColumns().map((col) => (
                  <td key={col.key} className="px-4 py-2 border-r border-[#EEF3F6] last:border-r-0">
                    {col.key === 'date' ? (
                      <span className="whitespace-nowrap">{row.date}</span>
                    ) : col.key === 'friendRate' || col.key === 'cvr' ? (
                      <span className="text-right block">{row[col.key as keyof typeof row] ?? '-'}</span>
                    ) : col.key === 'adCost' ? (
                      <span className="text-right block">
                        {row.adCost ? `¥${row.adCost.toLocaleString()}` : '-'}
                      </span>
                    ) : col.key === 'cpf' ? (
                      <span className="text-right block">
                        {row.cpf ? `¥${row.cpf.toLocaleString()}` : '-'}
                      </span>
                    ) : col.key === 'cpa' ? (
                      <span className="text-right block">
                        {row.cpa ? `¥${row.cpa.toLocaleString()}` : '-'}
                      </span>
                    ) : (
                      <span className="text-right block">{Number(row[col.key as keyof typeof row] ?? 0).toLocaleString()}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MediaReport() {
  const [mediaValues, setMediaValues] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [valuesLoading, setValuesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const filter = useFilterBar();
  const { columns, toggleColumn, visibleColumns } = useColumnVisibility(COLUMNS);

  useEffect(() => {
    Promise.resolve().then(() => { setMounted(true); setValuesLoading(true); });
    fetch('/api/media-values')
      .then((res) => res.json())
      .then((data) => {
        setMediaValues(Array.isArray(data) ? data : []);
        setValuesLoading(false);
      });
  }, []);

  if (!mounted) return null;

  function toggleMedia(media: string) {
    setSelectedMedia((prev) =>
      prev.includes(media) ? prev.filter((v) => v !== media) : [...prev, media]
    );
  }

  return (
    <div>
      <FilterBar {...filter} columns={columns} onToggleColumn={toggleColumn} />
      <SelectorBar
        label="メディア選択："
        values={mediaValues}
        selected={selectedMedia}
        onToggle={toggleMedia}
        emptyMessage="読み込み中..."
        loading={valuesLoading}
      />
      {selectedMedia.length === 0 ? (
        <p className="text-sm text-[#5A7A8A]">メディアを選択してください</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {selectedMedia.map((media) => (
            <MediaTableWrapper
              key={media}
              mediaValue={media}
              viewMode={filter.viewMode}
              apiDateRange={filter.apiDateRange}
              visibleColumns={visibleColumns}
            />
          ))}
        </div>
      )}
    </div>
  );
}