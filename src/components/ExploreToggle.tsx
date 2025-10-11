export default function ExploreToggle({ 
  exploreMode, 
  onToggle 
}: { 
  exploreMode: boolean; 
  onToggle: () => void 
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '6px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            onClick={() => exploreMode && onToggle()}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: !exploreMode ? '#00bcd4' : 'transparent',
              color: '#ffffff',
              boxShadow: !exploreMode ? '0 4px 12px rgba(0, 188, 212, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (exploreMode) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              if (exploreMode) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Global View
          </button>
          <button
            onClick={() => !exploreMode && onToggle()}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: exploreMode ? '#00bcd4' : 'transparent',
              color: '#ffffff',
              boxShadow: exploreMode ? '0 4px 12px rgba(0, 188, 212, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!exploreMode) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              if (!exploreMode) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}