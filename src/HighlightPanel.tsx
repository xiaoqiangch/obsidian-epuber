import * as React from 'react';
import { Highlight, HIGHLIGHT_COLORS } from './highlightTypes';

interface HighlightPanelProps {
  highlights: Highlight[];
  onRemoveHighlight: (highlightId: string) => void;
  onUpdateHighlight: (highlightId: string, note: string) => void;
  onNavigateToHighlight: (cfiRange: string) => void;
}

export const HighlightPanel: React.FC<HighlightPanelProps> = ({
  highlights,
  onRemoveHighlight,
  onUpdateHighlight,
  onNavigateToHighlight
}) => {
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [noteText, setNoteText] = React.useState('');

  const handleEditNote = (highlight: Highlight) => {
    setEditingNoteId(highlight.id);
    setNoteText(highlight.note || '');
  };

  const handleSaveNote = (highlightId: string) => {
    if (editingNoteId === highlightId) {
      onUpdateHighlight(highlightId, noteText);
      setEditingNoteId(null);
      setNoteText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (highlights.length === 0) {
    return (
      <div style={{
        padding: '20px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        No highlights yet. Select text to create a highlight.
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '10px'
    }}>
      <h3 style={{ marginTop: 0 }}>Highlights ({highlights.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {highlights.map(highlight => (
          <div
            key={highlight.id}
            style={{
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: 'var(--background-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: highlight.color,
                  marginRight: '8px',
                  border: '1px solid var(--background-modifier-border)'
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatDate(highlight.createdAt)}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onNavigateToHighlight(highlight.cfiRange)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '12px',
                    backgroundColor: 'var(--interactive-accent)',
                    color: 'var(--text-on-accent)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Go to
                </button>
                <button
                  onClick={() => onRemoveHighlight(highlight.id)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '12px',
                    backgroundColor: 'var(--background-modifier-border)',
                    color: 'var(--text-normal)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div style={{
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: 'var(--background-primary)',
              borderRadius: '4px',
              fontStyle: 'italic',
              borderLeft: `3px solid ${highlight.color}`
            }}>
              {highlight.text}
            </div>

            {editingNoteId === highlight.id ? (
              <div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid var(--background-modifier-border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--background-primary)',
                    color: 'var(--text-normal)',
                    resize: 'vertical'
                  }}
                  placeholder="Add a note to this highlight..."
                />
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleSaveNote(highlight.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'var(--interactive-accent)',
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'var(--background-modifier-border)',
                      color: 'var(--text-normal)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '4px' }}>
                  {highlight.note ? (
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'var(--background-primary)',
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {highlight.note}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No note added
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleEditNote(highlight)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '12px',
                    backgroundColor: 'var(--background-modifier-border)',
                    color: 'var(--text-normal)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {highlight.note ? 'Edit Note' : 'Add Note'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};