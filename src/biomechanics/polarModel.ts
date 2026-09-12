import type { Handedness } from '../types';

export interface PolarCoord {
  r: number;
  theta: number; // Radianes (-PI a PI)
}

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Retorna el centro articular (pivote CMC) en función de la mano y dimensiones del viewport.
 */
export function getThumbPivot(handedness: Handedness, width: number, height: number): Point2D {
  if (handedness === 'left') {
    // Esquina inferior izquierda ligeramente hacia afuera
    return { x: 0, y: height };
  }
  // Mano derecha por defecto: esquina inferior derecha
  return { x: width, y: height };
}

/**
 * Convierte coordenadas cartesianas relativas a coordenadas polares ancladas al pivote.
 */
export function toPolar(p: Point2D, pivot: Point2D): PolarCoord {
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return {
    r: Math.hypot(dx, dy),
    theta: Math.atan2(dy, dx)
  };
}

/**
 * Calcula el costo fisiológico de alcance (reach / fatigue penalty).
 * El pulgar tiene una zona de mínimo torque (sweet spot: rOpt).
 * Estirar en exceso (r > rMax) o encoger excesivamente la palma (r < rMin) incrementa el esfuerzo.
 */
export function calculateReachCost(
  point: Point2D,
  pivot: Point2D,
  rOpt: number = 220,
  rTolerance: number = 60
): number {
  const polar = toPolar(point, pivot);
  const diff = Math.abs(polar.r - rOpt);

  if (diff <= rTolerance) {
    // Zona de confort neutro: costo despreciable
    return (diff / rTolerance) * 0.2;
  }

  // Crecimiento cuadrático del esfuerzo fuera de la zona de confort
  const excess = diff - rTolerance;
  return 0.2 + Math.pow(excess / 80, 2);
}

/**
 * Calcula el polígono aproximado de oclusión visual del pulgar (sombra anatómica).
 * Cuando la yema toca en `touch`, la falange proximal y la mano ocluyen un cono hacia `pivot`.
 */
export function getOcclusionPolygon(touch: Point2D, pivot: Point2D, thumbWidth: number = 38): Point2D[] {
  const angle = Math.atan2(pivot.y - touch.y, pivot.x - touch.x);
  const perp = angle + Math.PI / 2;

  const halfW = thumbWidth / 2;
  const baseW = thumbWidth * 1.5;

  // Cuadrilátero trapezoidal que proyecta la sombra del dedo desde la yema hasta la base de la mano
  return [
    {
      x: touch.x + halfW * Math.cos(perp),
      y: touch.y + halfW * Math.sin(perp)
    },
    {
      x: touch.x - halfW * Math.cos(perp),
      y: touch.y - halfW * Math.sin(perp)
    },
    {
      x: pivot.x - baseW * Math.cos(perp),
      y: pivot.y - baseW * Math.sin(perp)
    },
    {
      x: pivot.x + baseW * Math.cos(perp),
      y: pivot.y + baseW * Math.sin(perp)
    }
  ];
}

/**
 * Evalúa si un punto destino queda tapado (ocluido) por la presencia del pulgar sobre el punto actual.
 * Algoritmo Point-in-Polygon (Ray casting).
 */
export function isPointOccluded(target: Point2D, touch: Point2D, pivot: Point2D): boolean {
  // Si el destino es exactamente el mismo punto de toque, no se considera oclusión externa
  if (Math.hypot(target.x - touch.x, target.y - touch.y) < 15) {
    return false;
  }

  const polygon = getOcclusionPolygon(touch, pivot);
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > target.y) !== (yj > target.y)) &&
      (target.x < (xj - xi) * (target.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
