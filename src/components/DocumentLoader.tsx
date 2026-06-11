import React, { useState, useRef } from "react";
import { 
  Edit3, 
  Globe, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";
import { InputMode } from "../types";

interface DocumentLoaderProps {
  activeInputMode: InputMode;
  setActiveInputMode: (mode: InputMode) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  webUrl: string;
  setWebUrl: (url: string) => void;
  useAiExtraction: boolean;
  setUseAiExtraction: (val: boolean) => void;
  loadingWeb: boolean;
  webError: string;
  onSubmitWeb: (e: React.FormEvent) => void;
  pdfError: string;
  lastUploadedFileName: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropFile: (file: File) => void;
  currentTheme: {
    loadersBg: string;
    tabSelected: string;
    tabUnselected: string;
  };
  showLoader: boolean;
  setShowLoader: (val: boolean) => void;
  zenFullscreen: boolean;
  onTriggerRefresh: () => void;
  onShowLoaderState: (val: boolean) => void;
  onSetSourceTitle: (title: string) => void;
}

export default function DocumentLoader({
  activeInputMode,
  setActiveInputMode,
  pastedText,
  setPastedText,
  webUrl,
  setWebUrl,
  useAiExtraction,
  setUseAiExtraction,
  loadingWeb,
  webError,
  onSubmitWeb,
  pdfError,
  lastUploadedFileName,
  onFileChange,
  onDropFile,
  currentTheme,
  showLoader,
  setShowLoader,
  zenFullscreen,
  onTriggerRefresh,
  onShowLoaderState,
  onSetSourceTitle
}: DocumentLoaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (zenFullscreen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onDropFile(files[0]);
    }
  };

  const bookmarkletUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}`
    : "";

  return (
    <div className={`border-b ${currentTheme.loadersBg} shrink-0`}>
      <button
        onClick={() => setShowLoader(!showLoader)}
        className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-800/5 transition select-none cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {showLoader ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {activeInputMode === "paste" ? "📝 Pegar texto" : activeInputMode === "web" ? "🌐 Cargar desde web" : "📄 Cargar PDF"}
        </span>
        <span className="text-[10px] text-neutral-400">{showLoader ? "Ocultar" : "Cambiar contenido"}</span>
      </button>

      {showLoader && (
        <div className="px-4 pb-3 max-w-3xl mx-auto">
          {/* Tab: Paste content */}
          {activeInputMode === "paste" && (
            <div className="flex flex-col gap-1.5">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Pega aquí el texto, notas o libro que deseas leer..."
                className="w-full h-20 p-2.5 border border-neutral-300/35 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-700 font-sans bg-white/60 dark:bg-neutral-900/10"
              />
            </div>
          )}

          {/* Tab: URL web crawler */}
          {activeInputMode === "web" && (
            <form onSubmit={onSubmitWeb} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-1.5">
                <input
                  type="text"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="ejemplo: es.wikipedia.org/wiki/Tinta_electrónica"
                  className="flex-1 p-2 border border-neutral-300/35 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-700 bg-white/60 dark:bg-neutral-900/10 text-neutral-800"
                />
                <button
                  type="submit"
                  disabled={loadingWeb || !webUrl}
                  className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:bg-neutral-300 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  {loadingWeb ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Cargando...
                    </>
                  ) : (
                    "Importar"
                  )}
                </button>
              </div>

              <label className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAiExtraction}
                  onChange={(e) => setUseAiExtraction(e.target.checked)}
                  className="rounded border-neutral-300 accent-neutral-900 h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1">
                  IA Gemini <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                </span>
              </label>

              {webError && (
                <div className="p-2 bg-red-55/10 text-red-600 border border-red-200/50 rounded-lg text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{webError}</span>
                </div>
              )}

              <div className="p-2.5 bg-orange-50/5 rounded-lg border border-neutral-300/30 flex items-center justify-between gap-3">
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight text-left">
                  Arrastra el botón a tus marcadores para importar webs con un clic.
                </p>
                <a
                  href={`javascript:(function(){var d=window.location.href;window.open('${bookmarkletUrl}?url='+encodeURIComponent(d),'_blank');})();`}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-950 text-white rounded-lg text-[10px] font-bold whitespace-nowrap shadow cursor-grab shrink-0"
                  onClick={(e) => { e.preventDefault(); alert("¡Arrástralo a tu barra de marcadores!"); }}
                >
                  📖 E-Ink
                </a>
              </div>
            </form>
          )}

          {/* Tab: PDF upload */}
          {activeInputMode === "pdf" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center gap-1 select-none ${
                isDragOver ? "border-neutral-800 bg-neutral-50/50" : "border-neutral-300/35 hover:border-neutral-400/50 hover:bg-neutral-50/20"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={onFileChange} className="hidden" />
              <FileText className="w-6 h-6 text-neutral-400" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {lastUploadedFileName ? (
                  <span className="text-neutral-800 dark:text-neutral-200 font-bold flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" /> {lastUploadedFileName}
                  </span>
                ) : (
                  "Arrastra tu PDF aquí o haz clic para seleccionar"
                )}
              </p>
              {pdfError && (
                <div className="p-2 bg-red-55/10 text-red-600 border border-red-200/50 rounded-lg text-[11px] flex items-start gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{pdfError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
