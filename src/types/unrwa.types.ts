export interface UNRWAApiResponse {
  data: UNRWARecord[];
  metadata?: {
    year: number;
    source: string;
    lastUpdated: string;
  };
}

export interface UNRWARecord {
  year: number;
  host_country: string;
  host_country_iso: string;
  registered_refugees: number;
  palestine_iso?: string;
}

export interface UNRWAParsedFlow {
  originIso: string;
  originName: string;
  asylumIso: string;
  asylumName: string;
  refugees: number;
  year: number;
  source: 'UNRWA';
}

