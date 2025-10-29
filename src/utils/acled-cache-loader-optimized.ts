/**
 * Optimized ACLED cache loader for deployment
 * Loads data on-demand from individual country files
 */

import type { ACLEDEvent } from '../services/acled.service';

export interface ACLEDCacheMetadata {
  version: string;
  lastFetched: string;
  totalEvents: number;
  countriesCount: number;
  years: number[];
  availableCountries: string[];
  compressionRatio: number;
}

export interface ACLEDCountryCache {
  iso3: string;
  yearlyData: Record<string | number, ACLEDEvent[]>;
  lastFetched: string;
  version: string;
}

const CACHE_BASE_PATH = '/conflict-data';

/**
 * Check if optimized ACLED cache is available
 */
export async function isOptimizedACLEDCacheAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${CACHE_BASE_PATH}/metadata.json`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get ACLED cache metadata
 */
export async function getACLEDCacheMetadata(): Promise<ACLEDCacheMetadata | null> {
  try {
    const response = await fetch(`${CACHE_BASE_PATH}/metadata.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Load ACLED country data from cache
 */
export async function loadACLEDCountryData(iso3: string): Promise<ACLEDCountryCache | null> {
  try {
    const response = await fetch(`${CACHE_BASE_PATH}/${iso3}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ACLED data for ${iso3}:`, error);
    return null;
  }
}

/**
 * Get ACLED events for a specific country and year from cache
 */
export async function getACLEDEventsFromOptimizedCache(iso3: string, year: number): Promise<ACLEDEvent[]> {
  try {
    const countryData = await loadACLEDCountryData(iso3);
    if (!countryData) return [];
    
    // Check both string and number keys (JSON uses string keys)
    return countryData.yearlyData[year] || countryData.yearlyData[String(year)] || [];
  } catch (error) {
    console.error(`Error loading ${iso3} ${year}:`, error);
    return [];
  }
}

/**
 * Check if specific country-year data exists in cache
 */
export async function hasOptimizedACLEDData(iso3: string, year: number): Promise<boolean> {
  try {
    const countryData = await loadACLEDCountryData(iso3);
    if (!countryData?.yearlyData) return false;
    
    const yearData = countryData.yearlyData[year] || countryData.yearlyData[String(year)];
    return !!(yearData && yearData.length > 0);
  } catch {
    return false;
  }
}

/**
 * Get available countries from cache metadata
 */
export async function getAvailableOptimizedCountries(): Promise<string[]> {
  const metadata = await getACLEDCacheMetadata();
  return metadata?.availableCountries || [];
}

/**
 * Get available years for a specific country
 */
export async function getAvailableOptimizedYears(iso3: string): Promise<number[]> {
  const countryData = await loadACLEDCountryData(iso3);
  if (!countryData) return [];
  return Object.keys(countryData.yearlyData).map(Number).sort();
}

/**
 * Console helper for debugging
 */
declare global {
  interface Window {
    checkACLEDCache?: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.checkACLEDCache = async () => {
    const metadata = await getACLEDCacheMetadata();
    if (metadata) {
      console.log('ACLED Cache Status:');
      console.log(`  Countries: ${metadata.countriesCount}`);
      console.log(`  Total events: ${metadata.totalEvents.toLocaleString()}`);
      console.log(`  Years: ${metadata.years[0]}-${metadata.years[metadata.years.length-1]}`);
      console.log(`  Last fetched: ${new Date(metadata.lastFetched).toLocaleString()}`);
    } else {
      console.log('ACLED cache not available');
    }
  };
}
