// Custom hook for data fetching with loading/error states
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useApi(path, options = {}) {
  const { immediate = true, deps = [] } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (overridePath) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(overridePath || path);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (immediate && path) fetch();
  }, [immediate, path, ...deps]);

  return { data, loading, error, refetch: fetch, setData };
}

export function useMutation(path, method = 'post') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body, overridePath) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api[method](overridePath || path, body);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
