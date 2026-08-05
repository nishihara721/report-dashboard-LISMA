import { useState, useMemo } from 'react';
import { toYYYYMMDD } from '../lib/utils';

export type RangePreset = '1week' | '1month' | '2months' | 'all';
export type ViewMode = 'daily' | 'monthly';

export function useFilterBar() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [rangePreset, setRangePreset] = useState<RangePreset>('1week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  function applyDateRange() {
    if (customFrom && customTo) {
      setAppliedFrom(customFrom);
      setAppliedTo(customTo);
      setRangePreset('all');
    }
  }

  function applyPreset(preset: RangePreset) {
    setRangePreset(preset);
    setCustomFrom('');
    setCustomTo('');
    setAppliedFrom('');
    setAppliedTo('');
  }

  const dateRange = useMemo(() => {
    let from = '';
    let to = '';
    if (rangePreset !== 'all') {
      const now = new Date();
      to = toYYYYMMDD(now);
      const past = new Date(now);
      if (rangePreset === '1week') {
        past.setDate(past.getDate() - 7);
      } else {
        past.setMonth(past.getMonth() - (rangePreset === '1month' ? 1 : 2));
      }
      from = toYYYYMMDD(past);
    }
    if (appliedFrom) from = appliedFrom.replace(/-/g, '/');
    if (appliedTo) to = appliedTo.replace(/-/g, '/');
    return { from, to };
  }, [rangePreset, appliedFrom, appliedTo]);

  const apiDateRange = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.from) params.set('from', dateRange.from.replace(/\//g, '-'));
    if (dateRange.to) params.set('to', dateRange.to.replace(/\//g, '-'));
    return params.toString();
  }, [dateRange]);

  return {
    viewMode, setViewMode,
    rangePreset, applyPreset,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    appliedFrom, appliedTo,
    applyDateRange,
    dateRange,
    apiDateRange,
  };
}