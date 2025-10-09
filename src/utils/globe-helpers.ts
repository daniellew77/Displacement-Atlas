import { VOLUME_THRESHOLDS } from '../config/globe.config';

export function normalizeISO3(code: string): string {
  const c = code.toUpperCase().trim();
  const map: Record<string, string> = {
    'KOS': 'XKX', 'XKX': 'XKX',
    'SDN': 'SDN', 'SDS': 'SSD',
    '-99': 'UNK'
  };
  if (map[c]) return map[c];
  if (c.length === 3) return c;
  return 'UNK';
}

export function normalizeCountryName(name: string, iso3: string): string {
  const nameMap: Record<string, string> = {
    'West Bank': 'Palestine',
    'West Bank and Gaza': 'Palestine',
  };
  
  if (nameMap[name]) {
    return nameMap[name];
  }
  
  const isoMap: Record<string, string> = {
    'PSE': 'Palestine',
  };
  
  if (isoMap[iso3.toUpperCase()]) {
    return isoMap[iso3.toUpperCase()];
  }
  
  return name;
}

export function polygonCentroid(feature: any): [number, number] {
  const coords = feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates.flat(1)
    : feature.geometry.coordinates;
  
  let sumX = 0, sumY = 0, n = 0;
  coords.forEach((ring: number[][]) => {
    ring.forEach(([lng, lat]) => { 
      sumX += lng; 
      sumY += lat; 
      n++; 
    });
  });
  
  return [sumY / n, sumX / n];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getVolumeStyle(volume: number) {
  const threshold = VOLUME_THRESHOLDS.find(t => volume > t.volume) || VOLUME_THRESHOLDS[VOLUME_THRESHOLDS.length - 1];
  return {
    opacity: threshold.opacity,
    stroke: threshold.stroke
  };
}

export function createTooltip(html: string): string {
  return `
    <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; color: white; font-family: sans-serif;">
      ${html}
    </div>
  `;
}