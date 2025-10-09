export const GLOBE_CONFIG = {
  year: 2024,
  initialPOV: { lat: 20, lng: 0, altitude: 2.5 },
  autoRotateSpeed: 0.1,
  arcConfig: {
    minVolume: 5000,
    topN: 100,
  },
  colors: {
    base: '#00bcd4',
    atmosphere: 'rgba(135, 206, 250, 0.5)',
  },
} as const;

export const VOLUME_THRESHOLDS = [
  { volume: 1000000, opacity: 0.8, stroke: 1.2 },
  { volume: 500000, opacity: 0.75, stroke: 0.8 },
  { volume: 200000, opacity: 0.7, stroke: 0.5 },
  { volume: 100000, opacity: 0.65, stroke: 0.3 },
  { volume: 50000, opacity: 0.6, stroke: 0.15 },
  { volume: 0, opacity: 0.55, stroke: 0.08 },
] as const;