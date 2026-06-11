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

const sidebarThemeClasses = {
  "paper-white": {
    aside: "bg-[#ecebe6] border-[#c2c2bd] text-neutral-800",
    buttonSelected: "bg-[#fcfbf9] border-[#a1a19b] font-medium text-neutral-900",
    buttonUnselected: "bg-[#ecebe6]/50 border-[#d8d7d3] hover:bg-[#dcdcd7] text-neutral-750",
    select: "bg-[#fcfbf9] border-[#d8d7d3] text-[#4b5563]"
  },
  "warm-sepia": {
    aside: "bg-[#e4dcbf] border-[#c8bfa3] text-[#2c2b26]",
    buttonSelected: "bg-[#f4ebd0] border-[#b0a584] font-medium text-[#2c2b26]",
    buttonUnselected: "bg-[#ebdcca]/50 border-[#dacfb9] hover:bg-[#decfa7]/60 text-[#5c523f]",
    select: "bg-[#f4ebd0] border-[#dacfb9] text-[#5c523f]"
  },
  "cool-grey": {
    aside: "bg-[#d1d5db] border-[#9aa4b3] text-neutral-800",
    buttonSelected: "bg-[#e5e7eb] border-[#8e9aa8] font-medium text-neutral-900",
    buttonUnselected: "bg-[#d8dbdf]/50 border-[#cbd5e1] hover:bg-[#acb5bd] text-neutral-700",
    select: "bg-[#e5e7eb] border-[#cbd5e1] text-neutral-700"
  },
  "dark-ink": {
    aside: "bg-[#18191b] border-[#2d2e30] text-[#cfcfcf]",
    buttonSelected: "bg-[#2d2e30] border-[#374151] font-medium text-white",
    buttonUnselected: "bg-[#1d1e20]/50 border-[#2a2b2d] hover:bg-[#2a2b2d] text-neutral-400",
    select: "bg-[#1d1e20] border-[#2d2e30] text-[#cfcfcf]"
  }
};

export default function Sidebar({ config, onChangeConfig, onRefreshTrigger }: SidebarProps) {
  const currentTheme = sidebarThemeClasses[config.contrastMode] || sidebarThemeClasses["warm-sepia"];

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
    <aside className={`w-full md:w-64 ${currentTheme.aside} border-r p-4 flex flex-col gap-4 select-none shadow-sm shrink-0 overflow-y-auto text-xs`}>
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-350/20">
        <Settings className="w-4 h-4 text-neutral-500" />
        <h2 className="font-semibold tracking-tight text-sm">Controles e-Ink</h2>
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

      {/* E-Ink Reflectivo Preset Card */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex flex-col gap-1.5">
        <span className="font-semibold text-neutral-800 dark:text-amber-100 flex items-center gap-1">
          🕶️ Confort Visual Kindle
        </span>
        <p className="text-[10px] text-neutral-600 dark:text-neutral-350 leading-normal">
          Apaga el brillo de pantalla, activa la ultra-atenuación y reduce la luz azul al 100%.
        </p>
        <button
          onClick={() => onChangeConfig({ brightness: 0, blueLightFilter: 100, applyFilterGlobally: true, ultraDim: true, screenProfile: 'high_brightness' })}
          className="w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition text-center font-bold text-[10px] shadow-sm select-none cursor-pointer uppercase tracking-wider"
        >
          Apagar Brillo y Luz Azul
        </button>
      </div>

      {/* Contrast paper type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 opacity-70">
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

      {/* Perfil de Pantalla */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 opacity-70">
          <Tablet className="w-3.5 h-3.5" /> Perfil de Pantalla
        </label>
        <div className="flex flex-col gap-1 mt-1">
          <button
            onClick={() => onChangeConfig({ screenProfile: 'standard' })}
            className={`p-2 rounded-lg border text-left flex justify-between items-center transition ${
              config.screenProfile === 'standard'
                ? currentTheme.buttonSelected
                : currentTheme.buttonUnselected
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold">Pantalla Estándar (LCD/IPS)</span>
              <span className="text-[9px] opacity-70">Filtro normal y brillo estándar</span>
            </div>
            {config.screenProfile === 'standard' && <span className="text-xs">✓</span>}
          </button>
          <button
            onClick={() => onChangeConfig({ screenProfile: 'amoled' })}
            className={`p-2 rounded-lg border text-left flex justify-between items-center transition ${
              config.screenProfile === 'amoled'
                ? currentTheme.buttonSelected
                : currentTheme.buttonUnselected
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold">OLED / AMOLED (Negro Puro)</span>
              <span className="text-[9px] opacity-70">Apaga píxeles en modo oscuro</span>
            </div>
            {config.screenProfile === 'amoled' && <span className="text-xs">✓</span>}
          </button>
          <button
            onClick={() => onChangeConfig({ screenProfile: 'high_brightness' })}
            className={`p-2 rounded-lg border text-left flex justify-between items-center transition ${
              config.screenProfile === 'high_brightness'
                ? currentTheme.buttonSelected
                : currentTheme.buttonUnselected
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold">Alto Brillo (Huawei/Premium)</span>
              <span className="text-[9px] opacity-70">Curva de atenuación agresiva</span>
            </div>
            {config.screenProfile === 'high_brightness' && <span className="text-xs">✓</span>}
          </button>
        </div>
      </div>

      {/* Fonts Configuration */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 opacity-70">
          <Type className="w-3.5 h-3.5" /> Tipografía del Lector
        </label>
        <div className="flex flex-col gap-1.5 mt-1">
          {fontOptions.map((opt) => (
            <button
              key={opt.font}
              onClick={() => onChangeConfig({ fontFamily: opt.font })}
              className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition ${
                config.fontFamily === opt.font
                  ? currentTheme.buttonSelected
                  : currentTheme.buttonUnselected
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

        {/* Brightness / Frontlight Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>💡 Brillo de Pantalla (Frontlight)</span>
            <span className="font-mono font-bold">{config.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={config.brightness}
            onChange={(e) => onChangeConfig({ brightness: parseInt(e.target.value) })}
            className="w-full accent-neutral-800 cursor-pointer"
          />
          <p className="text-[10px] text-neutral-400">0% simula papel reflectivo físico sin emisión de luz propia.</p>
        </div>

        {/* Global Filter Switch */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group pt-1">
          <div className="flex flex-col">
            <span>Filtro en Toda la Pantalla</span>
            <span className="text-[9px] text-neutral-400 font-normal">Protege la barra lateral y cabecera</span>
          </div>
          <input
            type="checkbox"
            checked={config.applyFilterGlobally}
            onChange={(e) => onChangeConfig({ applyFilterGlobally: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>

        {/* Ultra-Atenuacion (Filtro Agresivo) */}
        <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer group pt-1">
          <div className="flex flex-col">
            <span>Ultra-Atenuación (Capa Oscura)</span>
            <span className="text-[9px] text-neutral-400 font-normal">Para pantallas de alto brillo / noche</span>
          </div>
          <input
            type="checkbox"
            checked={config.ultraDim}
            onChange={(e) => onChangeConfig({ ultraDim: e.target.checked })}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-800"></div>
        </label>
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
            className={`w-full text-xs border rounded-lg p-2 accent-neutral-800 ${currentTheme.select}`}
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
