import type { LayoutDefinition, KeyDefinition } from '../types';

/**
 * Proyecta una tecla cartesiana a partir de coordenadas polares (r, thetaDeg)
 * ancladas al pivote del pulgar desplazado 5mm a la izquierda (332, 325).
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
    alternateChar?: string;
    radius?: number;
    px?: number;
    py?: number;
  } = {}
): KeyDefinition {
  const pivotX = options.px ?? 332;
  const pivotY = options.py ?? 325;
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
    radius: options.radius ?? 16,
    secondaryChar: options.secondaryChar,
    accentChar: options.accentChar,
    alternateChar: options.alternateChar,
    handAssigned: 'right'
  };
}

function createRibbonPath(px: number, py: number, rIn: number, rOut: number, startDeg: number, endDeg: number, isLeft: boolean = false): string {
  const rad1 = (startDeg * Math.PI) / 180;
  const rad2 = (endDeg * Math.PI) / 180;
  const x1 = Math.round(px + rOut * Math.cos(rad1));
  const y1 = Math.round(py + rOut * Math.sin(rad1));
  const x2 = Math.round(px + rOut * Math.cos(rad2));
  const y2 = Math.round(py + rOut * Math.sin(rad2));
  const x3 = Math.round(px + rIn * Math.cos(rad2));
  const y3 = Math.round(py + rIn * Math.sin(rad2));
  const x4 = Math.round(px + rIn * Math.cos(rad1));
  const y4 = Math.round(py + rIn * Math.sin(rad1));

  if (!isLeft) {
    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
  } else {
    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
  }
}

// 1. Arco Exterior de Números (r = 295 px, 10 teclas directas del 1 al 0)
const numbersChars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const arc0Numbers: KeyDefinition[] = numbersChars.map((c, i) => {
  const deg = -172 + i * ((172 - 94) / 9);
  return createPolarKey(`k_${c}`, c, c, 295, deg, { type: 'number', radius: 14.5 });
});

// 2. Arco Superior de Consonantes Bajas y Pares Fonotácticos (r = 250 px)
// Pares compartidos: J·H y Z·X
const upperKeysData: Array<{ id: string; char: string; display: string; alt?: string; sec?: string }> = [
  { id: 'k_q', char: 'q', display: 'Q', sec: '@' },
  { id: 'k_b', char: 'b', display: 'B', sec: '#' },
  { id: 'k_g', char: 'g', display: 'G', sec: '$' },
  { id: 'k_v', char: 'v', display: 'V', sec: '%' },
  { id: 'k_f', char: 'f', display: 'F', sec: '&' },
  { id: 'k_y', char: 'y', display: 'Y', sec: '*' },
  { id: 'k_jh', char: 'j', display: 'J·H', alt: 'h', sec: '(' },
  { id: 'k_zx', char: 'z', display: 'Z·X', alt: 'x', sec: ')' },
];
const arc1Upper: KeyDefinition[] = upperKeysData.map((k, i) => {
  const deg = -170 + i * ((170 - 94) / (upperKeysData.length - 1));
  return createPolarKey(k.id, k.char, k.display, 250, deg, {
    radius: 16.5,
    alternateChar: k.alt,
    secondaryChar: k.sec
  });
});

// 3. Arco Dorado (Sweet Spot del Español - r = 205 px)
// Pares compartidos: K·W
const goldenKeysData: Array<{ id: string; char: string; display: string; alt?: string; sec?: string }> = [
  { id: 'k_d', char: 'd', display: 'D', sec: '«' },
  { id: 'k_l', char: 'l', display: 'L', sec: '»' },
  { id: 'k_c', char: 'c', display: 'C', sec: '<' },
  { id: 'k_r', char: 'r', display: 'R', sec: '>' },
  { id: 'k_e', char: 'e', display: 'E' },
  { id: 'k_a', char: 'a', display: 'A' },
  { id: 'k_o', char: 'o', display: 'O' },
  { id: 'k_s', char: 's', display: 'S' },
  { id: 'k_kw', char: 'k', display: 'K·W', alt: 'w', sec: '=' },
];
const arc2Golden: KeyDefinition[] = goldenKeysData.map((k, i) => {
  const deg = -170 + i * ((170 - 94) / (goldenKeysData.length - 1));
  return createPolarKey(k.id, k.char, k.display, 205, deg, {
    radius: 17.5,
    alternateChar: k.alt,
    secondaryChar: k.sec
  });
});

// 4. Arco Medio (Vocales complementarias, Ñ, Tab y Shift - r = 160 px)
const midKeysData: Array<{ id: string; char: string; display: string; type?: KeyDefinition['type'] }> = [
  { id: 'k_tab', char: '\t', display: '⇥', type: 'action' },
  { id: 'k_shift', char: 'shift', display: '⇧', type: 'action' },
  { id: 'k_t', char: 't', display: 'T' },
  { id: 'k_n', char: 'n', display: 'N' },
  { id: 'k_m', char: 'm', display: 'M' },
  { id: 'k_p', char: 'p', display: 'P' },
  { id: 'k_u', char: 'u', display: 'U' },
  { id: 'k_i', char: 'i', display: 'I' },
  { id: 'k_ene', char: 'ñ', display: 'Ñ' },
];
const arc3Mid: KeyDefinition[] = midKeysData.map((k, i) => {
  const deg = -170 + i * ((170 - 94) / (midKeysData.length - 1));
  return createPolarKey(k.id, k.char, k.display, 160, deg, {
    radius: 16,
    type: k.type ?? 'letter'
  });
});

// 5. Controles Flanqueantes, Tilde y Puntuación (r = 118 px)
const arc4Controls: KeyDefinition[] = [
  createPolarKey('k_quest', '¿', '¿?', 118, -168, { type: 'punctuation', radius: 15 }),
  createPolarKey('k_tilde', '´', '´', 118, -152, { type: 'action', radius: 16 }),
  createPolarKey('k_comma', ',', ',', 118, -136, { type: 'punctuation', radius: 14 }),
  createPolarKey('k_dot', '.', '.', 118, -108, { type: 'punctuation', radius: 14 }),
  createPolarKey('k_bksp', '\b', '⌫', 118, -94, { type: 'action', radius: 16 }),
  createPolarKey('k_enter', '\n', '↵', 118, -80, { type: 'action', radius: 16 }),
];

// 6. Barra Espaciadora en Segmento de Arco (Curva con Ángulo de Barrido)
const spacebarRightPath = createRibbonPath(332, 325, 65, 98, -155, -95, false);
const spacebarKeyRight: KeyDefinition = {
  id: 'k_space',
  char: ' ',
  display: 'ESPACIO ⟷',
  type: 'space',
  x: 285,
  y: 260,
  radius: 30,
  path: spacebarRightPath,
  handAssigned: 'right'
};

export const radialSingleThumbLayout: LayoutDefinition = {
  id: 'radial-single-thumb-right',
  name: 'Polar Ergonómico Monomanual (Diestro)',
  description: 'Arco polar desplazado 5mm a la izquierda con abanico expandido. Incluye arco de números, barra espaciadora en segmento de arco, pares fonotácticos (J·H, Z·X, K·W), tecla de tilde (´), Shift y Tab.',
  mode: 'single-thumb-right',
  width: 360,
  height: 330,
  pivotPoints: {
    right: { x: 332, y: 325 }
  },
  keys: [
    ...arc0Numbers,
    ...arc1Upper,
    ...arc2Golden,
    ...arc3Mid,
    ...arc4Controls,
    spacebarKeyRight
  ]
};

// Layout Espejado para Pulgar Izquierdo (Pivote desplazado 5mm a la derecha desde la izquierda: x=28)
const spacebarLeftPath = createRibbonPath(28, 325, 65, 98, -25, -85, true);
export const radialSingleThumbLeftLayout: LayoutDefinition = {
  id: 'radial-single-thumb-left',
  name: 'Polar Ergonómico Monomanual (Zurdo)',
  description: 'Layout radial simétrico optimizado para pulgar izquierdo.',
  mode: 'single-thumb-left',
  width: 360,
  height: 330,
  pivotPoints: {
    left: { x: 28, y: 325 }
  },
  keys: [
    ...radialSingleThumbLayout.keys
      .filter(k => k.id !== 'k_space')
      .map(k => ({
        ...k,
        id: `${k.id}_left`,
        x: 360 - k.x,
        handAssigned: 'left' as const
      })),
    {
      id: 'k_space_left',
      char: ' ',
      display: 'ESPACIO ⟷',
      type: 'space',
      x: 360 - 285,
      y: 260,
      radius: 30,
      path: spacebarLeftPath,
      handAssigned: 'left'
    }
  ]
};
