import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Función que genera una fila de teclas siguiendo el arco de barrido fisiológico del pulgar.
 * Comienza desde el extremo izquierdo de la pantalla (xStart) hasta el borde derecho (xEnd).
 */
function createSweptRow(
  yBase: number,
  xStart: number,
  xEnd: number,
  items: Array<{
    id: string;
    char: string;
    display: string;
    type?: KeyDefinition['type'];
    secondaryChar?: string;
    radius?: number;
  }>,
  curvature: number = 38
): KeyDefinition[] {
  const count = items.length;
  const step = (xEnd - xStart) / (count - 1);

  return items.map((item, index) => {
    const x = Math.round(xStart + index * step);
    // Curvatura convexa suave adaptada al pulgar derecho (abducción máxima en el extremo izquierdo)
    const norm = (x - 210) / 160;
    const y = Math.round(yBase + Math.pow(norm, 2) * curvature);

    return {
      id: item.id,
      char: item.char,
      display: item.display,
      type: item.type ?? 'letter',
      x,
      y,
      radius: item.radius ?? 15.5,
      secondaryChar: item.secondaryChar,
      handAssigned: 'right' as const
    };
  });
}

// 1. Fila de Números (Extremo izquierdo a derecho: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
const numbersRow = createSweptRow(
  36,
  24,
  336,
  [
    { id: 'k_1', char: '1', display: '1', type: 'number' },
    { id: 'k_2', char: '2', display: '2', type: 'number' },
    { id: 'k_3', char: '3', display: '3', type: 'number' },
    { id: 'k_4', char: '4', display: '4', type: 'number' },
    { id: 'k_5', char: '5', display: '5', type: 'number' },
    { id: 'k_6', char: '6', display: '6', type: 'number' },
    { id: 'k_7', char: '7', display: '7', type: 'number' },
    { id: 'k_8', char: '8', display: '8', type: 'number' },
    { id: 'k_9', char: '9', display: '9', type: 'number' },
    { id: 'k_0', char: '0', display: '0', type: 'number' },
  ],
  42
);

// 2. Fila Superior: Consonantes y periféricas
const upperRow = createSweptRow(
  92,
  24,
  336,
  [
    { id: 'k_q', char: 'q', display: 'Q', secondaryChar: '@' },
    { id: 'k_w', char: 'w', display: 'W', secondaryChar: '#' },
    { id: 'k_f', char: 'f', display: 'F', secondaryChar: '$' },
    { id: 'k_g', char: 'g', display: 'G', secondaryChar: '%' },
    { id: 'k_b', char: 'b', display: 'B', secondaryChar: '&' },
    { id: 'k_v', char: 'v', display: 'V', secondaryChar: '*' },
    { id: 'k_h', char: 'h', display: 'H', secondaryChar: '(' },
    { id: 'k_j', char: 'j', display: 'J', secondaryChar: ')' },
    { id: 'k_z', char: 'z', display: 'Z', secondaryChar: '-' },
    { id: 'k_x', char: 'x', display: 'X', secondaryChar: '_' },
  ],
  40
);

// 3. Fila Dorada (Sweet Spot de Máxima Frecuencia del Español: D, L, C, R, E, A, O, S, T, N)
// Más del 72% de los caracteres en español se encuentran en este arco
const goldenRow = createSweptRow(
  148,
  26,
  334,
  [
    { id: 'k_d', char: 'd', display: 'D', secondaryChar: '«' },
    { id: 'k_l', char: 'l', display: 'L', secondaryChar: '»' },
    { id: 'k_c', char: 'c', display: 'C', secondaryChar: '<' },
    { id: 'k_r', char: 'r', display: 'R', secondaryChar: '>' },
    { id: 'k_e', char: 'e', display: 'E' },
    { id: 'k_a', char: 'a', display: 'A' },
    { id: 'k_o', char: 'o', display: 'O' },
    { id: 'k_s', char: 's', display: 'S' },
    { id: 'k_t', char: 't', display: 'T' },
    { id: 'k_n', char: 'n', display: 'N' },
  ],
  38
);

// 4. Fila Media: Vocales complementarias, M, P, Y, K, Ñ y Botón de Tilde Dedicado (´)
const midRow = createSweptRow(
  204,
  28,
  332,
  [
    { id: 'k_m', char: 'm', display: 'M', secondaryChar: ';' },
    { id: 'k_p', char: 'p', display: 'P', secondaryChar: ':' },
    { id: 'k_u', char: 'u', display: 'U' },
    { id: 'k_i', char: 'i', display: 'I' },
    { id: 'k_y', char: 'y', display: 'Y', secondaryChar: '/' },
    { id: 'k_k', char: 'k', display: 'K', secondaryChar: '=' },
    { id: 'k_ene', char: 'ñ', display: 'Ñ', secondaryChar: '+' },
    { id: 'k_tilde', char: '´', display: '´', type: 'action', radius: 17, secondaryChar: '¨' },
    { id: 'k_quest', char: '¿', display: '¿?', type: 'punctuation', secondaryChar: '?' },
  ],
  34
);

// 5. Fila Inferior: Puntuación, Barra de Espacio con Scrubbing y Acciones
const controlKeys: KeyDefinition[] = [
  { id: 'k_comma', char: ',', display: ',', type: 'punctuation', x: 30, y: 280, radius: 16 },
  { id: 'k_dot', char: '.', display: '.', type: 'punctuation', x: 70, y: 278, radius: 16 },
  { id: 'k_space', char: ' ', display: 'ESPACIO ⟷', type: 'space', x: 175, y: 278, radius: 26 },
  { id: 'k_backspace', char: '\b', display: '⌫', type: 'action', x: 278, y: 278, radius: 18 },
  { id: 'k_enter', char: '\n', display: '↵', type: 'action', x: 326, y: 280, radius: 18 },
];

export const radialSingleThumbLayout: LayoutDefinition = {
  id: 'radial-single-thumb-right',
  name: 'Polar Ergonómico Monomanual (Diestro)',
  description: 'Arco continuo desde el extremo izquierdo de la pantalla hasta el descanso del pulgar. Incluye fila de números directa, botón dedicado de tilde (´) y control de cursor por gestos.',
  mode: 'single-thumb-right',
  width: 360,
  height: 320,
  pivotPoints: {
    right: { x: 360, y: 320 }
  },
  keys: [
    ...numbersRow,
    ...upperRow,
    ...goldenRow,
    ...midRow,
    ...controlKeys
  ]
};

export const radialSingleThumbLeftLayout: LayoutDefinition = {
  id: 'radial-single-thumb-left',
  name: 'Polar Ergonómico Monomanual (Zurdo)',
  description: 'Layout radial simétrico optimizado para pulgar izquierdo. Comienza desde el extremo derecho hacia la base izquierda.',
  mode: 'single-thumb-left',
  width: 360,
  height: 320,
  pivotPoints: {
    left: { x: 0, y: 320 }
  },
  keys: radialSingleThumbLayout.keys.map(k => ({
    ...k,
    id: `${k.id}_left`,
    x: 360 - k.x,
    handAssigned: 'left' as const
  }))
};
