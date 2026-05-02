import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a: any, b: any) => {
      const keys = sortConfig.key.split('.');
      let valA = a;
      let valB = b;
      for (const k of keys) {
        valA = valA?.[k];
        valB = valB?.[k];
      }

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, 'id');
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' as SortDirection };
        if (prev.direction === 'desc') return { key: '', direction: null };
      }
      return { key, direction: 'asc' as SortDirection };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return ' ↕';
    if (sortConfig.direction === 'asc') return ' ↑';
    return ' ↓';
  };

  return { sortedData, requestSort, getSortIcon };
}
