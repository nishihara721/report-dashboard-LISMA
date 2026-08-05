'use client';

import { useState } from 'react';
import { Column } from '../hooks/useColumnVisibility';

export default function ColumnToggle({
  columns,
  onToggle,
}: {
  columns: Column[];
  onToggle: (key: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg bg-[#EEF3F6] text-[#5A7A8A] hover:bg-[#D6E8F2] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
        </svg>
        列の表示
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 bg-white border border-[#C8DCE8] rounded-xl shadow-lg p-3 z-20 min-w-[160px]">
          <p className="text-xs font-semibold text-[#5A7A8A] mb-2">表示する列</p>
          <div className="flex flex-col gap-1">
            {columns.map((col) => (
              <label key={col.key} className="flex items-center gap-2 cursor-pointer hover:bg-[#F5F8FA] rounded px-1 py-1">
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => onToggle(col.key)}
                  className="accent-[#7BB8D4]"
                />
                <span className="text-sm text-[#3A5A6A]">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}