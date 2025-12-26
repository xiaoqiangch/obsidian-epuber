import * as React from "react";
import { useEffect, useRef, useState, useCallback } from 'react';
import { WorkspaceLeaf, Plugin } from 'obsidian';
import { ReactReader, ReactReaderStyle, type IReactReaderStyle } from 'react-reader';
import type { Contents, Rendition } from 'epubjs';
import useLocalStorageState from 'use-local-storage-state';
import { HighlightToolbar } from './HighlightToolbar';
import { HighlightPanel } from './HighlightPanel';
import { HighlightManager } from './highlightManager';
import { Highlight, HIGHLIGHT_COLORS } from './highlightTypes';
import { EpubPluginSettings } from './EpubPluginSettings';

export const EpubReader = ({
  contents,
  title,
  scrolled,
  tocOffset,
  tocBottomOffset,
  leaf,
  settings,
  filePath,
  plugin
}: {
  contents: ArrayBuffer;
  title: string;
  scrolled: boolean;
  tocOffset: number;
  tocBottomOffset: number;
  leaf: WorkspaceLeaf;
  settings: EpubPluginSettings;
  filePath: string;
  plugin: Plugin;
}) => {
  const [location, setLocation] = useLocalStorageState<string | number>(`epub-${title}`, { defaultValue: 0 });
  const renditionRef = useRef<Rendition | null>(null);
  const [fontSize, setFontSize] = useState(100);
  const [selectedText, setSelectedText] = useState<{ cfiRange: string; text: string } | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlightPanel, setShowHighlightPanel] = useState(false);
  const [isContinuousHighlightMode, setIsContinuousHighlightMode] = useState(false);
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  const highlightManagerRef = useRef<HighlightManager | null>(null);

  const isDarkMode = document.body.classList.contains('theme-dark');

  // Initialize highlight manager
  useEffect(() => {
    highlightManagerRef.current = new HighlightManager(plugin);
    highlightManagerRef.current.load().then(() => {
      const loadedHighlights = highlightManagerRef.current?.getHighlightsForEpub(filePath) || [];
      setHighlights(loadedHighlights);
    });
  }, [filePath, plugin]);

  const locationChanged = useCallback((epubcifi: string | number) => {
    setLocation(epubcifi);
  }, [setLocation]);

  const updateTheme = useCallback((rendition: Rendition, theme: 'light' | 'dark') => {
    const themes = rendition.themes;
    themes.override('color', theme === 'dark' ? '#fff' : '#000');
    themes.override('background', theme === 'dark' ? '#000' : '#fff');
  }, []);

  const updateFontSize = useCallback((size: number) => {
    renditionRef.current?.themes.fontSize(`${size}%`);
  }, []);

  const applyHighlights = useCallback((rendition: Rendition) => {
    highlights.forEach(highlight => {
      try {
        rendition.annotations.add('highlight', highlight.cfiRange, {}, () => {}, 'hl', {
          fill: highlight.color,
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply'
        });
      } catch (error) {
        console.error('Failed to apply highlight:', error);
      }
    });
  }, [highlights]);

  const handleTextSelected = useCallback((cfiRange: string, contents: Contents) => {
    const selection = contents.window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text) return;

    setSelectedText({
      cfiRange,
      text
    });

    // Show toolbar when text is selected
    setShowHighlightToolbar(true);

    // Auto-highlight in continuous mode
    if (isContinuousHighlightMode && highlightManagerRef.current) {
      const newHighlight = highlightManagerRef.current.addHighlight(filePath, {
        cfiRange,
        text,
        color: HIGHLIGHT_COLORS.YELLOW,
        note: ''
      });

      setHighlights(prev => [...prev, newHighlight]);

      // Apply highlight to rendition
      if (renditionRef.current) {
        renditionRef.current.annotations.add('highlight', cfiRange, {}, () => {}, 'hl', {
          fill: HIGHLIGHT_COLORS.YELLOW,
          'fill-opacity': '0.3',
          'mix-blend-mode': 'multiply'
        });
      }
    }
  }, [isContinuousHighlightMode, filePath]);

  const handleHighlight = useCallback((color: string) => {
    if (!selectedText || !highlightManagerRef.current) return;

    const newHighlight = highlightManagerRef.current.addHighlight(filePath, {
      cfiRange: selectedText.cfiRange,
      text: selectedText.text,
      color: color,
      note: ''
    });

    setHighlights(prev => [...prev, newHighlight]);

    // Apply highlight to rendition
    if (renditionRef.current) {
      renditionRef.current.annotations.add('highlight', selectedText.cfiRange, {}, () => {}, 'hl', {
        fill: color,
        'fill-opacity': '0.3',
        'mix-blend-mode': 'multiply'
      });
    }

    // Clear selection
    setSelectedText(null);
    
    // Keep toolbar open in continuous mode
    if (!isContinuousHighlightMode) {
      setShowHighlightToolbar(false);
    }
  }, [selectedText, filePath, isContinuousHighlightMode]);

  const handleUpdateHighlight = useCallback((highlightId: string, note: string) => {
    if (!highlightManagerRef.current) return;

    const updatedHighlight = highlightManagerRef.current.updateHighlight(filePath, highlightId, { note });
    if (updatedHighlight) {
      setHighlights(prev => prev.map(h => h.id === highlightId ? updatedHighlight : h));
    }
  }, [filePath]);

  const handleRemoveHighlight = useCallback((highlightId: string) => {
    if (!highlightManagerRef.current) return;

    const highlightToRemove = highlights.find(h => h.id === highlightId);
    highlightManagerRef.current.deleteHighlight(filePath, highlightId);
    setHighlights(prev => prev.filter(h => h.id !== highlightId));

    if (renditionRef.current && highlightToRemove) {
      try {
        renditionRef.current.annotations.remove(highlightToRemove.cfiRange, 'highlight');
      } catch (error) {
        console.error('Failed to remove highlight from rendition:', error);
      }
    }
  }, [filePath, highlights]);

  const handleToggleContinuousMode = useCallback(() => {
    setIsContinuousHighlightMode(prev => !prev);
  }, []);

  const handleCloseToolbar = useCallback(() => {
    setShowHighlightToolbar(false);
    setSelectedText(null);
  }, []);

  const handleNavigateToHighlight = useCallback((cfiRange: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(cfiRange);
      setLocation(cfiRange);
    }
  }, [setLocation]);

  useEffect(() => {
    updateFontSize(fontSize);
  }, [fontSize, updateFontSize]);

  useEffect(() => {
    if (renditionRef.current) {
      applyHighlights(renditionRef.current);
    }
  }, [highlights, applyHighlights]);

  useEffect(() => {
    const handleResize = () => {
      const epubContainer = leaf.view.containerEl.querySelector('div.epub-container');
      if (!epubContainer) return;

      const viewContentStyle = getComputedStyle(epubContainer.parentElement!);
      renditionRef.current?.resize(
        parseFloat(viewContentStyle.width),
        parseFloat(viewContentStyle.height)
      );
    };

    leaf.view.app.workspace.on('resize', handleResize);
    return () => leaf.view.app.workspace.off('resize', handleResize);
  }, [leaf]);

  const readerStyles = isDarkMode ? darkReaderTheme : lightReaderTheme;

  return (
    <div style={{ height: "100vh", position: 'relative', display: 'flex' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="fontSizeSlider" style={{ whiteSpace: 'nowrap' }}>Font Size: </label>
          <input
            id="fontSizeSlider"
            type="range"
            min="80"
            max="160"
            value={fontSize}
            onChange={e => setFontSize(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setShowHighlightPanel(!showHighlightPanel)}
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              backgroundColor: showHighlightPanel ? 'var(--interactive-accent)' : 'var(--background-modifier-border)',
              color: showHighlightPanel ? 'var(--text-on-accent)' : 'var(--text-normal)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              position: 'relative'
            }}
            title={showHighlightPanel ? "Hide highlights panel" : `Show highlights (${highlights.length})`}
          >
            📖
            {highlights.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'var(--interactive-accent)',
                color: 'var(--text-on-accent)',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {highlights.length}
              </span>
            )}
          </button>
        </div>
        
        {showHighlightToolbar && (
          <HighlightToolbar
            onHighlight={handleHighlight}
            onClose={handleCloseToolbar}
            isContinuousMode={isContinuousHighlightMode}
            onToggleContinuousMode={handleToggleContinuousMode}
          />
        )}

        <div
          style={{ flex: 1, position: 'relative' }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              renditionRef.current?.next();
              e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
              renditionRef.current?.prev();
              e.preventDefault();
            }
            // 阻止键盘事件冒泡，避免影响其他编辑器
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onKeyUp={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onKeyPress={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <ReactReader
            title={title}
            showToc={true}
            location={location}
            locationChanged={locationChanged}
            swipeable={false}
            url={contents}
            handleTextSelected={handleTextSelected}
            handleKeyPress={undefined}
            getRendition={(rendition: Rendition) => {
              renditionRef.current = rendition;
              
              // Handle keyboard events from within the iframe
              rendition.on('keydown', (e: KeyboardEvent) => {
                if (e.key === 'ArrowRight') {
                  rendition.next();
                  e.preventDefault();
                } else if (e.key === 'ArrowLeft') {
                  rendition.prev();
                  e.preventDefault();
                }
              });
              
              // Register content hook to disable context menu
              rendition.hooks.content.register((contents: Contents) => {
                const body = contents.window.document.body;
                body.oncontextmenu = () => false;
              });

              // Apply theme and font size
              updateTheme(rendition, isDarkMode ? 'dark' : 'light');
              updateFontSize(fontSize);

              // Apply existing highlights
              applyHighlights(rendition);
            }}
            epubOptions={{
              allowPopups: true,
              flow: scrolled ? "scrolled" : "paginated",
              manager: scrolled ? "continuous" : "default",
              keyboard: false
            } as any}
            readerStyles={readerStyles}
          />
        </div>
      </div>

      {showHighlightPanel && (
        <div style={{
          width: '300px',
          borderLeft: '1px solid var(--background-modifier-border)',
          backgroundColor: 'var(--background-secondary)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <HighlightPanel
            highlights={highlights}
            onRemoveHighlight={handleRemoveHighlight}
            onUpdateHighlight={handleUpdateHighlight}
            onNavigateToHighlight={handleNavigateToHighlight}
          />
        </div>
      )}
    </div>
  );
};

const lightReaderTheme: IReactReaderStyle = {
  ...ReactReaderStyle,
  readerArea: {
    ...ReactReaderStyle.readerArea,
    transition: undefined,
  },
};

const darkReaderTheme: IReactReaderStyle = {
  ...ReactReaderStyle,
  arrow: {
    ...ReactReaderStyle.arrow,
    color: 'white',
  },
  arrowHover: {
    ...ReactReaderStyle.arrowHover,
    color: '#ccc',
  },
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: '#000',
    transition: undefined,
  },
  titleArea: {
    ...ReactReaderStyle.titleArea,
    color: '#ccc',
  },
  tocArea: {
    ...ReactReaderStyle.tocArea,
    background: '#111',
  },
  tocButtonExpanded: {
    ...ReactReaderStyle.tocButtonExpanded,
    background: '#222',
  },
  tocButtonBar: {
    ...ReactReaderStyle.tocButtonBar,
    background: '#fff',
  },
  tocButton: {
    ...ReactReaderStyle.tocButton,
    color: 'white',
  },
};