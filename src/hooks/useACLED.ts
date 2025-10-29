/**
 * React hook for ACLED data
 */

import { useState, useEffect } from 'react';
import { ACLEDApiService, type ACLEDEvent, type ACLEDSummary } from '../services/acled.service';

// Get from environment variables
const ACLED_ACCESS_TOKEN = import.meta.env.VITE_ACLED_ACCESS_TOKEN || '';
const ACLED_REFRESH_TOKEN = import.meta.env.VITE_ACLED_REFRESH_TOKEN || '';

// Create a singleton instance to persist tokens across component remounts
let acledApiInstance: ACLEDApiService | null = null;

function getACLEDApi(): ACLEDApiService | null {
  if (!acledApiInstance) {
    if (!ACLED_ACCESS_TOKEN || !ACLED_REFRESH_TOKEN) {
      console.warn('ACLED credentials not found in environment variables - will use cached data only');
      return null;
    }
    acledApiInstance = new ACLEDApiService(ACLED_ACCESS_TOKEN, ACLED_REFRESH_TOKEN);
  }
  return acledApiInstance;
}

export function useACLED(iso3: string, year: number) {
  const [events, setEvents] = useState<ACLEDEvent[]>([]);
  const [summary, setSummary] = useState<ACLEDSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!iso3 || !year) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`useACLED: Fetching data for ${iso3} ${year}`);
        
        const api = getACLEDApi();
        let eventData: ACLEDEvent[] = [];
        
        if (api) {
          // Service handles all caching internally (optimized cache → localStorage → API)
          eventData = await api.fetchAllCountryEvents(iso3, year);
        } else {
          // Fallback to cache-only mode when API credentials are not available
          console.log('ACLED API not available, using cached data only');
          const { getACLEDEventsFromOptimizedCache } = await import('../utils/acled-cache-loader-optimized');
          eventData = await getACLEDEventsFromOptimizedCache(iso3, year);
        }
        
        if (!cancelled) {
          console.log(`useACLED: Received ${eventData.length} events`);
          setEvents(eventData);
          
          if (eventData.length > 0) {
            // Create a temporary API instance for summarization if needed
            const tempApi = api || new ACLEDApiService('', '');
            const summaryData = tempApi.summarizeEvents(eventData);
            setSummary(summaryData);
          } else {
            setSummary(null);
          }
        }
      } catch (err) {
        console.error('ACLED fetch error:', err);
        if (!cancelled) {
          setError(err as Error);
          setEvents([]);
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [iso3, year]);

  return { events, summary, loading, error };
}