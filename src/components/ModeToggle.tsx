/**
 * Mode Toggle Component
 * Switches between Migration and Conflict visualization modes
 */

export type ViewMode = 'migration' | 'conflict';

interface ModeToggleProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }}>
            <span style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
            }}>
                Mode:
            </span>
            <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <button
                    onClick={() => onChange('migration')}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        background: mode === 'migration'
                            ? 'linear-gradient(135deg, rgba(0, 188, 212, 0.3) 0%, rgba(0, 188, 212, 0.15) 100%)'
                            : 'transparent',
                        color: mode === 'migration' ? '#00bcd4' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: mode === 'migration'
                            ? '0 0 12px rgba(0, 188, 212, 0.3), inset 0 0 8px rgba(0, 188, 212, 0.1)'
                            : 'none',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Migration
                </button>

                <button
                    onClick={() => onChange('conflict')}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        background: mode === 'conflict'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.15) 100%)'
                            : 'transparent',
                        color: mode === 'conflict' ? '#ef4444' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: mode === 'conflict'
                            ? '0 0 12px rgba(239, 68, 68, 0.3), inset 0 0 8px rgba(239, 68, 68, 0.1)'
                            : 'none',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Conflict
                </button>
            </div>
        </div>
    );
}
