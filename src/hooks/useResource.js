import { useCallback, useEffect, useRef, useState } from 'react';
import { get } from '../lib/api';

/**
 * Fetch a paginated list resource with search/filter support.
 *
 * @param {string} endpoint - e.g. '/bookings'
 * @param {Object} options - { initialFilters, limit }
 */
export default function useResource(endpoint, { initialFilters = {}, limit = 10 } = {}) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get(endpoint, {
        page,
        limit,
        search: search || undefined,
        ...filtersRef.current,
      });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to the first page whenever filters change.
  const updateFilter = useCallback((key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(
    (next = {}) => {
      setPage(1);
      setFilters(next);
    },
    []
  );

  return {
    rows,
    pagination,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch: (value) => {
      setPage(1);
      setSearch(value);
    },
    filters,
    updateFilter,
    resetFilters,
    reload: load,
  };
}
