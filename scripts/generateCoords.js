#!/usr/bin/env node

/**
 * Node.js runner for the coordinate generator
 * This script fetches country data and generates TypeScript/JSON files
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import interfaces
const OVERRIDES = {
  'PSE': { 
    iso3: 'PSE', 
    name: 'Palestine', 
    capital: 'Ramallah',
    lat: 31.9522, 
    lng: 35.2332 
  },
  'XKX': { 
    iso3: 'XKX', 
    name: 'Kosovo', 
    capital: 'Pristina',
    lat: 42.6629, 
    lng: 21.1655 
  },
  'TWN': { 
    iso3: 'TWN', 
    name: 'Taiwan', 
    capital: 'Taipei',
    lat: 25.0330, 
    lng: 121.5654 
  },
  'BOL': { 
    capital: 'La Paz',
    lat: -16.4897, 
    lng: -68.1193 
  },
  'ZAF': { 
    capital: 'Pretoria',
    lat: -25.7479, 
    lng: 28.2293 
  },
  'SRB': {
    name: 'Serbia',
    capital: 'Belgrade',
    lat: 44.7866,
    lng: 20.4489
  },
  'TIB': { 
    iso3: 'TIB', 
    name: 'Tibet', 
    capital: 'Lhasa',
    lat: 29.6520, 
    lng: 91.1720 
  },
};

const SPECIAL_CODES = {
  'STA': { iso3: 'STA', name: 'Stateless', capital: 'N/A', lat: 0, lng: 0 },
  'UKN': { iso3: 'UKN', name: 'Unknown', capital: 'N/A', lat: 0, lng: 0 },
  'XXA': { iso3: 'XXA', name: 'Unknown', capital: 'N/A', lat: 0, lng: 0 },
  'VAR': { iso3: 'VAR', name: 'Various', capital: 'N/A', lat: 0, lng: 0 },
};

async function generateCountryCoordinates() {
  console.log('🌍 Fetching country data from REST Countries API...\n');
  
  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=cca3,name,capital,capitalInfo,latlng'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.length} countries from API\n`);
    
    // Transform to our format
    const coordinates = data.map(country => {
      const override = OVERRIDES[country.cca3];
      const lat = country.capitalInfo?.latlng?.[0] ?? country.latlng[0];
      const lng = country.capitalInfo?.latlng?.[1] ?? country.latlng[1];
      
      return {
        iso3: country.cca3,
        name: country.name.common,
        capital: country.capital?.[0] ?? 'N/A',
        lat,
        lng,
        ...override,
      };
    });
    
    // Add special codes
    Object.values(SPECIAL_CODES).forEach(code => {
      coordinates.push(code);
    });
    
    // Add overrides not in REST Countries
    Object.entries(OVERRIDES).forEach(([iso3, override]) => {
      if (!coordinates.find(c => c.iso3 === iso3)) {
        coordinates.push({
          iso3,
          name: override.name || iso3,
          capital: override.capital || 'N/A',
          lat: override.lat || 0,
          lng: override.lng || 0,
        });
      }
    });
    
    // Sort by ISO code
    coordinates.sort((a, b) => a.iso3.localeCompare(b.iso3));
    
    console.log(`📊 Generated ${coordinates.length} country coordinates\n`);
    return coordinates;
    
  } catch (error) {
    console.error('❌ Error fetching country data:', error);
    throw error;
  }
}

function generateTypeScript(coords) {
  return `// Auto-generated country coordinates - DO NOT EDIT MANUALLY
// Generated on ${new Date().toISOString()}
// Source: REST Countries API (https://restcountries.com/)

export interface CountryCoordinate {
  iso3: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
}

export const COUNTRY_COORDINATES: CountryCoordinate[] = ${JSON.stringify(coords, null, 2)};

// Helper: Build Map for O(1) lookup
export function getCoordinateMap(): Map<string, CountryCoordinate> {
  return new Map(COUNTRY_COORDINATES.map(c => [c.iso3, c]));
}

// Helper: Get coordinate by ISO3 code
export function getCoordinate(iso3: string): CountryCoordinate | undefined {
  return COUNTRY_COORDINATES.find(c => c.iso3 === iso3);
}

// Helper: Check if coordinates exist
export function hasCoordinates(iso3: string): boolean {
  return COUNTRY_COORDINATES.some(c => c.iso3 === iso3);
}
`;
}

async function main() {
  try {
    console.log('='.repeat(70));
    console.log('  DISPLACEMENT ATLAS - Country Coordinate Generator');
    console.log('='.repeat(70));
    console.log();
    
    // Generate coordinates
    const coordinates = await generateCountryCoordinates();
    
    // Create data directory if it doesn't exist
    const dataDir = join(__dirname, '..', 'src', 'data');
    mkdirSync(dataDir, { recursive: true });
    
    // Generate and save TypeScript file
    const tsOutput = generateTypeScript(coordinates);
    const tsPath = join(dataDir, 'country-coordinates.ts');
    writeFileSync(tsPath, tsOutput, 'utf-8');
    console.log(`✅ TypeScript file saved: ${tsPath}\n`);
    
    // Generate and save JSON file
    const jsonOutput = JSON.stringify(coordinates, null, 2);
    const jsonPath = join(dataDir, 'country-coordinates.json');
    writeFileSync(jsonPath, jsonOutput, 'utf-8');
    console.log(`✅ JSON file saved: ${jsonPath}\n`);
    
    // Print statistics
    console.log('='.repeat(70));
    console.log('📊 Dataset Statistics');
    console.log('='.repeat(70));
    console.log(`  Total countries: ${coordinates.length}`);
    console.log(`  With capitals: ${coordinates.filter(c => c.capital !== 'N/A').length}`);
    console.log(`  Special codes: ${coordinates.filter(c => ['STA', 'UKN', 'XXA', 'VAR'].includes(c.iso3)).length}`);
    console.log();
    console.log('='.repeat(70));
    console.log('✨ Generation complete! You can now use these files in your app.');
    console.log('='.repeat(70));
    console.log();
    console.log('Usage example:');
    console.log('  import { getCoordinateMap } from \'./data/country-coordinates\';');
    console.log('  const coordMap = getCoordinateMap();');
    console.log();
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

main();

