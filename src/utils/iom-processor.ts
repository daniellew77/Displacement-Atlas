/**
 * IOM Data Processing Utilities
 * 
 * Processes and aggregates internal displacement data from IOM DTM API
 */

import type {
  IOMIdpDataPoint,
  IOMYearlyIdpData,
  IOMCountryIdpData,
  IOMDataCache,
} from '../types/iom.types';

/**
 * Aggregates IDP data points by year
 * PRIORITIZES "Countrywide monitoring" operation when available
 * Falls back to other operations if Countrywide monitoring not available
 */
export function aggregateIdpDataByYear(dataPoints: IOMIdpDataPoint[]): IOMYearlyIdpData[] {
  // Filter for valid data points (any operation)
  const validData = dataPoints.filter(
    dp => dp.numPresentIdpInd > 0
  );

  if (validData.length === 0) {
    return [];
  }

  // Group by year
  const yearMap = new Map<number, IOMIdpDataPoint[]>();
  
  for (const dataPoint of validData) {
    const year = dataPoint.yearReportingDate;
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)!.push(dataPoint);
  }

  // Aggregate each year
  const yearlyData: IOMYearlyIdpData[] = [];
  
  for (const [year, points] of yearMap.entries()) {
    // PRIORITIZE: Look for Countrywide monitoring first
    const countrywidePoints = points.filter(p => p.operation === 'Countrywide monitoring');
    const pointsToUse = countrywidePoints.length > 0 ? countrywidePoints : points;
    
    // Sort by reporting date to get the latest
    const sortedPoints = [...pointsToUse].sort((a, b) => 
      new Date(b.reportingDate).getTime() - new Date(a.reportingDate).getTime()
    );
    
    const latestPoint = sortedPoints[0];
    const allIdpCounts = pointsToUse.map(p => p.numPresentIdpInd);
    
    yearlyData.push({
      year,
      totalIdps: latestPoint.numPresentIdpInd, // Use the most recent value
      dataPoints: pointsToUse.length,
      minIdps: Math.min(...allIdpCounts),
      maxIdps: Math.max(...allIdpCounts),
      latestReportDate: latestPoint.reportingDate,
      operation: latestPoint.operation, // Track which operation was used
    });
  }

  // Sort by year descending
  return yearlyData.sort((a, b) => b.year - a.year);
}

/**
 * Processes raw IDP data for a country into aggregated format
 */
export function processCountryIdpData(
  dataPoints: IOMIdpDataPoint[],
  iso3: string
): IOMCountryIdpData | null {
  if (dataPoints.length === 0) {
    return null;
  }

  const yearlyData = aggregateIdpDataByYear(dataPoints);
  
  if (yearlyData.length === 0) {
    return null;
  }

  return {
    countryName: dataPoints[0].admin0Name,
    iso3,
    yearlyData,
    lastUpdated: new Date().toISOString(),
    hasData: true,
  };
}

/**
 * Processes all fetched IOM data into a cache-friendly format
 */
export function processAllIOMData(
  rawDataMap: Map<string, IOMIdpDataPoint[]>
): Map<string, IOMCountryIdpData> {
  const processedMap = new Map<string, IOMCountryIdpData>();
  
  for (const [iso3, dataPoints] of rawDataMap.entries()) {
    const processed = processCountryIdpData(dataPoints, iso3);
    if (processed) {
      processedMap.set(iso3, processed);
    }
  }
  
  return processedMap;
}

/**
 * Saves IOM data cache to localStorage
 */
export function saveIOMCache(cache: Partial<IOMDataCache>): void {
  try {
    const cacheData = {
      countries: cache.countries || [],
      idpData: cache.idpData ? Object.fromEntries(cache.idpData) : {},
      lastFetched: cache.lastFetched || new Date().toISOString(),
      version: cache.version || 1,
    };
    
    localStorage.setItem('iom-idp-cache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to save IOM cache:', error);
  }
}

/**
 * Loads IOM data cache from localStorage
 */
export function loadIOMCache(): IOMDataCache | null {
  try {
    const cached = localStorage.getItem('iom-idp-cache');
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    
    return {
      countries: parsed.countries || [],
      idpData: new Map(Object.entries(parsed.idpData || {})),
      lastFetched: parsed.lastFetched,
      version: parsed.version || 1,
    };
  } catch (error) {
    console.error('Failed to load IOM cache:', error);
    return null;
  }
}

/**
 * Checks if the cache needs refreshing (older than 30 days)
 */
export function shouldRefreshCache(lastFetched?: string): boolean {
  if (!lastFetched) return true;
  
  const lastFetchDate = new Date(lastFetched);
  const now = new Date();
  const daysSinceLastFetch = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceLastFetch > 30;
}

/**
 * Gets IDP data for a specific country and year
 */
export function getIdpDataForYear(
  countryData: IOMCountryIdpData | undefined,
  year: number
): IOMYearlyIdpData | undefined {
  if (!countryData) return undefined;
  return countryData.yearlyData.find(yd => yd.year === year);
}

