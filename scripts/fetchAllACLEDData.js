/**
 * Complete script to fetch ALL ACLED data for ALL countries and years
 * This will get every available conflict event from ACLED API
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACLED_API_BASE = 'https://acleddata.com/api/acled/read';

// Get credentials from environment or prompt user
let ACLED_ACCESS_TOKEN = process.env.ACLED_ACCESS_TOKEN || '';
let ACLED_REFRESH_TOKEN = process.env.ACLED_REFRESH_TOKEN || '';
const ACLED_USERNAME = process.env.ACLED_USERNAME || '';
const ACLED_PASSWORD = process.env.ACLED_PASSWORD || '';

if (!ACLED_USERNAME || !ACLED_PASSWORD) {
  console.error('ERROR: ACLED login credentials not found!');
  console.error('Please set ACLED_USERNAME and ACLED_PASSWORD environment variables');
  console.error('Or run: ACLED_USERNAME=your_email ACLED_PASSWORD=your_password node scripts [...]');
  process.exit(1);
}

/**
 * Get initial ACLED credentials using username/password
 */
async function getInitialACLEDCredentials() {
  console.log('Getting ACLED credentials...');
  
  const body = new URLSearchParams({
    username: ACLED_USERNAME,
    password: ACLED_PASSWORD,
    grant_type: 'password',
    client_id: 'acled',
  });

  const response = await fetch('https://acleddata.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to get credentials: ${response.status} - ${errorText}`);
    return false;
  }

  const data = await response.json();
  ACLED_ACCESS_TOKEN = data.access_token;
  ACLED_REFRESH_TOKEN = data.refresh_token;
  console.log('Authentication successful');
  return true;
}

/**
 * Refresh ACLED access token
 */
async function refreshACLEDToken() {
  const body = new URLSearchParams({
    refresh_token: ACLED_REFRESH_TOKEN,
    grant_type: 'refresh_token',
    client_id: 'acled',
  });

  const response = await fetch('https://acleddata.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    console.log('Token refresh failed, attempting re-login...');
    return await getInitialACLEDCredentials();
  }

  const data = await response.json();
  ACLED_ACCESS_TOKEN = data.access_token;
  return true;
}

// Common countries that are likely to have conflict data
const COMMON_COUNTRIES = [
  'COD', 'SYR', 'AFG', 'YEM', 'SSD', 'SOM', 'ETH', 'NGA', 'CMR', 'TCD',
  'IRQ', 'LBY', 'CAF', 'MLI', 'BFA', 'NER', 'SEN', 'GIN', 'LBR', 'CIV',
  'IRN', 'PAK', 'IND', 'BGD', 'MMR', 'THA', 'PHL', 'IDN', 'MYS', 'SGP',
  'UKR', 'RUS', 'TUR', 'GRC', 'BGR', 'ROU', 'MDA', 'BLR', 'LTU', 'LVA',
  'MEX', 'GTM', 'HND', 'SLV', 'NIC', 'COL', 'VEN', 'ECU', 'PER', 'BOL',
  'SDN', 'AGO', 'ZWE', 'MOZ', 'HTI', 'LBN'
];

// Years to fetch (2000 to current year for comprehensive historical data)
const currentYear = new Date().getFullYear();
const YEARS = [];
for (let year = 2000; year <= currentYear; year++) {
  YEARS.push(year);
}

// ISO3 to ACLED country name mapping
const ISO_TO_ACLED_COUNTRY = {
  'COD': 'Democratic Republic of Congo',
  'COG': 'Republic of the Congo',
  'CAF': 'Central African Republic',
  'SSD': 'South Sudan',
  'SOM': 'Somalia',
  'ETH': 'Ethiopia',
  'ERI': 'Eritrea',
  'DJI': 'Djibouti',
  'KEN': 'Kenya',
  'UGA': 'Uganda',
  'TZA': 'Tanzania',
  'BDI': 'Burundi',
  'RWA': 'Rwanda',
  'MWI': 'Malawi',
  'ZMB': 'Zambia',
  'ZWE': 'Zimbabwe',
  'BWA': 'Botswana',
  'NAM': 'Namibia',
  'ZAF': 'South Africa',
  'LSO': 'Lesotho',
  'SWZ': 'Eswatini',
  'MOZ': 'Mozambique',
  'MDG': 'Madagascar',
  'MUS': 'Mauritius',
  'SYC': 'Seychelles',
  'COM': 'Comoros',
  'AGO': 'Angola',
  'GAB': 'Gabon',
  'GNQ': 'Equatorial Guinea',
  'STP': 'Sao Tome and Principe',
  'CMR': 'Cameroon',
  'TCD': 'Chad',
  'NER': 'Niger',
  'NGA': 'Nigeria',
  'BEN': 'Benin',
  'TGO': 'Togo',
  'GHA': 'Ghana',
  'BFA': 'Burkina Faso',
  'MLI': 'Mali',
  'SEN': 'Senegal',
  'GMB': 'Gambia',
  'GNB': 'Guinea-Bissau',
  'GIN': 'Guinea',
  'SLE': 'Sierra Leone',
  'LBR': 'Liberia',
  'CIV': 'Cote d\'Ivoire',
  'DZA': 'Algeria',
  'TUN': 'Tunisia',
  'LBY': 'Libya',
  'EGY': 'Egypt',
  'SDN': 'Sudan',
  'MAR': 'Morocco',
  'ESH': 'Western Sahara',
  'MRT': 'Mauritania',
  'CPV': 'Cape Verde',
  'AFG': 'Afghanistan',
  'PAK': 'Pakistan',
  'IND': 'India',
  'BGD': 'Bangladesh',
  'LKA': 'Sri Lanka',
  'MDV': 'Maldives',
  'NPL': 'Nepal',
  'BTN': 'Bhutan',
  'MMR': 'Myanmar',
  'THA': 'Thailand',
  'LAO': 'Laos',
  'VNM': 'Vietnam',
  'KHM': 'Cambodia',
  'MYS': 'Malaysia',
  'SGP': 'Singapore',
  'BRN': 'Brunei',
  'IDN': 'Indonesia',
  'TLS': 'Timor-Leste',
  'PHL': 'Philippines',
  'CHN': 'China',
  'MNG': 'Mongolia',
  'PRK': 'North Korea',
  'KOR': 'South Korea',
  'JPN': 'Japan',
  'TWN': 'Taiwan',
  'HKG': 'Hong Kong',
  'MAC': 'Macau',
  'RUS': 'Russia',
  'KAZ': 'Kazakhstan',
  'KGZ': 'Kyrgyzstan',
  'TJK': 'Tajikistan',
  'TKM': 'Turkmenistan',
  'UZB': 'Uzbekistan',
  'AZE': 'Azerbaijan',
  'ARM': 'Armenia',
  'GEO': 'Georgia',
  'TUR': 'Turkey',
  'IRN': 'Iran',
  'IRQ': 'Iraq',
  'SYR': 'Syria',
  'LBN': 'Lebanon',
  'JOR': 'Jordan',
  'ISR': 'Israel',
  'PSE': 'Palestine',
  'SAU': 'Saudi Arabia',
  'KWT': 'Kuwait',
  'BHR': 'Bahrain',
  'QAT': 'Qatar',
  'ARE': 'United Arab Emirates',
  'OMN': 'Oman',
  'YEM': 'Yemen',
  'CYP': 'Cyprus',
  'GRC': 'Greece',
  'BGR': 'Bulgaria',
  'ROU': 'Romania',
  'MDA': 'Moldova',
  'UKR': 'Ukraine',
  'BLR': 'Belarus',
  'LTU': 'Lithuania',
  'LVA': 'Latvia',
  'EST': 'Estonia',
  'FIN': 'Finland',
  'SWE': 'Sweden',
  'NOR': 'Norway',
  'DNK': 'Denmark',
  'ISL': 'Iceland',
  'IRL': 'Ireland',
  'GBR': 'United Kingdom',
  'FRA': 'France',
  'BEL': 'Belgium',
  'NLD': 'Netherlands',
  'DEU': 'Germany',
  'POL': 'Poland',
  'CZE': 'Czech Republic',
  'SVK': 'Slovakia',
  'HUN': 'Hungary',
  'AUT': 'Austria',
  'CHE': 'Switzerland',
  'LIE': 'Liechtenstein',
  'ITA': 'Italy',
  'SMR': 'San Marino',
  'VAT': 'Vatican City',
  'MCO': 'Monaco',
  'AND': 'Andorra',
  'ESP': 'Spain',
  'PRT': 'Portugal',
  'ALB': 'Albania',
  'MKD': 'North Macedonia',
  'SRB': 'Serbia',
  'MNE': 'Montenegro',
  'BIH': 'Bosnia and Herzegovina',
  'HRV': 'Croatia',
  'SVN': 'Slovenia',
  'CAN': 'Canada',
  'USA': 'United States of America',
  'MEX': 'Mexico',
  'GTM': 'Guatemala',
  'BLZ': 'Belize',
  'SLV': 'El Salvador',
  'HND': 'Honduras',
  'NIC': 'Nicaragua',
  'CRI': 'Costa Rica',
  'PAN': 'Panama',
  'CUB': 'Cuba',
  'JAM': 'Jamaica',
  'HTI': 'Haiti',
  'DOM': 'Dominican Republic',
  'PRI': 'Puerto Rico',
  'TTO': 'Trinidad and Tobago',
  'BRB': 'Barbados',
  'LCA': 'Saint Lucia',
  'VCT': 'Saint Vincent and the Grenadines',
  'GRD': 'Grenada',
  'ATG': 'Antigua and Barbuda',
  'DMA': 'Dominica',
  'KNA': 'Saint Kitts and Nevis',
  'BHS': 'Bahamas',
  'VEN': 'Venezuela',
  'GUY': 'Guyana',
  'SUR': 'Suriname',
  'BRA': 'Brazil',
  'COL': 'Colombia',
  'ECU': 'Ecuador',
  'PER': 'Peru',
  'BOL': 'Bolivia',
  'PRY': 'Paraguay',
  'URY': 'Uruguay',
  'ARG': 'Argentina',
  'CHL': 'Chile'
};

async function fetchCountryYearEvents(iso3, year) {
  const countryName = ISO_TO_ACLED_COUNTRY[iso3];
  if (!countryName) {
    console.warn(`WARNING: No ACLED mapping for ${iso3}`);
    return [];
  }

  const allEvents = [];
  let page = 1;
  const pageSize = 5000;
  let hasMoreData = true;

  console.log(`  Fetching ${iso3} (${countryName}) ${year}...`);

  while (hasMoreData) {
    try {
      // Request only essential fields to reduce response size
      const fields = [
        'event_id_cnty',
        'event_date',
        'year',
        'event_type',
        'sub_event_type',
        'actor1',
        'actor2',
        'admin1',
        'admin2',
        'admin3',
        'location',
        'latitude',
        'longitude',
        'fatalities',
        'civilian_targeting'
      ].join('|');

      const params = new URLSearchParams({
        country: countryName,
        year: year.toString(),
        limit: pageSize.toString(),
        page: page.toString(),
        fields: fields,
      });

      const url = `${ACLED_API_BASE}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ACLED_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log(`  Authentication failed, refreshing token...`);
          const refreshSuccess = await refreshACLEDToken();
          if (refreshSuccess) {
            // Retry the request with new token
            const retryResponse = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${ACLED_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              return retryData.data || [];
            } else {
              console.error(`  Retry failed: HTTP ${retryResponse.status}`);
              return [];
            }
          } else {
            console.error(`  Token refresh failed`);
            return [];
          }
        } else if (response.status === 403) {
          console.log(`  Rate limited, waiting...`);
          // Wait longer before continuing
          await new Promise(resolve => setTimeout(resolve, 5000));
          return [];
        }
        console.error(`  HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      const events = data.data || [];

      if (events.length === 0) {
        hasMoreData = false;
      } else {
        allEvents.push(...events);
        console.log(`    Page ${page}: ${events.length} events (Total: ${allEvents.length})`);
        
        if (events.length < pageSize) {
          hasMoreData = false;
        } else {
          page++;
          // Longer delay to avoid Cloudflare blocks
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch (error) {
      console.error(`  Error on page ${page}:`, error.message);
      hasMoreData = false;
    }
  }

  if (allEvents.length > 0) {
    console.log(`  ${iso3} ${year}: ${allEvents.length} events`);
  }
  return allEvents;
}

/**
 * Test ACLED authentication before starting the full fetch
 */
async function testACLEDAuth() {
  console.log('Testing ACLED authentication...');
  
  if (!ACLED_ACCESS_TOKEN || !ACLED_REFRESH_TOKEN) {
    const loginSuccess = await getInitialACLEDCredentials();
    if (!loginSuccess) return false;
  }
  
  const testUrl = `${ACLED_API_BASE}?country=Syria&year=2024&limit=1&fields=event_id_cnty`;
  const response = await fetch(testUrl, {
    headers: {
      'Authorization': `Bearer ${ACLED_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    console.log('Authentication successful\n');
    return true;
  }
  
  if (response.status === 401) {
    const refreshSuccess = await refreshACLEDToken();
    if (!refreshSuccess) return false;
    
    const retryResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${ACLED_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (retryResponse.ok) {
      console.log('Authentication successful after refresh\n');
      return true;
    }
  }
  
  console.error(`Authentication failed: ${response.status}`);
  return false;
}

async function fetchAllACLEDData() {
  console.log('Starting ACLED data fetch\n');
  
  const authSuccess = await testACLEDAuth();
  if (!authSuccess) {
    console.error('Authentication failed. Please check credentials.');
    process.exit(1);
  }
  
  const totalCombinations = COMMON_COUNTRIES.length * YEARS.length;
  console.log(`Countries: ${COMMON_COUNTRIES.length}`);
  console.log(`Years: ${YEARS[0]}-${YEARS[YEARS.length-1]}`);
  console.log(`Total combinations: ${totalCombinations}`);
  console.log(`Started: ${new Date().toLocaleTimeString()}\n`);

  const acledData = {};
  let totalEvents = 0;
  let successfulFetches = 0;
  let successfulFetchesWithNoData = 0;
  let failedFetches = 0;
  let completedCombinations = 0;
  const startTime = Date.now();

  for (const iso3 of COMMON_COUNTRIES) {
    acledData[iso3] = {};
    
    for (const year of YEARS) {
      try {
        const events = await fetchCountryYearEvents(iso3, year);
        
        // Only save the year data if it has events
        if (events.length > 0) {
          acledData[iso3][year] = events;
          totalEvents += events.length;
          successfulFetches++;
        } else {
          successfulFetchesWithNoData++;
          // Don't save empty years - they don't help us (but API call was successful)
        }
      } catch (error) {
        console.error(`Failed to fetch ${iso3} ${year}:`, error.message);
        failedFetches++;
      }
      
      completedCombinations++;
      
      // Show progress every 50 combinations
      if (completedCombinations % 50 === 0 || completedCombinations === totalCombinations) {
        const elapsedTime = Date.now() - startTime;
        const progressPercent = ((completedCombinations / totalCombinations) * 100).toFixed(1);
        const avgTimePerCombination = elapsedTime / completedCombinations;
        const remainingMinutes = Math.round(((totalCombinations - completedCombinations) * avgTimePerCombination) / 60000);
        
        console.log(`\nProgress: ${completedCombinations}/${totalCombinations} (${progressPercent}%)`);
        console.log(`Success: ${successfulFetches}, No Data: ${successfulFetchesWithNoData}, Failed: ${failedFetches}`);
        console.log(`Total Events: ${totalEvents.toLocaleString()}`);
        console.log(`Elapsed: ${Math.round(elapsedTime / 60000)}min, Est. remaining: ~${remainingMinutes}min\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const countryProgress = ((COMMON_COUNTRIES.indexOf(iso3) + 1) / COMMON_COUNTRIES.length * 100).toFixed(1);
    console.log(`Completed ${iso3}: ${countryProgress}% of countries\n`);
  }

  // Create cache object
  const cacheData = {
    acledData,
    lastFetched: new Date().toISOString(),
    version: '1.0',
    totalEvents,
    countriesCount: Object.keys(acledData).length,
    years: YEARS,
    successfulFetches,
    failedFetches
  };

  console.log('\nFetch Summary:');
  console.log(`Successful (with data): ${successfulFetches}`);
  console.log(`Successful (no data): ${successfulFetchesWithNoData}`);
  console.log(`Failed: ${failedFetches}`);
  console.log(`Total events: ${totalEvents.toLocaleString()}`);
  console.log(`Countries with data: ${Object.keys(acledData).length}`);

  // Save to individual country files (merge with existing data)
  console.log('\nSaving cache files...');
  const cacheDir = path.join(__dirname, '..', 'public', 'conflict-data');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  let savedCountries = 0;
  let mergedCountries = 0;
  let newCountries = 0;
  const availableCountries = [];
  
  for (const [iso3, yearlyData] of Object.entries(cacheData.acledData)) {
    if (Object.keys(yearlyData).length > 0) {
      const countryPath = path.join(cacheDir, `${iso3}.json`);
      
      // Load existing cache file if it exists
      let existingData = null;
      if (fs.existsSync(countryPath)) {
        try {
          const existingContent = fs.readFileSync(countryPath, 'utf8');
          existingData = JSON.parse(existingContent);
          mergedCountries++;
        } catch (error) {
          console.log(`  Warning: Could not read existing ${iso3}.json, will overwrite`);
        }
      } else {
        newCountries++;
      }
      
      // Merge yearly data (new data takes precedence)
      const mergedYearlyData = existingData ? { ...existingData.yearlyData, ...yearlyData } : yearlyData;
      
      const countryData = {
        iso3,
        yearlyData: mergedYearlyData,
        lastFetched: cacheData.lastFetched,
        version: cacheData.version
      };
      
      fs.writeFileSync(countryPath, JSON.stringify(countryData, null, 2));
      availableCountries.push(iso3);
      savedCountries++;
      
      if (savedCountries % 10 === 0) {
        console.log(`  Saved ${savedCountries} countries...`);
      }
    }
  }
  
  console.log(`\nMerge Summary:`);
  console.log(`  Merged with existing: ${mergedCountries}`);
  console.log(`  New countries: ${newCountries}`);
  
  // Save metadata
  const metadata = {
    lastFetched: cacheData.lastFetched,
    version: cacheData.version,
    totalEvents: cacheData.totalEvents,
    countriesCount: savedCountries,
    years: cacheData.years,
    availableCountries: availableCountries.sort(),
    compressionRatio: 0
  };
  
  const metadataPath = path.join(cacheDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`\nSaved ${savedCountries} country files to: ${cacheDir}/`);
  console.log(`Metadata saved: ${metadataPath}`);
  
  return cacheData;
}

// Run the fetch
fetchAllACLEDData().catch(console.error);
