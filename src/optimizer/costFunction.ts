import type { LayoutDefinition, KeyDefinition, CostWeights, CostBreakdown } from '../types';
import type { Point2D } from '../biomechanics/polarModel';
import { toPolar, calculateReachCost, isPointOccluded } from '../biomechanics/polarModel';
import { getBigramProbability } from '../linguistics/spanishCorpus';

export const DEFAULT_COST_WEIGHTS: CostWeights = {
  w1_movement: 1.0,   // Distancia biomecánica
  w2_transition: 1.2, // Inversión inercial de trayectoria
  w3_error: 0.8,      // Proximidad de caracteres ambiguos
  w4_occlusion: 1.5,  // Oclusión visual de la siguiente letra
  w5_reach: 1.0       // Alejamiento de la zona neutra de confort
};

/**
 * Evalúa el costo ergonómico total de un layout para escribir un texto de muestra en español.
 */
export function evaluateLayoutCost(
  layout: LayoutDefinition,
  text: string,
  weights: CostWeights = DEFAULT_COST_WEIGHTS
): CostBreakdown {
  const cleanText = text.toLowerCase();
  const keyMap = new Map<string, KeyDefinition>();
  layout.keys.forEach(k => {
    keyMap.set(k.char.toLowerCase(), k);
    if (k.secondaryChar) keyMap.set(k.secondaryChar.toLowerCase(), k);
    if (k.accentChar) keyMap.set(k.accentChar.toLowerCase(), k);
  });

  const pivot = layout.pivotPoints.right ?? { x: layout.width, y: layout.height };

  let totalMovement = 0;
  let totalTransition = 0;
  let totalOcclusion = 0;
  let totalReach = 0;
  let totalError = 0;
  let validSteps = 0;

  let prevVector: Point2D | null = null;
  let prevKey: KeyDefinition | null = null;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const key = keyMap.get(char);
    if (!key) continue;

    // 1. Costo de alcance estático (Reach / Fatigue)
    const reachCost = calculateReachCost({ x: key.x, y: key.y }, pivot);
    totalReach += reachCost;

    if (prevKey) {
      // 2. Costo de movimiento biomecánico (Polar Distance)
      const pPrev: Point2D = { x: prevKey.x, y: prevKey.y };
      const pCurr: Point2D = { x: key.x, y: key.y };

      const polarPrev = toPolar(pPrev, pivot);
      const polarCurr = toPolar(pCurr, pivot);

      // Movimiento a lo largo del arco (dTheta) es más fluido que estirar/encoger el radio (dr)
      const deltaR = Math.abs(polarCurr.r - polarPrev.r);
      const deltaTheta = Math.abs(polarCurr.theta - polarPrev.theta);
      const avgR = (polarPrev.r + polarCurr.r) / 2;
      const arcDistance = avgR * deltaTheta;

      // El estiramiento radial cuesta el doble que el giro en arco
      const bioDistance = (deltaR * 1.8 + arcDistance * 0.9) / 100;
      totalMovement += bioDistance;

      // 3. Costo de cambio de inercia y dirección (Transition penalty)
      const currVector: Point2D = { x: pCurr.x - pPrev.x, y: pCurr.y - pPrev.y };
      if (prevVector) {
        const magPrev = Math.hypot(prevVector.x, prevVector.y);
        const magCurr = Math.hypot(currVector.x, currVector.y);

        if (magPrev > 1 && magCurr > 1) {
          // Coseno del ángulo entre el vector previo y el actual
          const dot = (prevVector.x * currVector.x + prevVector.y * currVector.y) / (magPrev * magCurr);
          // Si dot == -1 (inversión en 180°), costo máximo = 2. Si dot == 1 (continuidad recta), costo = 0.
          const angleReversalCost = (1 - dot);
          totalTransition += angleReversalCost;
        }
      }
      prevVector = currVector;

      // 4. Costo de oclusión visual del pulgar sobre la tecla destino
      if (isPointOccluded(pCurr, pPrev, pivot)) {
        const bigramProb = getBigramProbability(prevKey.char, key.char);
        // La penalización es mayor si la tecla ocluida pertenece a un bigrama de alta frecuencia
        totalOcclusion += (1.0 + bigramProb * 2.5);
      }

      // 5. Costo de separabilidad y error táctil
      const physicalDist = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
      if (physicalDist < 35 && prevKey.char !== key.char) {
        totalError += 0.5;
      }

      validSteps++;
    }

    prevKey = key;
  }

  const norm = validSteps > 0 ? validSteps : 1;
  const reachNorm = cleanText.length > 0 ? cleanText.length : 1;

  const movementScore = (totalMovement / norm) * weights.w1_movement;
  const transitionScore = (totalTransition / norm) * weights.w2_transition;
  const errorScore = (totalError / norm) * weights.w3_error;
  const occlusionScore = (totalOcclusion / norm) * weights.w4_occlusion;
  const reachScore = (totalReach / reachNorm) * weights.w5_reach;

  const totalCost = movementScore + transitionScore + errorScore + occlusionScore + reachScore;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    movementCost: Math.round(movementScore * 100) / 100,
    transitionCost: Math.round(transitionScore * 100) / 100,
    errorCost: Math.round(errorScore * 100) / 100,
    occlusionCost: Math.round(occlusionScore * 100) / 100,
    reachCost: Math.round(reachScore * 100) / 100,
    evalTextLength: cleanText.length
  };
}
