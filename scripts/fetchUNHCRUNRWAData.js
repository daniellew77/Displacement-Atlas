/**
 * Script to fetch and cache UNHCR & UNRWA data for all years
 * Runs annually via GitHub Actions (late January)
 * 
 * This script should:
 * 1. Fetch UNHCR data for all available years (2000-current)
 * 2. Fetch UNRWA Palestine refugee data for all available years
 * 3. Save to public/unhcr-cache.json and public/unrwa-cache.json
 * 4. Optionally save to src/data/ for development use
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNHCR_BASE_URL = 'https://api.unhcr.org/population/v1';
const YEARS = Array.from({ length: 25 }, (_, i) => 2024 - i); // 2024 down to 2000

// Add delay between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch UNHCR data for a specific year
 */
async function fetchUNHCRYear(year) {
  const url = `${UNHCR_BASE_URL}/population/?cf_type=ISO&coo_all=true&coa_all=true&year[]=${year}&limit=1000`;
  
  try {
    console.log(`Fetching UNHCR data for ${year}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${year}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`  ✓ Fetched ${data.items?.length || 0} records for ${year}`);
    
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching ${year}:`, error.message);
    return [];
  }
}

/**
 * Fetch UNRWA data for a specific year
 */
async function fetchUNRWAYear(year) {
  const url = `${UNHCR_BASE_URL}/population/?cf_type=ISO&coo=PSE&coa_all=true&year[]=${year}&limit=1000`;
  
  try {
    console.log(`Fetching UNRWA data for ${year}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch UNRWA ${year}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`  ✓ Fetched ${data.items?.length || 0} UNRWA records for ${year}`);
    
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching UNRWA ${year}:`, error.message);
    return [];
  }
}

/**
 * Main function to fetch all data
 */
async function fetchAllData() {
  console.log('Starting UNHCR & UNRWA data fetch...\n');
  
  const unhcrData = {};
  const unrwaData = {};
  
  for (const year of YEARS) {
    // Fetch UNHCR data
    const unhcrItems = await fetchUNHCRYear(year);
    if (unhcrItems.length > 0) {
      unhcrData[year] = unhcrItems;
    }
    
    await delay(500); // Wait 500ms between requests
    
    // Fetch UNRWA data
    const unrwaItems = await fetchUNRWAYear(year);
    if (unrwaItems.length > 0) {
      unrwaData[year] = unrwaItems;
    }
    
    await delay(500); // Wait 500ms between requests
  }
  
  // Prepare cache objects
  const unhcrCache = {
    lastFetched: new Date().toISOString(),
    years: Object.keys(unhcrData).map(Number).sort((a, b) => b - a),
    data: unhcrData,
  };
  
  const unrwaCache = {
    lastFetched: new Date().toISOString(),
    years: Object.keys(unrwaData).map(Number).sort((a, b) => b - a),
    data: unrwaData,
  };
  
  // Save to public directory (for client-side loading)
  const publicDir = path.join(__dirname, '..', 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  
  const unhcrPublicPath = path.join(publicDir, 'unhcr-cache.json');
  const unrwaPublicPath = path.join(publicDir, 'unrwa-cache.json');
  
  fs.writeFileSync(unhcrPublicPath, JSON.stringify(unhcrCache, null, 2));
  fs.writeFileSync(unrwaPublicPath, JSON.stringify(unrwaCache, null, 2));
  
  console.log('\nData saved successfully!');
  console.log(`   UNHCR: ${unhcrPublicPath}`);
  console.log(`   UNRWA: ${unrwaPublicPath}`);
  console.log(`\nSummary:`);
  console.log(`   UNHCR years: ${unhcrCache.years.join(', ')}`);
  console.log(`   UNRWA years: ${unrwaCache.years.join(', ')}`);
  console.log(`   Total UNHCR records: ${Object.values(unhcrData).reduce((sum, items) => sum + items.length, 0).toLocaleString()}`);
  console.log(`   Total UNRWA records: ${Object.values(unrwaData).reduce((sum, items) => sum + items.length, 0).toLocaleString()}`);
  console.log(`   Last fetched: ${new Date(unhcrCache.lastFetched).toLocaleString()}`);
}

// Run the script
fetchAllData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

