/**
 * Utilities for creating IDP point data for globe visualization
 */

import type { IOMCountryIdpData } from '../types/iom.types';
import { createTooltip } from './globe-helpers';

export interface IdpPoint {
  lat: number;
  lng: number;
  size: number; // Radius of the circle
  idpCount: number;
  countryName: string;
  iso3: string;
  year: number;
  operation: string; // Which IOM operation this data is from
}

/**
 * Calculate radius for IDP circle based on count
 * Uses exponential scale for dramatic size differences
 */
export function calculateIdpRadius(idpCount: number): number {
  // Balanced size range - dramatic but not overwhelming
  const minRadius = 0.25;  // Small but visible
  const maxRadius = 1.8;   // Large but won't cover entire countries
  
  // Use logarithmic scale with exponential boost
  // Typical range: 10,000 to 10,000,000 IDPs
  const minIdp = 10000;
  const maxIdp = 10000000;
  
  if (idpCount < minIdp) return minRadius;
  
  const logMin = Math.log(minIdp);
  const logMax = Math.log(maxIdp);
  const logValue = Math.log(Math.min(idpCount, maxIdp));
  
  // Normalized 0-1
  const normalized = (logValue - logMin) / (logMax - logMin);
  
  // Apply exponential curve for dramatic scaling
  // Power of 1.5 makes larger values grow faster without going overboard
  const exponential = Math.pow(normalized, 1.5);
  
  const radius = minRadius + (exponential * (maxRadius - minRadius));
  
  return radius;
}

/**
 * Calculate centroid of a polygon feature
 */
function calculatePolygonCentroid(feature: any): [number, number] | null {
  try {
    const coords = feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates.flat(1)
      : feature.geometry.coordinates;
    
    let sumLat = 0, sumLng = 0, n = 0;
    coords.forEach((ring: number[][]) => {
      ring.forEach(([lng, lat]) => { 
        sumLng += lng; 
        sumLat += lat; 
        n++; 
      });
    });
    
    return n > 0 ? [sumLat / n, sumLng / n] : null;
  } catch {
    return null;
  }
}

/**
 * Generate IDP points for countries with data for a given year
 */
export function generateIdpPoints(
  iomDataMap: Map<string, IOMCountryIdpData>,
  polygons: any[],
  year: number
): IdpPoint[] {
  const points: IdpPoint[] = [];
  
  // Create a map of ISO3 to polygon for quick lookup
  const polygonMap = new Map<string, any>();
  for (const polygon of polygons) {
    const iso3 = polygon.properties?.__iso3;
    if (iso3) {
      polygonMap.set(iso3, polygon);
    }
  }
  
  for (const [iso3, countryData] of iomDataMap.entries()) {
    // Get polygon for this country
    const polygon = polygonMap.get(iso3);
    if (!polygon) continue;
    
    // Calculate centroid
    const centroid = calculatePolygonCentroid(polygon);
    if (!centroid) continue;
    
    // Find data for the requested year
    const yearData = countryData.yearlyData.find(yd => yd.year === year);
    if (!yearData) continue;
    
    // Create point at centroid
    points.push({
      lat: centroid[0],
      lng: centroid[1],
      size: calculateIdpRadius(yearData.totalIdps),
      idpCount: yearData.totalIdps,
      countryName: countryData.countryName,
      iso3,
      year,
      operation: yearData.operation,
    });
  }
  
  return points;
}

/**
 * Create tooltip for IDP point
 */
export function createIdpTooltip(point: IdpPoint): string {
  return createTooltip(`
    <div style="font-weight: bold; margin-bottom: 4px;">${point.countryName}</div>
    <div style="color: #ff9800; font-size: 13px;">
      ${point.idpCount.toLocaleString()} Internally Displaced Persons
    </div>
    <div style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-top: 4px;">
      IOM DTM: ${point.operation} • ${point.year}
    </div>
  `);
}

/**
 * Get color for IDP point based on count
 */
export function getIdpPointColor(idpCount: number): string {
  // Red color scheme for IDP data - more opaque for visibility
  // More displaced = more intense red
  if (idpCount > 5000000) return 'rgba(198, 40, 40, 0.95)';   // Very dark red
  if (idpCount > 2000000) return 'rgba(211, 47, 47, 0.9)';    // Dark red
  if (idpCount > 1000000) return 'rgba(229, 57, 53, 0.9)';    // Red
  if (idpCount > 500000) return 'rgba(244, 67, 54, 0.85)';    // Bright red
  return 'rgba(239, 83, 80, 0.85)';                           // Light red
}

