import type { UNRWARecord, UNRWAParsedFlow } from '../types/unrwa.types';

const UNRWA_HOST_COUNTRIES = {
  'JOR': 'Jordan',
  'LBN': 'Lebanon',
  'SYR': 'Syria',
  'PSE': 'Palestine',
  'EGY': 'Egypt'
};

export class UNRWAApiService {
  private baseUrl = 'https://api.unhcr.org/population/v1/unrwa';
  private cache = new Map<string, UNRWAParsedFlow[]>();

  async fetchPalestineRefugees(year: number): Promise<UNRWAParsedFlow[]> {
    const cacheKey = `unrwa_${year}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const data = await this.fetchUNRWAData(year);
      console.log('UNRWA raw data:', data);
      const flows = this.transformToFlows(data, year);
      console.log('UNRWA transformed flows:', flows);
      this.cache.set(cacheKey, flows);
      return flows;
    } catch (error) {
      console.error('Failed to fetch UNRWA data:', error);
      return [];
    }
  }

  async fetchIncomingToCountry(asylumCountryIso: string, year: number): Promise<UNRWAParsedFlow[]> {
    if (!Object.keys(UNRWA_HOST_COUNTRIES).includes(asylumCountryIso)) {
      return [];
    }

    const allFlows = await this.fetchPalestineRefugees(year);
    return allFlows.filter(flow => flow.asylumIso === asylumCountryIso);
  }

  async fetchOutgoingFromPalestine(year: number): Promise<UNRWAParsedFlow[]> {
    return this.fetchPalestineRefugees(year);
  }

  private async fetchUNRWAData(year: number): Promise<UNRWARecord[]> {
    const url = this.buildUrl({
      cf_type: 'ISO',
      coo: 'PSE',
      coa_all: true,
      year: [year],
      limit: 1000,
    });

    console.log('UNRWA API URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: any = await response.json();
    console.log('UNRWA API response:', {
      hasItems: !!data.items,
      itemCount: data.items?.length,
      firstItem: data.items?.[0],
      keys: Object.keys(data)
    });
    
    return this.parseFromItems(data, year);
  }

  private parseFromItems(response: any, year: number): UNRWARecord[] {
    if (!response.items || !Array.isArray(response.items)) {
      console.warn('UNRWA API: No items array in response');
      return [];
    }

    if (response.items.length === 0) {
      console.warn('UNRWA API: Items array is empty');
      return [];
    }

    const hostCountryMap: Record<string, { name: string; iso: string; refugees: number }> = {};

    response.items.forEach((item: any, index: number) => {
      if (index < 3) {
        console.log(`UNRWA item ${index} FULL:`, item);
        console.log(`UNRWA item ${index} keys:`, Object.keys(item));
      }

      const iso = item.coa_iso;
      const name = item.coa_name;
      const total = this.parseNumber(item.total);

      if (index < 3) {
        console.log(`Processing item ${index}:`, {
          iso,
          name,
          total,
          coo_iso: item.coo_iso,
          isNotPSE: iso !== 'PSE',
          hasTotal: total > 0,
          willAdd: iso && iso !== 'PSE' && total > 0
        });
      }

      if (iso && iso !== 'PSE' && total > 0) {
        if (!hostCountryMap[iso]) {
          hostCountryMap[iso] = { name, iso, refugees: 0 };
        }
        hostCountryMap[iso].refugees += total;
      }
    });

    console.log('UNRWA parsed countries:', Object.keys(hostCountryMap));

    return Object.values(hostCountryMap).map(country => ({
      year,
      host_country: country.name,
      host_country_iso: country.iso,
      registered_refugees: country.refugees,
      palestine_iso: 'PSE'
    }));
  }

  private buildUrl(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, String(v)));
      } else if (typeof value === 'boolean') {
        searchParams.append(key, value ? 'true' : 'false');
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${this.baseUrl}/?${searchParams.toString()}`;
  }

  private parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (value === '-' || value === '' || !value) return 0;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private transformToFlows(records: UNRWARecord[], year: number): UNRWAParsedFlow[] {
    return records
      .filter(record => record.registered_refugees > 0)
      .map(record => ({
        originIso: 'PSE',
        originName: 'Palestine',
        asylumIso: record.host_country_iso,
        asylumName: record.host_country,
        refugees: record.registered_refugees,
        year: year,
        source: 'UNRWA' as const
      }));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

