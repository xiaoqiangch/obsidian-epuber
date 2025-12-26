import * as React from 'react';
import { HIGHLIGHT_COLORS } from './highlightTypes';

interface HighlightToolbarProps {
  onHighlight: () => void;
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
        top: '10px',
        right: '10px',
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onHighlight}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: HIGHLIGHT_COLORS.YELLOW,
            border: '2px solid var(--background-modifier-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
          title="Highlight selected text (Yellow)"
        >
          ✏️
        </button>
        
        <button
          onClick={onToggleContinuousMode}
          style={{
            padding: '6px 12px',
            backgroundColor: isContinuousMode ? 'var(--interactive-accent)' : 'var(--background-modifier-border)',
            color: isContinuousMode ? 'var(--text-on-accent)' : 'var(--text-normal)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}
          title={isContinuousMode ? "Continuous highlighting mode is ON" : "Continuous highlighting mode is OFF"}
        >
          {isContinuousMode ? 'Continuous ON' : 'Continuous OFF'}
        </button>
        
        <button
          onClick={onClose}
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--background-modifier-border)',
            color: 'var(--text-normal)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Close highlight toolbar"
        >
          Close
        </button>
      </div>
      
      <div style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: '200px'
      }}>
        {isContinuousMode 
          ? 'Continuous mode: Select text to automatically highlight' 
          : 'Single mode: Click highlight button after selecting text'}
      </div>
    </div>
  );
};