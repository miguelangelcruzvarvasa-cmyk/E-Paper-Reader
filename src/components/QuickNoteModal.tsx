import React, { useState, useEffect } from "react";

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedText: string;
  sourceTitle: string;
  page: number;
  onSaveNote: (highlightedText: string, comment: string) => void;
}

export default function QuickNoteModal({
  isOpen,
  onClose,
  highlightedText,
  sourceTitle,
  page,
  onSaveNote
}: QuickNoteModalProps) {
  const [quickNoteText, setQuickNoteText] = useState("");
  const [quickNoteComment, setQuickNoteComment] = useState("");

  // Sync initial selection text when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuickNoteText(highlightedText || "");
      setQuickNoteComment("");
    }
  }, [isOpen, highlightedText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(quickNoteText, quickNoteComment);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
          <span className="text-lg">📒</span>
          <h3 className="text-sm font-bold text-neutral-900">
            Añadir Apunte de Curso al Cuaderno
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">Origen de lectura:</span>
            <span className="bg-neutral-100 p-2 rounded border truncate font-medium text-neutral-800">
              {sourceTitle} — Página {page}
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
              className="w-full h-24 p-2.5 text-xs font-mono bg-neutral-50 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none leading-relaxed text-neutral-800 bg-white"
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
              className="w-full h-20 p-2.5 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none leading-relaxed text-neutral-800 bg-white"
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
                onClick={onClose}
                className="px-3.5 py-2 hover:bg-neutral-100 text-neutral-700 rounded-lg font-medium border border-neutral-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-950 text-white rounded-lg font-bold shadow transition cursor-pointer"
              >
                Guardar Apunte
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
