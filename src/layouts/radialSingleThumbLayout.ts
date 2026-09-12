import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Helper para proyectar una tecla en coordenadas cartesianas a partir de coordenadas polares (r, thetaDeg)
 * ancladas al pivote del pulgar derecho (360, 320).
 */
function createPolarKey(
  id: string,
  char: string,
  display: string,
  r: number,
  thetaDeg: number,
  options: {
    type?: KeyDefinition['type'];
    secondaryChar?: string;
    accentChar?: string;
    radius?: number;
  } = {}
): KeyDefinition {
  const pivotX = 360;
  const pivotY = 320;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const x = Math.round(pivotX + r * Math.cos(thetaRad));
  const y = Math.round(pivotY + r * Math.sin(thetaRad));

  return {
    id,
    char,
    display,
    type: options.type ?? 'letter',
    x,
    y,
    radius: options.radius ?? 20,
    secondaryChar: options.secondaryChar,
    accentChar: options.accentChar,
    handAssigned: 'right'
  };
}

// 1. Arco Central de Oro (Sweet Spot: r = 215 px, mínimo torque y fatiga)
// Alberga las letras más frecuentes del español: E, A, O, S, R, N, I, D, L, C, T
const goldenArc: KeyDefinition[] = [
  createPolarKey('k_c', 'c', 'C', 215, -164, { secondaryChar: '3' }),
  createPolarKey('k_d', 'd', 'D', 215, -153, { secondaryChar: '4' }),
  createPolarKey('k_r', 'r', 'R', 215, -142, { secondaryChar: '5' }),
  createPolarKey('k_e', 'e', 'E', 215, -131, { secondaryChar: '6', accentChar: 'é' }),
  createPolarKey('k_a', 'a', 'A', 215, -120, { secondaryChar: '7', accentChar: 'á' }),
  createPolarKey('k_o', 'o', 'O', 215, -109, { secondaryChar: '8', accentChar: 'ó' }),
  createPolarKey('k_s', 's', 'S', 215, -98, { secondaryChar: '9' }),
];

// 2. Arco Medio Confort (r = 165 px, flexión moderada cómoda)
// Letras de frecuencia media-alta: N, I, T, L, U, M, P, Ñ
const midArc: KeyDefinition[] = [
  createPolarKey('k_p', 'p', 'P', 165, -166, { secondaryChar: '0' }),
  createPolarKey('k_m', 'm', 'M', 165, -153, { secondaryChar: '?' }),
  createPolarKey('k_t', 't', 'T', 165, -140, { secondaryChar: '!' }),
  createPolarKey('k_i', 'i', 'I', 165, -127, { secondaryChar: '1', accentChar: 'í' }),
  createPolarKey('k_n', 'n', 'N', 165, -114, { secondaryChar: '2' }),
  createPolarKey('k_l', 'l', 'L', 165, -101, { secondaryChar: ':' }),
  createPolarKey('k_ene', 'ñ', 'Ñ', 165, -88, { secondaryChar: ';' }),
];

// 3. Arco Exterior Superior (r = 265 px, extensión del pulgar)
// Letras de frecuencia baja: B, G, V, Y, Q, H, F, Z, J, X, K, W
const outerArc: KeyDefinition[] = [
  createPolarKey('k_q', 'q', 'Q', 265, -164, { secondaryChar: '@' }),
  createPolarKey('k_b', 'b', 'B', 265, -154, { secondaryChar: '#' }),
  createPolarKey('k_g', 'g', 'G', 265, -144, { secondaryChar: '$' }),
  createPolarKey('k_u', 'u', 'U', 265, -134, { secondaryChar: '%', accentChar: 'ú' }),
  createPolarKey('k_v', 'v', 'V', 265, -124, { secondaryChar: '&' }),
  createPolarKey('k_y', 'y', 'Y', 265, -114, { secondaryChar: '*' }),
  createPolarKey('k_h', 'h', 'H', 265, -104, { secondaryChar: '(' }),
  createPolarKey('k_f', 'f', 'F', 265, -94, { secondaryChar: ')' }),
];

// 4. Arco Periférico Superior (r = 305 px, teclas raras)
const peripheralKeys: KeyDefinition[] = [
  createPolarKey('k_z', 'z', 'Z', 305, -155, { secondaryChar: '_' }),
  createPolarKey('k_j', 'j', 'J', 305, -140, { secondaryChar: '-' }),
  createPolarKey('k_x', 'x', 'X', 305, -125, { secondaryChar: '+' }),
  createPolarKey('k_k', 'k', 'K', 305, -110, { secondaryChar: '=' }),
  createPolarKey('k_w', 'w', 'W', 305, -95, { secondaryChar: '/' }),
];

// 5. Zona de Descanso y Teclas de Control Funcional (r = 110 px a 125 px, adyacente al pulgar)
const controlKeys: KeyDefinition[] = [
  createPolarKey('k_comma', ',', ',', 115, -165, { type: 'punctuation', secondaryChar: '¿' }),
  createPolarKey('k_dot', '.', '.', 115, -145, { type: 'punctuation', secondaryChar: '¡' }),
  createPolarKey('k_space', ' ', 'ESPACIO', 115, -120, { type: 'space', radius: 28 }),
  createPolarKey('k_backspace', '\b', '⌫', 115, -95, { type: 'action', radius: 22 }),
  createPolarKey('k_enter', '\n', '↵', 115, -75, { type: 'action', radius: 22 }),
];

export const radialSingleThumbLayout: LayoutDefinition = {
  id: 'radial-single-thumb-right',
  name: 'Polar Ergonómico Monomanual (Diestro)',
  description: 'Layout radial optimizado para pulgar derecho. Letras clave del español en el arco de mínimo torque (r = 215px), Ñ nativa y tildes por flick.',
  mode: 'single-thumb-right',
  width: 360,
  height: 320,
  pivotPoints: {
    right: { x: 360, y: 320 }
  },
  keys: [
    ...goldenArc,
    ...midArc,
    ...outerArc,
    ...peripheralKeys,
    ...controlKeys
  ]
};

export const radialSingleThumbLeftLayout: LayoutDefinition = {
  id: 'radial-single-thumb-left',
  name: 'Polar Ergonómico Monomanual (Zurdo)',
  description: 'Layout radial simétrico optimizado para pulgar izquierdo. Pivote en la esquina inferior izquierda (0, 320).',
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

