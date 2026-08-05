'use client';

import { Column } from '../hooks/useColumnVisibility';
import { calcRate } from '../lib/utils';

type MonthlyData = {
  pv: number; imp: number; cl: number;
  friend: number; cv?: number; billing?: number;
};

export type DailyRow = {
  date: string;
  pv: number;
  imp: number;
  impRate: string;
  cl: number;
  ctr: string;
  friend: number;
  friendRate: string;
  cv?: number;
  cvr?: string;
  billing?: number;
  note?: string;
};

function renderNoteWithLink(note: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = note.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7BB8D4] underline hover:text-[#5A9DBF]"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ReportTableCore({
  viewMode,
  filteredRows,
  visibleColumns,
  title,
  onNoteEdit,
  onNoteSave,
  onNoteCancel,
  editingNote,
  canEdit,
}: {
  viewMode: 'daily' | 'monthly';
  filteredRows: DailyRow[];
  visibleColumns: () => Column[];
  title?: string;
  onNoteEdit?: (date: string, value: string) => void;
  onNoteSave?: (date: string, note: string) => void;
  onNoteCancel?: () => void;
  editingNote?: { date: string; value: string } | null;
  canEdit?: boolean;
}) {
  // 月別集計
  const monthlyRows = (() => {
    const map: Record<string, MonthlyData> = {};
    for (const r of filteredRows) {
      const month = r.date.slice(0, 7);
      if (!map[month]) map[month] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
      map[month].pv += r.pv;
      map[month].imp += r.imp;
      map[month].cl += r.cl;
      map[month].friend += r.friend;
      if (r.cv !== undefined) map[month].cv = (map[month].cv ?? 0) + r.cv;
      if (r.cv !== undefined) {
        map[month].billing = (map[month].billing ?? 0) + (r.billing ?? 0);
      }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  })();

  // 総計計算
  const total = (() => {
    if (viewMode === 'daily') {
      return filteredRows.reduce(
        (acc, r) => ({
          pv: acc.pv + r.pv,
          imp: acc.imp + r.imp,
          cl: acc.cl + r.cl,
          friend: acc.friend + r.friend,
          cv: acc.cv + (r.cv ?? 0),
          billing: acc.billing + (r.billing ?? 0),
        }),
        { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 }
      );
    } else {
      return monthlyRows.reduce(
        (acc, [, d]) => ({
          pv: acc.pv + d.pv,
          imp: acc.imp + d.imp,
          cl: acc.cl + d.cl,
          friend: acc.friend + d.friend,
          cv: acc.cv + (d.cv ?? 0),
          billing: acc.billing + (d.billing ?? 0),
        }),
        { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 }
      );
    }
  })();

  function renderTotalCell(colKey: string): string {
    switch (colKey) {
      case 'date': return '総計';
      case 'pv': return total.pv.toLocaleString();
      case 'imp': return total.imp.toLocaleString();
      case 'impRate': return calcRate(total.imp, total.pv);
      case 'cl': return total.cl.toLocaleString();
      case 'ctr': return calcRate(total.cl, total.imp);
      case 'friend': return total.friend.toLocaleString();
      case 'friendRate': return calcRate(total.friend, total.cl);
      case 'cv': return total.cv.toLocaleString();
      case 'cvr': return calcRate(total.cv, total.friend);
      case 'unitPrice': return '-';
      case 'billing': return `¥${total.billing.toLocaleString()}`;
      case 'note': return '';
      default: return '-';
    }
  }

  return (
    <div className={title ? 'min-w-[600px]' : ''}>
      {title && <h3 className="text-sm font-semibold text-[#3A5A6A] mb-2 px-1">{title}</h3>}
      <div
        className="overflow-x-auto overflow-y-auto rounded-xl border border-[#C8DCE8]"
        style={{ maxHeight: title ? 'calc(100vh - 320px)' : 'calc(100vh - 150px)' }}
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
                  className={`px-4 py-2 bg-[#D6E8F2] ${col.key === 'date' || col.key === 'note' ? 'whitespace-nowrap' : 'text-right'}`}
                  style={{ boxShadow: 'inset -1px 0 0 #C8DCE8' }}
                >
                  {renderTotalCell(col.key)}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewMode === 'daily' ? (
              filteredRows.map((row) => (
                <tr key={row.date} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                  {visibleColumns().map((col) => (
                    <td key={col.key} className="px-4 py-2 border-r border-[#EEF3F6] last:border-r-0">
                      {col.key === 'date' ? (
                        <span className="whitespace-nowrap">{row.date}</span>
                      ) : col.key === 'note' ? (
                        canEdit ? (
                          editingNote?.date === row.date ? (
                            <div className="flex gap-2 min-w-[250px] note-edit-area">
                              <input
                                type="text"
                                value={editingNote.value}
                                onChange={(e) => onNoteEdit?.(row.date, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') onNoteSave?.(row.date, editingNote.value);
                                  if (e.key === 'Escape') onNoteCancel?.();
                                }}
                                className="flex-1 border border-[#C8DCE8] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#7BB8D4]"
                                autoFocus
                              />
                              <button
                                tabIndex={0}
                                onClick={() => onNoteSave?.(row.date, editingNote.value)}
                                className="text-xs bg-[#7BB8D4] text-white px-2 py-1 rounded whitespace-nowrap"
                              >
                                保存
                              </button>
                              <button
                                tabIndex={0}
                                onClick={() => onNoteCancel?.()}
                                className="text-xs bg-[#EEF3F6] text-[#5A7A8A] px-2 py-1 rounded whitespace-nowrap"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-[#F5F8FA] rounded px-2 py-1 text-sm text-[#3A5A6A] min-w-[200px] min-h-[28px]"
                              onClick={() => onNoteEdit?.(row.date, row.note ?? '')}
                            >
                              {row.note ? renderNoteWithLink(row.note) : <span className="text-[#A0B8C4]">クリックして入力</span>}
                            </div>
                          )
                        ) : (
                          <div className="px-2 py-1 text-sm text-[#3A5A6A] min-w-[200px] min-h-[28px]">
                            {row.note ? renderNoteWithLink(row.note) : '-'}
                          </div>
                        )
                      ) : col.key === 'unitPrice' ? (
                        <span className="text-right block">
                          {row.cv && row.cv > 0
                            ? `¥${Math.round((row.billing ?? 0) / row.cv).toLocaleString()}`
                            : '-'}
                        </span>
                      ) : col.key === 'billing' ? (
                        <span className="text-right block">{`¥${(row.billing ?? 0).toLocaleString()}`}</span>
                      ) : col.key === 'impRate' || col.key === 'ctr' || col.key === 'friendRate' || col.key === 'cvr' ? (
                        <span className="text-right block">{row[col.key as keyof typeof row] ?? '-'}</span>
                      ) : (
                        <span className="text-right block">{Number(row[col.key as keyof typeof row] ?? 0).toLocaleString()}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              monthlyRows.map(([month, d]) => (
                <tr key={month} className="border-b border-[#EEF3F6] hover:bg-[#F5F8FA]">
                  {visibleColumns().map((col) => (
                    <td key={col.key} className="px-4 py-2 text-right border-r border-[#EEF3F6] last:border-r-0">
                      {col.key === 'date' ? (
                        <span className="whitespace-nowrap">{month}</span>
                      ) : col.key === 'note' ? (
                        <span>-</span>
                      ) : col.key === 'unitPrice' ? (
                        '-'
                      ) : col.key === 'billing' ? (
                        `¥${(d.billing ?? 0).toLocaleString()}`
                      ) : col.key === 'pv' ? (
                        d.pv.toLocaleString()
                      ) : col.key === 'imp' ? (
                        d.imp.toLocaleString()
                      ) : col.key === 'impRate' ? (
                        calcRate(d.imp, d.pv)
                      ) : col.key === 'cl' ? (
                        d.cl.toLocaleString()
                      ) : col.key === 'ctr' ? (
                        calcRate(d.cl, d.imp)
                      ) : col.key === 'friend' ? (
                        d.friend.toLocaleString()
                      ) : col.key === 'friendRate' ? (
                        calcRate(d.friend, d.cl)
                      ) : col.key === 'cv' ? (
                        (d.cv ?? 0).toLocaleString()
                      ) : col.key === 'cvr' ? (
                        calcRate(d.cv ?? 0, d.friend)
                      ) : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}