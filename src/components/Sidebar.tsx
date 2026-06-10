import React from "react";
import { 
  ReaderConfig, 
  ContrastMode, 
  FontFamily 
} from "../types";
import { 
  Type, 
  Settings, 
  RefreshCw, 
  FileText, 
  AlignJustify, 
  Eye, 
  Sliders, 
  Tablet, 
  Sparkles 
} from "lucide-react";

interface SidebarProps {
  config: ReaderConfig;
  onChangeConfig: (newConfig: Partial<ReaderConfig>) => void;
  onRefreshTrigger: () => void;
}

export default function Sidebar({ config, onChangeConfig, onRefreshTrigger }: SidebarProps) {
  const contrastOptions: { mode: ContrastMode; name: string; bg: string; text: string; border: string }[] = [
    { mode: "paper-white", name: "Papel Claro", bg: "bg-[#fcfbf9]", text: "text-[#1e1e1e]", border: "border-[#d8d7d3]" },
    { mode: "warm-sepia", name: "Sepia Cálido", bg: "bg-[#f3efe2]", text: "text-[#2a2a26]", border: "border-[#dacfb9]" },
    { mode: "cool-grey", name: "Gris Slate", bg: "bg-[#e5e7eb]", text: "text-[#222222]", border: "border-[#cbd5e1]" },
    { mode: "dark-ink", name: "Tinta Oscura", bg: "bg-[#1c1d1f]", text: "text-[#cfcfcf]", border: "border-[#374151]" },
  ];

  const fontOptions: { font: FontFamily; label: string; preview: string }[] = [
    { font: "serif-lora", label: "Serifa Elegante", preview: "Lora / Editorial" },
    { font: "sans-inter", label: "Sans Moderna", preview: "Inter / Confort" },
    { font: "mono-jetbrains", label: "Mono Técnico", preview: "JetBrains Mono" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white/80 backdrop-blur-md border-r border-[#e2e8f0] p-4 flex flex-col gap-4 select-none shadow-sm shrink-0 overflow-y-auto text-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
        <Settings className="w-4 h-4 text-neutral-600" />
        <h2 className="font-semibold text-neutral-800 tracking-tight text-sm">Controles e-Ink</h2>
      </div>

      {/* Manual Refresh Action */}
      <button
        onClick={onRefreshTrigger}
        id="refresh-hardware-btn"
        className="w-full py-2 px-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition active:scale-98 flex items-center justify-center gap-1.5 font-medium text-xs shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refrescar Pantalla
      </button>

      {/* Contrast paper type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> Tipo de Papel
        </label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {contrastOptions.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => onChangeConfig({ contrastMode: opt.mode })}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${opt.bg} ${opt.text} ${opt.border} ${
                config.contrastMode === opt.mode 
                  ? "ring-2 ring-neutral-900 border-transparent font-semibold shadow-smScale" 
                  : "hover:scale-102 opacity-80"
              }`}
            >
              <span className="text-xs select-none">{opt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fonts Configuration */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Type className="w-3.5 h-3.5" /> Tipografía del Lector
        </label>
        <div className="flex flex-col gap-1.5 mt-1">
          {fontOptions.map((opt) => (
            <button
              key={opt.font}
              onClick={() => onChangeConfig({ fontFamily: opt.font })}
              className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition ${
                config.fontFamily === opt.font
                  ? "bg-neutral-100 border-neutral-400 font-medium"
                  : "bg-white/50 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm text-neutral-800">{opt.label}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{opt.preview}</span>
              </div>
              <span className="text-xs text-neutral-400">&#10003;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density and sizes */}
      <div className="flex flex-col gap-3 border-t border-[#f1f5f9] pt-3">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Sliders className="w-3 h-3" /> Ajustes de Texto
        </span>

        {/* Size Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Tamaño de Letra</span>
            <span className="font-mono font-bold">{config.fontSize}px</span>
          </div>
          <input
            type="range"
            min="14"
            max="32"
            value={config.fontSize}
            onChange={(e) => onChangeConfig({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-neutral-800 cursor-pointer text-xs"
          />
        </div>

        {/* Line Height Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Espaciado de Línea</span>
            <span className="font-mono font-bold">{config.lineHeight}x</span>
          </div>
          <input
            type="range"
            min="1.4"
            max="2.2"
            step="0.1"
            value={config.lineHeight}
            onChange={(e) => onChangeConfig({ lineHeight: parseFloat(e.target.value) })}
            className="w-full accent-neutral-800 cursor-pointer"
          />
        </div>

        {/* Contrast Multiplier */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Contraste Digital</span>
            <span className="font-mono font-bold">{(config.contrastLevel * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.05"
            value={config.contrastLevel}
            onChange={(e) => onChangeConfig({ contrastLevel: parseFloat(e.target.value) })}
            className="w-full accent-neutral-800 cursor-pointer"
          />
        </div>

        {/* Blue Light Filter */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>🌙 Filtro Luz Azul</span>
            <span className="font-mono font-bold">{config.blueLightFilter}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={config.blueLightFilter}
            onChange={(e) => onChangeConfig({ blueLightFilter: parseInt(e.target.value) })}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <p className="text-[10px] text-neutral-400">Reduce fatiga ocular eliminando luz azul. 80% recomendado.</p>
        </div>
      </div>

      {/* Screen Effects Tuning */}
      <div className="flex flex-col gap-3 border-t border-[#f1f5f9] pt-3">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Simulación Hardware
        </span>

        {/* Ghosting Amount */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Efecto Ghosting (Residuo)</span>
            <span className="font-mono font-bold">{config.ghostingLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            value={config.ghostingLevel}
            onChange={(e) => onChangeConfig({ ghostingLevel: parseInt(e.target.value) })}
            className="w-full accent-neutral-800 cursor-pointer"
          />
          <p className="text-[10px] text-neutral-400">Genera una sombra sutil de la lectura anterior para imitar paneles de tinta física.</p>
        </div>

        {/* Grain simulation toggle */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group mt-1">
          <span>Textura Granulada Mate</span>
          <input
            type="checkbox"
            checked={config.paperGrainActive}
            onChange={(e) => onChangeConfig({ paperGrainActive: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>

        {/* Grayscale filter togglers */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group">
          <span>Clasificación Escala de Grises</span>
          <input
            type="checkbox"
            checked={config.grayscaleActive}
            onChange={(e) => onChangeConfig({ grayscaleActive: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>

        {/* Dithering toggle */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group font-sans">
          <span>Simulación Rejilla Pixel</span>
          <input
            type="checkbox"
            checked={config.ditheringActive}
            onChange={(e) => onChangeConfig({ ditheringActive: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>

        {/* Bezel frame mode */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group">
          <span className="flex items-center gap-1">Marcos de Dispositivo <Tablet className="w-3.5 h-3.5 inline text-neutral-400" /></span>
          <input
            type="checkbox"
            checked={config.bezelModeActive}
            onChange={(e) => onChangeConfig({ bezelModeActive: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>

        {/* Text alignment layout switcher */}
        <div className="flex items-center justify-between mt-1 text-xs text-neutral-700">
          <span>Alineamiento de Texto</span>
          <div className="flex rounded-md border border-neutral-200 overflow-hidden">
            <button
              onClick={() => onChangeConfig({ textAlignment: "left" })}
              className={`p-1.5 xs:p-2 ${config.textAlignment === "left" ? "bg-neutral-800 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              title="Alineado Izquierda"
            >
              <AlignJustify className="w-3.5 h-3.5 transform -scale-x-100" />
            </button>
            <button
              onClick={() => onChangeConfig({ textAlignment: "justify" })}
              className={`p-1.5 xs:p-2 border-l border-neutral-200 ${config.textAlignment === "justify" ? "bg-neutral-800 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              title="Ajuste Justificado"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Refresh Pages rate */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Refrescar cada</span>
            <span className="font-mono font-semibold">
              {config.refreshRate === 0 ? "Solo Manual" : `${config.refreshRate} pág.`}
            </span>
          </div>
          <select
            value={config.refreshRate}
            onChange={(e) => onChangeConfig({ refreshRate: parseInt(e.target.value) })}
            className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-2 accent-neutral-800"
          >
            <option value="0">Desactivado (Solo Manual)</option>
            <option value="1">Cada 1 Cambio de Página</option>
            <option value="3">Cada 3 Cambios de Página</option>
            <option value="5">Cada 5 Cambios de Página</option>
            <option value="10">Cada 10 Cambios de Página</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
