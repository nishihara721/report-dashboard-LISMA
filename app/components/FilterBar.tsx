'use client';

import { useState } from 'react';
import { RangePreset, ViewMode } from '../hooks/useFilterBar';
import ColumnToggle from './ColumnToggle';
import { Column } from '../hooks/useColumnVisibility';

export default function FilterBar({
  viewMode,
  setViewMode,
  rangePreset,
  applyPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  appliedFrom,
  appliedTo,
  applyDateRange,
  columns,
  onToggleColumn,
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  rangePreset: RangePreset;
  applyPreset: (preset: RangePreset) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
  appliedFrom: string;
  appliedTo: string;
  applyDateRange: () => void;
  columns: Column[];
  onToggleColumn: (key: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 bg-white rounded-xl border border-[#C8DCE8] p-3 md:p-4">
      {/* スマホ：折りたたみヘッダー */}
      <div
        className="flex items-center justify-between md:hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-semibold text-[#3A5A6A]">フィルター・表示設定</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[#5A7A8A] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* PC：常に表示 / スマホ：展開時のみ表示 */}
      <div className={`${isExpanded ? 'block mt-3' : 'hidden'} md:flex md:flex-wrap md:items-center md:gap-4`}>

        {/* 期間プリセット */}
        <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-0">
          <span className="text-sm font-semibold text-[#3A5A6A]">期間：</span>
          {(['1week', '1month', '2months', 'all'] as RangePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                rangePreset === preset && !appliedFrom && !appliedTo
                  ? 'bg-[#7BB8D4] text-white'
                  : 'bg-[#EEF3F6] text-[#5A7A8A] hover:bg-[#D6E8F2]'
              }`}
            >
              {preset === '1week' ? '直近1週間' : preset === '1month' ? '直近1ヶ月' : preset === '2months' ? '直近2ヶ月' : '全期間'}
            </button>
          ))}
        </div>

        {/* 日付範囲指定 */}
        <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-0">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border border-[#C8DCE8] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#7BB8D4] w-full md:w-auto"
          />
          <span className="text-sm text-[#5A7A8A]">〜</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border border-[#C8DCE8] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#7BB8D4] w-full md:w-auto"
          />
          <button
            onClick={applyDateRange}
            disabled={!customFrom || !customTo}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              customFrom && customTo
                ? 'bg-[#7BB8D4] text-white hover:bg-[#5A9DBF]'
                : 'bg-[#EEF3F6] text-[#A0B8C4] cursor-not-allowed'
            }`}
          >
            決定
          </button>
        </div>

        {/* 日別・月別切替 + 列切替 */}
        <div className="flex items-center gap-2 md:ml-auto">
          <span className="text-sm font-semibold text-[#3A5A6A]">表示：</span>
          {(['daily', 'monthly'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                viewMode === mode
                  ? 'bg-[#7BB8D4] text-white'
                  : 'bg-[#EEF3F6] text-[#5A7A8A] hover:bg-[#D6E8F2]'
              }`}
            >
              {mode === 'daily' ? '日別' : '月別'}
            </button>
          ))}
          <ColumnToggle columns={columns} onToggle={onToggleColumn} />
        </div>
      </div>
    </div>
  );
}