export interface UNHCRApiResponse {
  page: number;
  maxPages: number;
  total: any[];
  items: UNHCRPopulationItem[];
}

export interface UNHCRPopulationItem {
  year: number;
  coo_id: number;
  coo_name: string;
  coo: string;
  coo_iso: string;
  coa_id: number;
  coa_name: string;
  coa: string;
  coa_iso: string;
  refugees: string | number;
  asylum_seekers: string | number;
  returned_refugees: string | number;
  idps: string | number;
  returned_idps: string | number;
  stateless: string | number;
  ooc: string | number;
  oip: string;
  hst: string | number;
}

export interface MigrationFlow {
  originIso: string;
  originName: string;
  asylumIso: string;
  asylumName: string;
  refugees: number;
  asylumSeekers: number;
  totalDisplaced: number;
  year: number;
}

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  strokeWidth: number;
  volume: number;
  originIso: string;
  asylumIso: string;
}

export interface CountryCoordinates {
  iso3: string;
  name: string;
  lat: number;
  lng: number;
}

export interface CountryAggregate {
  iso: string;
  name: string;
  total: number;
  count: number;
}