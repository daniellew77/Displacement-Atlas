/**
 * React hook for generating IDP points for globe visualization
 */

import { useState, useEffect, useCallback } from 'react';
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
  const [points, setPoints] = useState<IdpPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPoints = useCallback(() => {
    const cache = loadIOMCache();

    if (!cache || cache.idpData.size === 0) {
      return null; // Cache not ready yet
    }

    return generateIdpPoints(cache.idpData, polygons, year);
  }, [year, polygons]);

  useEffect(() => {
    setLoading(true);

    // Try to load immediately
    const immediatePoints = loadPoints();
    if (immediatePoints && immediatePoints.length > 0) {
      setPoints(immediatePoints);
      setLoading(false);
      return;
    }

    // If cache not ready, poll until it is (IOM cache loads async on app start)
    let attempts = 0;
    const maxAttempts = 20; // Try for ~2 seconds max

    const interval = setInterval(() => {
      attempts++;
      const loadedPoints = loadPoints();

      if (loadedPoints && loadedPoints.length > 0) {
        setPoints(loadedPoints);
        setLoading(false);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        // Give up after max attempts
        setPoints([]);
        setLoading(false);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loadPoints]);

  return {
    points,
    loading,
    hasData: points.length > 0,
  };
}

