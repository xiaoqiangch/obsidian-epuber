import { Plugin } from 'obsidian';
import { Highlight, EpubHighlights, HighlightStorage } from './highlightTypes';

const STORAGE_KEY = 'epub-highlights';
const STORAGE_VERSION = 1;

export class HighlightManager {
  private plugin: Plugin;
  private storage: HighlightStorage;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.storage = {
      version: STORAGE_VERSION,
      highlights: {}
    };
  }

  async load(): Promise<void> {
    try {
      const data = await this.plugin.loadData();
      if (data && data[STORAGE_KEY] && data[STORAGE_KEY].version === STORAGE_VERSION) {
        this.storage = data[STORAGE_KEY];
      }
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  }

  async save(): Promise<void> {
    try {
      const data = await this.plugin.loadData() || {};
      data[STORAGE_KEY] = this.storage;
      await this.plugin.saveData(data);
    } catch (error) {
      console.error('Failed to save highlights:', error);
    }
  }

  getHighlightsForEpub(epubFilePath: string): Highlight[] {
    return this.storage.highlights[epubFilePath] || [];
  }

  addHighlight(epubFilePath: string, highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>): Highlight {
    const highlights = this.getHighlightsForEpub(epubFilePath);
    const newHighlight: Highlight = {
      ...highlight,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    highlights.push(newHighlight);
    this.storage.highlights[epubFilePath] = highlights;
    this.save();
    
    return newHighlight;
  }

  updateHighlight(epubFilePath: string, highlightId: string, updates: Partial<Omit<Highlight, 'id' | 'createdAt'>>): Highlight | null {
    const highlights = this.getHighlightsForEpub(epubFilePath);
    const index = highlights.findIndex(h => h.id === highlightId);
    
    if (index === -1) return null;
    
    const updatedHighlight = {
      ...highlights[index],
      ...updates,
      updatedAt: Date.now()
    };
    
    highlights[index] = updatedHighlight;
    this.storage.highlights[epubFilePath] = highlights;
    this.save();
    
    return updatedHighlight;
  }

  deleteHighlight(epubFilePath: string, highlightId: string): boolean {
    const highlights = this.getHighlightsForEpub(epubFilePath);
    const index = highlights.findIndex(h => h.id === highlightId);
    
    if (index === -1) return false;
    
    highlights.splice(index, 1);
    this.storage.highlights[epubFilePath] = highlights;
    this.save();
    
    return true;
  }

  clearHighlightsForEpub(epubFilePath: string): void {
    delete this.storage.highlights[epubFilePath];
    this.save();
  }

  getAllEpubHighlights(): EpubHighlights {
    return { ...this.storage.highlights };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}