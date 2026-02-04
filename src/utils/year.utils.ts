/**
 * Year utilities for dynamic year calculation
 * Automatically includes previous year so 2025 data is available in 2026, etc.
 */

export const getLatestDataYear = (): number => new Date().getFullYear() - 1;

export const getAvailableYears = (): number[] => {
    const latestYear = getLatestDataYear();
    return Array.from({ length: latestYear - 1999 }, (_, i) => latestYear - i);
};

export const getYearRangeLabel = (): string => {
    return `2000-${getLatestDataYear()}`;
};
