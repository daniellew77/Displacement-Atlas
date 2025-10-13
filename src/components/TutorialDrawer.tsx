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
              Global Flow View
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              By default, you see the top 100 global displacement routes. Use the year selector to explore data from 2000-2024. Hover over arcs to see displacement numbers between countries and IDP hotspots to see the number of internally displaced persons.
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
              Explore Mode
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              Click the "Explore" button to zoom in and enable country selection. Click any country to see detailed migration statistics and IDP data.
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
              Country Details
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              When viewing a country, toggle between Immigration and Emigration to see people coming to or leaving from that country. View the top 10 origin or destination countries and their displacement numbers.
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
              IDP Visualization
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)',
              marginLeft: '32px'
            }}>
              Red circles show internally displaced persons (IDPs) for countries with available data. Circle size represents the number of displaced people. Hover over circles to see exact counts and data sources.
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

