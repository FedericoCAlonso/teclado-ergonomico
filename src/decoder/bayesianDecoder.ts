import type { KeyDefinition, LayoutDefinition } from '../types';
import { getBigramProbability, getUnigramProbability, resolveDeterministicAccent } from '../linguistics/spanishCorpus';
import { toPolar } from '../biomechanics/polarModel';

export type GestureType = 'tap' | 'flick_up' | 'flick_down' | 'flick_outward';

export interface TouchStroke {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  durationMs?: number;
}

export interface DecodedCandidate {
  key: KeyDefinition;
  char: string;
  probability: number;
  spatialScore: number;
  linguisticScore: number;
  totalScore: number;
}

export interface DecodeResult {
  char: string;
  gesture: GestureType;
  primaryKey: KeyDefinition;
  candidates: DecodedCandidate[];
  confidence: number;
}

export interface DecoderOptions {
  linguisticWeight?: number; // Beta (por defecto 0.35)
  tapThresholdPx?: number;   // Distancia máxima de desplazamiento para considerar tap (18px)
}

/**
 * Clasifica el gesto táctil en Tap, Flick Superior (tilde), Flick Inferior (secundario) o Flick Radial Outward.
 */
export function classifyGesture(
  stroke: TouchStroke,
  layout: LayoutDefinition,
  tapThreshold: number = 18
): GestureType {
  const dx = stroke.endX - stroke.startX;
  const dy = stroke.endY - stroke.startY;
  const dist = Math.hypot(dx, dy);

  if (dist < tapThreshold) {
    return 'tap';
  }

  // Comprobación de flick radial hacia afuera si hay pivote definido
  const pivot = layout.pivotPoints.right ?? layout.pivotPoints.left;
  if (pivot) {
    const polarStart = toPolar({ x: stroke.startX, y: stroke.startY }, pivot);
    const polarEnd = toPolar({ x: stroke.endX, y: stroke.endY }, pivot);
    const deltaR = polarEnd.r - polarStart.r;
    if (deltaR > 18) {
      return 'flick_outward';
    }
  }

  // Flick vertical clásico
  if (dy < -14) {
    return 'flick_up';
  }
  if (dy > 14) {
    return 'flick_down';
  }

  return 'tap';
}

/**
 * Decodificador Bayesiano Estático: Calcula P(key | touch, history) ∝ P(touch | key) * P(key | history).
 * El layout permanece FIJO; sólo se calibra la tolerancia y selección del carácter.
 */
export function decodeTouchStroke(
  stroke: TouchStroke,
  layout: LayoutDefinition,
  history: string = '',
  options: DecoderOptions = {}
): DecodeResult {
  const linguisticWeight = options.linguisticWeight ?? 0.35;
  const tapThreshold = options.tapThresholdPx ?? 18;

  // Punto de referencia para el contacto táctil
  const touchX = (stroke.startX + stroke.endX) / 2;
  const touchY = (stroke.startY + stroke.endY) / 2;

  const gesture = classifyGesture(stroke, layout, tapThreshold);

  // Obtener último carácter representativo del historial
  const cleanHistory = history.trimEnd();
  const lastChar = cleanHistory.length > 0 ? cleanHistory[cleanHistory.length - 1] : null;

  const scoredKeys: {
    key: KeyDefinition;
    spatialScore: number;
    linguisticScore: number;
    totalScore: number;
  }[] = [];

  for (const key of layout.keys) {
    // 1. Verosimilitud espacial gaussiana 2D: P(touch | key)
    const dist = Math.hypot(touchX - key.x, touchY - key.y);
    const sigma = key.radius * 1.25;
    // En espacio logarítmico: -d^2 / (2 * sigma^2) - ln(sigma * sqrt(2*PI))
    const logSpatial = -Math.pow(dist, 2) / (2 * Math.pow(sigma, 2)) - Math.log(sigma * Math.sqrt(2 * Math.PI));

    // 2. Probabilidad a priori lingüística: P(key | history)
    let priorProb = 0.001;
    if (key.type === 'action' || key.type === 'space') {
      priorProb = key.type === 'space' ? 0.175 : 0.05;
    } else if (lastChar && /[a-záéíóúñ]/i.test(lastChar)) {
      priorProb = getBigramProbability(lastChar, key.char);
    } else {
      priorProb = getUnigramProbability(key.char);
    }

    const logLinguistic = Math.log(priorProb + 1e-6);
    const totalScore = logSpatial + linguisticWeight * logLinguistic;

    scoredKeys.push({
      key,
      spatialScore: logSpatial,
      linguisticScore: logLinguistic,
      totalScore
    });
  }

  // Ordenar por score total descendente
  scoredKeys.sort((a, b) => b.totalScore - a.totalScore);

  // Softmax sobre los mejores candidatos para obtener probabilidades relativas normalizadas
  const topK = scoredKeys.slice(0, 5);
  const maxScore = topK[0]?.totalScore ?? 0;
  const expScores = topK.map(item => Math.exp(item.totalScore - maxScore));
  const sumExp = expScores.reduce((acc, val) => acc + val, 0);

  const candidates: DecodedCandidate[] = topK.map((item, idx) => ({
    key: item.key,
    char: item.key.char,
    probability: Math.round((expScores[idx] / sumExp) * 1000) / 1000,
    spatialScore: Math.round(item.spatialScore * 100) / 100,
    linguisticScore: Math.round(item.linguisticScore * 100) / 100,
    totalScore: Math.round(item.totalScore * 100) / 100
  }));

  const primaryCandidate = candidates[0];
  const primaryKey = primaryCandidate.key;

  // Selección de carácter final según el gesto detectado
  let resolvedChar = primaryKey.char;

  if (gesture === 'flick_up' || gesture === 'flick_outward') {
    if (primaryKey.accentChar) {
      resolvedChar = primaryKey.accentChar;
    }
  } else if (gesture === 'flick_down') {
    if (primaryKey.secondaryChar) {
      resolvedChar = primaryKey.secondaryChar;
    }
  }

  return {
    char: resolvedChar,
    gesture,
    primaryKey,
    candidates,
    confidence: primaryCandidate.probability
  };
}

/**
 * Asistente de buffer de texto: reemplaza la última palabra por su versión con tildes determinista.
 */
export function autoAccentBuffer(buffer: string): string {
  const words = buffer.split(/(\s+|[.,;:!?¿¡])/);
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].trim().length > 0) {
      words[i] = resolveDeterministicAccent(words[i]);
      break;
    }
  }
  return words.join('');
}
