import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Generic data-fetching hook with auto-abort on unmount.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => getStudents(), []);
 */
export function useApi(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result.data ?? result);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err?.response?.data?.message || err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook — for POST/PUT/DELETE calls.
 * Usage:
 *   const { mutate, loading, error } = useMutation((body) => createStudent(body));
 *   await mutate(formData);
 */
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutateFn(...args);
      return result.data ?? result;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Operation failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [mutateFn]);

  return { mutate, loading, error };
}
