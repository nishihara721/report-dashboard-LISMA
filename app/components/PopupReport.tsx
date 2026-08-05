'use client';

import { useEffect, useState } from 'react';
import { useFilterBar } from '../hooks/useFilterBar';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import FilterBar from './FilterBar';
import SelectorBar from './SelectorBar';
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
];

function PTableWrapper({
  pValue,
  viewMode,
  apiDateRange,
  visibleColumns,
}: {
  pValue: string;
  viewMode: 'daily' | 'monthly';
  apiDateRange: string;
  visibleColumns: () => { key: string; label: string; visible: boolean }[];
}) {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/report-by-p?p=${encodeURIComponent(pValue)}&${apiDateRange}`)
      .then((res) => res.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pValue, apiDateRange]);

  if (loading) return <Loading />;

  return (
    <ReportTableCore
      viewMode={viewMode}
      filteredRows={rows}
      visibleColumns={visibleColumns}
      title={pValue}
    />
  );
}

export default function PopupReport() {
  const [pValues, setPValues] = useState<string[]>([]);
  const [selectedP, setSelectedP] = useState<string[]>([]);
  const [valuesLoading, setValuesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const filter = useFilterBar();
  const { columns, toggleColumn, visibleColumns } = useColumnVisibility(COLUMNS);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/p-values').then((res) => res.json()),
      fetch('/api/p-values-active').then((res) => res.json()),
    ]).then(([pData, activeData]) => {
      setPValues(Array.isArray(pData) ? pData : []);
      setSelectedP(Array.isArray(activeData) ? activeData : []);
      setValuesLoading(false);
    });
  }, []);

  if (!mounted) return null;

  function toggleP(p: string) {
    setSelectedP((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  }

  return (
    <div>
      <FilterBar {...filter} columns={columns} onToggleColumn={toggleColumn} />
      <SelectorBar
        label="ポップアップ選択："
        values={pValues}
        selected={selectedP}
        onToggle={toggleP}
        emptyMessage="読み込み中..."
        loading={valuesLoading}
      />
      {selectedP.length === 0 ? (
        <p className="text-sm text-[#5A7A8A]">ポップアップを選択してください</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {selectedP.map((p) => (
            <PTableWrapper
              key={p}
              pValue={p}
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