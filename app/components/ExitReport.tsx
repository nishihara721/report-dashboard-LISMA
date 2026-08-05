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
];

function ExitTableWrapper({
  exitValue,
  viewMode,
  apiDateRange,
  visibleColumns,
}: {
  exitValue: string;
  viewMode: 'daily' | 'monthly';
  apiDateRange: string;
  visibleColumns: () => { key: string; label: string; visible: boolean }[];
}) {
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/report-by-exit?exit=${encodeURIComponent(exitValue)}&${apiDateRange}`)
      .then((res) => res.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [exitValue, apiDateRange]);

  if (loading) return <Loading />;

  return (
    <ReportTableCore
      viewMode={viewMode}
      filteredRows={rows}
      visibleColumns={visibleColumns}
      title={exitValue}
    />
  );
}

export default function ExitReport() {
  const [exitValues, setExitValues] = useState<string[]>([]);
  const [selectedExit, setSelectedExit] = useState<string[]>([]);
  const [valuesLoading, setValuesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const filter = useFilterBar();
  const { columns, toggleColumn, visibleColumns } = useColumnVisibility(COLUMNS);

  useEffect(() => {
    setMounted(true);
    fetch('/api/exit-values')
      .then((res) => res.json())
      .then((data) => {
        setExitValues(Array.isArray(data) ? data : []);
        setValuesLoading(false);
      });
  }, []);

  if (!mounted) return null;

  function toggleExit(exit: string) {
    setSelectedExit((prev) =>
      prev.includes(exit) ? prev.filter((v) => v !== exit) : [...prev, exit]
    );
  }

  return (
    <div>
      <FilterBar {...filter} columns={columns} onToggleColumn={toggleColumn} />
      <SelectorBar
        label="離脱地点選択："
        values={exitValues}
        selected={selectedExit}
        onToggle={toggleExit}
        emptyMessage="読み込み中..."
        loading={valuesLoading}
      />
      {selectedExit.length === 0 ? (
        <p className="text-sm text-[#5A7A8A]">離脱地点を選択してください</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {selectedExit.map((exit) => (
            <ExitTableWrapper
              key={exit}
              exitValue={exit}
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