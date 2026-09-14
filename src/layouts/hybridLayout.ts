import type { LayoutDefinition, KeyDefinition } from '../types';

function createHybridKey(
  id: string,
  char: string,
  display: string,
  x: number,
  y: number,
  options: {
    type?: KeyDefinition['type'];
    secondaryChar?: string;
    accentChar?: string;
    radius?: number;
    handAssigned?: 'left' | 'right';
  } = {}
): KeyDefinition {
  return {
    id,
    char,
    display,
    type: options.type ?? 'letter',
    x,
    y,
    radius: options.radius ?? 19,
    secondaryChar: options.secondaryChar,
    accentChar: options.accentChar,
    handAssigned: options.handAssigned
  };
}

// Layout Híbrido: Arco curvo continuo en U ("Smile")
// Permite escribir con 1 pulgar barriendo el semicírculo o con 2 pulgares cooperativos
const hybridKeys: KeyDefinition[] = [
  // Fila Superior Curva
  createHybridKey('hy_q', 'q', 'Q', 28, 110, { secondaryChar: '1', handAssigned: 'left' }),
  createHybridKey('hy_w', 'w', 'W', 62, 118, { secondaryChar: '2', handAssigned: 'left' }),
  createHybridKey('hy_b', 'b', 'B', 98, 128, { secondaryChar: '3', handAssigned: 'left' }),
  createHybridKey('hy_p', 'p', 'P', 134, 138, { secondaryChar: '4', handAssigned: 'left' }),
  createHybridKey('hy_g', 'g', 'G', 180, 142, { secondaryChar: '5' }),
  createHybridKey('hy_m', 'm', 'M', 226, 138, { secondaryChar: '6', handAssigned: 'right' }),
  createHybridKey('hy_v', 'v', 'V', 262, 128, { secondaryChar: '7', handAssigned: 'right' }),
  createHybridKey('hy_h', 'h', 'H', 298, 118, { secondaryChar: '8', handAssigned: 'right' }),
  createHybridKey('hy_f', 'f', 'F', 332, 110, { secondaryChar: '9', handAssigned: 'right' }),

  // Fila Media (Zona de Altísima Frecuencia)
  createHybridKey('hy_a', 'a', 'A', 34, 160, { secondaryChar: '0', accentChar: 'á', handAssigned: 'left' }),
  createHybridKey('hy_e', 'e', 'E', 72, 168, { secondaryChar: '@', accentChar: 'é', handAssigned: 'left' }),
  createHybridKey('hy_i', 'i', 'I', 110, 178, { secondaryChar: '#', accentChar: 'í', handAssigned: 'left' }),
  createHybridKey('hy_o', 'o', 'O', 148, 186, { secondaryChar: '$', accentChar: 'ó', handAssigned: 'left' }),
  createHybridKey('hy_u', 'u', 'U', 180, 188, { secondaryChar: '%', accentChar: 'ú' }),
  createHybridKey('hy_s', 's', 'S', 212, 186, { secondaryChar: '&', handAssigned: 'right' }),
  createHybridKey('hy_r', 'r', 'R', 250, 178, { secondaryChar: '*', handAssigned: 'right' }),
  createHybridKey('hy_n', 'n', 'N', 288, 168, { secondaryChar: '?', handAssigned: 'right' }),
  createHybridKey('hy_t', 't', 'T', 326, 160, { secondaryChar: '!', handAssigned: 'right' }),

  // Fila Inferior
  createHybridKey('hy_d', 'd', 'D', 46, 212, { secondaryChar: '/', handAssigned: 'left' }),
  createHybridKey('hy_l', 'l', 'L', 84, 218, { secondaryChar: '(', handAssigned: 'left' }),
  createHybridKey('hy_c', 'c', 'C', 124, 226, { secondaryChar: ')', handAssigned: 'left' }),
  createHybridKey('hy_ene', 'ñ', 'Ñ', 180, 232, { secondaryChar: ';' }),
  createHybridKey('hy_y', 'y', 'Y', 236, 226, { secondaryChar: ':', handAssigned: 'right' }),
  createHybridKey('hy_j', 'j', 'J', 276, 218, { secondaryChar: '-', handAssigned: 'right' }),
  createHybridKey('hy_z', 'z', 'Z', 314, 212, { secondaryChar: '_', handAssigned: 'right' }),

  // Periféricas (X, K)
  createHybridKey('hy_x', 'x', 'X', 148, 96, { secondaryChar: '+', handAssigned: 'left' }),
  createHybridKey('hy_k', 'k', 'K', 212, 96, { secondaryChar: '=', handAssigned: 'right' }),

  // Barra de Espacio y Controles Ergonómicos Inferiores
  createHybridKey('hy_comma', ',', ',', 70, 268, { type: 'punctuation', secondaryChar: '¿', handAssigned: 'left' }),
  createHybridKey('hy_space', ' ', '⟷', 180, 275, { type: 'space', radius: 30 }),
  createHybridKey('hy_dot', '.', '.', 290, 268, { type: 'punctuation', secondaryChar: '¡', handAssigned: 'right' }),
  createHybridKey('hy_bksp', '\b', '⌫', 328, 65, { type: 'action', radius: 20 }),
  createHybridKey('hy_enter', '\n', '↵', 32, 65, { type: 'action', radius: 20 })
];

export const hybridLayout: LayoutDefinition = {
  id: 'hybrid-continuous-arc',
  name: 'Híbrido Arco Continuo (1 o 2 Pulgares)',
  description: 'Geometría curva en forma de U que sigue el alcance anatómico natural. Se adapta con fluidez tanto a escritura monomanual como bimanual.',
  mode: 'hybrid',
  width: 360,
  height: 320,
  pivotPoints: {
    left: { x: 30, y: 320 },
    right: { x: 330, y: 320 }
  },
  keys: hybridKeys
};
