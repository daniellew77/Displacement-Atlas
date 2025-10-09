import type {
  UNHCRApiResponse,
  UNHCRPopulationItem,
  MigrationFlow,
} from '../types/unhcr.types';

export class UNHCRApiService {
  private baseUrl = 'https://api.unhcr.org/population/v1';
  private cache = new Map<string, any>();

  async fetchGlobalFlows(year: number): Promise<MigrationFlow[]> {
    const cacheKey = `global_flows_${year}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const allItems: UNHCRPopulationItem[] = [];
    let currentPage = 1;
    let maxPages = 1;

    try {
      const firstResponse = await this.fetchPage(year, currentPage);
      maxPages = firstResponse.maxPages;
      allItems.push(...firstResponse.items);

      const pagePromises: Promise<UNHCRApiResponse>[] = [];
      for (let page = 2; page <= Math.min(maxPages, 100); page++) {
        pagePromises.push(this.fetchPage(year, page));
      }

      const remainingPages = await Promise.all(pagePromises);
      remainingPages.forEach(response => {
        allItems.push(...response.items);
      });

      const flows = this.transformToFlows(allItems);
      this.cache.set(cacheKey, flows);
      
      return flows;
    } catch (error) {
      throw new Error(`Failed to fetch UNHCR data: ${error}`);
    }
  }

  async fetchIncomingFlows(
    asylumCountryIso: string, 
    year: number
  ): Promise<MigrationFlow[]> {
    const cacheKey = `incoming_${asylumCountryIso}_${year}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = this.buildUrl({
      cf_type: 'ISO',
      coa: asylumCountryIso,
      coo_all: true,
      year: [year],
      limit: 1000,
    });

    try {
      const response = await fetch(url);
      const data: UNHCRApiResponse = await response.json();
      const flows = this.transformToFlows(data.items);
      this.cache.set(cacheKey, flows);
      return flows;
    } catch (error) {
      throw error;
    }
  }

  async fetchOutgoingFlows(
    originCountryIso: string, 
    year: number
  ): Promise<MigrationFlow[]> {
    const cacheKey = `outgoing_${originCountryIso}_${year}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = this.buildUrl({
      cf_type: 'ISO',
      coo: originCountryIso,
      coa_all: true,
      year: [year],
      limit: 1000,
    });

    try {
      const response = await fetch(url);
      const data: UNHCRApiResponse = await response.json();
      const flows = this.transformToFlows(data.items);
      this.cache.set(cacheKey, flows);
      return flows;
    } catch (error) {
      throw error;
    }
  }

  private async fetchPage(year: number, page: number): Promise<UNHCRApiResponse> {
    const url = this.buildUrl({
      cf_type: 'ISO',
      coo_all: true,
      coa_all: true,
      year: [year],
      limit: 1000,
      page,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private buildUrl(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, String(v)));
      } else if (value === true) {
        searchParams.append(key, 'true');
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${this.baseUrl}/population/?${searchParams.toString()}`;
  }

  private transformToFlows(items: UNHCRPopulationItem[]): MigrationFlow[] {
    return items
      .filter(item => item.coo_iso !== item.coa_iso)
      .map(item => ({
        originIso: item.coo_iso,
        originName: item.coo_name,
        asylumIso: item.coa_iso,
        asylumName: item.coa_name,
        refugees: this.parseNumber(item.refugees),
        asylumSeekers: this.parseNumber(item.asylum_seekers),
        totalDisplaced: 
          this.parseNumber(item.refugees) + 
          this.parseNumber(item.asylum_seekers),
        year: item.year,
      }))
      .filter(flow => flow.totalDisplaced > 0);
  }

  private parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (value === '-' || value === '') return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  clearCache(): void {
    this.cache.clear();
  }
}