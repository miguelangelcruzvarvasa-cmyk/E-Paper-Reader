export type ContrastMode = "paper-white" | "warm-sepia" | "cool-grey" | "dark-ink";

export type FontFamily = "serif-lora" | "sans-inter" | "mono-jetbrains";

export interface ReaderConfig {
  contrastMode: ContrastMode;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  contrastLevel: number;
  grayscaleActive: boolean;
  paperGrainActive: boolean;
  ditheringActive: boolean;
  ghostingLevel: number;
  bezelModeActive: boolean;
  blueLightFilter: number; // 0-100, higher = warmer / less blue light
  brightness: number; // 0-100, simulated screen glow / frontlight
  applyFilterGlobally: boolean; // Apply filter to entire application window or just paper sheet
  screenProfile: 'standard' | 'amoled' | 'high_brightness';
  ultraDim: boolean;
  textAlignment: "left" | "justify";
  refreshRate: number;
  smartComfortActive: boolean; // Automates brightness/warmth based on environment/time/fatigue
}

export type InputMode = "paste" | "web" | "pdf";

export interface Bookmarks {
  title: string;
  type: InputMode;
  date: string;
  snippet: string;
  content: string; // HTML or Markdown
}

export interface StudyNote {
  id: string;
  sourceTitle: string;
  page: number;
  highlightedText: string;
  manualNote: string;
  timestamp: string;
}

