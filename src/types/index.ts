/**
 * Tipos fundamentales para la plataforma de investigación del Teclado Ergonómico Polar.
 */

export type Handedness = 'right' | 'left' | 'both';

export type ShiftMode = 'none' | 'shift' | 'caps';

export type ModifierMode = 'none' | 'sticky' | 'locked';

export type KeyboardLayer = 'abc' | '123' | 'sym';

export type KeyType = 'letter' | 'number' | 'punctuation' | 'action' | 'space';

export interface KeyDefinition {
  id: string;
  char: string;
  display: string;
  secondaryChar?: string; // Carácter secundario (número o símbolo al hacer swipe-down)
  accentChar?: string;    // Carácter con tilde (al hacer flick hacia afuera o inferencia)
  alternateChar?: string; // Carácter fonotáctico compartido (ej: W en K·W, X en Z·X, H en J·H)
  path?: string;          // Forma SVG personalizada (ej: segmento de arco para barra espaciadora)
  type: KeyType;
  /** Coordenadas relativas normalizadas (0 a 1) o absolutas en píxeles */
  x: number;
  y: number;
  radius: number;         // Radio visual/táctil base
  handAssigned?: 'left' | 'right'; // Asignación recomendada en modo bimanual
}

export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  mode: 'single-thumb-right' | 'single-thumb-left' | 'dual-thumb' | 'hybrid' | 'qwerty-baseline';
  keys: KeyDefinition[];
  width: number;
  height: number;
  pivotPoints: {
    right?: { x: number; y: number };
    left?: { x: number; y: number };
  };
  arcRadii?: number[];
}

export interface TouchEventSample {
  x: number;
  y: number;
  timestamp: number;
  recognizedChar: string;
  targetChar?: string;
  confidence: number;
  wasCorrected: boolean;
}

export interface CostWeights {
  w1_movement: number;   // Distancia polar recorrida
  w2_transition: number; // Penalización por cambio de dirección e inercia
  w3_error: number;      // Ambigüedad y proximidad de teclas críticas
  w4_occlusion: number;  // Sombra visual del pulgar sobre el siguiente carácter
  w5_reach: number;      // Esfuerzo de alejamiento de la zona neutra de reposo
}

export interface CostBreakdown {
  totalCost: number;
  movementCost: number;
  transitionCost: number;
  errorCost: number;
  occlusionCost: number;
  reachCost: number;
  evalTextLength: number;
}

export interface TypingSessionMetrics {
  wpm: number;
  accuracy: number; // Porcentaje (0 - 100)
  kspc: number;     // Keystrokes Per Character (1.0 = ideal)
  totalDistancePx: number;
  totalTimeSeconds: number;
  correctionsCount: number;
  keystrokesCount: number;
}
