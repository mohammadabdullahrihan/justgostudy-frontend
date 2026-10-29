import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Shared list-fetching state for admin CRUD pages.
 *
 * Distinguishes a failed fetch (`error`) from a genuinely empty list, so
 * pages can render an error banner instead of silently falling through to
 * an `EmptyState` (which previously happened on expired tokens, 500s, or
 * network blips — indistinguishable from "no items exist").
 *
 * `fetchFn` does not need to be wrapped in `useCallback` — the hook always
 * calls the latest version via a ref, so it's safe to pass a fresh inline
 * async function on every render. Use the `deps` option to control when an
 * automatic refetch should run (defaults to mount-only, matching the
 * existing `useEffect(() => { fetchX(); }, [])` convention across admin
 * pages).
 *
 * @param {() => Promise<any>} fetchFn - resolves to the data this hook should store (already normalized by the caller, e.g. `Array.isArray(res) ? res : []`)
 * @param {{ initialData?: any, deps?: any[] }} [options]
 * @returns {{ data: any, setData: Function, loading: boolean, error: string, refetch: () => Promise<void> }}
 */
export function useAdminList(fetchFn, { initialData = [], deps = [] } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}

export default useAdminList;
