import type { LayoutDefinition, KeyDefinition } from '../types';

export interface RadialTuningParams {
  pivotX: number;    // Posición X del pivote (px, base: 332)
  pivotY: number;    // Posición Y del pivote (px, base: 325)
  arcScale: number;  // Factor de escala de los arcos en % (base: 100)
  keyScale: number;  // Factor de tamaño de teclas en % (base: 100)
}

export const DEFAULT_RADIAL_TUNING: RadialTuningParams = {
  pivotX: 332,
  pivotY: 325,
  arcScale: 100,
  keyScale: 100
};

/**
 * Proyecta una tecla cartesiana a partir de coordenadas polares (r, thetaDeg)
 * ancladas al pivote del pulgar.
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
    hand?: 'left' | 'right';
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
    handAssigned: options.hand ?? 'right'
  };
}

function createRibbonPath(
  px: number,
  py: number,
  rIn: number,
  rOut: number,
  startDeg: number,
  endDeg: number,
  isLeft: boolean = false
): string {
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

/**
 * Genera el layout radial con parámetros de ajuste en tiempo real.
 * Cumple estrictamente la ley de escala polar: menor radio -> menos botones;
 * mayor radio -> más botones (5 < 7 < 9 < 10 < 11).
 */
export function createRadialSingleThumbLayout(
  params: Partial<RadialTuningParams> = {},
  isLeft: boolean = false
): LayoutDefinition {
  const pivotX = params.pivotX ?? DEFAULT_RADIAL_TUNING.pivotX;
  const pivotY = params.pivotY ?? DEFAULT_RADIAL_TUNING.pivotY;
  const arcScale = (params.arcScale ?? DEFAULT_RADIAL_TUNING.arcScale) / 100;
  const keyScale = (params.keyScale ?? DEFAULT_RADIAL_TUNING.keyScale) / 100;

  // Radios escalados según el factor de tamaño de arco
  const rNumbers = Math.round(295 * arcScale);
  const rUpper = Math.round(250 * arcScale);
  const rGolden = Math.round(205 * arcScale);
  const rMid = Math.round(160 * arcScale);
  const rControls = Math.round(118 * arcScale);
  const rInSpace = Math.round(65 * arcScale);
  const rOutSpace = Math.round(98 * arcScale);

  // 1. Arco Exterior de Números y Signo ¿? (r = rNumbers px, 11 botones)
  const arc0KeysData: Array<{ id: string; char: string; display: string; type: KeyDefinition['type'] }> = [
    { id: 'k_quest', char: '¿', display: '¿?', type: 'punctuation' },
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
  ];
  const arc0Numbers: KeyDefinition[] = arc0KeysData.map((k, i) => {
    const deg = -172 + i * ((172 - 92) / (arc0KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rNumbers, deg, {
      type: k.type,
      radius: Math.round(14.5 * keyScale),
      px: pivotX,
      py: pivotY
    });
  });

  // 2. Arco Superior de Consonantes Bajas, T y Pares Fonotácticos (r = rUpper px, 10 botones)
  const arc1KeysData: Array<{ id: string; char: string; display: string; alt?: string; sec?: string }> = [
    { id: 'k_q', char: 'q', display: 'Q', sec: '@' },
    { id: 'k_b', char: 'b', display: 'B', sec: '#' },
    { id: 'k_g', char: 'g', display: 'G', sec: '$' },
    { id: 'k_v', char: 'v', display: 'V', sec: '%' },
    { id: 'k_f', char: 'f', display: 'F', sec: '&' },
    { id: 'k_y', char: 'y', display: 'Y', sec: '*' },
    { id: 'k_t', char: 't', display: 'T', sec: '/' },
    { id: 'k_kw', char: 'k', display: 'K·W', alt: 'w', sec: '=' },
    { id: 'k_jh', char: 'j', display: 'J·H', alt: 'h', sec: '(' },
    { id: 'k_zx', char: 'z', display: 'Z·X', alt: 'x', sec: ')' },
  ];
  const arc1Upper: KeyDefinition[] = arc1KeysData.map((k, i) => {
    const deg = -170 + i * ((170 - 94) / (arc1KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rUpper, deg, {
      radius: Math.round(16.5 * keyScale),
      alternateChar: k.alt,
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

  // 3. Arco Dorado (Sweet Spot del Español - r = rGolden px, 9 botones de máxima frecuencia)
  const arc2KeysData: Array<{ id: string; char: string; display: string; sec?: string }> = [
    { id: 'k_d', char: 'd', display: 'D', sec: '«' },
    { id: 'k_l', char: 'l', display: 'L', sec: '»' },
    { id: 'k_c', char: 'c', display: 'C', sec: '<' },
    { id: 'k_r', char: 'r', display: 'R', sec: '>' },
    { id: 'k_e', char: 'e', display: 'E' },
    { id: 'k_a', char: 'a', display: 'A' },
    { id: 'k_o', char: 'o', display: 'O' },
    { id: 'k_s', char: 's', display: 'S' },
    { id: 'k_n', char: 'n', display: 'N' },
  ];
  const arc2Golden: KeyDefinition[] = arc2KeysData.map((k, i) => {
    const deg = -170 + i * ((170 - 94) / (arc2KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rGolden, deg, {
      radius: Math.round(17.5 * keyScale),
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

  // 4. Arco Medio (Tab, Shift, U, I, M, P, Ñ - r = rMid px, 7 botones)
  const arc3KeysData: Array<{ id: string; char: string; display: string; type?: KeyDefinition['type'] }> = [
    { id: 'k_tab', char: '\t', display: '⇥', type: 'action' },
    { id: 'k_shift', char: 'shift', display: '⇧', type: 'action' },
    { id: 'k_u', char: 'u', display: 'U' },
    { id: 'k_i', char: 'i', display: 'I' },
    { id: 'k_m', char: 'm', display: 'M' },
    { id: 'k_p', char: 'p', display: 'P' },
    { id: 'k_ene', char: 'ñ', display: 'Ñ' },
  ];
  const arc3Mid: KeyDefinition[] = arc3KeysData.map((k, i) => {
    const deg = -170 + i * ((170 - 94) / (arc3KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rMid, deg, {
      radius: Math.round(16 * keyScale),
      type: k.type ?? 'letter',
      px: pivotX,
      py: pivotY
    });
  });

  // 5. Controles Flanqueantes, Tilde y Puntuación (r = rControls px, 5 botones)
  const arc4ControlsData: Array<{ id: string; char: string; display: string; type: KeyDefinition['type']; deg: number; rad: number }> = [
    { id: 'k_tilde', char: '´', display: '´', type: 'action', deg: -160, rad: 16 },
    { id: 'k_comma', char: ',', display: ',', type: 'punctuation', deg: -142, rad: 14 },
    { id: 'k_dot', char: '.', display: '.', type: 'punctuation', deg: -124, rad: 14 },
    { id: 'k_bksp', char: '\b', display: '⌫', type: 'action', deg: -104, rad: 16 },
    { id: 'k_enter', char: '\n', display: '↵', type: 'action', deg: -84, rad: 16 },
  ];
  const arc4Controls: KeyDefinition[] = arc4ControlsData.map(k => {
    return createPolarKey(k.id, k.char, k.display, rControls, k.deg, {
      type: k.type,
      radius: Math.round(k.rad * keyScale),
      px: pivotX,
      py: pivotY
    });
  });

  // 6. Barra Espaciadora en Segmento de Arco (Curva Ergonómica)
  const spacebarRightPath = createRibbonPath(pivotX, pivotY, rInSpace, rOutSpace, -155, -95, false);
  const rMidSpace = (rInSpace + rOutSpace) / 2;
  const spaceKeyRight: KeyDefinition = {
    id: 'k_space',
    char: ' ',
    display: 'ESPACIO ⟷',
    type: 'space',
    x: Math.round(pivotX + rMidSpace * Math.cos((-125 * Math.PI) / 180)),
    y: Math.round(pivotY + rMidSpace * Math.sin((-125 * Math.PI) / 180)),
    radius: Math.round(30 * keyScale),
    path: spacebarRightPath,
    handAssigned: 'right'
  };

  const rightKeys = [
    ...arc0Numbers,
    ...arc1Upper,
    ...arc2Golden,
    ...arc3Mid,
    ...arc4Controls,
    spaceKeyRight
  ];

  if (!isLeft) {
    return {
      id: 'radial-single-thumb-right',
      name: 'Polar Ergonómico Monomanual (Diestro)',
      description: 'Arco polar adaptativo con menor densidad en menor radio (5 < 7 < 9 < 10 < 11). Incluye números, barra curva, tilde, Shift y Tab.',
      mode: 'single-thumb-right',
      width: 360,
      height: 330,
      pivotPoints: {
        right: { x: pivotX, y: pivotY }
      },
      arcRadii: [rNumbers, rUpper, rGolden, rMid, rControls],
      keys: rightKeys
    };
  }

  // Versión simétrica espejada para pulgar izquierdo
  const leftPivotX = 360 - pivotX;
  const spacebarLeftPath = createRibbonPath(leftPivotX, pivotY, rInSpace, rOutSpace, -25, -85, true);
  const leftKeys: KeyDefinition[] = [
    ...rightKeys
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
      x: 360 - spaceKeyRight.x,
      y: spaceKeyRight.y,
      radius: spaceKeyRight.radius,
      path: spacebarLeftPath,
      handAssigned: 'left'
    }
  ];

  return {
    id: 'radial-single-thumb-left',
    name: 'Polar Ergonómico Monomanual (Zurdo)',
    description: 'Layout radial simétrico para pulgar izquierdo con densidad creciente (5 < 7 < 9 < 10 < 11).',
    mode: 'single-thumb-left',
    width: 360,
    height: 330,
    pivotPoints: {
      left: { x: leftPivotX, y: pivotY }
    },
    arcRadii: [rNumbers, rUpper, rGolden, rMid, rControls],
    keys: leftKeys
  };
}

export const radialSingleThumbLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false);
export const radialSingleThumbLeftLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, true);
