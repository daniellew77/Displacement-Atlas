type InfoDrawerProps = {
  children: React.ReactNode;
  position: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
  isOpen: boolean;
};

export default function InfoDrawer({ children, position, align = 'center', isOpen }: InfoDrawerProps) {
  const positionClass = position === 'top' ? 'info-drawer-top' : 'info-drawer-bottom';
  const alignClass = position === 'bottom' ? `info-drawer-${align}` : '';

  return (
    <>
      {isOpen && (
        <div 
          className={`info-drawer ${positionClass} ${alignClass} info-drawer-open`}
        >
          <div className="info-drawer-content">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

