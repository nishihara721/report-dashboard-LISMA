'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFilterBar } from '../hooks/useFilterBar';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import FilterBar from './FilterBar';
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

export default function ReportTable() {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<{ date: string; value: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();
  const canEdit = session?.user?.email?.endsWith('@5s-inc.jp') ?? false;

  const filter = useFilterBar();
  const { columns, toggleColumn, visibleColumns } = useColumnVisibility(COLUMNS);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      setLoading(true);
    });
    Promise.all([
      fetch(`/api/report?${filter.apiDateRange}`).then((res) => res.json()),
      fetch(`/api/notes?${filter.apiDateRange}`).then((res) => res.json()),
    ]).then(([reportData, notesData]) => {
      setRows(Array.isArray(reportData) ? reportData : []);
      setNotes(notesData ?? {});
      setLoading(false);
    }).catch(() => {
      setError('データの取得に失敗しました');
      setLoading(false);
    });
  }, [filter.apiDateRange]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.note-edit-area')) {
        setEditingNote(null);
      }
    }
    if (editingNote) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingNote]);

  if (!mounted) return null;

  function handleNoteEdit(date: string, value: string) {
    setEditingNote({ date, value });
  }

  async function handleNoteSave(date: string, note: string) {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, note }),
    });
    setNotes((prev) => ({ ...prev, [date]: note }));
    setEditingNote(null);
  }

  function handleNoteCancel() {
    setEditingNote(null);
  }

  // 総計計算
  const total = rows.reduce(
    (acc, r) => ({
      cl: acc.cl + r.cl,
      friend: acc.friend + r.friend,
      cv: acc.cv + r.cv,
      adCost: acc.adCost + (r.adCost ?? 0),
    }),
    { cl: 0, friend: 0, cv: 0, adCost: 0 }
  );

  function renderTotalCell(colKey: string): string {
    switch (colKey) {
      case 'date': return '総計';
      case 'cl': return total.cl.toLocaleString();
      case 'friend': return total.friend.toLocaleString();
      case 'friendRate': return total.cl > 0 ? ((total.friend / total.cl) * 100).toFixed(2) + '%' : '-';
      case 'cv': return total.cv.toLocaleString();
      case 'cvr': return total.friend > 0 ? ((total.cv / total.friend) * 100).toFixed(2) + '%' : '-';
      case 'adCost': return total.adCost > 0 ? `¥${total.adCost.toLocaleString()}` : '-';
      case 'cpf': return total.friend > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.friend).toLocaleString()}` : '-';
      case 'cpa': return total.cv > 0 && total.adCost > 0 ? `¥${Math.round(total.adCost / total.cv).toLocaleString()}` : '-';
      default: return '-';
    }
  }

  function renderNoteWithLink(note: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = note.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#7BB8D4] underline hover:text-[#5A9DBF]">
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div>
      <FilterBar {...filter} columns={columns} onToggleColumn={toggleColumn} />
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : loading ? (
        <Loading />
      ) : (
        <div
          className="overflow-x-auto overflow-y-auto rounded-xl border border-[#C8DCE8]"
          style={{ maxHeight: 'calc(100vh - 150px)' }}
        >
          <table className="min-w-full border-collapse text-sm text-[#3A5A6A]">
            <thead className="sticky top-0 z-10">
              {/* ヘッダー行 */}
              <tr className="bg-[#7BB8D4]">
                {visibleColumns().map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap text-white bg-[#7BB8D4]"
                    style={{ boxShadow: 'inset -1px 0 0 #5A9DBF' }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
              {/* 総計行 */}
              <tr className="bg-[#D6E8F2] font-semibold" style={{ boxShadow: '0 2px 0 #C8DCE8' }}>
                {visibleColumns().map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 bg-[#D6E8F2] ${col.key === 'date' ? 'whitespace-nowrap' : 'text-right'}`}
                    style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}
                  >
                    {renderTotalCell(col.key)}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                  {visibleColumns().map((col) => (
                    <td key={col.key} className="px-4 py-2 border-r border-[#EEF3F6] last:border-r-0">
                      {col.key === 'date' ? (
                        <span className="whitespace-nowrap">{row.date}</span>
                      ) : col.key === 'friendRate' || col.key === 'cvr' ? (
                        <span className="text-right block">{row[col.key as keyof typeof row] ?? '-'}</span>
                      ) : col.key === 'adCost' ? (
                        <span className="text-right block">
                          {row.adCost !== undefined && row.adCost > 0 ? `¥${row.adCost.toLocaleString()}` : '-'}
                        </span>
                      ) : col.key === 'cpf' ? (
                        <span className="text-right block">
                          {row.cpf !== undefined && row.cpf > 0 ? `¥${row.cpf.toLocaleString()}` : '-'}
                        </span>
                      ) : col.key === 'cpa' ? (
                        <span className="text-right block">
                          {row.cpa !== undefined && row.cpa > 0 ? `¥${row.cpa.toLocaleString()}` : '-'}
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
      )}
    </div>
  );
}