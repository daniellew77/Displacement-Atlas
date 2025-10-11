/**
 * React hook for IOM internal displacement data
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAllIOMData, fetchIOMCountryList } from '../services/iom.service';
import {
  loadIOMCache,
  saveIOMCache,
  shouldRefreshCache,
  processAllIOMData,
  getIdpDataForYear,
} from '../utils/iom-processor';
import type { IOMCountryIdpData, IOMYearlyIdpData } from '../types/iom.types';

interface UseIOMDataState {
  idpDataMap: Map<string, IOMCountryIdpData>;
  loading: boolean;
  error: Error | null;
  lastFetched: string | null;
}

/**
 * Hook to manage IOM IDP data cache
 * Automatically loads from cache and provides refresh functionality
 */
export function useIOMDataCache() {
  const [state, setState] = useState<UseIOMDataState>({
    idpDataMap: new Map(),
    loading: false,
    error: null,
    lastFetched: null,
  });

  // Load from cache on mount
  useEffect(() => {
    const cache = loadIOMCache();
    if (cache) {
      setState({
        idpDataMap: cache.idpData,
        loading: false,
        error: null,
        lastFetched: cache.lastFetched,
      });
    }
  }, []);

  // Function to refresh all data from API
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all country data
      const countries = await fetchIOMCountryList();
      const rawDataMap = await fetchAllIOMData();
      
      // Process the data
      const processedMap = processAllIOMData(rawDataMap);
      const now = new Date().toISOString();

      // Save to cache
      saveIOMCache({
        countries,
        idpData: processedMap,
        lastFetched: now,
        version: 1,
      });

      setState({
        idpDataMap: processedMap,
        loading: false,
        error: null,
        lastFetched: now,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  // Auto-refresh if cache is stale
  useEffect(() => {
    if (shouldRefreshCache(state.lastFetched || undefined)) {
      console.log('IOM cache is stale, consider refreshing');
      // Don't auto-refresh to avoid unnecessary API calls
      // User can manually trigger refresh when needed
    }
  }, [state.lastFetched]);

  return {
    ...state,
    refreshData,
    needsRefresh: shouldRefreshCache(state.lastFetched || undefined),
  };
}

/**
 * Hook to get IDP data for a specific country
 */
export function useCountryIdpData(iso3: string | null) {
  const [countryData, setCountryData] = useState<IOMCountryIdpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!iso3) {
      setCountryData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const cache = loadIOMCache();
    
    if (cache && cache.idpData.has(iso3)) {
      setCountryData(cache.idpData.get(iso3) || null);
    } else {
      setCountryData(null);
    }
    
    setLoading(false);
  }, [iso3]);

  return {
    countryData,
    loading,
    hasData: countryData !== null && countryData.hasData,
  };
}

/**
 * Hook to get IDP data for a specific country and year
 */
export function useCountryYearIdpData(iso3: string | null, year: number) {
  const { countryData, loading, hasData } = useCountryIdpData(iso3);
  const [yearData, setYearData] = useState<IOMYearlyIdpData | null>(null);

  useEffect(() => {
    if (!countryData) {
      setYearData(null);
      return;
    }

    const data = getIdpDataForYear(countryData, year);
    setYearData(data || null);
  }, [countryData, year]);

  return {
    yearData,
    countryData,
    loading,
    hasData: yearData !== null,
    hasAnyData: hasData,
  };
}

/**
 * Hook to get all available IDP years for a country
 */
export function useCountryIdpYears(iso3: string | null) {
  const { countryData, loading } = useCountryIdpData(iso3);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    if (!countryData) {
      setYears([]);
      return;
    }

    const availableYears = countryData.yearlyData.map(yd => yd.year);
    setYears(availableYears);
  }, [countryData]);

  return {
    years,
    loading,
    hasData: years.length > 0,
  };
}

