import React from 'react';
import { AVAILABLE_LAYOUTS, RADIAL_MAPPING_OPTIONS, type RadialLetterMapping } from '../layouts';
import type { LayoutDefinition } from '../types';

interface LayoutControlsProps {
  currentLayout: LayoutDefinition;
  onSelectLayout: (layout: LayoutDefinition) => void;
  letterMapping: RadialLetterMapping;
  onSelectLetterMapping: (mapping: RadialLetterMapping) => void;
  showBiomechanicArcs: boolean;
  onToggleBiomechanicArcs: (val: boolean) => void;
  showOcclusionShadow: boolean;
  onToggleOcclusionShadow: (val: boolean) => void;
  autoAccentEnabled: boolean;
  onToggleAutoAccent: (val: boolean) => void;
  onSelectPresetText: (text: string) => void;
}

const PRESET_TEXTS = [
  { label: 'Pangrama Completo', text: 'el veloz murcielago hindu comia feliz cardillo y kiwi.' },
  { label: 'Manifiesto Ergonómico', text: 'la tecnologia debe adaptarse a la anatomia del cuerpo humano y no al reves.' },
  { label: 'Tildes y Fonética', text: 'esta cancion y poesia en espanol tiene acentuacion y emocion sin esfuerzo.' },
];

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  currentLayout,
  onSelectLayout,
  letterMapping,
  onSelectLetterMapping,
  showBiomechanicArcs,
  onToggleBiomechanicArcs,
  showOcclusionShadow,
  onToggleOcclusionShadow,
  autoAccentEnabled,
  onToggleAutoAccent,
  onSelectPresetText
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg space-y-2.5 text-xs text-slate-300">
      {/* Selector de Comparativa: Mapeo de Letras (Opción Original vs QWERTY Friendly) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Comparativa de Distribución (14 Botones):
          </label>
          <span className="text-[9px] text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
            3 Modos
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {RADIAL_MAPPING_OPTIONS.map((opt) => {
            const isSelected = letterMapping === opt.id;
            let activeClasses = 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/80';
            if (isSelected) {
              if (opt.id === 'phonotactic') {
                activeClasses = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20 font-bold';
              } else if (opt.id === 'qwerty-horizontal') {
                activeClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20 font-bold';
              } else {
                activeClasses = 'bg-violet-500/20 text-violet-300 border-violet-500/60 shadow-sm shadow-violet-500/20 font-bold';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => onSelectLetterMapping(opt.id)}
                className={`px-2 py-2 rounded-xl border text-center transition-all active:scale-95 ${activeClasses}`}
                title={opt.description}
              >
                <div className="text-[11px] leading-tight font-bold">{opt.shortName}</div>
                <div className="text-[9px] opacity-75 mt-0.5">
                  {opt.id === 'phonotactic' ? 'Frecuencia' : opt.id === 'qwerty-horizontal' ? 'Horizontal' : 'Columnas'}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          {RADIAL_MAPPING_OPTIONS.find(o => o.id === letterMapping)?.description}
        </p>
      </div>

      {/* Selector de Layout General (Diestro / Zurdo / Comparativas) */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Distribución de Teclado:
        </label>
        <select
          value={currentLayout.id}
          onChange={(e) => {
            const found = AVAILABLE_LAYOUTS.find(l => l.id === e.target.value);
            if (found) onSelectLayout(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
        >
          {AVAILABLE_LAYOUTS.map(l => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Controles y Visualizadores Biomecánicos */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
        <button
          onClick={() => onToggleBiomechanicArcs(!showBiomechanicArcs)}
          className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
            showBiomechanicArcs
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span>Arcos de Confort</span>
          <span className="text-[9px] opacity-75">{showBiomechanicArcs ? 'Activo' : 'Oculto'}</span>
        </button>

        <button
          onClick={() => onToggleOcclusionShadow(!showOcclusionShadow)}
          className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
            showOcclusionShadow
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span>Sombra Pulgar</span>
          <span className="text-[9px] opacity-75">{showOcclusionShadow ? 'Activa' : 'Oculta'}</span>
        </button>

        <button
          onClick={() => onToggleAutoAccent(!autoAccentEnabled)}
          className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
            autoAccentEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span>Auto-Tildado</span>
          <span className="text-[9px] opacity-75">{autoAccentEnabled ? 'Activo' : 'Inactivo'}</span>
        </button>
      </div>

      {/* Frases de Entrenamiento para Test de Rendimiento */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Cargar Frase de Prueba:</span>
        <div className="flex flex-wrap gap-1">
          {PRESET_TEXTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPresetText(item.text)}
              className="text-[10px] px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg active:scale-95 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
