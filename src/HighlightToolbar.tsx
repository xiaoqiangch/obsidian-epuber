import * as React from 'react';
import { HIGHLIGHT_COLORS } from './highlightTypes';

interface HighlightToolbarProps {
  onHighlight: (color: string) => void;
  onClose: () => void;
  isContinuousMode: boolean;
  onToggleContinuousMode: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  onHighlight,
  onClose,
  isContinuousMode,
  onToggleContinuousMode
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50px',
        right: '20px',
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '180px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Highlight</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
          <button
            key={name}
            onClick={() => onHighlight(color)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: color,
              border: '2px solid var(--background-modifier-border)',
              cursor: 'pointer',
              padding: 0
            }}
            title={name}
          />
        ))}
      </div>
      
      <div style={{ borderTop: '1px solid var(--background-modifier-border)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={onToggleContinuousMode}
          style={{
            width: '100%',
            padding: '4px 8px',
            backgroundColor: isContinuousMode ? 'var(--interactive-accent)' : 'var(--background-modifier-border)',
            color: isContinuousMode ? 'var(--text-on-accent)' : 'var(--text-normal)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          {isContinuousMode ? 'Continuous: ON' : 'Continuous: OFF'}
        </button>
      </div>
    </div>
  );
};