import React, { useState, useMemo, useRef } from 'react';
import type { LayoutDefinition, KeyDefinition, ShiftMode } from './types';
import type { Point2D } from './biomechanics/polarModel';
import { radialSingleThumbLayout, qwertyBaselineLayout } from './layouts';
import { TypingTracker } from './metrics/typingTracker';
import { evaluateLayoutCost } from './optimizer/costFunction';
import { VirtualKeyboardCanvas } from './components/VirtualKeyboardCanvas';
import { CursorToolbar } from './components/CursorToolbar';
import { MetricsPanel } from './components/MetricsPanel';
import { LayoutControls } from './components/LayoutControls';
import { Trash2, Copy, Check, Info, ShieldCheck, Activity } from 'lucide-react';

const BENCHMARK_TEXT = 'el veloz murcielago hindu 123 comia feliz cardillo y kiwi. esta cancion en espanol tiene acentuacion y emocion';

const ACCENTED_VOWELS: Record<string, string> = {
  'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
  'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'
};

/**
 * Resuelve la primera letra preferente en teclas compartidas (J·H, Z·X, K·W)
 * basada en la fonotáctica y ortografía del español.
 */
function resolveSharedInitialChar(keyDef: KeyDefinition, beforeText: string): string {
  if (!keyDef.alternateChar) return keyDef.char;
  const lastChar = beforeText.slice(-1).toLowerCase();

  // Regla fonotáctica para J·H:
  // Tras 'c' (dígrafo "ch" común en castellano) o 'p' ("ph"), se usa 'h'.
  if (keyDef.char === 'j' && (lastChar === 'c' || lastChar === 'p')) {
    return keyDef.alternateChar; // 'h'
  }

  // Regla fonotáctica para Z·X:
  // Tras 'e' (prefijos y raíces "ex-": examen, éxito, explicar, extra, texto), se usa 'x'.
  if (keyDef.char === 'z' && (lastChar === 'e' || lastChar === 't')) {
    return keyDef.alternateChar; // 'x'
  }

  // Regla fonotáctica para K·W:
  // Tras 's' ("sw": switch, swing), se usa 'w'.
  if (keyDef.char === 'k' && lastChar === 's') {
    return keyDef.alternateChar; // 'w'
  }

  return keyDef.char;
}

export const App: React.FC = () => {
  const [currentLayout, setCurrentLayout] = useState<LayoutDefinition>(radialSingleThumbLayout);
  const [inputText, setInputText] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [accentPending, setAccentPending] = useState<boolean>(false);
  const [shiftState, setShiftState] = useState<ShiftMode>('none');
  const [targetSentence, setTargetSentence] = useState<string>('');
  const [showOcclusionShadow, setShowOcclusionShadow] = useState<boolean>(false);
  const [showBiomechanicArcs, setShowBiomechanicArcs] = useState<boolean>(true);
  const [autoAccentEnabled, setAutoAccentEnabled] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Registro de última pulsación en teclas compartidas para detectar doble pulsación (toggle alternativo)
  const lastSharedTapRef = useRef<{
    keyId: string;
    charTyped: string;
    timestamp: number;
    cursorPos: number;
  } | null>(null);

  const [tracker] = useState(() => new TypingTracker());
  const [metrics, setMetrics] = useState(() => tracker.getMetrics());

  // Costo ergonómico evaluado sobre el texto actual o el benchmark estándar
  const sampleEvaluationText = useMemo(() => {
    return inputText.length >= 10 ? inputText : BENCHMARK_TEXT;
  }, [inputText]);

  const currentLayoutCost = useMemo(() => {
    return evaluateLayoutCost(currentLayout, sampleEvaluationText);
  }, [currentLayout, sampleEvaluationText]);

  const qwertyCost = useMemo(() => {
    return evaluateLayoutCost(qwertyBaselineLayout, sampleEvaluationText);
  }, [sampleEvaluationText]);

  // Manejador del movimiento del cursor (gesto de deslizar o flechas)
  const handleMoveCursor = (delta: number) => {
    lastSharedTapRef.current = null;
    setCursorPos((prev) => {
      const next = prev + delta;
      return Math.max(0, Math.min(inputText.length, next));
    });
  };

  const handleToggleShift = () => {
    setShiftState((prev) => (prev === 'none' ? 'shift' : prev === 'shift' ? 'caps' : 'none'));
  };

  // Manejador central de pulsación de teclas con soporte para Shift, pares fonotácticos y tildes
  const handleKeyPress = (char: string, keyDef: KeyDefinition, touchPoint: Point2D) => {
    // 0. Tecla de mayúsculas (Shift / Caps)
    if (char === 'shift' || (keyDef.type === 'action' && keyDef.id.includes('shift'))) {
      handleToggleShift();
      return;
    }

    // 1. Manejo del botón de tilde dedicado (´ - Dead Key)
    if (char === '´') {
      if (accentPending) {
        // Segundo toque consecutivo a ´ -> escribe el carácter ´
        const before = inputText.slice(0, cursorPos);
        const after = inputText.slice(cursorPos);
        const newText = before + '´' + after;
        setInputText(newText);
        setCursorPos(cursorPos + 1);
        setAccentPending(false);
        lastSharedTapRef.current = null;
        tracker.recordKeystroke(touchPoint, '´');
        setMetrics(tracker.getMetrics(newText.length));
      } else {
        // Activa modo tilde pendiente para la siguiente vocal
        setAccentPending(true);
      }
      return;
    }

    // 2. Si la tilde está pendiente y se presiona otra tecla
    if (accentPending) {
      const isUpper = shiftState !== 'none';
      const targetVowel = isUpper ? char.toUpperCase() : char.toLowerCase();
      const accented = ACCENTED_VOWELS[targetVowel];
      if (accented) {
        // Vocal acentuada directamente (a -> á, e -> é, A -> Á, etc.)
        const before = inputText.slice(0, cursorPos);
        const after = inputText.slice(cursorPos);
        const newText = before + accented + after;
        setInputText(newText);
        setCursorPos(cursorPos + 1);
        setAccentPending(false);
        if (shiftState === 'shift') setShiftState('none');
        lastSharedTapRef.current = null;
        tracker.recordKeystroke(touchPoint, accented);
        setMetrics(tracker.getMetrics(newText.length));
        return;
      } else {
        // No era vocal: insertar tilde suelta y continuar con el carácter presionado
        const effectiveChar = (shiftState !== 'none' && char.length === 1) ? char.toUpperCase() : char;
        const before = inputText.slice(0, cursorPos);
        const after = inputText.slice(cursorPos);
        const newText = before + '´' + effectiveChar + after;
        setInputText(newText);
        setCursorPos(cursorPos + 1 + effectiveChar.length);
        setAccentPending(false);
        if (shiftState === 'shift') setShiftState('none');
        lastSharedTapRef.current = null;
        tracker.recordKeystroke(touchPoint, effectiveChar);
        setMetrics(tracker.getMetrics(newText.length));
        return;
      }
    }

    // 3. Borrado (Backspace ⌫) en la posición actual del cursor
    if (char === '\b') {
      if (cursorPos > 0) {
        const before = inputText.slice(0, cursorPos - 1);
        const after = inputText.slice(cursorPos);
        const newText = before + after;
        setInputText(newText);
        setCursorPos(cursorPos - 1);
        lastSharedTapRef.current = null;
        tracker.recordKeystroke(touchPoint, '\b');
        setMetrics(tracker.getMetrics(newText.length));
      }
      return;
    }

    // 4. Salto de línea (Enter ↵)
    if (char === '\n') {
      const before = inputText.slice(0, cursorPos);
      const after = inputText.slice(cursorPos);
      const newText = before + '\n' + after;
      setInputText(newText);
      setCursorPos(cursorPos + 1);
      lastSharedTapRef.current = null;
      tracker.recordKeystroke(touchPoint, '\n');
      setMetrics(tracker.getMetrics(newText.length));
      return;
    }

    // 5. Tabulador (Tab ⇥)
    if (char === '\t') {
      const before = inputText.slice(0, cursorPos);
      const after = inputText.slice(cursorPos);
      const newText = before + '\t' + after;
      setInputText(newText);
      setCursorPos(cursorPos + 1);
      lastSharedTapRef.current = null;
      tracker.recordKeystroke(touchPoint, '\t');
      setMetrics(tracker.getMetrics(newText.length));
      return;
    }

    // 6. Doble pulsación en teclas compartidas (J·H, Z·X, K·W) para alternar
    const now = Date.now();
    const isSharedKey = Boolean(keyDef.alternateChar);
    if (
      isSharedKey &&
      lastSharedTapRef.current &&
      lastSharedTapRef.current.keyId === keyDef.id &&
      now - lastSharedTapRef.current.timestamp < 550 &&
      cursorPos === lastSharedTapRef.current.cursorPos &&
      cursorPos > 0
    ) {
      const lastCharTyped = lastSharedTapRef.current.charTyped;
      const isUpper = lastCharTyped === lastCharTyped.toUpperCase() && lastCharTyped !== lastCharTyped.toLowerCase();
      const altChar = keyDef.alternateChar!;
      const toggledChar = (lastCharTyped.toLowerCase() === keyDef.char.toLowerCase())
        ? (isUpper ? altChar.toUpperCase() : altChar.toLowerCase())
        : (isUpper ? keyDef.char.toUpperCase() : keyDef.char.toLowerCase());

      const before = inputText.slice(0, cursorPos - 1);
      const after = inputText.slice(cursorPos);
      const newText = before + toggledChar + after;
      setInputText(newText);
      lastSharedTapRef.current = {
        keyId: keyDef.id,
        charTyped: toggledChar,
        timestamp: now,
        cursorPos: cursorPos
      };
      tracker.recordKeystroke(touchPoint, toggledChar);
      setMetrics(tracker.getMetrics(newText.length));
      return;
    }

    // 7. Primera pulsación o tecla estándar
    let finalChar = char;
    if (isSharedKey) {
      finalChar = resolveSharedInitialChar(keyDef, inputText.slice(0, cursorPos));
    }

    if (shiftState !== 'none' && finalChar.length === 1) {
      finalChar = finalChar.toUpperCase();
      if (shiftState === 'shift') {
        setShiftState('none');
      }
    }

    const before = inputText.slice(0, cursorPos);
    const after = inputText.slice(cursorPos);
    const newText = before + finalChar + after;
    setInputText(newText);
    const nextCursorPos = cursorPos + finalChar.length;
    setCursorPos(nextCursorPos);

    if (isSharedKey) {
      lastSharedTapRef.current = {
        keyId: keyDef.id,
        charTyped: finalChar,
        timestamp: now,
        cursorPos: nextCursorPos
      };
    } else {
      lastSharedTapRef.current = null;
    }

    tracker.recordKeystroke(touchPoint, finalChar);
    setMetrics(tracker.getMetrics(newText.length));
  };

  const handleClearText = () => {
    setInputText('');
    setCursorPos(0);
    setAccentPending(false);
    setShiftState('none');
    lastSharedTapRef.current = null;
    tracker.reset();
    setMetrics(tracker.getMetrics());
  };

  const handleCopyText = async () => {
    if (!inputText) return;
    await navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPreset = (presetText: string) => {
    setTargetSentence(presetText);
    handleClearText();
  };

  const textBeforeCursor = inputText.slice(0, cursorPos);
  const textAfterCursor = inputText.slice(cursorPos);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-5 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Barra de Navegación / Header */}
      <header className="w-full max-w-md flex items-center justify-between py-2 border-b border-slate-800 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight text-white m-0">
              Cotizador Polar <span className="text-cyan-400 font-medium text-xs">v1.2</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium m-0">
              Arco Completo • Números Directos • Tilde Dedicada • Cursor Gestual
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-all"
          title="Principios de Diseño Biomecánico"
        >
          <Info className="w-4 h-4" />
        </button>
      </header>

      {/* Guía Explicativa Desplegable */}
      {showGuide && (
        <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 mb-3 shadow-xl space-y-2 text-xs leading-relaxed text-slate-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Nuevas Mejoras Ergonómicas
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p>
            <strong>1. Arco desde el Extremo Izquierdo:</strong> El pulgar abarca naturalmente todo el ancho de la pantalla (x ≈ 24px a 336px), brindando teclas con espaciado amplio y sin apiñamiento.
          </p>
          <p>
            <strong>2. Fila Directa de Números (1-0):</strong> Acceso instantáneo a los dígitos en el arco superior con un solo toque, sin pantallas secundarias.
          </p>
          <p>
            <strong>3. Tecla de Tilde Dedicada (´):</strong> Comportamiento de tecla muerta tradicional: pulsa <kbd className="px-1 bg-slate-800 rounded text-amber-300">´</kbd> y luego la vocal deseada (<kbd>a</kbd>, <kbd>e</kbd>, <kbd>i</kbd>, <kbd>o</kbd>, <kbd>u</kbd>) para obtener <kbd>á</kbd>, <kbd>é</kbd>, <kbd>í</kbd>, <kbd>ó</kbd>, <kbd>ú</kbd>.
          </p>
          <p>
            <strong>4. Control de Cursor por Gestos:</strong> Desliza horizontalmente el pulgar sobre la barra de espacio (<kbd>ESPACIO ⟷</kbd>) para mover el cursor con precisión milimétrica carácter a carácter.
          </p>
        </div>
      )}

      {/* Frase Objetivo (Modo Práctica) */}
      {targetSentence && (
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-xl p-2 mb-2 text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
            <span>Objetivo de Escritura:</span>
            <button
              onClick={() => setTargetSentence('')}
              className="text-slate-500 hover:text-slate-300"
            >
              Quitar
            </button>
          </div>
          <p className="text-slate-200 font-serif italic text-sm">{targetSentence}</p>
        </div>
      )}

      {/* Área de Entrada / Buffer de Texto con Cursor Interactivo */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-2 shadow-lg relative">
        <div
          className="min-h-[56px] max-h-[90px] overflow-y-auto font-mono text-sm leading-relaxed text-slate-100 break-words whitespace-pre-wrap cursor-text"
          onClick={(e) => {
            // Permite posicionar el cursor al hacer click en el texto
            const target = e.currentTarget;
            const textLen = inputText.length;
            const clickRatio = (e.clientX - target.getBoundingClientRect().left) / target.clientWidth;
            setCursorPos(Math.min(textLen, Math.max(0, Math.round(clickRatio * textLen))));
          }}
        >
          {inputText ? (
            <>
              {textBeforeCursor}
              <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse align-middle mx-0.5 shadow-sm shadow-cyan-400"></span>
              {textAfterCursor}
            </>
          ) : (
            <span className="text-slate-600 italic select-none">
              Escribe tocando el teclado. Desliza en la barra de espacio para mover el cursor...
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/70 pt-2 mt-2 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">
            {inputText.length} caracteres
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyText}
              disabled={!inputText}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleClearText}
              disabled={!inputText}
              className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 disabled:opacity-40 transition-all active:scale-95"
              title="Borrar todo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Navegación del Cursor, Estado de Tilde y Signos Rápidos */}
      <CursorToolbar
        cursorPos={cursorPos}
        totalLength={inputText.length}
        accentPending={accentPending}
        shiftState={shiftState}
        onMoveCursor={handleMoveCursor}
        onToggleAccent={() => setAccentPending(!accentPending)}
        onToggleShift={handleToggleShift}
        onInsertChar={(char) => handleKeyPress(char, { id: 'k_quick', char, display: char, type: 'punctuation', x: 0, y: 0, radius: 0 }, { x: 180, y: 160 })}
      />

      {/* Lienzo del Teclado Táctil Interactivo */}
      <main className="w-full my-2">
        <VirtualKeyboardCanvas
          layout={currentLayout}
          accentPending={accentPending}
          shiftState={shiftState}
          showOcclusionShadow={showOcclusionShadow}
          showBiomechanicArcs={showBiomechanicArcs}
          onKeyPress={handleKeyPress}
          onMoveCursor={handleMoveCursor}
        />
      </main>

      {/* Panel de Telemetría en Vivo & Comparativa Ergonómica */}
      <section className="w-full mb-3">
        <MetricsPanel
          metrics={metrics}
          currentCost={currentLayoutCost}
          qwertyCost={qwertyCost}
          onResetSession={handleClearText}
        />
      </section>

      {/* Controles de Layout, Visualizadores y Textos de Muestra */}
      <section className="w-full mb-6">
        <LayoutControls
          currentLayout={currentLayout}
          onSelectLayout={(l) => setCurrentLayout(l)}
          showBiomechanicArcs={showBiomechanicArcs}
          onToggleBiomechanicArcs={setShowBiomechanicArcs}
          showOcclusionShadow={showOcclusionShadow}
          onToggleOcclusionShadow={setShowOcclusionShadow}
          autoAccentEnabled={autoAccentEnabled}
          onToggleAutoAccent={setAutoAccentEnabled}
          onSelectPresetText={handleSelectPreset}
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-600 pb-4">
        Investigación y Prototipado Biomecánico © 2026 • Diseñado desde cero para Español
      </footer>
    </div>
  );
};

export default App;
