export interface Highlight {
  id: string;
  cfiRange: string;
  text: string;
  color: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EpubHighlights {
  [epubFilePath: string]: Highlight[];
}

export const HIGHLIGHT_COLORS = {
  YELLOW: '#FFEB3B',
  GREEN: '#8BC34A',
  BLUE: '#2196F3',
  PINK: '#E91E63',
  ORANGE: '#FF9800',
} as const;

export type HighlightColor = typeof HIGHLIGHT_COLORS[keyof typeof HIGHLIGHT_COLORS];

export interface HighlightStorage {
  version: number;
  highlights: EpubHighlights;
}