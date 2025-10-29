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

export default function DisplacementGlobe() {
  const globeRef = useRef<any>();
  const [year, setYear] = useState<number>(GLOBE_CONFIG.year);
  
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

  const handlePolygonClick = useCallback((f: any) => {
    const iso3 = f?.properties?.__iso3 || '';
    const name = f?.properties?.__name || iso3;
    if (iso3 && iso3 !== 'UNK') {
      setState(prev => ({
        ...prev,
        selectedCountry: iso3,
        selectedCountryName: name,
        autoRotate: false,
      }));
      
      try {
        const [lat, lng] = polygonCentroid(f);
        globeRef.current.pointOfView({ lat, lng, altitude: 0.8 }, 1000);
      } catch {
        // Failed to center on country
      }
    }
  }, []);

  const handlePolygonHover = useCallback((f: any) => {
    setState(prev => ({ ...prev, hoveredPoly: f || null }));
    document.body.style.cursor = f ? 'pointer' : 'default';
  }, []);

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
        />
      </div>

      <div className="absolute top-6 left-6 pointer-events-none" style={{ width: '360px', maxWidth: '90vw' }}>
        <div className="pointer-events-auto bg-black/95 backdrop-blur-md rounded-lg p-6 shadow-2xl border-2 border-cyan-500/40 white-text">
          <h1 className="text-3xl font-bold mb-2 drop-shadow-lg text-center">
            Global Displacement Atlas
          </h1>
          
          {loading && hasInitialData && (
            <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                <span className="text-sm font-medium text-cyan-400">
                  Loading {year} data...
                </span>
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(0, 188, 212, 0.1)',
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: 'rgba(255, 255, 255, 0.7)', 
              textAlign: 'center',
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              Click any country to explore detailed migration data
            </p>
            <div className="flex items-center justify-center gap-2">
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Viewing Year:</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid rgba(0, 188, 212, 0.3)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#000000',
                  cursor: 'pointer',
                }}
              >
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

      <TerminologyDrawer />
      <TutorialDrawer />
    </div>
  );
}
