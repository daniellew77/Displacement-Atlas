import type { ExtendedArc } from '../types/globe.types';

export default function StatisticsPanel({ 
  hoveredArc 
}: { 
  hoveredArc: ExtendedArc | null; 
}) {
  if (!hoveredArc) return null;
  
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(0, 188, 212, 0.2)',
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#00bcd4',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Active Route
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            From: <span style={{ fontWeight: 600, color: '#ffffff' }}>{hoveredArc.originName}</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            To: <span style={{ fontWeight: 600, color: '#ffffff' }}>{hoveredArc.asylumName}</span>
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#00bcd4',
            marginTop: '8px',
          }}>
            {hoveredArc.volume.toLocaleString()}
            <span style={{ fontSize: '13px', fontWeight: 500, marginLeft: '6px', color: 'rgba(255, 255, 255, 0.6)' }}>
              displaced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}