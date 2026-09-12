import React, { useState, useMemo } from 'react';
import type { LayoutDefinition } from './types';
import { radialSingleThumbLayout, qwertyBaselineLayout } from './layouts';
import type { DecodedCandidate, DecodeResult } from './decoder/bayesianDecoder';
import { autoAccentBuffer } from './decoder/bayesianDecoder';
import { TypingTracker } from './metrics/typingTracker';
import { evaluateLayoutCost } from './optimizer/costFunction';
import { VirtualKeyboardCanvas } from './components/VirtualKeyboardCanvas';
import { CandidateBar } from './components/CandidateBar';
import { MetricsPanel } from './components/MetricsPanel';
import { LayoutControls } from './components/LayoutControls';
import { Sparkles, Trash2, Copy, Check, Info, ShieldCheck, Activity } from 'lucide-react';

const BENCHMARK_TEXT = 'el veloz murcielago hindu comia feliz cardillo y kiwi. esta cancion en espanol tiene acentuacion y emocion';

export const App: React.FC = () => {
  const [currentLayout, setCurrentLayout] = useState<LayoutDefinition>(radialSingleThumbLayout);
  const [inputText, setInputText] = useState<string>('');
  const [targetSentence, setTargetSentence] = useState<string>('');
  const [candidates, setCandidates] = useState<DecodedCandidate[]>([]);
  const [showOcclusionShadow, setShowOcclusionShadow] = useState<boolean>(true);
  const [showBiomechanicArcs, setShowBiomechanicArcs] = useState<boolean>(true);
  const [autoAccentEnabled, setAutoAccentEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

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

  // Manejador central de teclas y gestos procesados por el decodificador bayesiano
  const handleKeyProcessed = (result: DecodeResult, touchPoint: { x: number; y: number }) => {
    setCandidates(result.candidates);
    const char = result.char;

    let newText = inputText;

    if (char === '\b') {
      newText = inputText.slice(0, -1);
      tracker.recordKeystroke(touchPoint, '\b');
    } else if (char === '\n') {
      newText = inputText + '\n';
      tracker.recordKeystroke(touchPoint, '\n');
    } else if (char === ' ') {
      // Si el auto-tildado está activo, se procesa la última palabra escrita antes de añadir el espacio
      const textToSpace = autoAccentEnabled ? autoAccentBuffer(inputText) : inputText;
      newText = textToSpace + ' ';
      tracker.recordKeystroke(touchPoint, ' ');
    } else {
      newText = inputText + char;
      tracker.recordKeystroke(touchPoint, char);
    }

    setInputText(newText);
    setMetrics(tracker.getMetrics(newText.length));
  };

  // Inserción manual desde la barra de candidatos o atajos
  const handleInsertCandidate = (char: string) => {
    const newText = inputText + char;
    tracker.recordKeystroke({ x: currentLayout.width / 2, y: currentLayout.height / 2 }, char);
    setInputText(newText);
    setMetrics(tracker.getMetrics(newText.length));
  };

  const handleClearText = () => {
    setInputText('');
    tracker.reset();
    setMetrics(tracker.getMetrics());
    setCandidates([]);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-5 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Barra de Navegación / Header */}
      <header className="w-full max-w-md flex items-center justify-between py-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight text-white m-0">
              Cotizador Polar <span className="text-cyan-400 font-medium text-xs">v1.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium m-0">
              Teclado Ergonómico No-QWERTY para Español
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
              Principios de la Arquitectura Polar
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p>
            <strong>1. Layout Fijo e Inmutable:</strong> A diferencia de teclados predictivos dinámicos que mueven las teclas, aquí la posición es constante para consolidar la <em>memoria muscular táctil</em>.
          </p>
          <p>
            <strong>2. Biomecánica del Pulgar (CMC):</strong> El pulgar pivota desde la esquina inferior. Moverse en arco requiere menor torque que estirar/encoger la falange. El arco central (r=215px) contiene las letras más frecuentes del español (<em>E, A, O, S, R, N, D, L, C, T</em>).
          </p>
          <p>
            <strong>3. Sin Long-Press:</strong> Las tildes (<em>á, é, í, ó, ú</em>) se obtienen deslizando ligeramente hacia arriba (flick &gt; 15px) y los números/símbolos deslizando hacia abajo.
          </p>
          <p>
            <strong>4. Decodificador Bayesiano:</strong> Integra verosimilitud espacial gaussiana 2D con un modelo lingüístico de bigramas en español para corregir toques en bordes sin mover la tecla.
          </p>
        </div>
      )}

      {/* Frase Objetivo (Modo Práctica) */}
      {targetSentence && (
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 mb-2.5 text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold mb-1">
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

      {/* Área de Entrada / Buffer de Texto en Vivo */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-2 shadow-lg relative">
        <div className="min-h-[64px] max-h-[100px] overflow-y-auto font-mono text-sm leading-relaxed text-slate-100 break-words whitespace-pre-wrap">
          {inputText ? (
            <>
              {inputText}
              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle"></span>
            </>
          ) : (
            <span className="text-slate-600 italic select-none">
              Toca o desliza en el teclado ergonómico inferior para escribir...
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/70 pt-2 mt-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {inputText.length} caracteres
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyText}
              disabled={!inputText}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 transition-all active:scale-95"
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

      {/* Barra de Inferencia Bayesiana y Tildes */}
      <CandidateBar
        candidates={candidates}
        onSelectCandidate={handleInsertCandidate}
        onInsertQuickChar={handleInsertCandidate}
      />

      {/* Lienzo del Teclado Táctil Interactivo */}
      <main className="w-full my-2">
        <VirtualKeyboardCanvas
          layout={currentLayout}
          textHistory={inputText}
          showOcclusionShadow={showOcclusionShadow}
          showBiomechanicArcs={showBiomechanicArcs}
          onKeyProcessed={handleKeyProcessed}
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
          onSelectLayout={(l) => {
            setCurrentLayout(l);
            setCandidates([]);
          }}
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
