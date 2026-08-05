'use client';

import { useState } from 'react';

export default function SelectorBar({
  label,
  values = [],
  selected,
  onToggle,
  emptyMessage,
  loading = false,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyMessage: string;
  loading?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const safeValues = Array.isArray(values) ? values : [];

  return (
    <div className="mb-4 bg-white rounded-xl border border-[#C8DCE8] p-3 md:p-4">
      <div
        className="flex items-center justify-between cursor-pointer md:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-semibold text-[#3A5A6A]">{label}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="text-xs bg-[#7BB8D4] text-white rounded-full px-2 py-0.5">
              {selected.length}件選択中
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-[#5A7A8A] transition-transform md:hidden ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div className={`${isExpanded ? 'block mt-2' : 'hidden'} md:block md:mt-2`}>
        {loading ? (
          // ローディング中はスピナーを表示
          <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
            <span className="text-sm text-[#5A7A8A]">{emptyMessage}</span>
          </div>
        ) : safeValues.length === 0 ? (
          <p className="text-sm text-[#5A7A8A]">{emptyMessage}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {safeValues.map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(v)}
                  onChange={() => onToggle(v)}
                  className="accent-[#7BB8D4]"
                />
                <span className="text-sm text-[#3A5A6A]">{v}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}