import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Genera una tecla para el layout bimanual dividido (Split Wings Ergonómico QWERTY)
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
    radius: options.radius ?? 18,
    secondaryChar: options.secondaryChar,
    accentChar: options.accentChar,
    handAssigned: hand
  };
}

// Ala Izquierda: Mitad izquierda de QWERTY con corrección ergonómica central (T-G-B)
// Pivote anatómico del pulgar izquierdo en (20, 320)
const leftWingKeys: KeyDefinition[] = [
  // Fila Superior Izquierda: Q, W, E, R, T (T inclinada ergonómicamente hacia el pulgar)
  createSplitKey('split_q', 'q', 'q', 26, 95, 'left', { secondaryChar: '1' }),
  createSplitKey('split_w', 'w', 'w', 58, 90, 'left', { secondaryChar: '2' }),
  createSplitKey('split_e', 'e', 'e', 90, 95, 'left', { secondaryChar: '3', accentChar: 'é' }),
  createSplitKey('split_r', 'r', 'r', 122, 105, 'left', { secondaryChar: '4' }),
  createSplitKey('split_t', 't', 't', 154, 120, 'left', { secondaryChar: '5' }),

  // Fila Media Izquierda: A, S, D, F, G (G en descanso natural)
  createSplitKey('split_a', 'a', 'a', 26, 142, 'left', { secondaryChar: '@', accentChar: 'á' }),
  createSplitKey('split_s', 's', 's', 58, 137, 'left', { secondaryChar: '#' }),
  createSplitKey('split_d', 'd', 'd', 90, 142, 'left', { secondaryChar: '$' }),
  createSplitKey('split_f', 'f', 'f', 122, 152, 'left', { secondaryChar: '%' }),
  createSplitKey('split_g', 'g', 'g', 154, 167, 'left', { secondaryChar: '&' }),

  // Fila Inferior Izquierda: Z, X, C, V, B (B con curvatura suave)
  createSplitKey('split_z', 'z', 'z', 28, 189, 'left', { secondaryChar: '<' }),
  createSplitKey('split_x', 'x', 'x', 60, 184, 'left', { secondaryChar: '>' }),
  createSplitKey('split_c', 'c', 'c', 92, 189, 'left', { secondaryChar: '{' }),
  createSplitKey('split_v', 'v', 'v', 124, 199, 'left', { secondaryChar: '}' }),
  createSplitKey('split_b', 'b', 'b', 154, 214, 'left', { secondaryChar: '[' }),

  // Clúster de Pulgar Izquierdo (Simétrico y Ergonómico)
  createSplitKey('split_shift', 'shift', '⇧', 32, 250, 'left', { type: 'action', radius: 19 }),
  createSplitKey('split_tilde', '´', '´', 68, 258, 'left', { type: 'action', secondaryChar: '¿', radius: 18 }),
  createSplitKey('split_space_l', ' ', '⟷', 115, 265, 'left', { type: 'space', radius: 25 }),
  createSplitKey('split_123', 'layer_123', '123', 158, 275, 'left', { type: 'action', radius: 18 })
];

// Ala Derecha: Mitad derecha de QWERTY con corrección ergonómica central (Y-H-N)
// Espejo exacto del ala izquierda: x_derecha = 360 - x_izquierda
// Pivote anatómico del pulgar derecho en (340, 320)
const rightWingKeys: KeyDefinition[] = [
  // Fila Superior Derecha: Y, U, I, O, P (Y inclinada ergonómicamente)
  createSplitKey('split_y', 'y', 'y', 206, 120, 'right', { secondaryChar: '6' }),
  createSplitKey('split_u', 'u', 'u', 238, 105, 'right', { secondaryChar: '7', accentChar: 'ú' }),
  createSplitKey('split_i', 'i', 'i', 270, 95, 'right', { secondaryChar: '8', accentChar: 'í' }),
  createSplitKey('split_o', 'o', 'o', 302, 90, 'right', { secondaryChar: '9', accentChar: 'ó' }),
  createSplitKey('split_p', 'p', 'p', 334, 95, 'right', { secondaryChar: '0' }),

  // Fila Media Derecha: H, J, K, L, Ñ (H en descanso natural)
  createSplitKey('split_h', 'h', 'h', 206, 167, 'right', { secondaryChar: '*' }),
  createSplitKey('split_j', 'j', 'j', 238, 152, 'right', { secondaryChar: '(' }),
  createSplitKey('split_k', 'k', 'k', 270, 142, 'right', { secondaryChar: ')' }),
  createSplitKey('split_l', 'l', 'l', 302, 137, 'right', { secondaryChar: '+' }),
  createSplitKey('split_ene', 'ñ', 'ñ', 334, 142, 'right', { secondaryChar: '=' }),

  // Fila Inferior Derecha: N, M, ,, ., - (N con curvatura suave)
  createSplitKey('split_n', 'n', 'n', 206, 214, 'right', { secondaryChar: ']' }),
  createSplitKey('split_m', 'm', 'm', 236, 199, 'right', { secondaryChar: '/' }),
  createSplitKey('split_comma', ',', ',', 268, 189, 'right', { type: 'punctuation', secondaryChar: ';' }),
  createSplitKey('split_dot', '.', '.', 300, 184, 'right', { type: 'punctuation', secondaryChar: ':' }),
  createSplitKey('split_dash', '-', '-', 332, 189, 'right', { type: 'punctuation', secondaryChar: '_' }),

  // Clúster de Pulgar Derecho (Simétrico y Ergonómico: x = 360 - x_izq)
  createSplitKey('split_supr', 'delete_forward', 'Supr', 202, 275, 'right', { type: 'action', radius: 18 }),
  createSplitKey('split_space_r', ' ', '⟷', 245, 265, 'right', { type: 'space', radius: 25 }),
  createSplitKey('split_enter', '\n', '↵', 292, 258, 'right', { type: 'action', radius: 18 }),
  createSplitKey('split_bksp', '\b', '⌫', 328, 250, 'right', { type: 'action', radius: 19 })
];

export const bimanualSplitLayout: LayoutDefinition = {
  id: 'bimanual-split-wings',
  name: 'Bimanual QWERTY Ergonómico (Dos Pulgares)',
  description: 'Distribución QWERTY dividida en dos alas simétricas con corrección ergonómica para los botones centrales (T-G-B y Y-H-N) y clústeres independientes para cada pulgar.',
  mode: 'dual-thumb',
  width: 360,
  height: 320,
  pivotPoints: {
    left: { x: 20, y: 320 },
    right: { x: 340, y: 320 }
  },
  keys: [
    ...leftWingKeys,
    ...rightWingKeys
  ]
};
