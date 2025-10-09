import { useState, useEffect } from 'react';
import { normalizeISO3, normalizeCountryName } from '../utils/globe-helpers';

export function usePolygons() {
  const [polygons, setPolygons] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPolygons() {
      try {
        const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const fc = await res.json();

        const withCodes = fc.features.map((f: any) => {
          const p = f.properties ?? {};
          const iso = p.ISO_A3 || p.ISO3 || p.iso_a3 || p.ADM0_A3 || f.id || '';
          const rawName = p.NAME || p.NAME_EN || p.ADMIN || p.name || '';
          
          return {
            ...f,
            properties: {
              ...p,
              __iso3: normalizeISO3(String(iso)),
              __name: normalizeCountryName(rawName, String(iso))
            }
          };
        });

        if (!cancelled) setPolygons(withCodes);
      } catch {
        // Failed to load polygons
      }
    }

    loadPolygons();
    return () => { cancelled = true; };
  }, []);

  return polygons;
}