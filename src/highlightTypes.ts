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
} as const;

export type HighlightColor = typeof HIGHLIGHT_COLORS.YELLOW;

export interface HighlightStorage {
  version: number;
  highlights: EpubHighlights;
}