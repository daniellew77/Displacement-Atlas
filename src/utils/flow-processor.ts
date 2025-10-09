import type {
  MigrationFlow,
  GlobeArc,
  CountryCoordinates,
  CountryAggregate,
} from '../types/unhcr.types';

export interface ToGlobeArcsOptions {
  minVolume?: number;
  topN?: number;
  colorScale?: (volume: number) => string;
}

export class FlowProcessor {
  static toGlobeArcs(
    flows: MigrationFlow[],
    coordinates: Map<string, CountryCoordinates>,
    options: ToGlobeArcsOptions = {}
  ): GlobeArc[] {
    const { 
      minVolume = 100, 
      topN = 500,
      colorScale = this.defaultColorScale 
    } = options;

    const significantFlows = flows
      .filter(f => f.totalDisplaced >= minVolume)
      .sort((a, b) => b.totalDisplaced - a.totalDisplaced)
      .slice(0, topN);

    return significantFlows
      .map(flow => {
        const origin = coordinates.get(flow.originIso);
        const asylum = coordinates.get(flow.asylumIso);

        if (!origin || !asylum) {
          return null;
        }

        return {
          startLat: origin.lat,
          startLng: origin.lng,
          endLat: asylum.lat,
          endLng: asylum.lng,
          color: colorScale(flow.totalDisplaced),
          strokeWidth: this.calculateStrokeWidth(flow.totalDisplaced),
          volume: flow.totalDisplaced,
          originIso: flow.originIso,
          asylumIso: flow.asylumIso,
        };
      })
      .filter((arc): arc is GlobeArc => arc !== null);
  }

  static aggregateByCountry(
    flows: MigrationFlow[],
    groupBy: 'origin' | 'asylum'
  ): Map<string, CountryAggregate> {
    const aggregated = new Map<string, CountryAggregate>();

    flows.forEach(flow => {
      const key = groupBy === 'origin' ? flow.originIso : flow.asylumIso;
      const name = groupBy === 'origin' ? flow.originName : flow.asylumName;

      if (!aggregated.has(key)) {
        aggregated.set(key, { iso: key, name, total: 0, count: 0 });
      }

      const entry = aggregated.get(key)!;
      entry.total += flow.totalDisplaced;
      entry.count += 1;
    });

    return aggregated;
  }

  private static calculateStrokeWidth(volume: number): number {
    const minWidth = 0.5;
    const maxWidth = 4;
    const minVolume = 100;
    const maxVolume = 1000000;

    const logVolume = Math.log10(Math.max(volume, minVolume));
    const logMin = Math.log10(minVolume);
    const logMax = Math.log10(maxVolume);
    
    const normalized = (logVolume - logMin) / (logMax - logMin);
    return minWidth + normalized * (maxWidth - minWidth);
  }

  private static defaultColorScale(volume: number): string {
    if (volume > 1000000) return '#00bcd4';
    if (volume > 500000) return '#2196f3';
    if (volume > 200000) return '#3f51b5';
    if (volume > 100000) return '#673ab7';
    if (volume > 50000) return '#9c27b0';
    return '#e91e63';
  }

  static filterByVolume(
    flows: MigrationFlow[],
    minVolume: number
  ): MigrationFlow[] {
    return flows.filter(f => f.totalDisplaced >= minVolume);
  }

  static getTopFlows(
    flows: MigrationFlow[],
    n: number
  ): MigrationFlow[] {
    return [...flows]
      .sort((a, b) => b.totalDisplaced - a.totalDisplaced)
      .slice(0, n);
  }

  static groupByYear(
    flows: MigrationFlow[]
  ): Map<number, MigrationFlow[]> {
    const grouped = new Map<number, MigrationFlow[]>();
    
    flows.forEach(flow => {
      if (!grouped.has(flow.year)) {
        grouped.set(flow.year, []);
      }
      grouped.get(flow.year)!.push(flow);
    });
    
    return grouped;
  }
}