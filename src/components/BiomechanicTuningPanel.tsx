import React, { useState } from 'react';
import { Sliders, Copy, Check, RotateCcw, Crosshair, Maximize2 } from 'lucide-react';
import type { RadialTuningParams } from '../layouts';

interface BiomechanicTuningPanelProps {
  params: RadialTuningParams;
  onChange: (params: RadialTuningParams) => void;
  onReset: () => void;
}

export const BiomechanicTuningPanel: React.FC<BiomechanicTuningPanelProps> = ({
  params,
  onChange,
  onReset
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const summaryString = `Pivote X: ${params.pivotX}px | Pivote Y: ${params.pivotY}px | Escala Arcos: ${params.arcScale}% | Tamaño Teclas: ${params.keyScale}%`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (key: keyof RadialTuningParams, value: number) => {
    onChange({
      ...params,
      [key]: value
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-3 mb-2 shadow-xl backdrop-blur select-none">
      {/* Cabecera del Panel de Ajuste */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
              Ajuste Biomecánico en Vivo
              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800/50 font-mono">
                4 Deslizadores
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 m-0 leading-tight">
              Calibra posición y tamaño con tu pulgar
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-cyan-400 text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-750 transition-colors"
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-in fade-in">
          {/* Fila de 4 Deslizadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Posición X */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-cyan-400" />
                  1. Posición X (Pivote):
                </span>
                <span className="font-mono font-bold text-cyan-400 text-xs">
                  {params.pivotX} px
                </span>
              </div>
              <input
                type="range"
                min="260"
                max="390"
                step="1"
                value={params.pivotX}
                onChange={(e) => handleChange('pivotX', Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                <span>260px</span>
                <span className="text-slate-400">Base: 332px</span>
                <span>390px</span>
              </div>
            </div>

            {/* 2. Posición Y */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-emerald-400" />
                  2. Posición Y (Pivote):
                </span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {params.pivotY} px
                </span>
              </div>
              <input
                type="range"
                min="260"
                max="390"
                step="1"
                value={params.pivotY}
                onChange={(e) => handleChange('pivotY', Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                <span>260px</span>
                <span className="text-slate-400">Base: 325px</span>
                <span>390px</span>
              </div>
            </div>

            {/* 3. Escala / Radio de los Arcos */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  3. Escala de Arcos:
                </span>
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {params.arcScale}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="125"
                step="1"
                value={params.arcScale}
                onChange={(e) => handleChange('arcScale', Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                <span>75%</span>
                <span className="text-slate-400">Base: 100%</span>
                <span>125%</span>
              </div>
            </div>

            {/* 4. Tamaño de Teclas */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-purple-400" />
                  4. Tamaño de Teclas:
                </span>
                <span className="font-mono font-bold text-purple-400 text-xs">
                  {params.keyScale}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="135"
                step="1"
                value={params.keyScale}
                onChange={(e) => handleChange('keyScale', Number(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                <span>75%</span>
                <span className="text-slate-400">Base: 100%</span>
                <span>135%</span>
              </div>
            </div>
          </div>

          {/* Resumen de Valores Actuales y Botones de Acción */}
          <div className="bg-slate-950 border border-cyan-500/20 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="font-mono text-[10.5px] text-cyan-300 leading-snug break-all text-center sm:text-left">
              {summaryString}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Copiar valores ajustados para pasarlos al chat"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Valores'}</span>
              </button>

              <button
                onClick={onReset}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 active:scale-95 transition-all"
                title="Restablecer valores por defecto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
