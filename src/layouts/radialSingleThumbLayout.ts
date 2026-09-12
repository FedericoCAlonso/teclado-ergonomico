import type { LayoutDefinition, KeyDefinition } from '../types';

export type RadialLetterMapping = 'phonotactic' | 'qwerty-horizontal' | 'qwerty-column';

export interface RadialLetterMappingOption {
  id: RadialLetterMapping;
  name: string;
  shortName: string;
  description: string;
}

export const RADIAL_MAPPING_OPTIONS: RadialLetterMappingOption[] = [
  {
    id: 'phonotactic',
    name: 'Original (Frecuencia Fonotáctica)',
    shortName: 'Original',
    description: 'Letras reinas (E, A, O, S, R, N) en arco dorado. Máxima tasa de toque simple (~94% Tap).'
  },
  {
    id: 'qwerty-horizontal',
    name: 'QWERTY 1 (Pares Horizontales)',
    shortName: 'QWERTY 1',
    description: 'Pares contiguos por filas: Q-W, E-R, T-Y / A-S, D-F, G-H... Búsqueda visual inmediata.'
  },
  {
    id: 'qwerty-column',
    name: 'QWERTY 2 (Columnas y Zonas)',
    shortName: 'QWERTY 2',
    description: 'Cada letra principal emparejada con su vecina de columna vertical (A-Z, S-X, D-C...).'
  }
];

export interface RadialTuningParams {
  pivotX: number;    // Posición X del pivote (px, base: 332)
  pivotY: number;    // Posición Y del pivote (px, base: 325)
  arcScale: number;  // Factor de escala de los arcos en % (base: 80)
  keyScale: number;  // Factor de tamaño de teclas en % (base: 75)
  mapping?: RadialLetterMapping;
}

export const DEFAULT_RADIAL_TUNING: RadialTuningParams = {
  pivotX: 332,
  pivotY: 325,
  arcScale: 80,
  keyScale: 75,
  mapping: 'phonotactic'
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

const MAPPING_CONFIGS: Record<
  RadialLetterMapping,
  {
    name: string;
    upper: Array<{ id: string; char: string; display: string; sec: string }>;
    golden: Array<{ id: string; char: string; display: string; sec: string }>;
  }
> = {
  'phonotactic': {
    name: 'Original (Frecuencia)',
    upper: [
      { id: 'k_iy', char: 'i', display: 'I', sec: 'y' },
      { id: 'k_dv', char: 'd', display: 'D', sec: 'v' },
      { id: 'k_lh', char: 'l', display: 'L', sec: 'h' },
      { id: 'k_cq', char: 'c', display: 'C', sec: 'q' },
      { id: 'k_tx', char: 't', display: 'T', sec: 'x' },
      { id: 'k_uw', char: 'u', display: 'U', sec: 'w' },
      { id: 'k_mg', char: 'm', display: 'M', sec: 'g' },
      { id: 'k_pb', char: 'p', display: 'P', sec: 'b' },
    ],
    golden: [
      { id: 'k_ej', char: 'e', display: 'E', sec: 'j' },
      { id: 'k_ak', char: 'a', display: 'A', sec: 'k' },
      { id: 'k_odot', char: 'o', display: 'O', sec: '.' },
      { id: 'k_sz', char: 's', display: 'S', sec: 'z' },
      { id: 'k_rf', char: 'r', display: 'R', sec: 'f' },
      { id: 'k_nene', char: 'n', display: 'N', sec: 'ñ' },
    ]
  },
  'qwerty-horizontal': {
    name: 'QWERTY 1 (Horizontal)',
    upper: [
      { id: 'k_qw', char: 'q', display: 'Q', sec: 'w' },
      { id: 'k_er', char: 'e', display: 'E', sec: 'r' },
      { id: 'k_ty', char: 't', display: 'T', sec: 'y' },
      { id: 'k_ui', char: 'i', display: 'I', sec: 'u' },
      { id: 'k_op', char: 'o', display: 'O', sec: 'p' },
      { id: 'k_zx', char: 'z', display: 'Z', sec: 'x' },
      { id: 'k_cv', char: 'c', display: 'C', sec: 'v' },
      { id: 'k_bn', char: 'n', display: 'N', sec: 'b' },
    ],
    golden: [
      { id: 'k_as', char: 'a', display: 'A', sec: 's' },
      { id: 'k_df', char: 'd', display: 'D', sec: 'f' },
      { id: 'k_gh', char: 'g', display: 'G', sec: 'h' },
      { id: 'k_jk', char: 'j', display: 'J', sec: 'k' },
      { id: 'k_lnene', char: 'l', display: 'L', sec: 'ñ' },
      { id: 'k_mdot', char: 'm', display: 'M', sec: '.' },
    ]
  },
  'qwerty-column': {
    name: 'QWERTY 2 (Columnas)',
    upper: [
      { id: 'k_qw', char: 'q', display: 'Q', sec: 'w' },
      { id: 'k_edot', char: 'e', display: 'E', sec: '.' },
      { id: 'k_yh', char: 'y', display: 'Y', sec: 'h' },
      { id: 'k_uj', char: 'u', display: 'U', sec: 'j' },
      { id: 'k_ik', char: 'i', display: 'I', sec: 'k' },
      { id: 'k_op', char: 'o', display: 'O', sec: 'p' },
      { id: 'k_nb', char: 'n', display: 'N', sec: 'b' },
      { id: 'k_mv', char: 'm', display: 'M', sec: 'v' },
    ],
    golden: [
      { id: 'k_az', char: 'a', display: 'A', sec: 'z' },
      { id: 'k_sx', char: 's', display: 'S', sec: 'x' },
      { id: 'k_dc', char: 'd', display: 'D', sec: 'c' },
      { id: 'k_rf', char: 'r', display: 'R', sec: 'f' },
      { id: 'k_tg', char: 't', display: 'T', sec: 'g' },
      { id: 'k_lnene', char: 'l', display: 'L', sec: 'ñ' },
    ]
  }
};

/**
 * Genera el layout radial con botones dobles (Opción C: Tap vs Flick).
 * Cumple estrictamente la ley de escala polar con densidad creciente:
 * Controles (5) < Golden Arc (6) < Upper Arc (8) < Numbers Arc (10).
 * Total: 14 botones dobles con las 27 letras del español.
 */
export function createRadialSingleThumbLayout(
  params: Partial<RadialTuningParams> = {},
  isLeft: boolean = false,
  mapping: RadialLetterMapping = 'phonotactic'
): LayoutDefinition {
  const pivotX = params.pivotX ?? DEFAULT_RADIAL_TUNING.pivotX;
  const pivotY = params.pivotY ?? DEFAULT_RADIAL_TUNING.pivotY;
  const arcScale = (params.arcScale ?? DEFAULT_RADIAL_TUNING.arcScale) / 100;
  const keyScale = (params.keyScale ?? DEFAULT_RADIAL_TUNING.keyScale) / 100;
  const activeMapping = params.mapping ?? mapping ?? 'phonotactic';
  const config = MAPPING_CONFIGS[activeMapping] ?? MAPPING_CONFIGS.phonotactic;

  // Radios concéntricos calculados sobre la base angular ergonómica
  const rNumbers = Math.round(295 * arcScale);
  const rUpper = Math.round(245 * arcScale);
  const rGolden = Math.round(192 * arcScale);
  const rControls = Math.round(138 * arcScale);
  const rInSpace = Math.round(52 * arcScale);
  const rOutSpace = Math.round(92 * arcScale);

  // 1. Arco Exterior de Números y Símbolos Directos (r = rNumbers px, 10 botones)
  const arc0KeysData: Array<{ id: string; char: string; display: string; sec: string }> = [
    { id: 'k_1', char: '1', display: '1', sec: '!' },
    { id: 'k_2', char: '2', display: '2', sec: '"' },
    { id: 'k_3', char: '3', display: '3', sec: '#' },
    { id: 'k_4', char: '4', display: '4', sec: '$' },
    { id: 'k_5', char: '5', display: '5', sec: '%' },
    { id: 'k_6', char: '6', display: '6', sec: '&' },
    { id: 'k_7', char: '7', display: '7', sec: '/' },
    { id: 'k_8', char: '8', display: '8', sec: '(' },
    { id: 'k_9', char: '9', display: '9', sec: ')' },
    { id: 'k_0', char: '0', display: '0', sec: '=' },
  ];
  const arc0Numbers: KeyDefinition[] = arc0KeysData.map((k, i) => {
    const deg = -172 + i * ((172 - 90) / (arc0KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rNumbers, deg, {
      type: 'number',
      secondaryChar: k.sec,
      radius: Math.round(18 * keyScale),
      px: pivotX,
      py: pivotY
    });
  });

  // 2. Arco Superior de Letras Dobles (r = rUpper px, 8 botones)
  const arc1KeysData = config.upper;
  const arc1Upper: KeyDefinition[] = arc1KeysData.map((k, i) => {
    const deg = -170 + i * ((170 - 90) / (arc1KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rUpper, deg, {
      radius: Math.round(22 * keyScale),
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

  // 3. Arco Dorado Interior de Letras Dobles (r = rGolden px, 6 botones)
  const arc2KeysData = config.golden;
  const arc2Golden: KeyDefinition[] = arc2KeysData.map((k, i) => {
    const deg = -168 + i * ((168 - 92) / (arc2KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rGolden, deg, {
      radius: Math.round(24 * keyScale),
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

  // 4. Arco Interior de Controles (r = rControls px, 5 botones)
  const arc3ControlsData: Array<{
    id: string;
    char: string;
    display: string;
    sec?: string;
    type: KeyDefinition['type'];
    deg: number;
    rad: number;
  }> = [
    { id: 'k_shift', char: 'shift', display: '⇧', sec: '\t', type: 'action', deg: -165, rad: 20 },
    { id: 'k_tilde', char: '´', display: '´', sec: '¿', type: 'action', deg: -147, rad: 20 },
    { id: 'k_comma', char: ',', display: ',', sec: ':', type: 'punctuation', deg: -129, rad: 18 },
    { id: 'k_bksp', char: '\b', display: '⌫', type: 'action', deg: -111, rad: 20 },
    { id: 'k_enter', char: '\n', display: '↵', type: 'action', deg: -93, rad: 20 },
  ];
  const arc3Controls: KeyDefinition[] = arc3ControlsData.map(k => {
    return createPolarKey(k.id, k.char, k.display, rControls, k.deg, {
      type: k.type,
      secondaryChar: k.sec,
      radius: Math.round(k.rad * keyScale),
      px: pivotX,
      py: pivotY
    });
  });

  // 5. Barra Espaciadora en Segmento de Cinta Curva
  const spacebarRightPath = createRibbonPath(pivotX, pivotY, rInSpace, rOutSpace, -155, -95, false);
  const rMidSpace = (rInSpace + rOutSpace) / 2;
  const spaceKeyRight: KeyDefinition = {
    id: 'k_space',
    char: ' ',
    display: 'ESPACIO ⟷',
    type: 'space',
    x: Math.round(pivotX + rMidSpace * Math.cos((-125 * Math.PI) / 180)),
    y: Math.round(pivotY + rMidSpace * Math.sin((-125 * Math.PI) / 180)),
    radius: Math.round(32 * keyScale),
    path: spacebarRightPath,
    handAssigned: 'right'
  };

  const rightKeys = [
    ...arc0Numbers,
    ...arc1Upper,
    ...arc2Golden,
    ...arc3Controls,
    spaceKeyRight
  ];

  const mappingLabel = config.name;

  if (!isLeft) {
    return {
      id: 'radial-single-thumb-right',
      name: `Polar Ergonómico Monomanual (Diestro - ${mappingLabel})`,
      description: `14 botones dobles (Tap vs Flick - ${mappingLabel}) con las 27 letras del español. Densidad creciente: Controles (5) < Golden (6) < Upper (8) < Números (10).`,
      mode: 'single-thumb-right',
      width: 360,
      height: 330,
      pivotPoints: {
        right: { x: pivotX, y: pivotY }
      },
      arcRadii: [rNumbers, rUpper, rGolden, rControls],
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
    name: `Polar Ergonómico Monomanual (Zurdo - ${mappingLabel})`,
    description: `Layout radial simétrico para pulgar izquierdo (${mappingLabel}) con 14 botones dobles (5 < 6 < 8 < 10).`,
    mode: 'single-thumb-left',
    width: 360,
    height: 330,
    pivotPoints: {
      left: { x: leftPivotX, y: pivotY }
    },
    arcRadii: [rNumbers, rUpper, rGolden, rControls],
    keys: leftKeys
  };
}

export const radialSingleThumbLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'phonotactic');
export const radialSingleThumbLeftLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, true, 'phonotactic');
