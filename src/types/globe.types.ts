import type { GlobeArc } from './unhcr.types';

export interface ExtendedArc extends GlobeArc {
  originName: string;
  asylumName: string;
}

export interface GlobeState {
  selectedCountry: string | null;
  selectedCountryName: string | null;
  hoveredArc: ExtendedArc | null;
  hoveredPoly: any | null;
  autoRotate: boolean;
  exploreMode: boolean;
  polygons: any[];
  flowDirection: 'incoming' | 'outgoing';
}