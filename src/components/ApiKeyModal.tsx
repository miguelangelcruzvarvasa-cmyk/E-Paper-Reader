import React, { useState } from "react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: Array<{ provider: string; available: boolean; source: string }>;
  onSaveKey: (provider: string, key: string) => Promise<void>;
}

export default function ApiKeyModal({ isOpen, onClose, apiStatus, onSaveKey }: ApiKeyModalProps) {
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({ groq: "", gemini: "", deepseek: "" });
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSaveClick = async (provider: string) => {
    const key = tempKeys[provider]?.trim();
    if (!key) return;
    setSaving(prev => ({ ...prev, [provider]: true }));
    try {
      await onSaveKey(provider, key);
      setTempKeys(prev => ({ ...prev, [provider]: "" }));
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-neutral-200 relative">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            🔑 Configurar APIs de IA
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-neutral-500 mb-4">
          Pega tus claves API aquí. Se guardan solo en memoria del servidor durante esta sesión.
          Para uso permanente, configura las variables de entorno en tu hosting.
        </p>

        {(["groq", "gemini", "deepseek"] as const).map(provider => {
          const status = apiStatus.find(s => s.provider === provider);
          const label = provider === "groq" ? "Groq (Llama, Mixtral, Gemma)" : provider === "gemini" ? "Google Gemini" : "DeepSeek (V3, R1)";
          const placeholder = provider === "groq" ? "gsk_..." : provider === "gemini" ? "AIza..." : "sk-...";

          return (
            <div key={provider} className="mb-3 pb-3 border-b border-neutral-100 last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-700">{label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  status?.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500'
                }`}>
                  {status?.available ? `✓ ${status.source === 'env' ? '.env' : 'usuario'}` : '✗ Sin clave'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="password"
                  value={tempKeys[provider] || ""}
                  onChange={(e) => setTempKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                  placeholder={placeholder}
                  className="flex-1 p-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-700 font-mono text-neutral-800 bg-white"
                />
                <button
                  onClick={() => handleSaveClick(provider)}
                  disabled={!tempKeys[provider]?.trim() || saving[provider]}
                  className="px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 rounded-lg text-xs font-bold transition shrink-0"
                >
                  {saving[provider] ? "..." : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium text-xs transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
