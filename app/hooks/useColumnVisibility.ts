import { useState } from 'react';

export type Column = {
  key: string;
  label: string;
  visible: boolean;
};

export function useColumnVisibility(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  function toggleColumn(key: string) {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  }

  function visibleColumns() {
    return columns.filter((col) => col.visible);
  }

  return { columns, toggleColumn, visibleColumns };
}