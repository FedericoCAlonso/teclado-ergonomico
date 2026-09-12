import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CursorToolbarProps {
  cursorPos: number;
  totalLength: number;
  accentPending: boolean;
  onMoveCursor: (delta: number) => void;
  onToggleAccent: () => void;
  onInsertChar: (char: string) => void;
}

const QUICK_SYMBOLS = ['¿', '?', '¡', '!', '«', '»', '"', '-'];

export const CursorToolbar: React.FC<CursorToolbarProps> = ({
  cursorPos,
  totalLength,
  accentPending,
  onMoveCursor,
  onToggleAccent,
  onInsertChar
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-md flex items-center justify-between gap-2 text-xs select-none">
      {/* Control y Navegación Precisa del Cursor */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Cursor:
        </span>
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onMoveCursor(-1)}
            disabled={cursorPos <= 0}
            className="p-1 rounded text-slate-300 hover:text-cyan-400 hover:bg-slate-800 disabled:opacity-20 active:scale-95 transition-all"
            title="Mover cursor a la izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] font-mono font-semibold text-cyan-400">
            {cursorPos}/{totalLength}
          </span>
          <button
            onClick={() => onMoveCursor(1)}
            disabled={cursorPos >= totalLength}
            className="p-1 rounded text-slate-300 hover:text-cyan-400 hover:bg-slate-800 disabled:opacity-20 active:scale-95 transition-all"
            title="Mover cursor a la derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Indicador y Botón Rápido de Tilde Muerta */}
      <button
        onClick={onToggleAccent}
        className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
          accentPending
            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400/60 hover:text-amber-300'
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span>Tilde [ ´ ]</span>
        {accentPending && <span className="text-[9px] bg-slate-950/80 text-amber-300 px-1 rounded">Vocal...</span>}
      </button>

      {/* Símbolos Rápidos del Español */}
      <div className="hidden sm:flex items-center gap-1">
        {QUICK_SYMBOLS.slice(0, 4).map(sym => (
          <button
            key={sym}
            onClick={() => onInsertChar(sym)}
            className="w-5 h-5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center text-[11px] active:scale-95 transition-all"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};
