import React from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  CornerDownRight, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { StudyNote } from "../types";

interface NotebookPanelProps {
  showNotebook: boolean;
  setShowNotebook: (val: boolean) => void;
  activeNotebookTab: "ai" | "notebook";
  setActiveNotebookTab: (tab: "ai" | "notebook") => void;
  studyNotes: StudyNote[];
  onDeleteNote: (id: string) => void;
  onDownloadNotes: () => void;
  onAddStudyNote: () => void;
  aiProvider: string;
  setAiProvider: (provider: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  aiLoading: boolean;
  aiError: string;
  aiAssistantText: string;
  handleAiAssist: (type: "summarize" | "simplify" | "explain") => void;
  highlightedText: string;
  setHighlightedText: (txt: string) => void;
  setShowApiKeyModal: (val: boolean) => void;
  apiStatus: Array<{ provider: string; available: boolean; source: string }>;
  currentTheme: {
    notebookBg: string;
    tabSelected: string;
    tabUnselected: string;
    floatingBtn: string;
    select: string;
  };
  zenFullscreen: boolean;
  onFetchApiStatus: () => void;
}

export default function NotebookPanel({
  showNotebook,
  setShowNotebook,
  activeNotebookTab,
  setActiveNotebookTab,
  studyNotes,
  onDeleteNote,
  onDownloadNotes,
  onAddStudyNote,
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  aiLoading,
  aiError,
  aiAssistantText,
  handleAiAssist,
  highlightedText,
  setHighlightedText,
  setShowApiKeyModal,
  apiStatus,
  currentTheme,
  zenFullscreen,
  onFetchApiStatus
}: NotebookPanelProps) {
  if (zenFullscreen) return null;

  return (
    <div className={`border-t ${currentTheme.notebookBg} shadow-md select-text shrink-0`}>
      <button
        onClick={() => setShowNotebook(!showNotebook)}
        className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-800/5 transition select-none cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {showNotebook ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          📖 Cuaderno de Apuntes {studyNotes.length > 0 && `(${studyNotes.length})`} · 🤖 Asistente IA
        </span>
        <span className="text-[10px] text-neutral-400">{showNotebook ? "Ocultar" : "Mostrar"}</span>
      </button>

      {showNotebook && (
        <div className="max-w-3xl mx-auto flex flex-col">
          {/* Dual Tab Switcher */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setActiveNotebookTab("notebook")}
              className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 text-center transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                activeNotebookTab === "notebook"
                  ? "border-neutral-900 text-neutral-900 bg-neutral-50/50 dark:bg-white/5"
                  : "border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50/20"
              }`}
            >
              📖 MI CUADERNO DE APUNTES
              <span className="bg-neutral-900 text-white dark:bg-neutral-700 dark:text-neutral-200 rounded-full text-[9px] px-1.5 py-0.5">
                {studyNotes.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveNotebookTab("ai"); onFetchApiStatus(); }}
              className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 text-center transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                activeNotebookTab === "ai"
                  ? "border-neutral-900 text-neutral-900 bg-neutral-50/50 dark:bg-white/5"
                  : "border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50/20"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              ASISTENTE IA
              {apiStatus.filter(s => s.available).length > 0 && (
                <span className="text-emerald-500 text-[10px]">✓</span>
              )}
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-3 md:p-4 flex flex-col gap-2">
            
            {/* TAB 1: MI CUADERNO DE APUNTES */}
            {activeNotebookTab === "notebook" && (
              <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3 border-b border-neutral-300/20 pb-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">📖 CUADERNO</span>
                  <div className="flex items-center gap-1.5">
                    {studyNotes.length > 0 && (
                      <button
                        onClick={onDownloadNotes}
                        className="p-1 px-2 bg-neutral-950 text-white hover:bg-neutral-900 rounded text-[10px] font-bold transition cursor-pointer"
                        title="Descargar apuntes en Markdown (.md)"
                      >
                        📥 .md
                      </button>
                    )}
                    <button
                      onClick={onAddStudyNote}
                      className="p-1 px-2 border border-neutral-300 hover:border-neutral-500 rounded text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                    >
                      ➕ Apunte
                    </button>
                  </div>
                </div>

                {studyNotes.length === 0 ? (
                  <div className="py-4 text-center bg-neutral-50/70 rounded-lg border border-dashed border-neutral-200 flex flex-col items-center justify-center p-3">
                    <p className="text-[11px] font-medium text-neutral-600">📒 Sin apuntes todavía</p>
                    <p className="text-[10px] text-neutral-400 max-w-md mt-0.5 leading-tight">
                      Selecciona texto en la lectura y usa el botón ✍ Anotar para guardarlo aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {studyNotes.map((note) => (
                      <div 
                        key={note.id} 
                        className="p-4 bg-neutral-50/50 dark:bg-white/5 hover:bg-neutral-50 border border-neutral-250/20 rounded-xl transition duration-150 relative group/noteItem"
                      >
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="absolute top-3 right-3 text-neutral-450 hover:text-red-650 transition p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded text-xs opacity-0 group-hover/noteItem:opacity-100 cursor-pointer"
                          title="Eliminar este apunte"
                        >
                          ✕ Quitar
                        </button>

                        <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
                          <span className="text-[10px] uppercase font-mono bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400">
                            Pág. {note.page}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            • {note.timestamp}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 truncate max-w-sm italic">
                            &ldquo;{note.sourceTitle}&rdquo;
                          </span>
                        </div>

                        {note.highlightedText && (
                          <div className="mb-2 bg-neutral-100/70 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-300/40 text-xs font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed select-text overflow-x-auto">
                            {note.highlightedText}
                          </div>
                        )}

                        {note.manualNote && (
                          <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans flex items-start gap-1 p-1 bg-amber-50/30 rounded border border-amber-200/30">
                            <span className="text-neutral-500 font-bold shrink-0">Comentario del estudiante:</span>
                            <span>{note.manualNote}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ASISTENTE DE CONSULTA IA */}
            {activeNotebookTab === "ai" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                
                {/* Control Panel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-300/30 pb-4">
                  
                  {/* Left: AI Status & Settings Card */}
                  <div className="flex flex-col justify-between bg-neutral-800/5 dark:bg-white/5 rounded-xl p-3.5 border border-neutral-300/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <BrainCircuit className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                        <span className="text-xs uppercase font-mono tracking-wider font-bold text-neutral-700 dark:text-neutral-300">Asistente IA</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-normal text-left">
                        Resume, simplifica o explica conceptos clave del texto seleccionado.
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-300/15 pt-2.5">
                      <span className="text-[9px] uppercase font-mono text-neutral-400">Servicio</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const s = apiStatus.find(x => x.provider === aiProvider);
                          return (
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              s?.available 
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50' 
                                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/30'
                            }`}>
                              {s?.available ? `✓ Activo` : `✗ Sin Clave`}
                            </span>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => { setShowApiKeyModal(true); onFetchApiStatus(); }}
                          className="text-[10px] text-neutral-500 hover:text-neutral-800 dark:hover:text-white font-semibold underline flex items-center gap-0.5 cursor-pointer"
                          title="Configurar claves API"
                        >
                          🔑 Configurar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Brain selector Card */}
                  <div className="flex flex-col justify-between bg-neutral-800/5 dark:bg-white/5 rounded-xl p-3.5 border border-neutral-300/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold mb-2 block text-left">Cerebro de la IA</span>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-mono text-left">Proveedor</span>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className={`text-xs border rounded-lg p-2 font-medium cursor-pointer focus:outline-none focus:ring-1 ${currentTheme.select}`}
                        >
                          <option value="groq">Groq (Súper Rápido)</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="deepseek">DeepSeek</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-mono text-left">Modelo Activo</span>
                        <select
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          className={`text-xs border rounded-lg p-2 font-mono cursor-pointer focus:outline-none focus:ring-1 ${currentTheme.select}`}
                        >
                          {aiProvider === "groq" && (
                            <>
                              <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                              <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
                              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                              <option value="gemma2-9b-it">Gemma 2 9B</option>
                              <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 70B</option>
                            </>
                          )}
                          {aiProvider === "gemini" && (
                            <>
                              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                            </>
                          )}
                          {aiProvider === "deepseek" && (
                            <>
                              <option value="deepseek-chat">DeepSeek V3 (Chat)</option>
                              <option value="deepseek-reasoner">DeepSeek R1 (Reasoner)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cognitive Actions Card */}
                  <div className="flex flex-col justify-between bg-neutral-800/5 dark:bg-white/5 rounded-xl p-3.5 border border-neutral-300/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold mb-2 block text-left">Acciones Cognitivas</span>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleAiAssist("summarize")}
                        disabled={aiLoading}
                        className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition-all duration-200 active:scale-98 flex items-center justify-between gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.floatingBtn}`}
                        title="Resume la selección o la página activa en viñetas"
                      >
                        <span>📝 Resumir Selección</span>
                        <span className="text-[9px] uppercase font-mono opacity-50">Viñetas</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleAiAssist("simplify")}
                        disabled={aiLoading}
                        className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition-all duration-200 active:scale-98 flex items-center justify-between gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.floatingBtn}`}
                        title="Reescribe el texto de forma más simple y amena"
                      >
                        <span>🎨 Simplificar Texto</span>
                        <span className="text-[9px] uppercase font-mono opacity-50">Simple</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleAiAssist("explain")}
                        disabled={aiLoading}
                        className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition-all duration-200 active:scale-98 flex items-center justify-between gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.floatingBtn}`}
                        title="Explica brevemente los conceptos de la selección"
                      >
                        <span>💡 Explicar Conceptos</span>
                        <span className="text-[9px] uppercase font-mono opacity-50">Ideas</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Highlighted text context feedback */}
                {highlightedText && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-neutral-300/25 bg-neutral-850/5 text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed relative animate-in slide-in-from-top-1 duration-200">
                    <CornerDownRight className="w-4 h-4 mt-0.5 shrink-0 text-neutral-400" />
                    <span className="italic line-clamp-2 pr-16 select-text text-left">
                      Contexto seleccionado: &ldquo;{highlightedText}&rdquo;
                    </span>
                    <button 
                      type="button"
                      onClick={() => setHighlightedText("")}
                      className="absolute right-3 top-2.5 text-[9px] uppercase font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 border border-neutral-300/40 rounded px-1.5 py-0.5 hover:bg-white/10 transition shrink-0 cursor-pointer"
                      title="Borrar selección manual"
                    >
                      Quitar
                    </button>
                  </div>
                )}

                {/* Loader */}
                {aiLoading && (
                  <div className="p-6 bg-neutral-800/5 dark:bg-white/5 border border-dashed border-neutral-300/20 rounded-xl text-center flex flex-col items-center justify-center gap-2 animate-pulse">
                    <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-spin" />
                    <p className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300">
                      Procesando con {aiModel}...
                    </p>
                  </div>
                )}

                {/* Error */}
                {aiError && (
                  <div className="p-3 bg-red-100/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-300/20 rounded-xl text-xs flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{aiError}</span>
                  </div>
                )}

                {/* Output display pad */}
                {aiAssistantText && (
                  <div className="p-4 bg-white/40 dark:bg-neutral-900/30 rounded-xl border border-neutral-300/30 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans relative transition animate-in fade-in duration-300 max-h-56 overflow-y-auto shadow-inner text-left">
                    <div className="absolute top-3 right-3 text-[9px] uppercase font-mono tracking-widest text-neutral-400 select-none">
                      Tinta Digital
                    </div>
                    <div className="pr-16 whitespace-pre-line text-xs font-medium">
                      {aiAssistantText}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
