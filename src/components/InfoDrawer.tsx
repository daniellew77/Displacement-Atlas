import { useState } from 'react';

type InfoDrawerProps = {
  title: string;
  children: React.ReactNode;
  position: 'top' | 'bottom';
};

export default function InfoDrawer({ title, children, position }: InfoDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`info-drawer ${position === 'top' ? 'info-drawer-top' : 'info-drawer-bottom'} ${isOpen ? 'info-drawer-open' : ''}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="info-drawer-toggle"
        aria-label={isOpen ? 'Close' : 'Open'}
      >
        <svg 
          width="16" 
          height="16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="info-drawer-content">
          {children}
        </div>
      )}
    </div>
  );
}

