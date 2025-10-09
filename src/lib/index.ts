export { UNHCRApiService } from '../services/unhcr.service';
export { UNRWAApiService } from '../services/unrwa.service';
export { FlowProcessor } from '../utils/flow-processor';
export { DataAggregator } from '../utils/data-aggregator';
export type { ToGlobeArcsOptions } from '../utils/flow-processor';

export {
  COUNTRY_COORDINATES,
  getCoordinateMap,
  getCoordinate,
  hasCoordinates,
  type CountryCoordinate,
} from '../data/country-coordinates';

export { COUNTRY_COORDINATES as SAMPLE_COORDINATES } from '../data/country-coordinates';

export {
  useGlobalFlows,
  useIncomingFlows,
  useOutgoingFlows,
} from '../hooks/useUNHCRData';

export type {
  UNHCRApiResponse,
  UNHCRPopulationItem,
  MigrationFlow,
  GlobeArc,
  CountryCoordinates,
  CountryAggregate,
} from '../types/unhcr.types';

export type {
  UNRWAApiResponse,
  UNRWARecord,
  UNRWAParsedFlow,
} from '../types/unrwa.types';

export {
  fetchAndProcessGlobalData,
  fetchCountryData,
  runExamples,
} from './example-usage';