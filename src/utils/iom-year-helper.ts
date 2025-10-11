/**
 * Developer console helpers for exploring IOM IDP data
 * These functions are exposed to window for easy debugging
 */

import { loadIOMCache } from './iom-processor';

/**
 * Display all available IDP data years in the console
 */
export function showAvailableIdpYears(): void {
  const cache = loadIOMCache();
  
  if (!cache || cache.idpData.size === 0) {
    console.log('❌ No IOM cache loaded. Run: window.loadIOMCache()');
    return;
  }
  
  console.log('\n📅 IDP Data Available by Year');
  console.log('==============================\n');
  
  // Collect all years across all countries
  const yearCountryMap = new Map<number, string[]>();
  
  for (const [iso3, countryData] of cache.idpData.entries()) {
    for (const yearData of countryData.yearlyData) {
      if (!yearCountryMap.has(yearData.year)) {
        yearCountryMap.set(yearData.year, []);
      }
      yearCountryMap.get(yearData.year)!.push(
        `${countryData.countryName} (${iso3}): ${yearData.totalIdps.toLocaleString()} IDPs`
      );
    }
  }
  
  // Sort years
  const sortedYears = Array.from(yearCountryMap.keys()).sort((a, b) => a - b);
  
  // Display by year
  for (const year of sortedYears) {
    const countries = yearCountryMap.get(year)!;
    console.log(`Year ${year}: ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}`);
    countries.forEach(country => console.log(`  🔴 ${country}`));
    console.log('');
  }
  
  console.log(`\n✅ Total years with data: ${sortedYears.length}`);
  console.log(`📊 Year range: ${Math.min(...sortedYears)} - ${Math.max(...sortedYears)}`);
  console.log('\n💡 Change the year selector to see different circles!\n');
}

/**
 * Display what countries have data for a specific year
 */
export function showYearData(year: number): void {
  const cache = loadIOMCache();
  
  if (!cache || cache.idpData.size === 0) {
    console.log('❌ No IOM cache loaded. Run: window.loadIOMCache()');
    return;
  }
  
  console.log(`\n📅 IDP Data for Year ${year}`);
  console.log('===========================\n');
  
  let count = 0;
  for (const [iso3, countryData] of cache.idpData.entries()) {
    const yearData = countryData.yearlyData.find(yd => yd.year === year);
    if (yearData) {
      console.log(`🔴 ${countryData.countryName} (${iso3}): ${yearData.totalIdps.toLocaleString()} IDPs - ${yearData.operation}`);
      count++;
    }
  }
  
  if (count === 0) {
    console.log('❌ No IDP data available for this year');
  } else {
    console.log(`\n✅ ${count} ${count === 1 ? 'country' : 'countries'} with data for ${year}`);
  }
  console.log('');
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).showIdpYears = showAvailableIdpYears;
  (window as any).showYearData = showYearData;
}

