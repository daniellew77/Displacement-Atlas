/**
 * IOM DTM API Service
 * 
 * Fetches internal displacement data from the International Organization for Migration (IOM)
 * Displacement Tracking Matrix (DTM) API.
 */

import type {
  IOMCountryListResponse,
  IOMIdpDataResponse,
  IOMFetchParams,
  IOMCountry,
  IOMIdpDataPoint,
} from '../types/iom.types';

const IOM_API_BASE = 'https://dtmapi.iom.int/api';

/**
 * Fetches the list of all countries available in IOM DTM
 */
export async function fetchIOMCountryList(): Promise<IOMCountry[]> {
  try {
    const response = await fetch(`${IOM_API_BASE}/Common/GetAllCountryList`);
    
    if (!response.ok) {
      throw new Error(`IOM API error: ${response.status}`);
    }
    
    const data: IOMCountryListResponse = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(`IOM API error: ${data.errorMessages.join(', ')}`);
    }
    
    return data.result || [];
  } catch (error) {
    console.error('Failed to fetch IOM country list:', error);
    return [];
  }
}

/**
 * Fetches IDP data for a specific country
 */
export async function fetchIOMIdpData(params: IOMFetchParams): Promise<IOMIdpDataPoint[]> {
  const {
    countryName,
    operation = '', // Empty string = all operations (not just Countrywide monitoring)
    fromDate = '2000-01-01',
    toDate = new Date().toISOString().split('T')[0],
    fromRound,
    toRound,
  } = params;

  try {
    const url = new URL(`${IOM_API_BASE}/IdpAdmin0Data/GetAdmin0Datav2`);
    url.searchParams.set('CountryName', countryName);
    url.searchParams.set('Operation', operation);
    url.searchParams.set('FromReportingDate', fromDate);
    url.searchParams.set('ToReportingDate', toDate);
    
    if (fromRound !== undefined) {
      url.searchParams.set('FromRoundNumber', fromRound.toString());
    } else {
      url.searchParams.set('FromRoundNumber', '');
    }
    
    if (toRound !== undefined) {
      url.searchParams.set('ToRoundNumber', toRound.toString());
    } else {
      url.searchParams.set('ToRoundNumber', '');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`IOM API error: ${response.status}`);
    }
    
    const data: IOMIdpDataResponse = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(`IOM API error: ${data.errorMessages.join(', ')}`);
    }
    
    return data.result || [];
  } catch (error) {
    console.error(`Failed to fetch IOM IDP data for ${countryName}:`, error);
    return [];
  }
}

/**
 * Fetches IDP data for all countries with available data
 * This is intended to be run periodically (e.g., monthly) to update the cache
 */
export async function fetchAllIOMData(): Promise<Map<string, IOMIdpDataPoint[]>> {
  const countries = await fetchIOMCountryList();
  const dataMap = new Map<string, IOMIdpDataPoint[]>();
  
  console.log(`Fetching IOM IDP data for ${countries.length} countries (all operations)...`);
  
  // Fetch data for each country with a small delay to avoid rate limiting
  for (const country of countries) {
    const data = await fetchIOMIdpData({
      countryName: country.admin0Name,
      operation: '', // Fetch ALL operations, not just Countrywide monitoring
    });
    
    if (data.length > 0 && data[0].admin0Pcode) {
      dataMap.set(data[0].admin0Pcode, data);
      console.log(`Fetched ${data.length} data points for ${country.admin0Name} (${data[0].admin0Pcode})`);
    }
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Successfully fetched IOM data for ${dataMap.size} countries`);
  return dataMap;
}

