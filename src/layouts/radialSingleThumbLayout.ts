import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Genera una fila de teclas distribuidas a lo largo de un arco parabólico/polar
 * correspondiente al alcance ergonómico natural del pulgar (ni muy lejos ni muy cerca de la articulación).
 */
function createCrescentRow(
  startPt: { x: number; y: number },
  midPt: { x: number; y: number },
  endPt: { x: number; y: number },
  items: Array<{
    id: string;
    char: string;
    display: string;
    type?: KeyDefinition['type'];
    secondaryChar?: string;
    radius?: number;
  }>
): KeyDefinition[] {
  const count = items.length;

  return items.map((item, index) => {
    const t = index / (count - 1);
    // Interpolación cuadrática que reproduce la curvatura del arco del pulgar
    const x = Math.round((1 - t) * (1 - t) * startPt.x + 2 * (1 - t) * t * midPt.x + t * t * endPt.x);
    const y = Math.round((1 - t) * (1 - t) * startPt.y + 2 * (1 - t) * t * midPt.y + t * t * endPt.y);

    return {
      id: item.id,
      char: item.char,
      display: item.display,
      type: item.type ?? 'letter',
      x,
      y,
      radius: item.radius ?? 15,
      secondaryChar: item.secondaryChar,
      handAssigned: 'right' as const
    };
  });
}

// 1. Arco 0 (Exterior - Números directos 1 al 0):
// Inicia en el extremo izquierdo (x=25, y=165), se eleva suavemente hacia el centro y baja a la derecha
const numbersRow = createCrescentRow(
  { x: 25, y: 165 },
  { x: 185, y: 85 },
  { x: 340, y: 115 },
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
  ]
);

// 2. Arco 1 (Consonantes superiores e infrecuentes):
// Paralelo al arco 0, nace en el borde izquierdo (x=25, y=205)
const upperRow = createCrescentRow(
  { x: 25, y: 205 },
  { x: 185, y: 125 },
  { x: 340, y: 155 },
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
  ]
);

// 3. Arco 2 (Arco Dorado - Máxima Frecuencia del Español: D, L, C, R, E, A, O, S, T, N):
// Ubicado exactamente en la franja de mínimo torque y fatiga muscular
const goldenRow = createCrescentRow(
  { x: 35, y: 245 },
  { x: 190, y: 165 },
  { x: 340, y: 195 },
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
  ]
);

// 4. Arco 3 (Frecuencia Media + Ñ + Tecla de Tilde Dedicada ´):
const midRow = createCrescentRow(
  { x: 65, y: 280 },
  { x: 200, y: 205 },
  { x: 335, y: 235 },
  [
    { id: 'k_m', char: 'm', display: 'M', secondaryChar: ';' },
    { id: 'k_p', char: 'p', display: 'P', secondaryChar: ':' },
    { id: 'k_u', char: 'u', display: 'U' },
    { id: 'k_i', char: 'i', display: 'I' },
    { id: 'k_y', char: 'y', display: 'Y', secondaryChar: '/' },
    { id: 'k_k', char: 'k', display: 'K', secondaryChar: '=' },
    { id: 'k_ene', char: 'ñ', display: 'Ñ', secondaryChar: '+' },
    { id: 'k_tilde', char: '´', display: '´', type: 'action', radius: 16, secondaryChar: '¨' },
    { id: 'k_quest', char: '¿', display: '¿?', type: 'punctuation', secondaryChar: '?' },
  ]
);

// 5. Zona de Descanso y Control del Pulgar (Espacio Central con Scrubbing + Borrado + Puntuación):
// Situada en la zona neutra de reposo, sin invadir la articulación en la esquina inferior derecha
const controlKeys: KeyDefinition[] = [
  { id: 'k_comma', char: ',', display: ',', type: 'punctuation', x: 45, y: 298, radius: 15 },
  { id: 'k_dot', char: '.', display: '.', type: 'punctuation', x: 82, y: 295, radius: 15 },
  { id: 'k_space', char: ' ', display: 'ESPACIO ⟷', type: 'space', x: 175, y: 290, radius: 24 },
  { id: 'k_backspace', char: '\b', display: '⌫', type: 'action', x: 268, y: 292, radius: 17 },
  { id: 'k_enter', char: '\n', display: '↵', type: 'action', x: 312, y: 295, radius: 17 },
];

export const radialSingleThumbLayout: LayoutDefinition = {
  id: 'radial-single-thumb-right',
  name: 'Polar Ergonómico Monomanual (Diestro)',
  description: 'Arco polar continuo diseñado en la franja de confort del pulgar (sin forzar cerca de la articulación ni lejos hacia arriba). Comienza en el extremo izquierdo e incluye números directos y botón de tilde.',
  mode: 'single-thumb-right',
  width: 360,
  height: 330,
  pivotPoints: {
    right: { x: 360, y: 340 }
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
  description: 'Arco polar simétrico optimizado para pulgar izquierdo. Nace desde el extremo derecho hacia el descanso del pulgar izquierdo.',
  mode: 'single-thumb-left',
  width: 360,
  height: 330,
  pivotPoints: {
    left: { x: 0, y: 340 }
  },
  keys: radialSingleThumbLayout.keys.map(k => ({
    ...k,
    id: `${k.id}_left`,
    x: 360 - k.x,
    handAssigned: 'left' as const
  }))
};
