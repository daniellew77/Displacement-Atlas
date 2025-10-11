// IOM DTM API Types for Internal Displacement Data

/**
 * Country information from IOM API
 */
export interface IOMCountry {
  admin0Name: string;
  admin0Pcode: string; // ISO3 code
}

/**
 * Raw IDP data point from IOM API
 */
export interface IOMIdpDataPoint {
  id: number;
  operation: string;
  admin0Name: string;
  admin0Pcode: string; // ISO3 code
  numPresentIdpInd: number; // Number of present IDP individuals
  reportingDate: string; // ISO date string
  yearReportingDate: number;
  monthReportingDate: number;
  roundNumber: number;
  assessmentType: string;
}

/**
 * Response from GetAdmin0Datav2 endpoint
 */
export interface IOMIdpDataResponse {
  result: IOMIdpDataPoint[];
  statusCode: number;
  isSuccess: boolean;
  errorMessages: string[];
  totalRecordsCount: number;
}

/**
 * Response from GetAllCountryList endpoint
 */
export interface IOMCountryListResponse {
  result: IOMCountry[];
  statusCode: number;
  isSuccess: boolean;
  errorMessages: string[];
  totalRecordsCount: number;
}

/**
 * Aggregated IDP data by year for a country
 */
export interface IOMYearlyIdpData {
  year: number;
  totalIdps: number; // Average or latest value for the year
  dataPoints: number; // Number of data points available for this year
  minIdps: number;
  maxIdps: number;
  latestReportDate: string;
  operation: string; // Which operation this data is from
}

/**
 * Processed IDP data for a country
 */
export interface IOMCountryIdpData {
  countryName: string;
  iso3: string;
  yearlyData: IOMYearlyIdpData[];
  lastUpdated: string; // When this data was fetched
  hasData: boolean;
}

/**
 * Cached IOM data structure
 */
export interface IOMDataCache {
  countries: IOMCountry[];
  idpData: Map<string, IOMCountryIdpData>; // Keyed by ISO3
  lastFetched: string;
  version: number;
}

/**
 * Parameters for fetching IOM IDP data
 */
export interface IOMFetchParams {
  countryName: string;
  operation?: string;
  fromDate?: string;
  toDate?: string;
  fromRound?: number;
  toRound?: number;
}

