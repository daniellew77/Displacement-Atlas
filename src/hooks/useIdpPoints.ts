/**
 * React hook for generating IDP points for globe visualization
 */

import { useState, useMemo } from 'react';
import { loadIOMCache } from '../utils/iom-processor';
import { generateIdpPoints } from '../utils/idp-points';
import type { IdpPoint } from '../utils/idp-points';

/**
 * Hook to get IDP points for a specific year
 * Returns points for countries with IOM data for that year
 */
export function useIdpPoints(year: number, polygons: any[]): {
  points: IdpPoint[];
  loading: boolean;
  hasData: boolean;
} {
  const [loading, setLoading] = useState(true);
  
  const points = useMemo(() => {
    setLoading(true);
    
    const cache = loadIOMCache();
    
    if (!cache || cache.idpData.size === 0) {
      setLoading(false);
      return [];
    }
    
    const idpPoints = generateIdpPoints(cache.idpData, polygons, year);
    
    setLoading(false);
    return idpPoints;
  }, [year, polygons]);

  return {
    points,
    loading,
    hasData: points.length > 0,
  };
}

