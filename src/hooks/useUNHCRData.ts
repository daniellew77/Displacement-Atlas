import { useState, useEffect, useCallback } from 'react';
import { UNHCRApiService } from '../services/unhcr.service';
import { UNRWAApiService } from '../services/unrwa.service';
import { DataAggregator } from '../utils/data-aggregator';
import type { MigrationFlow } from '../types/unhcr.types';

interface UseUNHCRDataState {
  flows: MigrationFlow[];
  loading: boolean;
  error: Error | null;
}

interface UseUNHCRDataOptions {
  year: number;
  autoFetch?: boolean;
}

export function useGlobalFlows(options: UseUNHCRDataOptions) {
  const { year, autoFetch = true } = options;
  const [state, setState] = useState<UseUNHCRDataState>({
    flows: [],
    loading: false,
    error: null,
  });

  const api = new UNHCRApiService();
  const unrwaApi = new UNRWAApiService();

  const fetchFlows = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const unhcrFlows = await api.fetchGlobalFlows(year);
      const unrwaFlows = await unrwaApi.fetchPalestineRefugees(year);
      const mergedFlows = DataAggregator.mergeUNHCRAndUNRWA(unhcrFlows, unrwaFlows);
      
      setState({ flows: mergedFlows, loading: false, error: null });
    } catch (error) {
      setState({ flows: [], loading: false, error: error as Error });
    }
  }, [year]);

  useEffect(() => {
    if (autoFetch) {
      fetchFlows();
    }
  }, [autoFetch, fetchFlows]);

  return {
    ...state,
    refetch: fetchFlows,
  };
}

export function useIncomingFlows(
  asylumCountryIso: string | null,
  year: number
) {
  const [state, setState] = useState<UseUNHCRDataState>({
    flows: [],
    loading: false,
    error: null,
  });

  const fetchFlows = useCallback(async () => {
    if (!asylumCountryIso) {
      setState({ flows: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    const api = new UNHCRApiService();
    const unrwaApi = new UNRWAApiService();
    
    try {
      const unhcrFlows = await api.fetchIncomingFlows(asylumCountryIso, year);
      const unrwaFlows = await unrwaApi.fetchIncomingToCountry(asylumCountryIso, year);
      const mergedFlows = DataAggregator.mergeUNHCRAndUNRWA(unhcrFlows, unrwaFlows);
      
      setState({ flows: mergedFlows, loading: false, error: null });
    } catch (error) {
      setState({ flows: [], loading: false, error: error as Error });
    }
  }, [asylumCountryIso, year]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  return {
    ...state,
    refetch: fetchFlows,
  };
}

export function useOutgoingFlows(
  originCountryIso: string | null,
  year: number
) {
  const [state, setState] = useState<UseUNHCRDataState>({
    flows: [],
    loading: false,
    error: null,
  });

  const api = new UNHCRApiService();
  const unrwaApi = new UNRWAApiService();

  const fetchFlows = useCallback(async () => {
    if (!originCountryIso) {
      setState({ flows: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const unhcrFlows = await api.fetchOutgoingFlows(originCountryIso, year);
      
      if (originCountryIso === 'PSE') {
        const unrwaFlows = await unrwaApi.fetchOutgoingFromPalestine(year);
        const mergedFlows = DataAggregator.mergeUNHCRAndUNRWA(unhcrFlows, unrwaFlows);
        setState({ flows: mergedFlows, loading: false, error: null });
      } else {
        setState({ flows: unhcrFlows, loading: false, error: null });
      }
    } catch (error) {
      setState({ flows: [], loading: false, error: error as Error });
    }
  }, [originCountryIso, year]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  return {
    ...state,
    refetch: fetchFlows,
  };
}