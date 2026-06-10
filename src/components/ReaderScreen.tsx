import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { ReaderConfig, ContrastMode, FontFamily } from "../types";
import { PdfPageRenderer } from "./PdfPageRenderer";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  HelpCircle,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react";

interface ReaderScreenProps {
  config: ReaderConfig;
  title: string;
  contentType: "paste" | "web" | "pdf";
  textContent: string; // Used for text and web (markdown)
  pdfDocument: any; // loaded via PDF.js on CDN
  pdfTotalPages: number;
  pdfCurrentPage: number;
  onPdfPageChange: (page: number) => void;
  onPageTurnEvent: () => void; // Trigger ghosting refresh
  ghostingText: string; // Faint text background shadow
  textCurrentPage: number;
  onTextPageChange: (page: number) => void;
  onAddStudyNote: () => void;
  zenFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function ReaderScreen({
  config,
  title,
  contentType,
  textContent,
  pdfDocument,
  pdfTotalPages,
  pdfCurrentPage,
  onPdfPageChange,
  onPageTurnEvent,
  ghostingText,
  textCurrentPage,
  onTextPageChange,
  onAddStudyNote,
  zenFullscreen,
  onToggleFullscreen,
}: ReaderScreenProps) {
  const [pdfScale, setPdfScale] = useState(1.3);
  const [showHelperModal, setShowHelperModal] = useState(false);

  // Pagination for Text / Web Markdown content
  const charactersPerPage = 1700; // Optimal length per reader sheet
  
  // Split content based on structural linebreaks to preserve headlines and paragraphs
  const getPages = (): string[] => {
    if (!textContent) return ["No hay contenido para mostrar. Selecciona un método de lectura arriba para empezar."];
    
    const paragraphs = textContent.split(/\n\n+/);
    const resultPages: string[] = [];
    let currentAccumulate = "";

    for (const para of paragraphs) {
      if ((currentAccumulate + para).length > charactersPerPage && currentAccumulate.length > 0) {
        resultPages.push(currentAccumulate.trim());
        currentAccumulate = para + "\n\n";
      } else {
        currentAccumulate += para + "\n\n";
      }
    }
    
    if (currentAccumulate.trim()) {
      resultPages.push(currentAccumulate.trim());
    }

    return resultPages.length > 0 ? resultPages : [""];
  };

  const pages = getPages();
  const totalPages = contentType === "pdf" ? pdfTotalPages : pages.length;
  
  // Zero-based index for reading page sheets safely bounded by actual slice count
  const currentPageIndex = Math.min(Math.max(0, textCurrentPage - 1), Math.max(0, pages.length - 1));
  const activePage = contentType === "pdf" ? pdfCurrentPage : currentPageIndex + 1;

  // Auto correction if page count contracts below active range due to text changes
  useEffect(() => {
    if (pages.length > 0 && textCurrentPage > pages.length) {
      onTextPageChange(pages.length);
    }
  }, [pages.length, textCurrentPage, onTextPageChange]);

  // Turn page action
  const handlePrevPage = () => {
    if (contentType === "pdf") {
      if (pdfCurrentPage > 1) {
        onPageTurnEvent();
        onPdfPageChange(pdfCurrentPage - 1);
      }
    } else {
      if (currentPageIndex > 0) {
        onPageTurnEvent();
        onTextPageChange(currentPageIndex);
      }
    }
  };

  const handleNextPage = () => {
    if (contentType === "pdf") {
      if (pdfCurrentPage < pdfTotalPages) {
        onPageTurnEvent();
        onPdfPageChange(pdfCurrentPage + 1);
      }
    } else {
      if (currentPageIndex < pages.length - 1) {
        onPageTurnEvent();
        onTextPageChange(currentPageIndex + 2);
      }
    }
  };

  // Contrast styling map
  const contrastClasses: Record<ContrastMode, { container: string; paper: string; text: string; header: string }> = {
    "paper-white": {
      container: "bg-[#f2f1ed]",
      paper: "bg-[#fcfbf9] border-[#e1e0db] text-[#1c1c1a]",
      text: "text-[#2e2e2a]",
      header: "text-neutral-500 border-neutral-200"
    },
    "warm-sepia": {
      container: "bg-[#ebdfce]",
      paper: "bg-[#f4ebd0] border-[#decfa7] text-[#2c2b26]",
      text: "text-[#3c3b36]",
      header: "text-[#888171] border-[#e8dcb9]"
    },
    "cool-grey": {
      container: "bg-[#d8dbdf]",
      paper: "bg-[#e5e7eb] border-[#cbd5e1] text-[#222222]",
      text: "text-[#334155]",
      header: "text-neutral-500 border-neutral-300"
    },
    "dark-ink": {
      container: "bg-[#111213]",
      paper: "bg-[#1d1e20] border-[#2d2e30] text-[#dedede]",
      text: "text-[#cdcdcd]",
      header: "text-neutral-500 border-neutral-800"
    }
  };

  // Font classes map
  const fontClasses: Record<FontFamily, string> = {
    "serif-lora": "font-serif tracking-normal leading-relaxed",
    "sans-inter": "font-sans tracking-tight leading-relaxed",
    "mono-jetbrains": "font-mono tracking-tighter text-sm leading-loose"
  };

  const selectedContrast = contrastClasses[config.contrastMode];
  const selectedFont = fontClasses[config.fontFamily];

  // Check which content page to output
  const renderReadingContent = () => {
    if (contentType === "pdf") {
      if (!pdfDocument) {
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
            <FileText className="w-16 h-16 text-neutral-400 stroke-1 animate-pulse" />
            <p className="mt-4 text-neutral-500 font-medium">Renderizando páginas del PDF...</p>
            <p className="text-xs text-neutral-400 mt-1">Cargando motor de lectura de tinta digital.</p>
          </div>
        );
      }
      return (
        <div className="overflow-x-auto py-4 flex justify-center">
          <PdfPageRenderer
            pdfDocument={pdfDocument}
            pageNum={pdfCurrentPage}
            scale={pdfScale}
            config={config}
          />
        </div>
      );
    }

    // Otherwise render pasted or web parsed texts (Markdown Supported)
    const currentMarkdown = pages[currentPageIndex] || "";
    
    return (
      <div 
        className={`w-full prose max-w-none ${selectedFont}`}
        style={{
          fontSize: `${config.fontSize}px`,
          lineHeight: config.lineHeight,
          textAlign: config.textAlignment === "justify" ? "justify" : "left",
          hyphens: "auto",
        }}
      >
        <Markdown
          components={{
            img: ({ src, alt }) => {
              const [showColor, setShowColor] = useState(false);
              const [isZoomed, setIsZoomed] = useState(false);

              if (!src) return null;

              return (
                <div className="my-6 relative group inline-block w-full select-none">
                  <div className="relative overflow-hidden rounded-xl border border-neutral-300/70 shadow-sm bg-neutral-100/50 max-w-full inline-block">
                    <img
                      src={src}
                      alt={alt || "Ilustración técnica"}
                      referrerPolicy="no-referrer"
                      className={`max-w-full h-auto max-h-[400px] object-contain block transition-all duration-300 ${
                        showColor 
                          ? "grayscale-0 opacity-100" 
                          : "grayscale opacity-80 group-hover:opacity-95"
                      } ${
                        config.contrastMode === "dark-ink" ? "mix-blend-lighten" : "mix-blend-multiply"
                      }`}
                      style={{
                        transform: isZoomed ? "scale(1.2)" : "scale(1)",
                        cursor: "zoom-in",
                        transition: "transform 0.25s ease, filter 0.3s ease, opacity 0.3s ease"
                      }}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                    
                    {/* Caption bar */}
                    <div className="bg-neutral-100/90 dark:bg-neutral-800/90 text-[11px] px-3.5 py-2 text-neutral-600 dark:text-neutral-300 border-t border-neutral-200/50 italic font-sans flex justify-between items-center">
                      <span>{alt || "Diagrama / Captura ilustrativa"}</span>
                      <span className="text-[9px] uppercase font-mono tracking-widest opacity-70">Ilustración e-Ink</span>
                    </div>

                    {/* Image controls overlay */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 select-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowColor(!showColor);
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-white/95 text-neutral-800 text-xs shadow border border-neutral-200 hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-1 font-semibold active:scale-95 cursor-pointer"
                        title={showColor ? "Volver a escala de grises" : "Inspeccionar en color original"}
                      >
                        {showColor ? "👁️ e-Ink Mate" : "🎨 Ver a Color"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomed(!isZoomed);
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-white/95 text-neutral-800 text-xs shadow border border-neutral-200 hover:bg-neutral-900 hover:text-white transition-all font-semibold active:scale-95 cursor-pointer"
                        title="Acercar ilustración"
                      >
                        {isZoomed ? "🔍 Ajustar" : "🔍 Zoom"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            },
            pre: ({ children }) => {
              const [copied, setCopied] = useState(false);
              
              // Safely extract string content
              const getCodeString = (nodes: React.ReactNode): string => {
                if (typeof nodes === "string") return nodes;
                if (Array.isArray(nodes)) return nodes.map(getCodeString).join("");
                if (React.isValidElement(nodes)) {
                  const props = nodes.props as { children?: React.ReactNode };
                  return getCodeString(props.children);
                }
                return "";
              };

              const codeText = getCodeString(children).trim();

              const handleCopy = () => {
                navigator.clipboard.writeText(codeText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              };

              return (
                <div className="relative group my-5 w-full select-text">
                  <div className="bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-300/60 py-1.5 px-4 rounded-t-lg text-[10px] font-mono tracking-widest text-neutral-500 flex justify-between items-center select-none">
                    <span>BLOQUE DE CÓDIGO - EXPLICACIÓN</span>
                    <button
                      onClick={handleCopy}
                      className="text-[9px] uppercase font-bold text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-200 transition-all flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-300/40 hover:bg-white active:scale-95 cursor-pointer"
                    >
                      {copied ? "✓ Copiado" : "📋 Copiar Código"}
                    </button>
                  </div>
                  <pre className="p-4 bg-neutral-50 dark:bg-neutral-900/40 rounded-b-lg border-b border-l border-r border-neutral-300/60 overflow-x-auto font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-all relative">
                    {children}
                  </pre>
                </div>
              );
            },
            code: ({ className, children, ...props }) => {
              return (
                <code className="bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300/60 px-1 py-0.5 rounded font-mono text-xs text-neutral-800 dark:text-neutral-200 mx-0.5" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {currentMarkdown}
        </Markdown>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col ${zenFullscreen ? 'p-0' : 'p-4 md:p-8'} overflow-hidden transition-colors duration-500 ${selectedContrast.container}`}>
      {/* Upper toolbar */}
      <div className={`${zenFullscreen ? 'max-w-full px-4 md:px-8' : 'max-w-3xl mx-auto'} w-full flex items-center justify-between gap-4 mb-2 select-none ${zenFullscreen ? 'py-2' : 'mb-4'}`}>
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">LECTOR DIGITAL ACTIVO</p>
          <h1 className="text-sm font-semibold truncate text-neutral-800" title={title || "Sin título"}>
            {title || "Borrador de Lectura Libre"}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {contentType === "pdf" && pdfDocument && (
            <div className="flex items-center border border-neutral-300/60 bg-white rounded-md overflow-hidden mr-2">
              <button
                onClick={() => setPdfScale(prev => Math.max(0.8, prev - 0.15))}
                className="p-1 px-2 text-neutral-600 hover:bg-neutral-100 transition border-r border-neutral-200"
                title="Alejar Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs px-2.5 font-mono text-neutral-500">{Math.round(pdfScale * 100)}%</span>
              <button
                onClick={() => setPdfScale(prev => Math.min(2.5, prev + 0.15))}
                className="p-1 px-2 text-neutral-600 hover:bg-neutral-100 transition border-l border-neutral-200"
                title="Acercar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              zenFullscreen 
                ? "bg-neutral-950 text-white border-neutral-800 hover:bg-neutral-900" 
                : "bg-white/60 text-neutral-600 hover:text-neutral-900 hover:bg-white border-neutral-200"
            }`}
            title={zenFullscreen ? "Salir del modo Concentración (Pantalla Completa)" : "Fijar lectura a Pantalla Completa"}
          >
            {zenFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Modo Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Pantalla Completa</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowHelperModal(true)}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg bg-white/60 hover:bg-white border border-neutral-200"
            title="Beneficios de Salud Visual"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Chassis (Device frame or pure sheet) */}
      <div className={`w-full flex-1 flex flex-col items-center justify-center relative ${zenFullscreen ? '' : 'max-w-3xl mx-auto'}`}>
        <div 
          className={`w-full transition-all duration-300 relative ${
            config.bezelModeActive 
              ? "border-[22px] md:border-[32px] border-neutral-800 rounded-[28px] md:rounded-[40px] shadow-2xl relative" 
              : zenFullscreen ? "" : "border rounded-xl shadow-lg border-neutral-300/40"
          }`}
          style={{ width: "100%" }}
        >
          {/* Main Paper Sheet */}
          <div 
            id="reader-paper-sheet"
            className={`w-full ${zenFullscreen ? 'min-h-screen' : 'min-h-[500px] md:min-h-[640px]'} ${zenFullscreen ? 'px-4 sm:px-8 md:px-16 lg:px-24 py-6 md:py-10' : 'p-6 md:p-12'} pb-16 flex flex-col justify-between border relative overflow-y-auto select-text ${selectedContrast.paper} reading-sheet`}
            style={{
              filter: `
                contrast(${config.contrastLevel})
                brightness(${1.0 - (config.blueLightFilter / 250)})
                sepia(${config.blueLightFilter / 100 * 0.5})
                grayscale(${config.grayscaleActive && contentType !== "pdf" ? "100%" : "0%"})
              `
            }}
          >
            {/* SVG Paper texture layer — coarse cellulose fiber */}
            {config.paperGrainActive && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.10] mix-blend-multiply z-10" 
                style={{ filter: "url(#paper-grain)" }}
              />
            )}

            {/* Fine paper micro-texture — simulates paper pulp at close range */}
            {config.paperGrainActive && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-multiply z-[11]" 
                style={{ filter: "url(#paper-grain-fine)" }}
              />
            )}

            {/* Dithering overlay — e-ink microcapsule simulation */}
            {config.ditheringActive && (
              <div 
                className={`absolute inset-0 pointer-events-none z-20 ${config.contrastMode === "dark-ink" ? "opacity-[0.06]" : "opacity-[0.09]"} ${
                  config.contrastMode === "dark-ink" ? "grid-dither-dark" : "grid-dither"
                }`}
              />
            )}

            {/* Ghosting Background Trace Layer — simulates e-ink particle residue */}
            {config.ghostingLevel > 0 && ghostingText && (
              <div 
                className="absolute inset-0 pointer-events-none select-none overflow-hidden z-[2]"
                style={{
                  opacity: config.ghostingLevel / 180,
                  padding: zenFullscreen ? '2rem 5% 2rem 5%' : '1.5rem 3rem',
                  transform: "rotate(-0.5deg) scale(0.993) translate(2px, 3px)",
                  fontFamily: config.fontFamily === "serif-lora" ? "Lora" : config.fontFamily === "sans-inter" ? "Inter" : "JetBrains Mono",
                  fontSize: `${config.fontSize * 0.95}px`,
                  lineHeight: config.lineHeight,
                  color: config.contrastMode === "dark-ink" ? "rgba(200,200,200,0.5)" : "rgba(80,80,80,0.4)",
                  filter: "blur(0.3px)",
                }}
              >
                <div className="break-words whitespace-pre-wrap line-clamp-[30]">
                  {ghostingText.slice(0, 1800)}
                </div>
              </div>
            )}

            {/* Top Reading Meta */}
            <div className={`flex justify-between items-center text-[10px] font-mono border-b pb-2.5 mb-6 leading-none select-none z-[5] ${selectedContrast.header}`}>
              <span className="uppercase tracking-wider truncate max-w-[200px]">
                {title || "e-Reader Tinta Digital"}
              </span>
              <span>{Math.round((activePage / (totalPages || 1)) * 100)}% leído</span>
            </div>

            {/* Main Central Content Area */}
            <div className="flex-1 relative z-[5]">
              {renderReadingContent()}
            </div>

            {/* Bottom Status / Kindle-style Progress */}
            <div className={`flex justify-between items-center text-[10px] font-mono border-t pt-4 mt-8 select-none z-[5] ${selectedContrast.header}`}>
              <span>Tinta Papel v1.2</span>
              <span className="tracking-widest">
                PÁGINA {activePage} DE {totalPages || 1}
              </span>
            </div>
          </div>

          {/* Physical Bezel Home Button (renders nested if bezel is active) */}
          {config.bezelModeActive && (
            <div className="absolute -bottom-[20px] md:-bottom-[26px] left-1/2 transform -translate-x-1/2 flex flex-col items-center select-none z-40">
              <button
                onClick={onAddStudyNote}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-900 border-[1.5px] border-neutral-700 hover:border-neutral-500 shadow-md flex items-center justify-center transition hover:bg-neutral-800 active:scale-90 cursor-pointer scale-90 md:scale-100 group/bezelBtn text-neutral-400 hover:text-white"
                title="Capturar Apunte o Bloque de Código de esta lección"
              >
                <span className="text-xs md:text-sm font-bold group-hover/bezelBtn:scale-110 transition-transform">✍</span>
              </button>
              <span className="text-[7px] md:text-[8px] text-neutral-400/80 font-mono tracking-widest mt-0.5 uppercase">Anotar</span>
            </div>
          )}
        </div>

        {/* Page navigator buttons */}
        <div className="flex justify-between w-full mt-4 select-none px-4 max-w-xl">
          <button
            onClick={handlePrevPage}
            disabled={activePage <= 1}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
              activePage <= 1
                ? "bg-transparent text-neutral-400 border-neutral-300/40 cursor-not-allowed opacity-50"
                : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300 shadow-sm active:scale-98"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-xs text-neutral-500 font-mono flex items-center justify-center">
            Pág. {activePage} / {totalPages || 1}
          </span>

          <button
            onClick={handleNextPage}
            disabled={activePage >= totalPages}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
              activePage >= totalPages
                ? "bg-transparent text-neutral-400 border-neutral-300/40 cursor-not-allowed opacity-50"
                : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300 shadow-sm active:scale-98"
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded SVG Filters for Paper Grain — multi-layer for realistic cellulose texture */}
      <svg className="hidden" aria-hidden="true">
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="7" result="noise2" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" in="noise1" result="colored1" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" in="noise2" result="colored2" />
          <feBlend mode="multiply" in="colored1" in2="colored2" result="blended" />
          <feBlend mode="multiply" in="SourceGraphic" in2="blended" />
        </filter>
        <filter id="paper-grain-fine" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="3" seed="5" result="micro" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.03 0" in="micro" result="microColored" />
          <feBlend mode="multiply" in="SourceGraphic" in2="microColored" />
        </filter>
      </svg>

      {/* Visual Health Info Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-neutral-700" /> ¿Por qué protege tus ojos?
            </h3>
            
            <div className="space-y-3.5 text-sm text-neutral-600">
              <p>
                Las pantallas convencionales (móviles, ordenadores, tablets) emiten cantidades excesivas de <strong>luz azul de onda corta</strong> y brillo directo, lo que fatiga el músculo ocular, produce sequedad (síndrome de ojo seco) y altera la síntesis de melatonina, dañando los ciclos de sueño.
              </p>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex flex-col gap-2">
                <p className="text-xs font-semibold text-neutral-800 uppercase tracking-widest font-mono">Simulaciones incorporadas:</p>
                <ul className="text-xs space-y-1.5 list-disc pl-4 font-normal">
                  <li><strong>Tonalidad Mate:</strong> El papel sepia y gris reduce drásticamente el contraste excesivo que cansa la córnea.</li>
                  <li><strong>Filtro Dual Grayscale:</strong> Elimina el color RGB, reduciendo la sobresaturación y la sobrecarga sensorial del cerebro.</li>
                  <li><strong>Ruido Fractal de Textura:</strong> Mitiga la radiación directa emulando el reflejo difuso de la tinta física sobre celulosa.</li>
                  <li><strong>Dithering Electroporético:</strong> Suaviza el contorno del renderizado sub-pixel convirtiéndolo en microesferas de carbón.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-400 italic">
                *Nota: Para un efecto óptimo, lee en ambientes bien iluminados y reduce el brillo de luz de fondo físico de tu monitor.
              </p>
            </div>

            <button
              onClick={() => setShowHelperModal(false)}
              className="mt-6 w-full py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 transition rounded-lg font-medium text-xs shadow-sm"
            >
              Entendido, Seguir Leyendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
