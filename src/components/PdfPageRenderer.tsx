import React, { useEffect, useRef, useState } from "react";
import { ReaderConfig } from "../types";

interface PdfPageRendererProps {
  pdfDocument: any; // PDFJS Document object
  pageNum: number;
  scale: number;
  config: ReaderConfig;
}

export function PdfPageRenderer({ pdfDocument, pageNum, scale, config }: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    let active = true;
    setIsRendering(true);

    const renderPage = async () => {
      try {
        // Cancel existing render task if any to prevent canvas overlaps
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // Task already finished or failed to cancel, safe to ignore
          }
        }

        const page = await pdfDocument.getPage(pageNum);
        if (!active || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Set dimensions to match page viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        
        if (active) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err.name === "RenderingCancelledException" || err.name === "NS_ERROR_FAILURE" || err.message?.includes("cancelled")) {
          // Clean cancellation catch
          return;
        }
        console.error("Error al renderizar página PDF:", err);
        if (active) {
          setIsRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDocument, pageNum, scale]);

  return (
    <div className="relative flex justify-center w-full select-none">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 transition-all duration-200">
          <div className="px-4 py-2 bg-neutral-900/10 backdrop-blur-[2px] rounded-full border border-neutral-400/20 shadow-xs">
            <span className="text-xs font-mono text-neutral-700 font-bold animate-pulse">
              Cargando pigmentos de tinta...
            </span>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full shadow-md rounded-md transition-all duration-300"
        style={{
          boxShadow: config.contrastMode === "dark-ink" 
            ? "0 4px 20px rgba(0,0,0,0.6)" 
            : "0 4px 20px rgba(0,0,0,0.08)",
          border: config.contrastMode === "dark-ink"
            ? "1px solid #2d2e30"
            : "1px solid #dcdbd2",
          filter: config.grayscaleActive ? "grayscale(100%)" : "none",
        }}
      />
    </div>
  );
}
