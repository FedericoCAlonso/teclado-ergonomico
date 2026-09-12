import React from 'react';
import type { DecodedCandidate } from '../decoder/bayesianDecoder';

interface CandidateBarProps {
  candidates: DecodedCandidate[];
  onSelectCandidate: (char: string) => void;
  onInsertQuickChar: (char: string) => void;
}

const QUICK_ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'];

export const CandidateBar: React.FC<CandidateBarProps> = ({
  candidates,
  onSelectCandidate,
  onInsertQuickChar
}) => {
  return (
    <div className="flex flex-col gap-1 w-full max-w-md mx-auto px-2 py-1 bg-slate-900/80 backdrop-blur border-b border-slate-800 text-xs select-none">
      {/* Barra de Probabilidades Bayesianas */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-none">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-wider">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Bayes P(k|x,c):
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-start">
          {candidates.length === 0 ? (
            <span className="text-slate-500 italic text-[11px]">Toca una tecla para ver la inferencia</span>
          ) : (
            candidates.slice(0, 4).map((c, idx) => (
              <button
                key={`${c.char}-${idx}`}
                onClick={() => onSelectCandidate(c.char)}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  idx === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{c.key.display}</span>
                <span className="text-[10px] opacity-75">({Math.round(c.probability * 100)}%)</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Atajos Rápidos de Tildes y Signos Especiales Españoles */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-1">
        <span className="text-[10px] text-slate-500 uppercase font-semibold">Tildes/Signos:</span>
        <div className="flex items-center gap-1">
          {QUICK_ACCENTS.map(acc => (
            <button
              key={acc}
              onClick={() => onInsertQuickChar(acc)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 border border-slate-700/80 flex items-center justify-center font-medium text-xs active:scale-95 transition-all"
            >
              {acc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
