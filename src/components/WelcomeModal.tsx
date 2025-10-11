export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="welcome-modal-backdrop" onClick={onClose} />
      
      <div className="welcome-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-content">
          <div className="welcome-modal-header">
            <h2 className="welcome-modal-title">
              Welcome to Global Displacement Atlas!
            </h2>
            <p className="welcome-modal-subtitle">
              Visualize decades of migration patterns from UNHCR's data
            </p>
          </div>

          <div className="welcome-modal-body">
            <div className="welcome-modal-features">
              <div>
                <h3 className="welcome-modal-feature-title">Navigate the Globe</h3>
                <p className="welcome-modal-feature-text">
                  Drag to rotate, scroll to zoom. Hover over migration arcs and dots to see detailed information.
                </p>
              </div>

              <div>
                <h3 className="welcome-modal-feature-title">Compare Time Periods</h3>
                <p className="welcome-modal-feature-text">
                  In Global View (top left), compare migration patterns and IDP data across multiple years to understand how global displacement has evolved.
                </p>
              </div>

              <div>
                <h3 className="welcome-modal-feature-title">Discover Country Details</h3>
                <p className="welcome-modal-feature-text">
                  Toggle Explore Mode to click on countries and view immigration/emigration breakdowns and IDP data.
                </p>
              </div>
            </div>

            <button className="welcome-modal-button" onClick={onClose}>
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </>
  );
}