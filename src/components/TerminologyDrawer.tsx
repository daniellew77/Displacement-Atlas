import InfoDrawer from './InfoDrawer';

export default function TerminologyDrawer() {
  return (
    <InfoDrawer title="Understanding the Terms" position="bottom">
      <div style={{ padding: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#00bcd4'
        }}>
          Key Definitions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff'
            }}>
              Refugees
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              People who have crossed international borders fleeing persecution, war, or violence. They have been granted official refugee status and international protection.
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff'
            }}>
              Asylum Seekers
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              People who have fled their country and formally requested protection in another country, but whose claim has not yet been processed or approved. They are awaiting a decision on their refugee status.
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#ffffff'
            }}>
              Internally Displaced Persons (IDPs)
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              People forced to flee their homes due to conflict, violence, or disasters, but who remain within their country's borders. Unlike refugees, they have not crossed an international boundary. Shown as red circles on the globe.
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0, 188, 212, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
            <strong>Data Sources:</strong> UNHCR (refugees & asylum seekers), UNRWA (Palestine refugees), IOM DTM (internal displacement)
          </div>
        </div>
      </div>
    </InfoDrawer>
  );
}

