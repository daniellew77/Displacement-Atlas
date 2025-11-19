import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { useGlobalFlows } from '../hooks/useUNHCRData';
import { usePolygons } from '../hooks/usePolygons';
import { useIdpPoints } from '../hooks/useIdpPoints';
import { FlowProcessor, getCoordinateMap } from '../lib';
import { 
  polygonCentroid, 
  hexToRgba, 
  getVolumeStyle, 
  createTooltip 
} from '../utils/globe-helpers';
import { createIdpTooltip, getIdpPointColor } from '../utils/idp-points';
import { GLOBE_CONFIG } from '../config/globe.config';
import type { ExtendedArc, GlobeState } from '../types/globe.types';
import type { IdpPoint } from '../utils/idp-points';
import CountryDashboard from './CountryDashboard';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import StatisticsPanel from './StatisticsPanel';
import TerminologyDrawer from './TerminologyDrawer';
import TutorialDrawer from './TutorialDrawer';

const AVAILABLE_YEARS = Array.from({ length: 25 }, (_, i) => 2024 - i);

const BottomBarToggle = ({ 
  isOpen, 
  onClick, 
  label 
}: { 
  isOpen: boolean; 
  onClick: () => void; 
  label: string; 
}) => (
  <button
    onClick={onClick}
    style={{
      height: '48px',
      padding: '0 20px',
      background: isOpen ? 'rgba(0, 188, 212, 0.2)' : 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 600,
      color: '#ffffff',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.background = isOpen ? 'rgba(0, 188, 212, 0.2)' : 'transparent'}
  >
    <svg 
      width="18" 
      height="18" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      strokeWidth={2}
      style={{ 
        transform: isOpen ? 'rotate(90deg)' : 'rotate(-90deg)', 
        transition: 'transform 0.2s' 
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    <span>{label}</span>
  </button>
);

const YearSelector = ({ 
  year, 
  onChange,
  loading 
}: { 
  year: number; 
  onChange: (year: number) => void;
  loading: boolean;
}) => (
  <div className="flex items-center justify-center gap-4">
    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>
      Viewing Year:
    </span>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          padding: '8px 36px 8px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(0, 188, 212, 0.2)',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 188, 212, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(0, 188, 212, 0.2)';
        }}
      >
        {AVAILABLE_YEARS.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontSize: '12px',
        color: '#ffffff'
      }}>
        ▼
      </div>
    </div>
    {loading && (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
        <span style={{ fontSize: '13px', color: '#00bcd4', fontWeight: 600 }}>
          Loading...
        </span>
      </div>
    )}
  </div>
);

export default function DisplacementGlobe() {
  const globeRef = useRef<any>();
  const [year, setYear] = useState<number>(GLOBE_CONFIG.year);
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [terminologyOpen, setTerminologyOpen] = useState(true);
  
  const [state, setState] = useState<GlobeState>({
    selectedCountry: null,
    selectedCountryName: null,
    hoveredArc: null,
    hoveredPoly: null,
    autoRotate: true,
    exploreMode: true, // Always in explore mode now
    polygons: [],
    flowDirection: 'incoming',
  });

  const { flows, loading, error } = useGlobalFlows({ year });
  const coordinates = useMemo(() => getCoordinateMap(), []);
  const polygons = usePolygons();
  const { points: idpPoints } = useIdpPoints(year, polygons);
  const [hasInitialData, setHasInitialData] = useState(false);
  
  useEffect(() => {
    if (!loading && flows.length > 0) {
      setHasInitialData(true);
    }
  }, [loading, flows]);

  useEffect(() => {
    setState(prev => ({ ...prev, polygons }));
  }, [polygons]);

  const arcs = useMemo(() => {
    if (!flows.length || !coordinates.size) return [];
    
    const baseArcs = FlowProcessor.toGlobeArcs(flows, coordinates, {
      ...GLOBE_CONFIG.arcConfig,
      topN: 300,
    });
    return baseArcs.map(arc => {
      const flow = flows.find(
        f => f.originIso === arc.originIso && f.asylumIso === arc.asylumIso
      );
      return {
        ...arc,
        originName: flow?.originName || arc.originIso,
        asylumName: flow?.asylumName || arc.asylumIso,
      } as ExtendedArc;
    });
  }, [flows, coordinates]);

  const incomingOnlyArcs = useMemo(() => {
    if (!state.selectedCountry) return arcs.slice(0, 100);
    return arcs.filter(arc => arc.asylumIso === state.selectedCountry);
  }, [arcs, state.selectedCountry]);
  
  const outgoingOnlyArcs = useMemo(() => {
    if (!state.selectedCountry) return arcs.slice(0, 100);
    return arcs.filter(arc => arc.originIso === state.selectedCountry);
  }, [arcs, state.selectedCountry]);

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;
    globe.pointOfView(GLOBE_CONFIG.initialPOV, 0);

    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = state.autoRotate && !state.selectedCountry;
      controls.autoRotateSpeed = GLOBE_CONFIG.autoRotateSpeed;
    }
  }, [state.autoRotate, state.selectedCountry]);

  const handleGlobeClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCountry: null,
      selectedCountryName: null,
      autoRotate: true,
    }));
  }, []);

  const handleToggleFlowDirection = useCallback(() => {
    setState(prev => ({
      ...prev,
      flowDirection: prev.flowDirection === 'incoming' ? 'outgoing' : 'incoming'
    }));
  }, []);

  // Unified helper to select and focus on a country
  const selectCountry = useCallback((iso3: string, name: string, lat: number, lng: number) => {
    if (iso3 && iso3 !== 'UNK') {
      setState(prev => ({
        ...prev,
        selectedCountry: iso3,
        selectedCountryName: name,
        autoRotate: false,
      }));
      
      const dashboardWidth = 480;
      const visibleWidth = window.innerWidth - dashboardWidth;
      const centerOffset = (window.innerWidth - visibleWidth) / window.innerWidth;
      
      const lngOffset = 35 * centerOffset; // Approximate degrees adjustment
      
      globeRef.current.pointOfView({ lat, lng: lng + lngOffset, altitude: 0.8 }, 1000);
    }
  }, []);

  const handlePolygonClick = useCallback((f: any) => {
    const iso3 = f?.properties?.__iso3 || '';
    const name = f?.properties?.__name || iso3;
    
    try {
      const [lat, lng] = polygonCentroid(f);
      selectCountry(iso3, name, lat, lng);
    } catch {
      // Failed to center on country
    }
  }, [selectCountry]);

  const handlePolygonHover = useCallback((f: any) => {
    setState(prev => ({ ...prev, hoveredPoly: f || null }));
    document.body.style.cursor = f ? 'pointer' : 'default';
  }, []);

  const handleIdpPointClick = useCallback((point: any) => {
    const idpPoint = point as IdpPoint;
    if (idpPoint?.iso3) {
      selectCountry(idpPoint.iso3, idpPoint.countryName, idpPoint.lat, idpPoint.lng);
    }
  }, [selectCountry]);

  const getArcColor = useCallback((d: any) => {
    const arc = d as ExtendedArc;
    const { opacity } = getVolumeStyle(arc.volume);
    return hexToRgba(GLOBE_CONFIG.colors.base, opacity);
  }, []);

  const getArcStroke = useCallback((d: any) => {
    const arc = d as ExtendedArc;
    return getVolumeStyle(arc.volume).stroke;
  }, []);

  const getArcLabel = useCallback((d: any) => {
    const arc = d as ExtendedArc;
    return createTooltip(`
      <div style="font-weight: bold; margin-bottom: 4px;">${arc.originName} → ${arc.asylumName}</div>
      <div style="color: #ffa726;">${arc.volume.toLocaleString()} displaced</div>
    `);
  }, []);

  const getPolygonLabel = useCallback((f: any) => {
    const name = f?.properties?.__name ?? 'Unknown';
    return createTooltip(`
      <div style="font-weight: bold; margin-bottom: 4px;">${name}</div>
    `);
  }, []);

  const getIdpPointRadius = useCallback((point: any) => (point as IdpPoint).size, []);
  const getIdpPointColorCallback = useCallback((point: any) => getIdpPointColor((point as IdpPoint).idpCount), []);
  const getIdpPointLabel = useCallback((point: any) => createIdpTooltip(point as IdpPoint), []);

  if (loading && !hasInitialData) return <LoadingScreen />;
  if (error && !hasInitialData) return <ErrorScreen error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Globe
          ref={globeRef}
          width={window.innerWidth}
          height={window.innerHeight}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          arcsData={state.flowDirection === 'incoming' ? incomingOnlyArcs : outgoingOnlyArcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={getArcColor}
          arcStroke={getArcStroke}
          arcLabel={getArcLabel}
          arcDashLength={0.1}
          arcDashGap={0.01}
          arcDashAnimateTime={10000}
          arcsTransitionDuration={600}
          onArcHover={(arc: any) => setState(prev => ({ ...prev, hoveredArc: arc as ExtendedArc | null }))}
          
          atmosphereColor={GLOBE_CONFIG.colors.atmosphere}
          atmosphereAltitude={0.2}
          enablePointerInteraction={true}
          onGlobeClick={handleGlobeClick}
          
          polygonsData={state.polygons}
          polygonCapColor={(f: any) => (f === state.hoveredPoly ? 'rgba(0, 188, 212, 0.4)' : 'rgba(255,255,255,0.02)')}
          polygonSideColor={() => 'rgba(0,0,0,0)'}
          polygonStrokeColor={(f: any) => (f === state.hoveredPoly ? 'rgba(0, 188, 212, 0.9)' : 'rgba(255,255,255,0.35)')}
          polygonAltitude={(f: any) => (f === state.hoveredPoly ? 0.005 : 0.001)}
          polygonLabel={getPolygonLabel}
          onPolygonHover={handlePolygonHover}
          onPolygonClick={handlePolygonClick}
          
          pointsData={idpPoints}
          pointLat="lat"
          pointLng="lng"
          pointRadius={getIdpPointRadius}
          pointColor={getIdpPointColorCallback}
          pointLabel={getIdpPointLabel}
          pointAltitude={0.01}
          pointResolution={12}
          onPointClick={handleIdpPointClick}
        />
      </div>

      <div className="absolute top-6 left-1/2 pointer-events-none" style={{ width: '600px', maxWidth: '90vw', transform: 'translateX(-50%)' }}>
        <div 
          className="pointer-events-auto white-text"
          style={{
            background: 'transparent',
            padding: '12px 24px'
          }}
        >
          <h1 
            className="text-xl font-bold drop-shadow-lg text-center"
            style={{
              opacity: state.selectedCountry ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            Global Displacement Atlas
          </h1>
        </div>
      </div>
      
      <div className="absolute top-6 left-6 pointer-events-none" style={{ maxWidth: '300px' }}>
        <div className="pointer-events-auto">
          <StatisticsPanel hoveredArc={state.hoveredArc} />
        </div>
      </div>

      {state.selectedCountry && (
        <CountryDashboard
          iso3={state.selectedCountry}
          year={year}
          direction={state.flowDirection}
          asylumName={state.selectedCountryName || undefined}
          onClose={() => setState(prev => ({ ...prev, selectedCountry: null, selectedCountryName: null, autoRotate: true }))}
          onToggleDirection={handleToggleFlowDirection}
          onYearChange={(y) => setYear(y)}
        />
      )}

      {/* Full-width bottom bar with year selector and toggles */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
        zIndex: 900,
        pointerEvents: state.selectedCountry ? 'none' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        borderTop: '1px solid rgba(0, 188, 212, 0.2)',
        opacity: state.selectedCountry ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <BottomBarToggle 
          isOpen={tutorialOpen} 
          onClick={() => setTutorialOpen(!tutorialOpen)} 
          label="How to Use This Tool" 
        />
        
        <YearSelector year={year} onChange={setYear} loading={loading && hasInitialData} />
        
        <BottomBarToggle 
          isOpen={terminologyOpen} 
          onClick={() => setTerminologyOpen(!terminologyOpen)} 
          label="Understanding the Terms" 
        />
      </div>

      <TerminologyDrawer isOpen={terminologyOpen} />
      <TutorialDrawer isOpen={tutorialOpen} />
    </div>
  );
}
