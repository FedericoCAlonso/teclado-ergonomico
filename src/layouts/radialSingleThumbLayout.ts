import type { LayoutDefinition, KeyDefinition, KeyboardLayer } from '../types';

export type RadialLetterMapping = 'phonotactic' | 'qwerty-horizontal' | 'qwerty-column';
export type { KeyboardLayer };

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
  layer?: KeyboardLayer;
}

export const DEFAULT_RADIAL_TUNING: RadialTuningParams = {
  pivotX: 332,
  pivotY: 325,
  arcScale: 80,
  keyScale: 75,
  mapping: 'qwerty-column'
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
      { id: 'k_iy', char: 'i', display: 'i', sec: 'y' },
      { id: 'k_dv', char: 'd', display: 'd', sec: 'v' },
      { id: 'k_lh', char: 'l', display: 'l', sec: 'h' },
      { id: 'k_cq', char: 'c', display: 'c', sec: 'q' },
      { id: 'k_tx', char: 't', display: 't', sec: 'x' },
      { id: 'k_uw', char: 'u', display: 'u', sec: 'w' },
      { id: 'k_mg', char: 'm', display: 'm', sec: 'g' },
      { id: 'k_pb', char: 'p', display: 'p', sec: 'b' },
    ],
    golden: [
      { id: 'k_ej', char: 'e', display: 'e', sec: 'j' },
      { id: 'k_ak', char: 'a', display: 'a', sec: 'k' },
      { id: 'k_odot', char: 'o', display: 'o', sec: '.' },
      { id: 'k_sz', char: 's', display: 's', sec: 'z' },
      { id: 'k_rf', char: 'r', display: 'r', sec: 'f' },
      { id: 'k_nene', char: 'n', display: 'n', sec: 'ñ' },
    ]
  },
  'qwerty-horizontal': {
    name: 'QWERTY 1 (Horizontal)',
    upper: [
      { id: 'k_qw', char: 'q', display: 'q', sec: 'w' },
      { id: 'k_er', char: 'e', display: 'e', sec: 'r' },
      { id: 'k_ty', char: 't', display: 't', sec: 'y' },
      { id: 'k_ui', char: 'i', display: 'i', sec: 'u' },
      { id: 'k_op', char: 'o', display: 'o', sec: 'p' },
      { id: 'k_zx', char: 'z', display: 'z', sec: 'x' },
      { id: 'k_cv', char: 'c', display: 'c', sec: 'v' },
      { id: 'k_bn', char: 'n', display: 'n', sec: 'b' },
    ],
    golden: [
      { id: 'k_as', char: 'a', display: 'a', sec: 's' },
      { id: 'k_df', char: 'd', display: 'd', sec: 'f' },
      { id: 'k_gh', char: 'g', display: 'g', sec: 'h' },
      { id: 'k_jk', char: 'j', display: 'j', sec: 'k' },
      { id: 'k_lnene', char: 'l', display: 'l', sec: 'ñ' },
      { id: 'k_mdot', char: 'm', display: 'm', sec: '.' },
    ]
  },
  'qwerty-column': {
    name: 'QWERTY 2 (Columnas)',
    upper: [
      { id: 'k_qw', char: 'q', display: 'q', sec: 'w' },
      { id: 'k_edot', char: 'e', display: 'e', sec: '.' },
      { id: 'k_yh', char: 'y', display: 'y', sec: 'h' },
      { id: 'k_uj', char: 'u', display: 'u', sec: 'j' },
      { id: 'k_ik', char: 'i', display: 'i', sec: 'k' },
      { id: 'k_op', char: 'o', display: 'o', sec: 'p' },
      { id: 'k_nb', char: 'n', display: 'n', sec: 'b' },
      { id: 'k_mv', char: 'm', display: 'm', sec: 'v' },
    ],
    golden: [
      { id: 'k_az', char: 'a', display: 'a', sec: 'z' },
      { id: 'k_sx', char: 's', display: 's', sec: 'x' },
      { id: 'k_dc', char: 'd', display: 'd', sec: 'c' },
      { id: 'k_rf', char: 'r', display: 'r', sec: 'f' },
      { id: 'k_tg', char: 't', display: 't', sec: 'g' },
      { id: 'k_lnene', char: 'l', display: 'l', sec: 'ñ' },
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
  mapping?: RadialLetterMapping,
  layer?: KeyboardLayer
): LayoutDefinition {
  const pivotX = params.pivotX ?? DEFAULT_RADIAL_TUNING.pivotX;
  const pivotY = params.pivotY ?? DEFAULT_RADIAL_TUNING.pivotY;
  const arcScale = (params.arcScale ?? DEFAULT_RADIAL_TUNING.arcScale) / 100;
  const keyScale = (params.keyScale ?? DEFAULT_RADIAL_TUNING.keyScale) / 100;
  const activeMapping = mapping ?? params.mapping ?? 'qwerty-column';
  const activeLayer = layer ?? params.layer ?? 'abc';
  const config = MAPPING_CONFIGS[activeMapping] ?? MAPPING_CONFIGS.phonotactic;

  // Radios concéntricos calculados sobre la base angular ergonómica
  const rNumbers = Math.round(295 * arcScale);
  const rUpper = Math.round(245 * arcScale);
  const rGolden = Math.round(192 * arcScale);
  const rControls = Math.round(138 * arcScale);
  const rInSpace = Math.round(52 * arcScale);
  const rOutSpace = Math.round(92 * arcScale);

  // 1. Arco Exterior (r = rNumbers px, 10 botones)
  let arc0KeysData: Array<{ id: string; char: string; display: string; sec?: string; type?: KeyDefinition['type'] }>;
  // 2. Arco Superior (r = rUpper px, 8 botones)
  let arc1KeysData: Array<{ id: string; char: string; display: string; sec?: string; type?: KeyDefinition['type'] }>;
  // 3. Arco Dorado Interior (r = rGolden px, 6 botones)
  let arc2KeysData: Array<{ id: string; char: string; display: string; sec?: string; type?: KeyDefinition['type'] }>;
  // 4. Arco Interior de Controles (r = rControls px, 5 botones)
  let arc3ControlsData: Array<{
    id: string;
    char: string;
    display: string;
    sec?: string;
    type: KeyDefinition['type'];
    deg: number;
    rad: number;
  }>;

  if (activeLayer === '123') {
    // Capa Numérica: Polar Numpad Mix (3x3 en arcos) + Operadores + Accesos
    arc0KeysData = [
      { id: 'k_acc_abc', char: 'layer_abc', display: 'ABC', sec: 'A', type: 'action' },
      { id: 'k_acc_sym', char: 'layer_sym', display: 'SYM', sec: '#', type: 'action' },
      { id: 'k_par_o', char: '(', display: '(', sec: '[', type: 'punctuation' },
      { id: 'k_par_c', char: ')', display: ')', sec: ']', type: 'punctuation' },
      { id: 'k_num_7', char: '7', display: '7', sec: '&', type: 'number' },
      { id: 'k_num_8', char: '8', display: '8', sec: '[', type: 'number' },
      { id: 'k_num_9', char: '9', display: '9', sec: ']', type: 'number' },
      { id: 'k_op_div', char: '/', display: '/', sec: '\\', type: 'punctuation' },
      { id: 'k_op_mul', char: '*', display: '*', sec: '×', type: 'punctuation' },
      { id: 'k_bksp_123', char: '\b', display: '⌫', type: 'action' },
    ];

    arc1KeysData = [
      { id: 'k_acc_esc', char: 'esc', display: 'Esc', type: 'action' },
      { id: 'k_acc_tab', char: '\t', display: 'Tab', type: 'action' },
      { id: 'k_num_4', char: '4', display: '4', sec: '$', type: 'number' },
      { id: 'k_num_5', char: '5', display: '5', sec: '{', type: 'number' },
      { id: 'k_num_6', char: '6', display: '6', sec: '}', type: 'number' },
      { id: 'k_op_sub', char: '-', display: '-', sec: '_', type: 'punctuation' },
      { id: 'k_op_add', char: '+', display: '+', sec: '±', type: 'punctuation' },
      { id: 'k_op_pow', char: '^', display: '^', sec: '%', type: 'punctuation' },
    ];

    arc2KeysData = [
      { id: 'k_num_1', char: '1', display: '1', sec: '!', type: 'number' },
      { id: 'k_num_2', char: '2', display: '2', sec: '"', type: 'number' },
      { id: 'k_num_3', char: '3', display: '3', sec: '#', type: 'number' },
      { id: 'k_op_eq', char: '=', display: '=', sec: '≈', type: 'punctuation' },
      { id: 'k_num_0', char: '0', display: '0', sec: '°', type: 'number' },
      { id: 'k_num_dot', char: '.', display: '.', sec: ',', type: 'punctuation' },
    ];

    arc3ControlsData = [
      { id: 'k_ctrl', char: 'ctrl', display: 'Ctrl', type: 'action', deg: -165, rad: 20 },
      { id: 'k_alt', char: 'alt', display: 'Alt', type: 'action', deg: -147, rad: 20 },
      { id: 'k_comma', char: ',', display: ',', sec: ':', type: 'punctuation', deg: -129, rad: 18 },
      { id: 'k_supr', char: 'delete_forward', display: 'Supr', type: 'action', deg: -111, rad: 20 },
      { id: 'k_enter', char: '\n', display: '↵', type: 'action', deg: -93, rad: 20 },
    ];
  } else if (activeLayer === 'sym') {
    // Capa de Símbolos: Programación y Puntuación Técnica
    arc0KeysData = [
      { id: 'k_sym_abc', char: 'layer_abc', display: 'ABC', type: 'action' },
      { id: 'k_sym_123', char: 'layer_123', display: '123', type: 'action' },
      { id: 'k_sym_sqo', char: '[', display: '[', sec: '(', type: 'punctuation' },
      { id: 'k_sym_sqc', char: ']', display: ']', sec: ')', type: 'punctuation' },
      { id: 'k_sym_cro', char: '{', display: '{', sec: '<', type: 'punctuation' },
      { id: 'k_sym_crc', char: '}', display: '}', sec: '>', type: 'punctuation' },
      { id: 'k_sym_lto', char: '<', display: '<', sec: '«', type: 'punctuation' },
      { id: 'k_sym_gto', char: '>', display: '>', sec: '»', type: 'punctuation' },
      { id: 'k_sym_bsh', char: '\\', display: '\\', sec: '/', type: 'punctuation' },
      { id: 'k_sym_pip', char: '|', display: '|', sec: '¦', type: 'punctuation' },
    ];

    arc1KeysData = [
      { id: 'k_sym_at', char: '@', display: '@', sec: '€', type: 'punctuation' },
      { id: 'k_sym_hsh', char: '#', display: '#', sec: '№', type: 'punctuation' },
      { id: 'k_sym_dlr', char: '$', display: '$', sec: '¥', type: 'punctuation' },
      { id: 'k_sym_pct', char: '%', display: '%', sec: '‰', type: 'punctuation' },
      { id: 'k_sym_amp', char: '&', display: '&', sec: '§', type: 'punctuation' },
      { id: 'k_sym_und', char: '_', display: '_', sec: '-', type: 'punctuation' },
      { id: 'k_sym_tld', char: '~', display: '~', sec: '`', type: 'punctuation' },
      { id: 'k_sym_crt', char: '^', display: '^', sec: '°', type: 'punctuation' },
    ];

    arc2KeysData = [
      { id: 'k_sym_dqt', char: '"', display: '"', sec: '“', type: 'punctuation' },
      { id: 'k_sym_sqt', char: '\'', display: '\'', sec: '‘', type: 'punctuation' },
      { id: 'k_sym_qmo', char: '¿', display: '¿', sec: '?', type: 'punctuation' },
      { id: 'k_sym_qmc', char: '?', display: '?', sec: '¿', type: 'punctuation' },
      { id: 'k_sym_emo', char: '¡', display: '¡', sec: '!', type: 'punctuation' },
      { id: 'k_sym_emc', char: '!', display: '!', sec: '¡', type: 'punctuation' },
    ];

    arc3ControlsData = [
      { id: 'k_sym_col', char: ':', display: ':', type: 'punctuation', deg: -165, rad: 20 },
      { id: 'k_sym_sem', char: ';', display: ';', type: 'punctuation', deg: -147, rad: 20 },
      { id: 'k_sym_gra', char: '`', display: '`', type: 'punctuation', deg: -129, rad: 18 },
      { id: 'k_bksp', char: '\b', display: '⌫', type: 'action', deg: -111, rad: 20 },
      { id: 'k_enter', char: '\n', display: '↵', type: 'action', deg: -93, rad: 20 },
    ];
  } else {
    // Capa Alfabética Principal (ABC)
    // Arco Exterior: Teclas accesorias y accesos directos (con números 1..0 en flick)
    arc0KeysData = [
      { id: 'k_acc_123', char: 'layer_123', display: '123', sec: '1', type: 'action' },
      { id: 'k_acc_sym', char: 'layer_sym', display: 'SYM', sec: '2', type: 'action' },
      { id: 'k_acc_ctrl', char: 'ctrl', display: 'Ctrl', sec: '3', type: 'action' },
      { id: 'k_acc_alt', char: 'alt', display: 'Alt', sec: '4', type: 'action' },
      { id: 'k_acc_esc', char: 'esc', display: 'Esc', sec: '5', type: 'action' },
      { id: 'k_acc_tab', char: '\t', display: 'Tab', sec: '6', type: 'action' },
      { id: 'k_acc_supr', char: 'delete_forward', display: 'Supr', sec: '7', type: 'action' },
      { id: 'k_acc_undo', char: 'undo', display: '↶', sec: '8', type: 'action' },
      { id: 'k_acc_paste', char: 'paste', display: '📋', sec: '9', type: 'action' },
      { id: 'k_acc_copy', char: 'copy', display: '📄', sec: '0', type: 'action' },
    ];

    arc1KeysData = config.upper;
    arc2KeysData = config.golden;

    arc3ControlsData = [
      { id: 'k_shift', char: 'shift', display: '⇧', sec: '\t', type: 'action', deg: -165, rad: 20 },
      { id: 'k_tilde', char: '´', display: '´', sec: '¿', type: 'action', deg: -147, rad: 20 },
      { id: 'k_comma', char: ',', display: ',', sec: ':', type: 'punctuation', deg: -129, rad: 18 },
      { id: 'k_bksp', char: '\b', display: '⌫', type: 'action', deg: -111, rad: 20 },
      { id: 'k_enter', char: '\n', display: '↵', type: 'action', deg: -93, rad: 20 },
    ];
  }

  const arc0Keys: KeyDefinition[] = arc0KeysData.map((k, i) => {
    const deg = -172 + i * ((172 - 90) / (arc0KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rNumbers, deg, {
      type: k.type ?? 'action',
      secondaryChar: k.sec,
      radius: Math.round(18 * keyScale),
      px: pivotX,
      py: pivotY
    });
  });

  const arc1Keys: KeyDefinition[] = arc1KeysData.map((k, i) => {
    const deg = -170 + i * ((170 - 90) / (arc1KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rUpper, deg, {
      type: k.type ?? 'letter',
      radius: Math.round(22 * keyScale),
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

  const arc2Keys: KeyDefinition[] = arc2KeysData.map((k, i) => {
    const deg = -168 + i * ((168 - 92) / (arc2KeysData.length - 1));
    return createPolarKey(k.id, k.char, k.display, rGolden, deg, {
      type: k.type ?? 'letter',
      radius: Math.round(24 * keyScale),
      secondaryChar: k.sec,
      px: pivotX,
      py: pivotY
    });
  });

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
    display: '⟷',
    type: 'space',
    x: Math.round(pivotX + rMidSpace * Math.cos((-125 * Math.PI) / 180)),
    y: Math.round(pivotY + rMidSpace * Math.sin((-125 * Math.PI) / 180)),
    radius: Math.round(32 * keyScale),
    path: spacebarRightPath,
    handAssigned: 'right'
  };

  const rightKeys = [
    ...arc0Keys,
    ...arc1Keys,
    ...arc2Keys,
    ...arc3Controls,
    spaceKeyRight
  ];

  const layerLabel = activeLayer === 'abc' ? config.name : activeLayer === '123' ? 'NumPad Polar (123)' : 'Símbolos (SYM)';

  if (!isLeft) {
    return {
      id: 'radial-single-thumb-right',
      name: `Polar Ergonómico Monomanual (Diestro - ${layerLabel})`,
      description: `Layout polar monomanual (${layerLabel}). Densidad creciente: Controles (5) < Golden (6) < Upper (8) < Exterior (10).`,
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
      display: '⟷',
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
    name: `Polar Ergonómico Monomanual (Zurdo - ${layerLabel})`,
    description: `Layout radial simétrico para pulgar izquierdo (${layerLabel}) con densidad creciente (5 < 6 < 8 < 10).`,
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

export const radialSingleThumbLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'qwerty-column', 'abc');
export const radialSingleThumbLeftLayout: LayoutDefinition = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, true, 'qwerty-column', 'abc');
