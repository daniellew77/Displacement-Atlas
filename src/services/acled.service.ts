/**
 * ACLED API Service Layer
 * Handles conflict and event data from ACLED
 */

import { getACLEDEventsFromOptimizedCache, hasOptimizedACLEDData } from '../utils/acled-cache-loader-optimized';

/**
 * Map ISO3 codes to ACLED country names
 */
const ISO_TO_ACLED_COUNTRY: Record<string, string> = {
  'COD': 'Democratic Republic of the Congo',
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
  'CHL': 'Chile',
  'AUS': 'Australia',
  'NZL': 'New Zealand',
  'PNG': 'Papua New Guinea',
  'SLB': 'Solomon Islands',
  'VUT': 'Vanuatu',
  'NCL': 'New Caledonia',
  'FJI': 'Fiji',
  'TON': 'Tonga',
  'WSM': 'Samoa',
  'KIR': 'Kiribati',
  'TUV': 'Tuvalu',
  'NRU': 'Nauru',
  'PLW': 'Palau',
  'FSM': 'Federated States of Micronesia',
  'MHL': 'Marshall Islands',
  'COK': 'Cook Islands',
  'NIU': 'Niue',
  'TKL': 'Tokelau',
  'WLF': 'Wallis and Futuna',
  'PYF': 'French Polynesia',
  'ASM': 'American Samoa',
  'GUM': 'Guam',
  'MNP': 'Northern Mariana Islands',
  'VIR': 'U.S. Virgin Islands',
  'AIA': 'Anguilla',
  'MSR': 'Montserrat',
  'VGB': 'British Virgin Islands',
  'TCA': 'Turks and Caicos Islands',
  'CYM': 'Cayman Islands',
  'BES': 'Bonaire, Sint Eustatius and Saba',
  'SXM': 'Sint Maarten',
  'CUW': 'Curacao',
  'ABW': 'Aruba',
  'GRL': 'Greenland',
  'SPM': 'Saint Pierre and Miquelon',
  'BLM': 'Saint Barthelemy',
  'MAF': 'Saint Martin',
  'GLP': 'Guadeloupe',
  'MTQ': 'Martinique',
  'REU': 'Reunion',
  'MYT': 'Mayotte',
  'SHN': 'Saint Helena',
  'ASC': 'Ascension Island',
  'TAA': 'Tristan da Cunha',
  'ATF': 'French Southern Territories',
  'HMD': 'Heard Island and McDonald Islands',
  'BVT': 'Bouvet Island',
  'SGS': 'South Georgia and the South Sandwich Islands',
  'ATA': 'Antarctica',
};

export interface ACLEDEvent {
    event_id_cnty: string;
    event_date: string;
    year: number;
    time_precision: number;
    event_type: string;
    sub_event_type: string;
    actor1: string;
    actor2: string;
    admin1: string;
    admin2: string;
    admin3: string;
    location: string;
    latitude: number;
    longitude: number;
    source: string;
    notes: string;
    fatalities: number;
    civilian_targeting: string;
  }
  
  export interface ACLEDSummary {
    totalEvents: number;
    totalFatalities: number;
    eventTypes: Map<string, number>;
    topLocations: Array<{ location: string; count: number }>;
    mostDeadly: ACLEDEvent[];
    timelineData: Array<{ month: string; events: number; fatalities: number }>;
  }
  
  export class ACLEDApiService {
    private baseUrl: string;
    private tokenUrl: string;
    private accessToken: string;
    private refreshToken: string;
    private tokenExpiry: number = 0;
    private cache = new Map<string, ACLEDEvent[]>();
    private readonly CACHE_PREFIX = 'acled_cache_';
    private readonly CACHE_EXPIRY_HOURS = 24;

    constructor(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      // Set initial expiry to now + 24 hours (86400 seconds)
      this.tokenExpiry = Date.now() + 86400000;
      
      // Use proxy in development to avoid CORS issues
      if (import.meta.env.DEV) {
        this.baseUrl = '/api/acled/read';
        this.tokenUrl = '/api/acled/oauth/token';
      } else {
        this.baseUrl = 'https://acleddata.com/api/acled/read';
        this.tokenUrl = 'https://acleddata.com/oauth/token';
      }
    }
  
    /**
     * Check if token needs refresh
     */
    private needsRefresh(): boolean {
      // Refresh if token expires in less than 1 hour
      return Date.now() > (this.tokenExpiry - 3600000);
    }

    /**
     * Get cached data from localStorage
     */
    private getCachedData(cacheKey: string): ACLEDEvent[] | null {
      try {
        const cached = localStorage.getItem(this.CACHE_PREFIX + cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
          
          if (ageHours < this.CACHE_EXPIRY_HOURS) {
            console.log(`ACLED localStorage cache hit for ${cacheKey}`);
            return data;
          } else {
            // Remove expired cache
            localStorage.removeItem(this.CACHE_PREFIX + cacheKey);
          }
        }
      } catch (error) {
        console.warn('Error reading from localStorage cache:', error);
      }
      return null;
    }

    /**
     * Save data to localStorage cache
     */
    private setCachedData(cacheKey: string, data: ACLEDEvent[]): void {
      try {
        const cacheData = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(this.CACHE_PREFIX + cacheKey, JSON.stringify(cacheData));
        console.log(`ACLED data cached for ${cacheKey}`);
      } catch (error) {
        console.warn('Error saving to localStorage cache:', error);
      }
    }
  
    /**
     * Fetch ALL ACLED events for a specific country and year with pagination
     */
    async fetchAllCountryEvents(
      iso3: string,
      year: number
    ): Promise<ACLEDEvent[]> {
      const cacheKey = `acled_all_${iso3}_${year}`;
      
      // Check in-memory cache first
      if (this.cache.has(cacheKey)) {
        console.log(`ACLED in-memory cache hit for ${iso3} ${year}`);
        return this.cache.get(cacheKey)!;
      }

      // Check optimized cache from public folder (fastest)
      if (await hasOptimizedACLEDData(iso3, year)) {
        console.log(`ACLED optimized cache hit for ${iso3} ${year}`);
        const events = await getACLEDEventsFromOptimizedCache(iso3, year);
        this.cache.set(cacheKey, events);
        return events;
      }

      // Check localStorage cache (fallback)
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`ACLED localStorage cache hit for ${iso3} ${year}`);
        this.cache.set(cacheKey, cachedData);
        return cachedData;
      }

      console.log(`Fetching ALL ACLED events for ${iso3} ${year}...`);
      
      const allEvents: ACLEDEvent[] = [];
      let page = 1;
      const pageSize = 5000; // ACLED API max per request
      let hasMoreData = true;

      while (hasMoreData) {
        try {
          const events = await this.fetchCountryEventsPage(iso3, year, page, pageSize);
          
          if (events.length === 0) {
            hasMoreData = false;
          } else {
            allEvents.push(...events);
            console.log(`Fetched page ${page}: ${events.length} events (Total: ${allEvents.length})`);
            
            // If we got less than pageSize, we've reached the end
            if (events.length < pageSize) {
              hasMoreData = false;
            } else {
              page++;
              // Small delay between requests to be respectful to the API
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
        } catch (error) {
          console.error(`Error fetching page ${page} for ${iso3}:`, error);
          hasMoreData = false;
        }
      }

      console.log(`Total events fetched for ${iso3} ${year}: ${allEvents.length}`);
      
      if (allEvents.length > 0) {
        // Save to both in-memory and localStorage cache
        this.cache.set(cacheKey, allEvents);
        this.setCachedData(cacheKey, allEvents);
      }
      
      return allEvents;
    }

    /**
     * Fetch a single page of ACLED events (internal method for pagination)
     */
    private async fetchCountryEventsPage(
      iso3: string,
      year: number,
      page: number,
      limit: number
    ): Promise<ACLEDEvent[]> {
      // Map ISO3 code to country name
      const countryName = ISO_TO_ACLED_COUNTRY[iso3];
      if (!countryName) {
        throw new Error(`No ACLED country mapping found for ISO3 code: ${iso3}`);
      }

      // Check if we need to refresh token before making request
      if (this.needsRefresh()) {
        console.log('ACLED token needs refresh, refreshing...');
        await this.refreshAccessToken();
      }

      try {
        // Request only the fields we need to reduce response size
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
          limit: limit.toString(),
          page: page.toString(),
          fields: fields,
        });

        const url = `${this.baseUrl}?${params.toString()}`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for pagination
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 401) {
          console.log('ACLED token expired, refreshing...');
          await this.refreshAccessToken();
          // Retry with new token
          return this.fetchCountryEventsPage(iso3, year, page, limit);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`ACLED API error: ${response.status} - ${errorText}`);
          throw new Error(`ACLED API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error(`Error fetching ACLED data page ${page} for ${iso3}:`, error);
        throw error;
      }
    }

    /**
     * Fetch ACLED events for a specific country and year (single page)
     */
    async fetchCountryEvents(
      iso3: string,
      year: number,
      limit: number = 10000
    ): Promise<ACLEDEvent[]> {
      const cacheKey = `acled_${iso3}_${year}`;
      
      // Check in-memory cache first
      if (this.cache.has(cacheKey)) {
        console.log(`ACLED in-memory cache hit for ${iso3} ${year}`);
        return this.cache.get(cacheKey)!;
      }

      // Check localStorage cache
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        this.cache.set(cacheKey, cachedData);
        return cachedData;
      }

      // Check if we need to refresh token before making request
      if (this.needsRefresh()) {
        console.log('ACLED token needs refresh, refreshing...');
        await this.refreshAccessToken();
      }

      // Map ISO3 code to country name
      const countryName = ISO_TO_ACLED_COUNTRY[iso3];
      if (!countryName) {
        throw new Error(`No ACLED country mapping found for ISO3 code: ${iso3}`);
      }

      try {
        // Request only the fields we need to reduce response size
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
          limit: limit.toString(),
          fields: fields,
        });

        console.log(`Fetching ACLED data for ${iso3} ${year}...`);
        const url = `${this.baseUrl}?${params.toString()}`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`ACLED response status: ${response.status}`);
        
        if (response.status === 401) {
          console.log('ACLED token expired, refreshing...');
          await this.refreshAccessToken();
          // Retry with new token
          return this.fetchCountryEvents(iso3, year, limit);
        }
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`ACLED API error: ${response.status} - ${errorText}`);
          throw new Error(`ACLED API error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log(`ACLED data received:`, data);
        
        const events: ACLEDEvent[] = data.data || [];
        console.log(`ACLED events count: ${events.length}`);
        
        if (events.length > 0) {
          // Save to both in-memory and localStorage cache
          this.cache.set(cacheKey, events);
          this.setCachedData(cacheKey, events);
        }
        
        return events;
      } catch (error) {
        console.error(`Error fetching ACLED data for ${iso3}:`, error);
        throw error;
      }
    }
  
    /**
     * Refresh the access token using refresh token
     */
    private async refreshAccessToken(): Promise<void> {
      try {
        console.log('Refreshing ACLED access token...');
        
        const body = new URLSearchParams({
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
          client_id: 'acled',
        });
  
        const response = await fetch(this.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to refresh ACLED token: ${response.status} - ${errorText}`);
          throw new Error(`Failed to refresh ACLED token: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('ACLED token refreshed successfully');
        
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token; // Update refresh token too
        this.tokenExpiry = Date.now() + (data.expires_in * 1000); // Convert seconds to milliseconds
        
      } catch (error) {
        console.error('Error refreshing ACLED token:', error);
        throw error;
      }
    }
  
    /**
     * Summarize ACLED events for display
     */
    summarizeEvents(events: ACLEDEvent[]): ACLEDSummary {
      const eventTypes = new Map<string, number>();
      const locationCounts = new Map<string, number>();
      const monthlyData = new Map<string, { events: number; fatalities: number }>();
  
      let totalFatalities = 0;
  
      events.forEach(event => {
        // Count event types
        const type = event.event_type || 'Unknown';
        eventTypes.set(type, (eventTypes.get(type) || 0) + 1);
  
        // Count locations
        const location = event.admin1 || event.location || 'Unknown';
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  
        // Sum fatalities
        totalFatalities += event.fatalities || 0;
  
        // Monthly aggregation
        const date = new Date(event.event_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { events: 0, fatalities: 0 });
        }
        const monthData = monthlyData.get(monthKey)!;
        monthData.events += 1;
        monthData.fatalities += event.fatalities || 0;
      });
  
      // Get top 5 locations
      const topLocations = Array.from(locationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));
  
      // Get 5 most deadly events
      const mostDeadly = [...events]
        .sort((a, b) => (b.fatalities || 0) - (a.fatalities || 0))
        .slice(0, 5);
  
      // Convert monthly data to array
      const timelineData = Array.from(monthlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({ month, ...data }));
  
      return {
        totalEvents: events.length,
        totalFatalities,
        eventTypes,
        topLocations,
        mostDeadly,
        timelineData,
      };
    }
  
    /**
     * Preload data for common countries to improve user experience
     */
    async preloadCommonCountries(year: number = new Date().getFullYear()): Promise<void> {
      const commonCountries = ['COD', 'SYR', 'AFG', 'YEM', 'SSD', 'SOM', 'ETH', 'NGA', 'CMR', 'TCD'];
      
      console.log('Preloading ACLED data for common countries...');
      
      // Load in parallel but with a small delay between requests to avoid overwhelming the API
      for (const iso3 of commonCountries) {
        try {
          // Use the limited version for preloading to avoid long waits
          await this.fetchCountryEvents(iso3, year, 2000); // Moderate limit for preloading
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Failed to preload data for ${iso3}:`, error);
        }
      }
      
      console.log('ACLED preloading completed');
    }

    clearCache(): void {
      this.cache.clear();
      
      // Clear localStorage cache
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
        console.log('ACLED cache cleared');
      } catch (error) {
        console.warn('Error clearing localStorage cache:', error);
      }
    }
  }