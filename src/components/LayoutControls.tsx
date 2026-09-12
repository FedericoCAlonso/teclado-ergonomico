import React from 'react';
import { AVAILABLE_LAYOUTS } from '../layouts';
import type { LayoutDefinition } from '../types';

interface LayoutControlsProps {
  currentLayout: LayoutDefinition;
  onSelectLayout: (layout: LayoutDefinition) => void;
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
      {/* Selector de Layout */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Distribución de Teclado (Layout Fijo):
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
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
          {currentLayout.description}
        </p>
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
