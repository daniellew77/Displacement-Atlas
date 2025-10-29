/**
 * ACLED Section for Country Dashboard
 */

import { useState } from 'react';
import type { ACLEDSummary } from '../services/acled.service';

interface Props {
  summary: ACLEDSummary | null;
  loading: boolean;
  error: Error | null;
}

export default function ACLEDSection({ summary, loading, error }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    console.log('ACLEDSection render:', { summary, loading, error });
    
    if (loading) {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#eab308',
            }}>
              Conflict Events (ACLED)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
              <span style={{ fontSize: '11px', color: 'rgba(234, 179, 8, 0.7)' }}>
                Loading...
              </span>
            </div>
          </div>

          {/* Skeleton loading */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                padding: '12px',
              }}>
                <div style={{
                  height: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}></div>
                <div style={{
                  height: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}></div>
              </div>
            ))}
          </div>

          {/* Additional skeleton rows */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              height: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              marginBottom: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}>
                <div style={{
                  height: '12px',
                  width: '60%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}></div>
                <div style={{
                  height: '12px',
                  width: '20%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ fontSize: '13px', color: '#eab308' }}>
            Failed to load conflict data: {error.message}
          </div>
        </div>
      );
    }
  
    if (!summary || summary.totalEvents === 0) {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
            No conflict data available for this period
          </div>
        </div>
      );
    }

  return (
    <div style={{
      background: 'rgba(234, 179, 8, 0.08)',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid rgba(234, 179, 8, 0.2)',
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#eab308"
            strokeWidth={2.5}
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <h3 style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#eab308',
          }}>
            Conflict Events (ACLED)
          </h3>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'rgba(234, 179, 8, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Source: ACLED</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
            Total Events
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
            {summary.totalEvents.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px' }}>
            {summary.eventTypes.size} unique types
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
            Total Fatalities
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#eab308' }}>
            {summary.totalFatalities.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px' }}>
            {summary.totalEvents > 0 ? Math.round(summary.totalFatalities / summary.totalEvents) : 0} avg per event
          </div>
        </div>
      </div>

      {/* Event Types */}
      {isExpanded && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Event Types
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Array.from(summary.eventTypes.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#eab308',
                    }}></div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{type}</span>
                  </div>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{count.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Affected Locations */}
      {isExpanded && summary.topLocations.length > 0 && (
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Most Affected Areas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {summary.topLocations.slice(0, 3).map((loc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{loc.location}</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{loc.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}