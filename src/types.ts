export type ContrastMode = "paper-white" | "warm-sepia" | "cool-grey" | "dark-ink";

export type FontFamily = "serif-lora" | "sans-inter" | "mono-jetbrains";

export interface ReaderConfig {
  contrastMode: ContrastMode;
  fontFamily: FontFamily;
  fontSize: number; // in pixels (e.g., 14 to 32)
  lineHeight: number; // multiplier (e.g., 1.4 to 2.2)
  contrastLevel: number; // CSS contrast slider multiplier (0.8 to 1.5)
  grayscaleActive: boolean;
  paperGrainActive: boolean;
  ditheringActive: boolean;
  ghostingLevel: number; // opacity (0 to 15) for simulated ghosting
  bezelModeActive: boolean; // physical e-reader shell overlay
  textAlignment: "left" | "justify";
  refreshRate: number; // automatically flash refresh every X pages (0 to disable)
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

