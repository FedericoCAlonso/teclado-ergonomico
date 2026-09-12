import React from 'react';
import type { TypingSessionMetrics, CostBreakdown } from '../types';

interface MetricsPanelProps {
  metrics: TypingSessionMetrics;
  currentCost: CostBreakdown;
  qwertyCost: CostBreakdown;
  onResetSession: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  currentCost,
  qwertyCost,
  onResetSession
}) => {
  // Cálculo de ventaja ergonómica sobre QWERTY
  const costDiff = qwertyCost.totalCost > 0
    ? Math.round(((qwertyCost.totalCost - currentCost.totalCost) / qwertyCost.totalCost) * 100)
    : 0;

  const movementDiff = qwertyCost.movementCost > 0
    ? Math.round(((qwertyCost.movementCost - currentCost.movementCost) / qwertyCost.movementCost) * 100)
    : 0;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg space-y-3 text-slate-200">
      {/* Cabecera y Estadísticas de Escritura en Vivo */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Telemetría en Vivo
        </h3>
        <button
          onClick={onResetSession}
          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
        >
          Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">WPM</div>
          <div className="text-lg font-black text-cyan-400">{metrics.wpm}</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Precisión</div>
          <div className="text-lg font-black text-emerald-400">{metrics.accuracy}%</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">KSPC</div>
          <div className="text-lg font-black text-amber-400">{metrics.kspc}</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-medium">Distancia</div>
          <div className="text-lg font-black text-purple-400">{metrics.totalDistancePx} <span className="text-[9px] font-normal text-slate-500">px</span></div>
        </div>
      </div>

      {/* Comparativa Biomecánica vs QWERTY */}
      <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 text-[11px]">Costo Ergonómico (Índice de Fatiga):</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400">{currentCost.totalCost} pts</span>
            {costDiff !== 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${costDiff > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {costDiff > 0 ? `-${costDiff}% esfuerzo` : `+${Math.abs(costDiff)}% esfuerzo`}
              </span>
            )}
          </div>
        </div>

        {/* Desglose de Factores del Modelo Biomecánico */}
        <div className="space-y-1.5 text-[10px]">
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Distancia Biomecánica Polar</span>
              <span className="text-slate-300">{currentCost.movementCost} pts ({movementDiff > 0 ? `-${movementDiff}% vs QWERTY` : 'base'})</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentCost.movementCost * 10)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Esfuerzo de Alcance (Zona Neutra)</span>
              <span className="text-slate-300">{currentCost.reachCost} pts</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentCost.reachCost * 10)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Sombra de Oclusión del Pulgar</span>
              <span className="text-slate-300">{currentCost.occlusionCost} pts</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentCost.occlusionCost * 10)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
