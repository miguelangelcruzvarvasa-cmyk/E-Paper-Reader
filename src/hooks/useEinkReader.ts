import { useState, useEffect } from "react";
import { ReaderConfig, InputMode, StudyNote } from "../types";
import { defaultTextContent, uiThemeClasses } from "../constants";

export function useEinkReader() {
  // Config state restored from localStorage
  const [config, setConfig] = useState<ReaderConfig>(() => {
    try {
      const saved = localStorage.getItem("EINK_CONFIG");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          contrastMode: "warm-sepia",
          fontFamily: "serif-lora",
          fontSize: 18,
          lineHeight: 1.7,
          contrastLevel: 1.05,
          grayscaleActive: true,
          paperGrainActive: true,
          ditheringActive: true,
          ghostingLevel: 4,
          bezelModeActive: false,
          blueLightFilter: 80,
          brightness: 60,
          applyFilterGlobally: true,
          screenProfile: "standard",
          ultraDim: false,
          textAlignment: "justify",
          refreshRate: 3,
          smartComfortActive: true,
          ...parsed,
        };
      }
    } catch (e) {
      console.error("Local storage read error for config:", e);
    }
    return {
      contrastMode: "warm-sepia",
      fontFamily: "serif-lora",
      fontSize: 18,
      lineHeight: 1.7,
      contrastLevel: 1.05,
      grayscaleActive: true,
      paperGrainActive: true,
      ditheringActive: true,
      ghostingLevel: 4,
      bezelModeActive: false,
      blueLightFilter: 85,
      brightness: 60,
      applyFilterGlobally: true,
      screenProfile: "standard",
      ultraDim: false,
      textAlignment: "justify",
      refreshRate: 3,
      smartComfortActive: true,
    };
  });

  const baseTheme = uiThemeClasses[config.contrastMode] || uiThemeClasses["warm-sepia"];
  const currentTheme = { ...baseTheme };
  if (config.screenProfile === 'amoled' && config.contrastMode === 'dark-ink') {
    currentTheme.rootBg = "bg-black";
    currentTheme.headerBg = "bg-black text-[#cfcfcf] border-b border-neutral-900";
    currentTheme.headerIcon = "bg-black text-[#cfcfcf] border-neutral-900";
    currentTheme.tabSelected = "bg-neutral-950 text-[#dedede] shadow border border-neutral-800";
    currentTheme.tabUnselected = "text-neutral-500 hover:text-white hover:bg-neutral-950";
    currentTheme.loadersBg = "bg-black border-neutral-900";
    currentTheme.notebookBg = "bg-black border-neutral-900";
    currentTheme.floatingBtn = "bg-neutral-950 border-neutral-800 hover:bg-neutral-900 text-[#dedede] hover:text-white";
    currentTheme.select = "bg-black border-neutral-900 text-[#cfcfcf] focus:ring-neutral-800";
  }

  // Flow & Mode tracking loaded from local storage
  const [activeInputMode, setActiveInputMode] = useState<InputMode>(() => {
    try {
      const saved = localStorage.getItem("EINK_INPUT_MODE");
      if (saved && (saved === "paste" || saved === "web" || saved === "pdf")) {
        return saved as InputMode;
      }
    } catch {}
    return "paste";
  });

  const [sourceTitle, setSourceTitle] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_SOURCE_TITLE");
      if (saved) return saved;
    } catch {}
    return "Guía del Confort Visual e-Ink";
  });

  const [ghostingText, setGhostingText] = useState("");
  const [refreshFlash, setRefreshFlash] = useState(false);
  const [pageChangesCount, setPageChangesCount] = useState(0);

  // Raw interactive states loaded from local storage
  const [pastedText, setPastedText] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_PASTED_TEXT");
      if (saved !== null) return saved;
    } catch {}
    return defaultTextContent;
  });

  const [webUrl, setWebUrl] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_WEB_URL");
      if (saved !== null) return saved;
    } catch {}
    return "";
  });

  const [useAiExtraction, setUseAiExtraction] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_USE_AI_EXTRACTION");
      if (saved !== null) return saved === "true";
    } catch {}
    return true;
  });

  const [webContent, setWebContent] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_WEB_CONTENT");
      if (saved !== null) return saved;
    } catch {}
    return defaultTextContent;
  });

  const [lastUploadedFileName, setLastUploadedFileName] = useState(() => {
    try {
      const saved = localStorage.getItem("EINK_LAST_FILE_NAME");
      if (saved !== null) return saved;
    } catch {}
    return "";
  });

  // Loading & Error states
  const [loadingWeb, setLoadingWeb] = useState(false);
  const [webError, setWebError] = useState("");
  const [pdfError, setPdfError] = useState("");

  // PDF.js worker load state
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);

  // Read saved page indexes
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("EINK_PDF_CURRENT_PAGE");
      if (saved) return parseInt(saved, 10) || 1;
    } catch {}
    return 1;
  });

  const [textCurrentPage, setTextCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("EINK_TEXT_CURRENT_PAGE");
      if (saved) return parseInt(saved, 10) || 1;
    } catch {}
    return 1;
  });

  const [studyNotes, setStudyNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem("EINK_STUDY_NOTES");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "intro-note",
        sourceTitle: "Guía de bienvenida",
        page: 1,
        highlightedText: "La emisión constante de luz azul de alta energía disminuye la frecuencia de parpadeo.",
        manualNote: "Anotación de ejemplo: Configurar alertas cada 20 minutos de lectura para descansar la vista.",
        timestamp: "9/6/2026, 21:43"
      }
    ];
  });

  const [zenFullscreen, setZenFullscreen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("EINK_ZEN_FULLSCREEN");
      if (saved !== null) return saved === "true";
    } catch {}
    return true;
  });

  const [showLoader, setShowLoader] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);

  // AI Provider & Model selection
  const [aiProvider, setAiProvider] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("EINK_AI_PROVIDER");
      if (saved) return saved;
    } catch {}
    return "groq";
  });
  const [aiModel, setAiModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("EINK_AI_MODEL");
      if (saved) return saved;
    } catch {}
    return "llama-3.3-70b-versatile";
  });

  // API Key management
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<Array<{ provider: string; available: boolean; source: string }>>([]);

  const fetchApiStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setApiStatus(data.providers || []);
    } catch {}
  };

  useEffect(() => { fetchApiStatus(); }, []);

  const handleSaveApiKey = async (provider: string, apiKey: string) => {
    try {
      const res = await fetch("/api/set-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      if (res.ok) {
        fetchApiStatus();
      }
    } catch {}
  };

  // Save changes reactively to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("EINK_CONFIG", JSON.stringify(config));
      localStorage.setItem("EINK_INPUT_MODE", activeInputMode);
      localStorage.setItem("EINK_PASTED_TEXT", pastedText);
      localStorage.setItem("EINK_WEB_URL", webUrl);
      localStorage.setItem("EINK_USE_AI_EXTRACTION", useAiExtraction ? "true" : "false");
      localStorage.setItem("EINK_WEB_CONTENT", webContent);
      localStorage.setItem("EINK_LAST_FILE_NAME", lastUploadedFileName);
      localStorage.setItem("EINK_PDF_CURRENT_PAGE", pdfCurrentPage.toString());
      localStorage.setItem("EINK_TEXT_CURRENT_PAGE", textCurrentPage.toString());
      localStorage.setItem("EINK_SOURCE_TITLE", sourceTitle);
      localStorage.setItem("EINK_STUDY_NOTES", JSON.stringify(studyNotes));
      localStorage.setItem("EINK_ZEN_FULLSCREEN", zenFullscreen ? "true" : "false");
      localStorage.setItem("EINK_AI_PROVIDER", aiProvider);
      localStorage.setItem("EINK_AI_MODEL", aiModel);
    } catch (err) {
      console.warn("Failed syncing state with localStorage:", err);
    }
  }, [
    config,
    activeInputMode,
    pastedText,
    webUrl,
    useAiExtraction,
    webContent,
    lastUploadedFileName,
    pdfCurrentPage,
    textCurrentPage,
    sourceTitle,
    studyNotes,
    zenFullscreen,
    aiProvider,
    aiModel,
  ]);

  // Smart AI Help Desk state (bottom notes widget)
  const [highlightedText, setHighlightedText] = useState("");
  const [activeReadingMinutes, setActiveReadingMinutes] = useState(0);
  
  // Notebook/Annotations States
  const [activeNotebookTab, setActiveNotebookTab] = useState<"ai" | "notebook">("notebook");
  const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState("");
  const [noteSuccessToast, setNoteSuccessToast] = useState("");

  const handleSaveStudyNote = (highlightedTextParam: string, commentParam: string) => {
    const newNote = {
      id: "note-" + Date.now(),
      sourceTitle: sourceTitle || "Notas de Estudio",
      page: activeInputMode === "pdf" ? pdfCurrentPage : textCurrentPage,
      highlightedText: highlightedTextParam.trim(),
      manualNote: commentParam.trim(),
      timestamp: new Date().toLocaleString("es-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setStudyNotes(prev => [newNote, ...prev]);
    setQuickNoteModalOpen(false);
    setHighlightedText("");

    setNoteSuccessToast("📝 ¡Apunte guardado en tu Cuaderno!");
    setTimeout(() => setNoteSuccessToast(""), 3500);
    setActiveNotebookTab("notebook");
  };

  const handleDeleteNote = (id: string) => {
    setStudyNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleDownloadNotesAsMarkdown = () => {
    if (studyNotes.length === 0) return;
    
    let content = `# Cuaderno de Apuntes - ${sourceTitle || "Curso"}\n`;
    content += `Generado el ${new Date().toLocaleDateString("es-ES")}\n\n`;
    content += `* * *\n\n`;

    studyNotes.slice().reverse().forEach((note, index) => {
      content += `## Apunte #${index + 1}: de "${note.sourceTitle}" (Pág. ${note.page})\n`;
      content += `*Fecha: ${note.timestamp}*\n\n`;
      
      if (note.highlightedText) {
        content += `### Texto / Código capturado:\n\`\`\`\n${note.highlightedText}\n\`\`\`\n\n`;
      }
      
      if (note.manualNote) {
        content += `### Mi Explicación / Configuración:\n${note.manualNote}\n\n`;
      }
      content += `* * *\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Apuntes_${sourceTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [aiAssistantText, setAiAssistantText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Load PDFjs from CDN dynamically on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (urlParam) {
      setWebUrl(urlParam);
      setActiveInputMode("web");
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      const autoFetchUrl = async () => {
        setLoadingWeb(true);
        setWebError("");
        try {
          const response = await fetch("/api/fetch-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlParam, useAi: true, provider: aiProvider, model: aiModel })
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "No se pudo extraer contenido mediante IA del marcador.");
          }
          setWebContent(data.markdown);
          setSourceTitle(data.title || urlParam);
          setTextCurrentPage(1);
          triggerRefreshFlash();
        } catch (err: any) {
          console.error("Bookmarklet autostart error:", err);
          setWebError(`Error de carga del marcador: ${err.message || err}`);
        } finally {
          setLoadingWeb(false);
        }
      };
      autoFetchUrl();
    }
  }, []);

  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const globPdf = (window as any).pdfjsLib;
      globPdf.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      setPdfjsLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Listen to visual text highlights for assistant context
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectionText = selection ? selection.toString().trim() : "";
      if (selectionText && selectionText.length > 5 && selectionText.length < 1500) {
        setHighlightedText(selectionText);
      }
    };

    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
    };
  }, []);

  // 1. Device Auto-Detection on boot
  useEffect(() => {
    const isDetected = localStorage.getItem("EINK_DEVICE_DETECTED");
    if (!isDetected) {
      const ua = navigator.userAgent || "";
      const isHuawei = /huawei|honor|harmonyos/i.test(ua);
      const isMobileApple = /ipad|iphone|macintosh/i.test(ua) && ('ontouchend' in document);
      
      let detectedProfile: 'standard' | 'amoled' | 'high_brightness' = "standard";
      let message = "";

      if (isHuawei) {
        detectedProfile = "high_brightness";
        message = "🤖 Confort Inteligente: Pantalla Huawei detectada. Se activó el perfil de Alto Brillo para mitigar la luz agresiva.";
      } else if (isMobileApple) {
        detectedProfile = "high_brightness";
        message = "🤖 Confort Inteligente: Pantalla retina táctil premium detectada. Ajustamos el perfil de brillo para lectura cómoda.";
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        detectedProfile = "amoled";
        message = "🤖 Confort Inteligente: Tema oscuro detectado. Perfil AMOLED activado para negros puros.";
      }

      if (detectedProfile !== "standard") {
        setConfig(prev => ({
          ...prev,
          screenProfile: detectedProfile,
          contrastMode: detectedProfile === "amoled" ? "dark-ink" : prev.contrastMode
        }));
        setNoteSuccessToast(message);
        setTimeout(() => setNoteSuccessToast(""), 6000);
      }
      localStorage.setItem("EINK_DEVICE_DETECTED", "true");
    }
  }, []);

  // 2. Clock-based Smart Adaptive Comfort & Fatigue monitoring
  useEffect(() => {
    let interval: any = null;
    
    // Function to update smart parameters
    const checkAndApplySmartComfort = () => {
      const hour = new Date().getHours();
      
      // Calculate settings
      let targetBrightness = 60;
      let targetBlueLightFilter = 80;
      let targetUltraDim = false;

      if (hour >= 8 && hour < 18) {
        // Daytime: high brightness, low filter
        targetBrightness = 85;
        targetBlueLightFilter = 35;
        targetUltraDim = false;
      } else if (hour >= 18 && hour < 20) {
        // Sunset: warm light transitions
        targetBrightness = 68;
        targetBlueLightFilter = 60;
        targetUltraDim = false;
      } else if (hour >= 20 && hour < 23) {
        // Night: cozy reading
        targetBrightness = 48;
        targetBlueLightFilter = 82;
        targetUltraDim = false;
      } else {
        // Late Night: dimmest paper, extreme yellow protection
        targetBrightness = 25;
        targetBlueLightFilter = 98;
        targetUltraDim = true;
      }

      // Profile adjustment
      if (config.screenProfile === 'high_brightness') {
        targetBrightness = Math.max(0, targetBrightness - 15);
        targetBlueLightFilter = Math.min(100, targetBlueLightFilter + 5);
      } else if (config.screenProfile === 'amoled') {
        targetBrightness = Math.max(0, targetBrightness - 8);
      }

      // Fatigue offset: +2% warmth and -1.5% brightness per 10 minutes read
      const fatigueWarmthOffset = Math.min(10, Math.floor(activeReadingMinutes / 10) * 2);
      const fatigueDimOffset = Math.min(12, Math.floor(activeReadingMinutes / 10) * 1.5);
      
      const finalFilter = Math.min(100, targetBlueLightFilter + fatigueWarmthOffset);
      const finalBrightness = Math.max(0, targetBrightness - fatigueDimOffset);

      // Check if changes are needed to prevent infinite state updates
      if (
        config.brightness !== finalBrightness ||
        config.blueLightFilter !== finalFilter ||
        config.ultraDim !== targetUltraDim
      ) {
        setConfig(prev => ({
          ...prev,
          brightness: finalBrightness,
          blueLightFilter: finalFilter,
          ultraDim: targetUltraDim,
        }));
      }
    };

    if (config.smartComfortActive) {
      // Apply immediately
      checkAndApplySmartComfort();

      // Check every 30 seconds
      interval = setInterval(() => {
        checkAndApplySmartComfort();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.smartComfortActive, config.screenProfile, activeReadingMinutes]);

  // 3. Active Session Tracker (1 minute tick)
  useEffect(() => {
    const handleInterval = () => {
      // Increment active reading duration
      setActiveReadingMinutes(prev => {
        const nextMin = prev + 1;
        
        // Every 20 minutes of reading: show the 20-20-20 visual health nudge
        if (nextMin % 20 === 0) {
          setNoteSuccessToast("👀 Regla 20-20-20: Has leído por 20 minutos. Mira un objeto a 6 metros por 20 segundos para relajar tus ojos.");
          setTimeout(() => setNoteSuccessToast(""), 7000);
        }
        return nextMin;
      });
    };

    const interval = setInterval(handleInterval, 60000);
    return () => clearInterval(interval);
  }, []);

  // Manual & automatic refresh trigger (screen flash mechanism)
  const triggerRefreshFlash = () => {
    setRefreshFlash(true);
    setPageChangesCount(0);
    setTimeout(() => {
      setRefreshFlash(false);
      setGhostingText("");
    }, 450);
  };

  // Turn page handle
  const handlePageTurnEvent = () => {
    const newCount = pageChangesCount + 1;
    setPageChangesCount(newCount);

    if (config.refreshRate > 0 && newCount >= config.refreshRate) {
      triggerRefreshFlash();
    } else {
      if (activeInputMode === "paste") {
        setGhostingText(pastedText.replace(/[#*`>_\-\[\]]/g, " ").slice(0, 1600));
      } else if (activeInputMode === "web") {
        setGhostingText(webContent.replace(/[#*`>_\-\[\]]/g, " ").slice(0, 1600));
      } else {
        setGhostingText("Residuos de pigmentos de carburo. Refresca para limpiar.");
      }
    }
  };

  const handleConfigChange = (newConfig: Partial<ReaderConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  // API Call: Fetch URL and parse with/without Gemini
  const handleFetchUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl) return;

    setLoadingWeb(true);
    setWebError("");
    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webUrl, useAi: useAiExtraction, provider: aiProvider, model: aiModel })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener la respuesta del servidor.");
      }

      setWebContent(data.markdown);
      setSourceTitle(data.title || webUrl);
      setActiveInputMode("web");
      setTextCurrentPage(1);
      triggerRefreshFlash();
    } catch (err: any) {
      console.error(err);
      setWebError(err.message || "Error al conectar con la página web.");
    } finally {
      setLoadingWeb(false);
    }
  };

  // PDF.js Load Document
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleLoadPdfFile(file);
  };

  const handleLoadPdfFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setPdfError("Por favor selecciona un archivo en formato de documento PDF.");
      return;
    }

    setPdfError("");
    setLastUploadedFileName(file.name);
    
    if (!pdfjsLoaded) {
      setPdfError("El motor de renderizado PDF.js aún se está descargando de la red CDN. Inténtalo de nuevo.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        const globPdf = (window as any).pdfjsLib;
        try {
          const loadingTask = globPdf.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          
          setPdfDocument(pdfDoc);
          setPdfTotalPages(pdfDoc.numPages);
          setPdfCurrentPage(1);
          setSourceTitle(file.name);
          setActiveInputMode("pdf");
          triggerRefreshFlash();
        } catch (err: any) {
          console.error("PDF.js doc loading crash:", err);
          setPdfError(`No se pudo decodificar el PDF: ${err.message || err}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setPdfError(`Error al leer el archivo: ${err.message || err}`);
    }
  };

  // API Call: Gemini Assistance (Analyze / Explain / Simplify Selection)
  const handleAiAssist = async (type: "summarize" | "simplify" | "explain") => {
    const textToProcess = highlightedText || (activeInputMode === "paste" ? pastedText : webContent).slice(0, 1500);
    
    if (!textToProcess || textToProcess.trim().length === 0) {
      setAiError("Por favor selecciona algún texto del panel para analizar.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiAssistantText("");

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess, type, provider: aiProvider, model: aiModel })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Respuesta errónea del backend.");
      }

      setAiAssistantText(data.response);
    } catch (err: any) {
      console.error(err);
      setAiError(`Error en el Asistente: ${err.message || err}`);
    } finally {
      setAiLoading(false);
    }
  };

  // API Call: Gemini Synthesis (Generate Study Guide from Notebook Notes)
  const handleNotebookSynthesis = async () => {
    if (studyNotes.length === 0) {
      setAiError("No tienes apuntes en tu cuaderno para sintetizar todavía.");
      setActiveNotebookTab("ai");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiAssistantText("");
    setActiveNotebookTab("ai");

    const notesText = studyNotes
      .slice()
      .reverse()
      .map((n, i) => `[Apunte #${i+1}] (Pág. ${n.page}):\nTexto Capturado: "${n.highlightedText}"\nMi Comentario: "${n.manualNote}"`)
      .join("\n\n");

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notesText, type: "synthesis", provider: aiProvider, model: aiModel })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Respuesta errónea del backend.");
      }

      setAiAssistantText(data.response);
    } catch (err: any) {
      console.error(err);
      setAiError(`Error al sintetizar apuntes: ${err.message || err}`);
    } finally {
      setAiLoading(false);
    }
  };

  return {
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
    aiAssistantText,
    handleNotebookSynthesis,
    activeReadingMinutes
  };
}
