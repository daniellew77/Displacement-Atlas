import { useState, useEffect } from 'react';
import type { ACLEDEvent } from '../services/acled.service';
import blobUrlData from '../data/blob-urls.json';

interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
}

interface ConflictDataHook {
    heatmapPoints: HeatmapPoint[];
    loading: boolean;
}

export function useConflictData(year: number, isEnabled: boolean): ConflictDataHook {
    const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        let isMounted = true;

        const fetchAllData = async () => {
            setLoading(true);

            try {
                // Use blob URLs source map
                // The file has a 'urls' property mapping file names to URLs
                const urls = blobUrlData.urls as Record<string, string>;

                // Filter out metadata.json to get just the country data files
                const countryKeys = Object.keys(urls).filter(k => k !== 'metadata.json');

                // Fetch all country files in parallel from Blob storage
                const promises = countryKeys.map(async (key) => {
                    try {
                        const url = urls[key];
                        const res = await fetch(url);
                        if (!res.ok) return [];
                        const data = await res.json();

                        // Extract events for the specific year
                        const yearlyEvents = data.yearlyData?.[year] || [];
                        return yearlyEvents as ACLEDEvent[];
                    } catch (e) {
                        console.warn(`Failed to fetch conflict data for ${key}`);
                        return [];
                    }
                });

                const results = await Promise.all(promises);
                const allEvents = results.flat();

                // 3. Transform to heatmap points with spatial binning and log weighting
                // This helps balance visibility between high-conflict zones (Ukraine) and lower-intensity areas (South America)
                const BIN_SIZE = 0.5; // degrees roughly 50km
                const bins = new Map<string, { lat: number, lng: number, count: number }>();

                allEvents.forEach(e => {
                    if (!e.latitude || !e.longitude) return;

                    const lat = Number(e.latitude);
                    const lng = Number(e.longitude);

                    // Round to nearest bin center
                    const binLat = Math.round(lat / BIN_SIZE) * BIN_SIZE;
                    const binLng = Math.round(lng / BIN_SIZE) * BIN_SIZE;
                    const key = `${binLat},${binLng}`;

                    if (!bins.has(key)) {
                        bins.set(key, { lat: binLat, lng: binLng, count: 0 });
                    }
                    bins.get(key)!.count += 1; // Count events (density)
                });

                const points: HeatmapPoint[] = Array.from(bins.values()).map(bin => ({
                    lat: bin.lat,
                    lng: bin.lng,
                    // Log transform the count to compress dynamic range
                    // Adding small multiplier to ensure single events are visible enough
                    weight: Math.log(bin.count + 1)
                }));

                if (isMounted) {
                    setHeatmapPoints(points);
                }
            } catch (err) {
                console.error("Error fetching conflict data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
        };
    }, [year, isEnabled]);

    return { heatmapPoints, loading };
}
