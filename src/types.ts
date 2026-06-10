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
  textAlignment: "left" | "justify";
  refreshRate: number;
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

