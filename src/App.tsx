import React from "react";
import { 
  BookOpen, 
  FileText, 
  Globe, 
  Edit3, 
  EyeOff, 
  Settings, 
  RefreshCw 
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import ReaderScreen from "./components/ReaderScreen";
import ApiKeyModal from "./components/ApiKeyModal";
import QuickNoteModal from "./components/QuickNoteModal";
import DocumentLoader from "./components/DocumentLoader";
import NotebookPanel from "./components/NotebookPanel";
import { useEinkReader } from "./hooks/useEinkReader";

export default function App() {
  const {
    config,
    currentTheme,
    activeInputMode,
    setActiveInputMode,
    sourceTitle,
    setSourceTitle,
    ghostingText,
    refreshFlash,
    pastedText,
    setPastedText,
    webUrl,
    setWebUrl,
    useAiExtraction,
    setUseAiExtraction,
    webContent,
    lastUploadedFileName,
    loadingWeb,
    webError,
    pdfError,
    pdfDocument,
    pdfTotalPages,
    pdfCurrentPage,
    setPdfCurrentPage,
    textCurrentPage,
    setTextCurrentPage,
    studyNotes,
    zenFullscreen,
    setZenFullscreen,
    showLoader,
    setShowLoader,
    showNotebook,
    setShowNotebook,
    activeNotebookTab,
    setActiveNotebookTab,
    aiProvider,
    setAiProvider,
    aiModel,
    setAiModel,
    showApiKeyModal,
    setShowApiKeyModal,
    apiStatus,
    fetchApiStatus,
    handleSaveApiKey,
    highlightedText,
    setHighlightedText,
    quickNoteModalOpen,
    setQuickNoteModalOpen,
    quickNoteText,
    setQuickNoteText,
    noteSuccessToast,
    handleSaveStudyNote,
    handleDeleteNote,
    handleDownloadNotesAsMarkdown,
    triggerRefreshFlash,
    handlePageTurnEvent,
    handleConfigChange,
    handleFetchUrlSubmit,
    handleFileChange,
    handleLoadPdfFile,
    handleAiAssist,
    aiLoading,
    aiError,
    aiAssistantText
  } = useEinkReader();

  return (
    <div 
      className={`h-full flex flex-col font-sans select-none relative transition-colors duration-700 ${zenFullscreen ? 'bg-[#1c1d1f]' : currentTheme.rootBg}`}
      style={config.applyFilterGlobally ? {
        filter: `
          contrast(${config.contrastLevel})
          brightness(${0.82 + (config.brightness / 100) * 0.28 - (config.blueLightFilter / 100) * 0.15})
          sepia(${config.blueLightFilter / 100 * 0.55})
        `
      } : undefined}
    >
      {/* Absolute screen flash animation for refreshing paper trace */}
      {refreshFlash && (
        <div className="fixed inset-0 z-[100] pointer-events-none animate-eink-flash" />
      )}

      {/* Floating toolbar in fullscreen mode — quick controls without leaving reading */}
      {zenFullscreen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-0.5 bg-neutral-900/80 backdrop-blur-md rounded-full px-2 py-1.5 border border-neutral-800/50 shadow-2xl touch-manipulation">
          {/* Mode tabs */}
          <button
            onClick={() => { setActiveInputMode("paste"); setSourceTitle("Borrador de Lectura Libre"); triggerRefreshFlash(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${activeInputMode === "paste" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"}`}
            title="Notas / Texto"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveInputMode("web"); setSourceTitle(webUrl ? "Lectura Web" : "Enlace Web"); triggerRefreshFlash(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${activeInputMode === "web" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"}`}
            title="Web"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveInputMode("pdf"); setSourceTitle(lastUploadedFileName || "Documento PDF"); triggerRefreshFlash(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${activeInputMode === "pdf" ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"}`}
            title="PDF"
          >
            <FileText className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-700 mx-1" />

          {/* Contrast cycle */}
          <button
            onClick={() => {
              const modes: Array<typeof config.contrastMode> = ["paper-white", "warm-sepia", "cool-grey", "dark-ink"];
              const nextIdx = (modes.indexOf(config.contrastMode) + 1) % modes.length;
              handleConfigChange({ contrastMode: modes[nextIdx] });
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-neutral-400 hover:text-white transition"
            title="Ciclar contraste del papel"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
          </button>

          {/* Manual Refresh Flash */}
          <button
            onClick={triggerRefreshFlash}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-neutral-400 hover:text-white transition"
            title="Forzar refresco electromagnético (Purgar Ghosting)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-700 mx-1" />

          {/* Exit Fullscreen */}
          <button
            onClick={() => setZenFullscreen(false)}
            className="px-3 py-1.5 bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold rounded-full border border-neutral-750 transition"
          >
            Salir Zen
          </button>
        </div>
      )}

      {/* Main Standard Header */}
      {!zenFullscreen && (
        <header className={`px-4 py-2 flex items-center justify-between shadow-sm border-b select-none shrink-0 ${currentTheme.headerBg}`}>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 border rounded-lg flex items-center justify-center ${currentTheme.headerIcon}`}>
              <BookOpen className="w-4 h-4 shrink-0" />
            </span>
            <h1 className="text-sm font-black tracking-tight uppercase select-none">
              Tinta Papel <span className="font-light text-neutral-400 dark:text-neutral-500">E-Ink</span>
            </h1>
          </div>

          {/* Dual bar selectors */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => { setActiveInputMode("paste"); setSourceTitle("Borrador de Lectura Libre"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap text-xs select-none cursor-pointer ${
                activeInputMode === "paste" ? currentTheme.tabSelected : currentTheme.tabUnselected
              }`}
            >
              <Edit3 className="w-3 h-3" /> Notas
            </button>
            <button
              onClick={() => { setActiveInputMode("web"); setSourceTitle(webUrl ? "Lectura Web" : "Enlace Web"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap text-xs select-none cursor-pointer ${
                activeInputMode === "web" ? currentTheme.tabSelected : currentTheme.tabUnselected
              }`}
            >
              <Globe className="w-3 h-3" /> Web
            </button>
            <button
              onClick={() => { setActiveInputMode("pdf"); setSourceTitle(lastUploadedFileName || "Documento PDF"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap text-xs select-none cursor-pointer ${
                activeInputMode === "pdf" ? currentTheme.tabSelected : currentTheme.tabUnselected
              }`}
            >
              <FileText className="w-3 h-3" /> PDF
            </button>
          </div>

          <button
            onClick={() => setZenFullscreen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-650 dark:hover:text-neutral-200 transition shrink-0 cursor-pointer"
            title="Pantalla completa"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </header>
      )}

      {/* Main Core Layout: Sidebar Config left, Reader Center */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {!zenFullscreen && (
          <Sidebar 
            config={config} 
            onChangeConfig={handleConfigChange}
            onRefreshTrigger={triggerRefreshFlash}
          />
        )}

        {/* Reader stage & Loaders panel */}
        <main className={`flex-1 flex flex-col ${currentTheme.rootBg} min-w-0 min-h-0 overflow-hidden`}>
          
          {/* Document Loaders — collapsible toggle bar + content */}
          <DocumentLoader
            activeInputMode={activeInputMode}
            setActiveInputMode={setActiveInputMode}
            pastedText={pastedText}
            setPastedText={setPastedText}
            webUrl={webUrl}
            setWebUrl={setWebUrl}
            useAiExtraction={useAiExtraction}
            setUseAiExtraction={setUseAiExtraction}
            loadingWeb={loadingWeb}
            webError={webError}
            onSubmitWeb={handleFetchUrlSubmit}
            pdfError={pdfError}
            lastUploadedFileName={lastUploadedFileName}
            onFileChange={handleFileChange}
            onDropFile={handleLoadPdfFile}
            currentTheme={currentTheme}
            showLoader={showLoader}
            setShowLoader={setShowLoader}
            zenFullscreen={zenFullscreen}
            onTriggerRefresh={triggerRefreshFlash}
            onShowLoaderState={setShowLoader}
            onSetSourceTitle={setSourceTitle}
          />

          {/* Core reading view area */}
          <ReaderScreen
            config={config}
            title={sourceTitle}
            contentType={activeInputMode}
            textContent={activeInputMode === "paste" ? pastedText : webContent}
            pdfDocument={pdfDocument}
            pdfTotalPages={pdfTotalPages}
            pdfCurrentPage={pdfCurrentPage}
            onPdfPageChange={setPdfCurrentPage}
            onPageTurnEvent={handlePageTurnEvent}
            ghostingText={ghostingText}
            textCurrentPage={textCurrentPage}
            onTextPageChange={setTextCurrentPage}
            zenFullscreen={zenFullscreen}
            onToggleFullscreen={() => setZenFullscreen(!zenFullscreen)}
            onAddStudyNote={() => {
              const selection = window.getSelection()?.toString().trim() || highlightedText;
              setQuickNoteText(selection);
              setQuickNoteModalOpen(true);
            }}
          />

          {/* Intelligent Study Notebook & AI Assistant — collapsible */}
          <NotebookPanel
            showNotebook={showNotebook}
            setShowNotebook={setShowNotebook}
            activeNotebookTab={activeNotebookTab}
            setActiveNotebookTab={setActiveNotebookTab}
            studyNotes={studyNotes}
            onDeleteNote={handleDeleteNote}
            onDownloadNotes={handleDownloadNotesAsMarkdown}
            onAddStudyNote={() => {
              const selection = window.getSelection()?.toString().trim() || highlightedText;
              setQuickNoteText(selection);
              setQuickNoteModalOpen(true);
            }}
            aiProvider={aiProvider}
            setAiProvider={(p) => {
              setAiProvider(p);
              localStorage.setItem("EINK_AI_PROVIDER", p);
              const defaults: Record<string, string> = { groq: "llama-3.3-70b-versatile", gemini: "gemini-2.0-flash", deepseek: "deepseek-chat" };
              const newModel = defaults[p] || "llama-3.3-70b-versatile";
              setAiModel(newModel);
              localStorage.setItem("EINK_AI_MODEL", newModel);
            }}
            aiModel={aiModel}
            setAiModel={(m) => {
              setAiModel(m);
              localStorage.setItem("EINK_AI_MODEL", m);
            }}
            aiLoading={aiLoading}
            aiError={aiError}
            aiAssistantText={aiAssistantText}
            handleAiAssist={handleAiAssist}
            highlightedText={highlightedText}
            setHighlightedText={setHighlightedText}
            setShowApiKeyModal={setShowApiKeyModal}
            apiStatus={apiStatus}
            currentTheme={currentTheme}
            zenFullscreen={zenFullscreen}
            onFetchApiStatus={fetchApiStatus}
          />
        </main>
      </div>

      {/* SUCCESS STUDY NOTE TOAST GHOST NOTIFICATION */}
      {noteSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce select-none animate-in slide-in-from-bottom-5">
          <span className="text-emerald-400">✓</span>
          <span>{noteSuccessToast}</span>
        </div>
      )}

      {/* API KEY CONFIGURATION MODAL */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiStatus={apiStatus}
        onSaveKey={handleSaveApiKey}
      />

      {/* QUICK NOTE ENTRY DIALOG MODAL */}
      <QuickNoteModal
        isOpen={quickNoteModalOpen}
        onClose={() => setQuickNoteModalOpen(false)}
        highlightedText={quickNoteText}
        sourceTitle={sourceTitle}
        page={activeInputMode === "pdf" ? pdfCurrentPage : textCurrentPage}
        onSaveNote={handleSaveStudyNote}
      />

      {/* Ultra-Atenuación Overlay (Software Dimmer) */}
      {config.ultraDim && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-none bg-black" 
          style={{ opacity: 0.35 }}
        />
      )}
    </div>
  );
}
