import { useMemo, useState } from 'react';
import { useIncomingFlows, useOutgoingFlows } from '../hooks/useUNHCRData';
import { loadIOMCache } from '../utils/iom-processor';
import { useACLED } from '../hooks/useACLED';
import ACLEDSection from './ACLEDSection';


type Props = {
  iso3: string;
  year: number;
  onClose: () => void;
  asylumName?: string;
  direction: 'incoming' | 'outgoing';
  onToggleDirection: () => void;
  onYearChange?: (year: number) => void;
};

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-title">
        {title}
      </div>
      <div className="dashboard-stat-value">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function CountryDashboard({ iso3, year: initialYear, onClose, asylumName, direction, onToggleDirection, onYearChange }: Props) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };
  
  const incomingData = useIncomingFlows(iso3, selectedYear);
  const outgoingData = useOutgoingFlows(iso3, selectedYear);
  const { flows, loading, error } = direction === 'incoming' ? incomingData : outgoingData;

  const acledData = useACLED(iso3, selectedYear);

  // Load IDP data for this country and year
  const idpData = useMemo(() => {
    const cache = loadIOMCache();
    if (!cache) return null;
    
    const countryData = cache.idpData.get(iso3);
    if (!countryData) return null;
    
    const yearData = countryData.yearlyData.find(yd => yd.year === selectedYear);
    return yearData || null;
  }, [iso3, selectedYear]);

  const {
    totalAsylumSeekers,
    totalRefugees,
    groupedSorted,
    listLabel,
    emptyText
  } = useMemo(() => {
    const keyOf = (f: any) => (direction === 'incoming' ? f.originIso : f.asylumIso);
    const nameOf = (f: any) => (direction === 'incoming' ? f.originName : f.asylumName);

    const agg = new Map<string, { iso3: string; name: string; asylumSeekers: number; refugees: number; total: number }>();

    for (const f of flows) {
      const key = keyOf(f);
      if (!key) continue;
      if (!agg.has(key)) {
        agg.set(key, { iso3: key, name: nameOf(f), asylumSeekers: 0, refugees: 0, total: 0 });
      }
      const cur = agg.get(key)!;
      cur.asylumSeekers += f.asylumSeekers;
      cur.refugees += f.refugees;
      cur.total += f.asylumSeekers + f.refugees;
    }

    const arr = [...agg.values()].sort((a, b) => b.total - a.total);
    const totalAS = arr.reduce((s, d) => s + d.asylumSeekers, 0);
    const totalRef = arr.reduce((s, d) => s + d.refugees, 0);

    return {
      totalAsylumSeekers: totalAS,
      totalRefugees: totalRef,
      groupedSorted: arr,
      listLabel: direction === 'incoming' ? 'Top Origins' : 'Top Destinations',
      emptyText: direction === 'incoming' ? `No incoming records for ${selectedYear}.` : `No outgoing records for ${selectedYear}.`
    };
  }, [flows, direction, selectedYear]);

  return (
    <>
      <div className="dashboard-drawer">
        <div className="dashboard-header">
          <div className="dashboard-header-top">
            <div>
              <h2 className="dashboard-title">
                {asylumName ?? iso3}
              </h2>
              <div className="dashboard-meta">
                <p className="dashboard-meta-text">
                  {direction === 'incoming' ? 'Immigration Data' : 'Emigration Data'}
                </p>
                <span className="dashboard-meta-separator">•</span>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="dashboard-year-select"
                >
                  {AVAILABLE_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="dashboard-close-button"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="dashboard-toggle-container">
            <button
              onClick={() => direction === 'outgoing' && onToggleDirection()}
              className={`dashboard-toggle-button ${direction === 'incoming' ? 'dashboard-toggle-button-active' : 'dashboard-toggle-button-inactive'}`}
            >
              Immigration
            </button>
            <button
              onClick={() => direction === 'incoming' && onToggleDirection()}
              className={`dashboard-toggle-button ${direction === 'outgoing' ? 'dashboard-toggle-button-active' : 'dashboard-toggle-button-inactive'}`}
            >
              Emigration
            </button>
          </div>
        </div>

        <div className="dashboard-body">
          {loading && (
            <div className="dashboard-loading">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          )}
          
          {error && (
            <div className="dashboard-error">
              Failed to load data: {String(error.message || error)}
            </div>
          )}
          
          {!loading && !error && groupedSorted.length === 0 && (
            <div className="dashboard-empty">
              {emptyText}
            </div>
          )}

          {!loading && !error && groupedSorted.length > 0 && (
            <div className="dashboard-content">
              <div className="dashboard-stats-grid">
                <Stat
                  title={direction === 'incoming' ? 'Asylum Seekers' : 'Seekers Abroad'}
                  value={totalAsylumSeekers}
                />
                <Stat
                  title={direction === 'incoming' ? 'Refugees' : 'Refugees Abroad'}
                  value={totalRefugees}
                />
                {idpData && (
                  <div className="dashboard-stat-card-full">
                    <div className="dashboard-stat-title">
                      Internally Displaced
                    </div>
                    <div className="dashboard-stat-value">
                      {idpData.totalIdps.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              
              {idpData && (
                <div className="dashboard-data-note" style={{ marginTop: '12px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>IDP data from IOM DTM: {idpData.operation}</span>
                </div>
              )}

              <ACLEDSection 
                summary={acledData.summary}
                loading={acledData.loading}
                error={acledData.error}
              />

              {iso3 === 'PSE' && (
                <div className="dashboard-data-note">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Data aggregated from UNHCR and UNRWA sources</span>
                </div>
              )}

              <div>
                <h3 className="dashboard-table-title">
                  {listLabel}
                </h3>
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>#</th>
                        <th style={{ textAlign: 'left' }}>Country</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedSorted.slice(0, 10).map((d, index) => (
                        <tr key={d.iso3}>
                          <td className="dashboard-table-index">
                            {index + 1}
                          </td>
                          <td className="dashboard-table-country">
                            {d.name}
                          </td>
                          <td className="dashboard-table-total">
                            {d.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
