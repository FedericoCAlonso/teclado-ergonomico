import type { LayoutDefinition, KeyDefinition } from '../types';

function createQwertyKey(
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
  } = {}
): KeyDefinition {
  return {
    id,
    char,
    display,
    type: options.type ?? 'letter',
    x,
    y,
    radius: options.radius ?? 16,
    secondaryChar: options.secondaryChar,
    accentChar: options.accentChar
  };
}

// QWERTY rectangular estándar tradicional (360x320)
// Fila 1: Q W E R T Y U I O P (10 teclas, espaciado ~34px)
const row1Chars = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const row1Numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const row1Accents: Record<string, string> = { e: 'é', u: 'ú', i: 'í', o: 'ó' };
const row1: KeyDefinition[] = row1Chars.map((c, idx) =>
  createQwertyKey(`qw_${c}`, c, c.toUpperCase(), 20 + idx * 35.5, 115, {
    secondaryChar: row1Numbers[idx],
    accentChar: row1Accents[c]
  })
);

// Fila 2: A S D F G H J K L Ñ (10 teclas)
const row2Chars = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'];
const row2Symbols = ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'];
const row2: KeyDefinition[] = row2Chars.map((c, idx) =>
  createQwertyKey(`qw_${c}`, c, c.toUpperCase(), 20 + idx * 35.5, 165, {
    secondaryChar: row2Symbols[idx],
    accentChar: c === 'a' ? 'á' : undefined
  })
);

// Fila 3: Z X C V B N M , . (9 teclas)
const row3Chars = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'];
const row3Symbols = ['!', '?', '"', '\'', '/', ':', ';', '¿', '¡'];
const row3: KeyDefinition[] = row3Chars.map((c, idx) =>
  createQwertyKey(
    `qw_${c === ',' ? 'comma' : c === '.' ? 'dot' : c}`,
    c,
    c === ',' || c === '.' ? c : c.toUpperCase(),
    38 + idx * 35.5,
    215,
    {
      type: c === ',' || c === '.' ? 'punctuation' : 'letter',
      secondaryChar: row3Symbols[idx]
    }
  )
);

// Fila 4: Acciones (Espacio, Borrado, Enter)
const row4: KeyDefinition[] = [
  createQwertyKey('qw_bksp', '\b', '⌫', 40, 270, { type: 'action', radius: 22 }),
  createQwertyKey('qw_space', ' ', '⟷', 180, 270, { type: 'space', radius: 45 }),
  createQwertyKey('qw_enter', '\n', '↵', 320, 270, { type: 'action', radius: 22 })
];

export const qwertyBaselineLayout: LayoutDefinition = {
  id: 'qwerty-baseline',
  name: 'QWERTY Tradicional (Línea de Base)',
  description: 'Distribución histórica de máquina de escribir adaptada a pantalla táctil. Utilizada como referencia de control empírico para medir distancias, fatiga y oclusión.',
  mode: 'qwerty-baseline',
  width: 360,
  height: 320,
  pivotPoints: {
    right: { x: 360, y: 320 },
    left: { x: 0, y: 320 }
  },
  keys: [
    ...row1,
    ...row2,
    ...row3,
    ...row4
  ]
};
