import InfoDrawer from './InfoDrawer';

export default function TutorialDrawer() {
  return (
    <InfoDrawer title="How to Use This Tool" position="top">
      <div style={{ padding: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#00bcd4'
        }}>
          Quick Start Guide
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                background: '#00bcd4', 
                color: '#000', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>1</span>
              Select a Year
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              Use the year selector to explore displacement data from 2000-2024. The globe automatically updates to show migration flows and IDP data for your selected year.
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                background: '#00bcd4', 
                color: '#000', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>2</span>
              Click Any Country
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              Click any country to see detailed migration statistics including asylum seekers, refugees, internally displaced persons (IDPs), and conflict events. The globe automatically centers on your selected country.
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                background: '#00bcd4', 
                color: '#000', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>3</span>
              Immigration vs Emigration
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              In the country dashboard, toggle between Immigration and Emigration to see people coming to or leaving from that country. View the top 10 origin or destination countries with their displacement numbers.
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                background: '#00bcd4', 
                color: '#000', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>4</span>
              IDP & Conflict Data
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              Red circles show internally displaced persons (IDPs) for countries with available data. Hover over circles to see exact counts. Click the Conflict Events (ACLED) dropdown in country dashboards to see detailed conflict statistics and affected areas.
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255, 165, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 165, 0, 0.2)'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
            <strong>💡 Tip:</strong> Click anywhere on the ocean to deselect a country and return to the global view.
          </div>
        </div>
      </div>
    </InfoDrawer>
  );
}

