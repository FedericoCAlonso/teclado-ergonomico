import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Genera una tecla para el layout bimanual dividido (Split Wings)
 */
function createSplitKey(
  id: string,
  char: string,
  display: string,
  x: number,
  y: number,
  hand: 'left' | 'right',
  options: {
    type?: KeyDefinition['type'];
    secondaryChar?: string;
    accentChar?: string;
    radius?: number;
  } = {}
): KeyDefinition {
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
    handAssigned: hand
  };
}

// Ala Izquierda: Concentración de Vocales y Consonantes Frontales
// Pivote en (0, 320)
const leftWingKeys: KeyDefinition[] = [
  // Fila Superior Izquierda
  createSplitKey('split_q', 'q', 'Q', 35, 110, 'left', { secondaryChar: '1' }),
  createSplitKey('split_b', 'b', 'B', 75, 105, 'left', { secondaryChar: '2' }),
  createSplitKey('split_g', 'g', 'G', 115, 115, 'left', { secondaryChar: '3' }),
  createSplitKey('split_f', 'f', 'F', 155, 135, 'left', { secondaryChar: '4' }),

  // Fila Media Izquierda (Sweet spot del pulgar izquierdo)
  createSplitKey('split_a', 'a', 'A', 35, 160, 'left', { secondaryChar: '5', accentChar: 'á' }),
  createSplitKey('split_e', 'e', 'E', 75, 155, 'left', { secondaryChar: '6', accentChar: 'é' }),
  createSplitKey('split_i', 'i', 'I', 115, 165, 'left', { secondaryChar: '7', accentChar: 'í' }),
  createSplitKey('split_o', 'o', 'O', 155, 185, 'left', { secondaryChar: '8', accentChar: 'ó' }),

  // Fila Inferior Izquierda
  createSplitKey('split_u', 'u', 'U', 40, 210, 'left', { secondaryChar: '9', accentChar: 'ú' }),
  createSplitKey('split_d', 'd', 'D', 80, 205, 'left', { secondaryChar: '0' }),
  createSplitKey('split_l', 'l', 'L', 120, 215, 'left', { secondaryChar: '@' }),
  createSplitKey('split_c', 'c', 'C', 160, 235, 'left', { secondaryChar: '#' }),

  // Modificadores Izquierdos
  createSplitKey('split_comma', ',', ',', 45, 260, 'left', { type: 'punctuation', secondaryChar: '¿' }),
  createSplitKey('split_space_l', ' ', 'ESP', 110, 270, 'left', { type: 'space', radius: 26 })
];

// Ala Derecha: Consonantes Complementarias y Puntuación
// Pivote en (360, 320)
const rightWingKeys: KeyDefinition[] = [
  // Fila Superior Derecha
  createSplitKey('split_p', 'p', 'P', 205, 135, 'right', { secondaryChar: ')' }),
  createSplitKey('split_m', 'm', 'M', 245, 115, 'right', { secondaryChar: '$' }),
  createSplitKey('split_h', 'h', 'H', 285, 105, 'right', { secondaryChar: '%' }),
  createSplitKey('split_z', 'z', 'Z', 325, 110, 'right', { secondaryChar: '&' }),

  // Fila Media Derecha (Sweet spot del pulgar derecho)
  createSplitKey('split_s', 's', 'S', 205, 185, 'right', { secondaryChar: '?' }),
  createSplitKey('split_r', 'r', 'R', 245, 165, 'right', { secondaryChar: '!' }),
  createSplitKey('split_n', 'n', 'N', 285, 155, 'right', { secondaryChar: '*' }),
  createSplitKey('split_t', 't', 'T', 325, 160, 'right', { secondaryChar: '+' }),

  // Fila Inferior Derecha
  createSplitKey('split_ene', 'ñ', 'Ñ', 200, 235, 'right', { secondaryChar: ';' }),
  createSplitKey('split_v', 'v', 'V', 240, 215, 'right', { secondaryChar: ':' }),
  createSplitKey('split_y', 'y', 'Y', 280, 205, 'right', { secondaryChar: '-' }),
  createSplitKey('split_j', 'j', 'J', 320, 210, 'right', { secondaryChar: '_' }),

  // Letras de baja frecuencia y teclas de acción derechas
  createSplitKey('split_x', 'x', 'X', 180, 85, 'right', { secondaryChar: '/' }),
  createSplitKey('split_k', 'k', 'K', 225, 80, 'right', { secondaryChar: '=' }),
  createSplitKey('split_w', 'w', 'W', 270, 75, 'right', { secondaryChar: '\\' }),

  // Modificadores Derechos
  createSplitKey('split_space_r', ' ', 'ESP', 250, 270, 'right', { type: 'space', radius: 26 }),
  createSplitKey('split_dot', '.', '.', 315, 260, 'right', { type: 'punctuation', secondaryChar: '¡' }),
  createSplitKey('split_bksp', '\b', '⌫', 325, 60, 'right', { type: 'action', radius: 20 }),
  createSplitKey('split_enter', '\n', '↵', 180, 285, 'right', { type: 'action', radius: 20 })
];

export const bimanualSplitLayout: LayoutDefinition = {
  id: 'bimanual-split-wings',
  name: 'Bimanual Split Wings (Dos Pulgares)',
  description: 'Distribución simétrica dividida en dos alas ergonómicas. Optimiza la alternancia vocal/consonante entre ambas manos, eliminando la oclusión visual.',
  mode: 'dual-thumb',
  width: 360,
  height: 320,
  pivotPoints: {
    left: { x: 0, y: 320 },
    right: { x: 360, y: 320 }
  },
  keys: [
    ...leftWingKeys,
    ...rightWingKeys
  ]
};
