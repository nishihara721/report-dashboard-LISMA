'use client';

import { useEffect, useState } from 'react';
import { useFilterBar } from '../hooks/useFilterBar';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import FilterBar from './FilterBar';
import ReportTableCore, { DailyRow } from './ReportTableCore';
import Loading from './Loading';

const COLUMNS = [
  { key: 'date', label: '日付', visible: true },
  { key: 'pv', label: 'PV数', visible: true },
  { key: 'imp', label: 'imp数', visible: true },
  { key: 'impRate', label: 'imp率', visible: true },
  { key: 'cl', label: 'CL数', visible: true },
  { key: 'ctr', label: 'CTR', visible: true },
  { key: 'friend', label: '友だち追加数', visible: true },
  { key: 'friendRate', label: '友だち追加率', visible: true },
  { key: 'cv', label: 'CV数', visible: true },
  { key: 'cvr', label: 'CVR', visible: true },
  { key: 'unitPrice', label: '成果単価', visible: true },
  { key: 'billing', label: '請求額', visible: true },
  { key: 'note', label: '施策・修正点など', visible: true },
];

export default function SharedReportTable() {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const filter = useFilterBar();
  const { columns, toggleColumn, visibleColumns } = useColumnVisibility(COLUMNS);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    Promise.all([
      fetch(`/api/report-shared?${filter.apiDateRange}`).then((res) => res.json()),
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

  if (!mounted) return null;

  // rowsにnoteを付与（閲覧のみ・編集不可）
  const rowsWithNotes = rows.map((r) => ({
    ...r,
    note: notes[r.date] ?? '',
  }));

  return (
    <div>
      <FilterBar
        {...filter}
        columns={columns}
        onToggleColumn={toggleColumn}
      />
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : loading ? (
        <Loading />
      ) : (
        <ReportTableCore
          viewMode={filter.viewMode}
          filteredRows={rowsWithNotes}
          visibleColumns={visibleColumns}
          canEdit={false}
        />
      )}
    </div>
  );
}