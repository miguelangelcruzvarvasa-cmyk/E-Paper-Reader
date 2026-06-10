import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  FileText, 
  Globe, 
  Edit3, 
  Sparkles, 
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  CornerDownRight,
  BrainCircuit,
  EyeOff,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ReaderConfig, InputMode } from "./types";
import Sidebar from "./components/Sidebar";
import ReaderScreen from "./components/ReaderScreen";

// Default reading material about E-Ink history and layout comfort
const defaultTextContent = `# Bienvenidos a Tinta Papel E-Ink 📖

Este es un lector digital de confort visual diseñado específicamente para combatir la **fatiga ocular digital** (asteno-opía), reducir el estrés de la córnea y ayudarte a leer largos textos, libros o artículos de internet de una manera amigable y segura para tus ojos.

---

## ¿Por qué tenemos fatiga visual con dispositivos convencionales?
Las pantallas tradicionales tipo LED u OLED emiten luz mediante diodos que disparan haces directamente a tus ojos. Para el cerebro, esto equivale a mirar fijamente una bombilla atenuada durante horas. Esta emisión constante de **luz azul de alta energía** y el parpadeo incesante genera:
1. **Reducción de parpadeo**: Parpadeamos un 60% menos al mirar pantallas, desecando la película lagrimal.
2. **Fatiga acomodativa**: El enfoque estático del contraste extremo de los píxeles digitales agota tu músculo biliar en poco tiempo.
3. **Pérdida del sueño**: La luz azul de noche inhibe la secreción de melatonina, impidiendo conciliar el sueño profundo.

---

## Cómo usar este Lector Inteligente
Para empezar, selecciona una de las tres pestañas superiores en el cargador:
* **Pegar Texto o Notas**: Pega cualquier texto libre, novela o apuntes académicos aquí mismo para convertirlos instantáneamente al formato de confort.
* **Convertir Enlace Web**: Introduce un enlace de un blog, periódico o Wikipedia. Nuestro backend procesará el sitio y la **Inteligencia Artificial (Gemini)** extraerá solo el cuerpo útil del artículo en Markdown impecable, descartando ventanas emergentes molestas o anuncios.
* **Cargar Documento PDF**: Arrastra o sube cualquier libro o diapositiva en PDF. Renderizaremos cada página sobre un lienzo digital aplicando todos los filtros protectores de escala de grises y papel mate.

---

## Explora el Panel de Configuración Lateral
Ajusta la interfaz según la sensibilidad de tus ojos:
* **Tipos de Papel**: Elige entre *Papel Claro* (Kindle Pearl), *Sepia Cálido* (Paperwhite cálido ideal para leer de noche), *Gris Slate* (Kobo clásico) o *Tinta Invertida* (Modo noche mate).
* **Simulación de Hardware**: Activa el **Efecto Ghosting** para añadir un sutil residuo del texto anterior, o la **Textura Granulada Mate** para dispersar visualmente el haz de luz de tu monitor tradicional.
* **Refrescar Pantalla**: Haz clic en el botón de refresco para simular el destello electromagnético de limpieza que purga cualquier residuo en las pantallas de tinta electrónica real.

Disfruta de una lectura saludable y protege tu visión. ¡El conocimiento no tiene por qué doler!`;

export default function App() {
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
          textAlignment: "justify",
          refreshRate: 3,
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
      blueLightFilter: 80,
      textAlignment: "justify",
      refreshRate: 3,
    };
  });

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

  const [studyNotes, setStudyNotes] = useState<any[]>(() => {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  // Notebook/Annotations States
  const [activeNotebookTab, setActiveNotebookTab] = useState<"ai" | "notebook">("notebook");
  const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState("");
  const [quickNoteComment, setQuickNoteComment] = useState("");
  const [noteSuccessToast, setNoteSuccessToast] = useState("");

  const handleSaveStudyNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const newNote = {
      id: "note-" + Date.now(),
      sourceTitle: sourceTitle || "Notas de Estudio",
      page: activeInputMode === "pdf" ? pdfCurrentPage : textCurrentPage,
      highlightedText: quickNoteText.trim(),
      manualNote: quickNoteComment.trim(),
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
    setQuickNoteText("");
    setQuickNoteComment("");
    
    // Reset temporary selections
    setHighlightedText("");

    // Show beautiful success toast
    setNoteSuccessToast("📝 ¡Apunte guardado en tu Cuaderno!");
    setTimeout(() => setNoteSuccessToast(""), 3500);
    
    // Scroll to or focus the notebook tab
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
    // Check if redirect query param exists (e.g., from browser Bookmarklet)
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (urlParam) {
      setWebUrl(urlParam);
      setActiveInputMode("web");
      // Strip query parameters from the addressing bar to ensure refreshing doesn't do a double fetch
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Auto Fetch
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

  // Manual & automatic refresh trigger (screen flash mechanism)
  const triggerRefreshFlash = () => {
    setRefreshFlash(true);
    // Clear page change counter upon complete refresh
    setPageChangesCount(0);
    setTimeout(() => {
      setRefreshFlash(false);
      // Clean up ghost crumbs!
      setGhostingText("");
    }, 450);
  };

  // Turn page handle
  const handlePageTurnEvent = () => {
    // Increment turns counts
    const newCount = pageChangesCount + 1;
    setPageChangesCount(newCount);

    // Auto flash refresh triggers?
    if (config.refreshRate > 0 && newCount >= config.refreshRate) {
      triggerRefreshFlash();
    } else {
      // Simulate physical paper ghost shadow (retain previously visible lines in shadow state)
      if (activeInputMode === "paste") {
        setGhostingText(pastedText.replace(/[#*`>_\-\[\]]/g, " ").slice(0, 1600));
      } else if (activeInputMode === "web") {
        setGhostingText(webContent.replace(/[#*`>_\-\[\]]/g, " ").slice(0, 1600));
      } else {
        setGhostingText("Residuos de pigmentos de carburo. Refresca para limpiar.");
      }
    }
  };

  // Change active input configuration safely
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

  // Drag & drop handlers
  const [isDragOver, setIsDragOver] = useState(false);
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
      const file = files[0];
      if (file.type === "application/pdf") {
        setPdfError("");
        setLastUploadedFileName(file.name);
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const globPdf = (window as any).pdfjsLib;
          if (globPdf && arrayBuffer) {
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
              setPdfError(`Fallo al cargar el PDF arrastrado: ${err.message}`);
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setPdfError("Únicamente se soporta la lectura de documentos PDF tradicionales.");
      }
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans select-none relative transition-colors duration-700 ${zenFullscreen ? 'bg-[#1c1d1f]' : 'bg-slate-50'}`}>
      {/* Absolute screen flash animation for refreshing paper trace */}
      {refreshFlash && (
        <div className="fixed inset-0 z-[100] pointer-events-none animate-eink-flash" />
      )}

      {/* Floating toolbar in fullscreen mode — quick controls without leaving reading */}
      {zenFullscreen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-0.5 bg-neutral-900/75 backdrop-blur-md rounded-full px-2 py-1.5 border border-neutral-800/50 shadow-2xl">
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
              const modes: Array<ReaderConfig["contrastMode"]> = ["paper-white", "warm-sepia", "cool-grey", "dark-ink"];
              const idx = modes.indexOf(config.contrastMode);
              handleConfigChange({ contrastMode: modes[(idx + 1) % modes.length] });
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Cambiar tipo de papel"
          >
            <span className="text-xs">
              {config.contrastMode === "paper-white" ? "☀️" : config.contrastMode === "warm-sepia" ? "🟤" : config.contrastMode === "cool-grey" ? "🩶" : "🌙"}
            </span>
          </button>

          {/* Font size */}
          <button
            onClick={() => handleConfigChange({ fontSize: Math.max(12, config.fontSize - 2) })}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Reducir letra"
          >
            A⁻
          </button>
          <button
            onClick={() => handleConfigChange({ fontSize: Math.min(36, config.fontSize + 2) })}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Aumentar letra"
          >
            A⁺
          </button>

          <div className="w-px h-5 bg-neutral-700 mx-1" />

          {/* Refresh */}
          <button
            onClick={triggerRefreshFlash}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Refrescar pantalla"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Exit fullscreen — open full panel */}
          <button
            onClick={() => setZenFullscreen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition ml-1"
            title="Abrir panel completo"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating fullscreen button (only in normal mode) */}
      {!zenFullscreen && (
        <button
          onClick={() => setZenFullscreen(true)}
          className="fixed bottom-4 right-4 z-[90] w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100"
          title="Pantalla completa"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Primary header — compact bar */}
      {!zenFullscreen && (
        <header className="bg-neutral-900 text-white px-4 py-2 flex flex-row items-center justify-between gap-3 shadow-md select-none shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center border border-neutral-700 shadow-sm shrink-0">
              <BookOpen className="w-4 h-4 text-neutral-900 fill-neutral-900" />
            </div>
            <h1 className="font-bold tracking-tight text-sm whitespace-nowrap">Tinta Papel E-Ink</h1>
          </div>

          {/* Document selector tabs */}
          <div className="flex bg-neutral-800 rounded-lg p-0.5 border border-neutral-700 text-[11px]">
            <button
              onClick={() => { setActiveInputMode("paste"); setSourceTitle("Borrador de Lectura Libre"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                activeInputMode === "paste" ? "bg-white text-neutral-900 shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              <Edit3 className="w-3 h-3" /> Notas
            </button>
            <button
              onClick={() => { setActiveInputMode("web"); setSourceTitle(webUrl ? "Lectura Web" : "Enlace Web"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                activeInputMode === "web" ? "bg-white text-neutral-900 shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              <Globe className="w-3 h-3" /> Web
            </button>
            <button
              onClick={() => { setActiveInputMode("pdf"); setSourceTitle(lastUploadedFileName || "Documento PDF"); triggerRefreshFlash(); setShowLoader(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                activeInputMode === "pdf" ? "bg-white text-neutral-900 shadow" : "text-neutral-300 hover:text-white"
              }`}
            >
              <FileText className="w-3 h-3" /> PDF
            </button>
          </div>

          <button
            onClick={() => setZenFullscreen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition shrink-0"
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
        <main className="flex-1 flex flex-col bg-[#eef0f3] min-w-0">
          
          {/* Document Loaders — collapsible toggle bar + content */}
          {!zenFullscreen && (
            <div className="bg-white border-b border-slate-200 shrink-0">
              <button
                onClick={() => setShowLoader(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50 transition"
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
                    className="w-full h-20 p-2.5 border border-slate-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-700 font-sans"
                  />
                </div>
              )}

              {/* Tab: URL web crawler */}
              {activeInputMode === "web" && (
                <form onSubmit={handleFetchUrlSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <input
                      type="text"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="ejemplo: es.wikipedia.org/wiki/Tinta_electrónica"
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                    />
                    <button
                      type="submit"
                      disabled={loadingWeb || !webUrl}
                      className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:bg-neutral-300 disabled:cursor-not-allowed shrink-0"
                    >
                      {loadingWeb ? <><Clock className="w-3.5 h-3.5 animate-spin" /> Cargando...</> : "Importar"}
                    </button>
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-600 cursor-pointer">
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
                    <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{webError}</span>
                    </div>
                  )}

                  <div className="p-2.5 bg-orange-50/15 rounded-lg border border-neutral-300/40 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Arrastra el botón a tus marcadores para importar webs con un clic.
                    </p>
                    <a
                      href={`javascript:(function(){var d=window.location.href;window.open('${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?url='+encodeURIComponent(d),'_blank');})();`}
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
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center gap-1 ${
                    isDragOver ? "border-neutral-800 bg-neutral-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  <FileText className="w-6 h-6 text-neutral-400" />
                  <p className="text-xs font-medium text-neutral-700">
                    {lastUploadedFileName ? (
                      <span className="text-neutral-800 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> {lastUploadedFileName}</span>
                    ) : (
                      "Arrastra tu PDF aquí o haz clic para seleccionar"
                    )}
                  </p>
                </div>
              )}

              {pdfError && (
                <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] flex items-start gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{pdfError}</span>
                </div>
              )}

            </div>
              )}
            </div>
          )}

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
            onToggleFullscreen={() => setZenFullscreen(prev => !prev)}
            onAddStudyNote={() => {
              // Capture any selected text on the reader or default to empty
              const selection = window.getSelection()?.toString().trim() || highlightedText;
              setQuickNoteText(selection);
              setQuickNoteComment("");
              setQuickNoteModalOpen(true);
            }}
          />

          {/* Intelligent Study Notebook & AI Assistant — collapsible */}
          {!zenFullscreen && (
            <div className="bg-white border-t border-slate-200 shadow-md select-text shrink-0">
              <button
                onClick={() => setShowNotebook(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50 transition"
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
                  className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 text-center transition-all flex items-center justify-center gap-2 ${
                    activeNotebookTab === "notebook"
                      ? "border-neutral-900 text-neutral-900 bg-neutral-50/50"
                      : "border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50/20"
                  }`}
                >
                  📖 MI CUADERNO DE APUNTES
                  <span className="bg-neutral-900 text-white rounded-full text-[9px] px-1.5 py-0.5">
                    {studyNotes.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveNotebookTab("ai")}
                  className={`flex-1 py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 text-center transition-all flex items-center justify-center gap-2 ${
                    activeNotebookTab === "ai"
                      ? "border-neutral-900 text-neutral-900 bg-neutral-50/50"
                      : "border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50/20"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-neutral-700" />
                  ASISTENTE DE CONSULTA IA
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="p-4 md:p-6 flex flex-col gap-3 min-h-[220px]">
                
                {/* TAB 1: MI CUADERNO DE APUNTES */}
                {activeNotebookTab === "notebook" && (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">HERRAMIENTA DEL ESTUDIANTE</span>
                        <h4 className="text-xs font-bold text-neutral-700">Extractores, Fragmentos de Configuración y Código Guardados</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {studyNotes.length > 0 && (
                          <button
                            onClick={handleDownloadNotesAsMarkdown}
                            className="p-1.5 px-3 bg-neutral-950 text-white hover:bg-neutral-900 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                            title="Descarga todo tu resumen de curso ordenado en un genial archivo Markdown (.md)"
                          >
                            📥 Descargar Guía .md
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setQuickNoteText(highlightedText || "");
                            setQuickNoteComment("");
                            setQuickNoteModalOpen(true);
                          }}
                          className="p-1.5 px-3 border border-neutral-300 hover:border-neutral-500 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                        >
                          ➕ Apunte Manual
                        </button>
                      </div>
                    </div>

                    {studyNotes.length === 0 ? (
                      <div className="py-8 text-center bg-neutral-50/70 rounded-xl border border-dashed border-neutral-200 flex flex-col items-center justify-center p-4">
                        <span className="text-2xl mb-2">📒</span>
                        <p className="text-xs font-bold text-neutral-700 leading-normal">¡Tu Cuaderno de Apuntes está vacío!</p>
                        <p className="text-[11px] text-neutral-500 max-w-md mt-1 leading-relaxed">
                          Mientras tomas tu curso, puedes **seleccionar bloques de código, diagramas o explicaciones** directamente en la hoja de lectura y presionar el botón físico <span className="font-bold underline">✍ Anotar</span> en el marco de tu dispositivo para agregarlo aquí permanentemente con tus comentarios.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {studyNotes.map((note) => (
                          <div 
                            key={note.id} 
                            className="p-4 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-205 rounded-xl transition duration-150 relative group/noteItem"
                          >
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="absolute top-3 right-3 text-neutral-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded text-xs opacity-0 group-hover/noteItem:opacity-100"
                              title="Eliminar este apunte"
                            >
                              ✕ Quitar
                            </button>

                            <div className="flex flex-wrap items-center gap-2 mb-2 select-none">
                              <span className="text-[10px] uppercase font-mono bg-neutral-200/60 px-2 py-0.5 rounded text-neutral-600">
                                Pág. {note.page}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                • {note.timestamp}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-500 truncate max-w-sm italic">
                                &ldquo;{note.sourceTitle}&rdquo;
                              </span>
                            </div>

                            {note.highlightedText && (
                              <div className="mb-2 bg-neutral-100/70 p-3 rounded-lg border border-neutral-300/40 text-xs font-mono text-neutral-800 whitespace-pre-wrap leading-relaxed select-text overflow-x-auto">
                                {note.highlightedText}
                              </div>
                            )}

                            {note.manualNote && (
                              <div className="text-xs text-neutral-700 leading-relaxed font-sans flex items-start gap-1 p-1 bg-amber-50/30 rounded border border-amber-200/30">
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
                  <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">INTELIGENCIA EMULA E-INK</span>
                        <h4 className="text-xs font-bold text-neutral-700">Análisis y aclaración rápida de lecciones técnicas</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Provider + Model compact selector */}
                        <select
                          value={aiProvider}
                          onChange={(e) => {
                            const p = e.target.value;
                            setAiProvider(p);
                            localStorage.setItem("EINK_AI_PROVIDER", p);
                            const defaults: Record<string, string> = { groq: "llama-3.3-70b-versatile", gemini: "gemini-2.0-flash", deepseek: "deepseek-chat" };
                            const newModel = defaults[p] || "llama-3.3-70b-versatile";
                            setAiModel(newModel);
                            localStorage.setItem("EINK_AI_MODEL", newModel);
                          }}
                          className="text-[10px] bg-neutral-100 border border-neutral-200 rounded-md px-2 py-1 text-neutral-700 font-medium cursor-pointer"
                        >
                          <option value="groq">Groq</option>
                          <option value="gemini">Gemini</option>
                          <option value="deepseek">DeepSeek</option>
                        </select>
                        <select
                          value={aiModel}
                          onChange={(e) => { setAiModel(e.target.value); localStorage.setItem("EINK_AI_MODEL", e.target.value); }}
                          className="text-[10px] bg-neutral-100 border border-neutral-200 rounded-md px-2 py-1 text-neutral-600 font-mono cursor-pointer max-w-[160px]"
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
                              <option value="deepseek-chat">DeepSeek V3</option>
                              <option value="deepseek-reasoner">DeepSeek R1</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAiAssist("summarize")}
                          disabled={aiLoading}
                          className="p-1.5 px-3 bg-[#f1f5f9] hover:bg-neutral-800 hover:text-white rounded-lg text-xs font-semibold text-neutral-700 transition flex items-center gap-1 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          title="Resume la selección o la página activa en viñetas"
                        >
                          Resumir Selección
                        </button>
                        <button
                          onClick={() => handleAiAssist("simplify")}
                          disabled={aiLoading}
                          className="p-1.5 px-3 bg-[#f1f5f9] hover:bg-neutral-800 hover:text-white rounded-lg text-xs font-semibold text-neutral-700 transition flex items-center gap-1 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          title="Reescribe el texto de forma más simple y amena"
                        >
                          Simplificar Texto
                        </button>
                        <button
                          onClick={() => handleAiAssist("explain")}
                          disabled={aiLoading}
                          className="p-1.5 px-3 bg-[#f1f5f9] hover:bg-neutral-800 hover:text-white rounded-lg text-xs font-semibold text-neutral-700 transition flex items-center gap-1 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          title="Explica brevemente los conceptos de la selección"
                        >
                          Explicar Conceptos
                        </button>
                      </div>
                    </div>

                    {/* Input feedback showing highlighted context */}
                    {highlightedText && (
                      <div className="flex items-start gap-1 p-2 bg-neutral-50 rounded border border-neutral-100 text-xs text-neutral-500 leading-snug select-text">
                        <CornerDownRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-400" />
                        <span className="italic line-clamp-2">
                          Contexto seleccionado: &ldquo;{highlightedText}&rdquo;
                        </span>
                        <button 
                          onClick={() => setHighlightedText("")}
                          className="ml-auto text-[10px] text-neutral-400 hover:text-neutral-900 border px-1 rounded hover:bg-neutral-200 transition shrink-0"
                          title="Borrar selección manual"
                        >
                          Quitar Contexto
                        </button>
                      </div>
                    )}

                    {/* Output block for parsed summary */}
                    {aiLoading && (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                        <p className="text-xs font-mono font-medium text-slate-500 animate-pulse flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-spin" /> Procesando con {aiModel}...
                        </p>
                      </div>
                    )}

                    {aiError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                        {aiError}
                      </div>
                    )}

                    {aiAssistantText ? (
                      <div className="p-4 bg-yellow-50/55 rounded-lg border border-yellow-200/40 text-xs sm:text-sm text-neutral-800 leading-relaxed font-serif relative transition animate-in fade-in duration-300 h-32 md:h-44 overflow-y-auto">
                        <span className="absolute top-2.5 right-2.5 text-[9px] bg-neutral-900 text-white rounded px-1.5 py-0.5 font-mono select-none">
                          Análisis de Tinta Digital
                        </span>
                        <div className="pr-12 whitespace-pre-line text-xs font-sans">
                          {aiAssistantText}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                        Selecciona o destaca cualquier texto de la lección y haz clic en los botones superiores para pedir ayuda explicativa al asistente IA.
                      </div>
                    )}

                    <p className="text-[10px] text-neutral-400 italic">
                      *Tip de productividad: Puedes **seleccionar/resaltar** cualquier palabra o comando con el ratón directamente sobre la hoja del lector y hacer clic en los botones de arriba para sintetizar únicamente ese pasaje.
                    </p>
                  </div>
                )}

              </div>
            </div>
              )}
          </div>
          )}
        </main>
      </div>

      {/* SUCCESS STUDY NOTE TOAST GHOST NOTIFICATION */}
      {noteSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce select-none">
          <span className="text-emerald-400">✓</span>
          <span>{noteSuccessToast}</span>
        </div>
      )}

      {/* QUICK NOTE ENTRY DIALOG MODAL */}
      {quickNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-3 border-b pb-2">
              <span className="text-lg">📒</span>
              <h3 className="text-sm font-bold text-neutral-900">
                Añadir Apunte de Curso al Cuaderno
              </h3>
            </div>

            <form onSubmit={handleSaveStudyNote} className="space-y-4">
              <div className="flex flex-col gap-1 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">Origen de lectura:</span>
                <span className="bg-neutral-100 p-2 rounded border truncate font-medium">
                  {sourceTitle} — Página {activeInputMode === "pdf" ? pdfCurrentPage : textCurrentPage}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700 flex justify-between items-center">
                  <span>Texto o Bloque de Código de Referencia:</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Opcional</span>
                </label>
                <textarea
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Pega aquí el trozo de código o las instrucciones de configuración que quieres guardar..."
                  className="w-full h-24 p-2.5 text-xs font-mono bg-neutral-50 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-neutral-700">
                  Mi Explicación, Comando o Apunte Personal:
                </label>
                <textarea
                  value={quickNoteComment}
                  onChange={(e) => setQuickNoteComment(e.target.value)}
                  placeholder="Escribe por qué es importante, comandos clave, notas rápidas de clase..."
                  className="w-full h-20 p-2.5 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 text-xs">
                <p className="text-[10px] text-neutral-400 leading-normal max-w-xs">
                  *Este apunte se guardará en la memoria local y podrás descargarlo en formato Markdown al finalizar el día de estudio.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickNoteModalOpen(false)}
                    className="px-3.5 py-2 hover:bg-neutral-100 text-neutral-700 rounded-lg font-medium border border-neutral-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-950 text-white rounded-lg font-bold shadow transition"
                  >
                    Guardar Apunte
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
