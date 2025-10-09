import type { MigrationFlow } from '../types/unhcr.types';
import type { UNRWAParsedFlow } from '../types/unrwa.types';

export class DataAggregator {
  static mergeUNHCRAndUNRWA(
    unhcrFlows: MigrationFlow[],
    unrwaFlows: UNRWAParsedFlow[]
  ): MigrationFlow[] {
    const flowMap = new Map<string, MigrationFlow>();

    unhcrFlows.forEach(flow => {
      const key = `${flow.originIso}_${flow.asylumIso}`;
      flowMap.set(key, { ...flow });
    });

    unrwaFlows.forEach(unrwaFlow => {
      const key = `${unrwaFlow.originIso}_${unrwaFlow.asylumIso}`;
      
      if (flowMap.has(key)) {
        const existing = flowMap.get(key)!;
        flowMap.set(key, {
          ...existing,
          refugees: existing.refugees + unrwaFlow.refugees,
          totalDisplaced: existing.totalDisplaced + unrwaFlow.refugees
        });
      } else {
        flowMap.set(key, {
          originIso: unrwaFlow.originIso,
          originName: unrwaFlow.originName,
          asylumIso: unrwaFlow.asylumIso,
          asylumName: unrwaFlow.asylumName,
          refugees: unrwaFlow.refugees,
          asylumSeekers: 0,
          totalDisplaced: unrwaFlow.refugees,
          year: unrwaFlow.year
        });
      }
    });

    return Array.from(flowMap.values());
  }

  static shouldFetchUNRWA(flows: MigrationFlow[], countryIso?: string | null): boolean {
    if (countryIso === 'PSE') {
      return true;
    }

    const unrwaHostCountries = ['JOR', 'LBN', 'SYR', 'PSE', 'EGY'];
    
    if (countryIso && unrwaHostCountries.includes(countryIso)) {
      return true;
    }

    return flows.some(flow => 
      flow.originIso === 'PSE' || 
      (flow.asylumIso === 'PSE' && unrwaHostCountries.includes(flow.originIso))
    );
  }

  static filterPalestineFlows(flows: MigrationFlow[]): MigrationFlow[] {
    return flows.filter(flow => 
      flow.originIso === 'PSE' || flow.asylumIso === 'PSE'
    );
  }
}

