import { describe, it, expect } from 'vitest';
import {
  getThumbPivot,
  toPolar,
  calculateReachCost,
  getOcclusionPolygon,
  isPointOccluded
} from './polarModel';

describe('polarModel (Biomecánica del Pulgar)', () => {
  it('computes right and left thumb pivots correctly', () => {
    const rightPivot = getThumbPivot('right', 390, 600);
    expect(rightPivot).toEqual({ x: 390, y: 600 });

    const leftPivot = getThumbPivot('left', 390, 600);
    expect(leftPivot).toEqual({ x: 0, y: 600 });
  });

  it('converts cartesian points to polar coordinates relative to pivot', () => {
    const pivot = { x: 400, y: 400 };
    const point = { x: 100, y: 400 }; // Directamente a la izquierda (dx = -300, dy = 0)
    const polar = toPolar(point, pivot);

    expect(polar.r).toBeCloseTo(300);
    expect(Math.abs(polar.theta)).toBeCloseTo(Math.PI);
  });

  it('computes low reach cost in the optimal radius zone and higher cost outside', () => {
    const pivot = { x: 400, y: 400 };
    const optimalPoint = { x: 400 - 220, y: 400 }; // r = 220 (rOpt)
    const extremePoint = { x: 400 - 380, y: 400 }; // r = 380 (hiper-extensión)

    const optCost = calculateReachCost(optimalPoint, pivot, 220, 60);
    const extremeCost = calculateReachCost(extremePoint, pivot, 220, 60);

    expect(optCost).toBeLessThan(0.1);
    expect(extremeCost).toBeGreaterThan(1.0);
  });

  it('detects occlusion when a target falls inside the thumb shadow cone', () => {
    const pivot = { x: 400, y: 600 };
    const touch = { x: 200, y: 300 };

    // Punto situado justo a mitad de camino entre el toque y la base de la mano
    const occludedTarget = { x: 300, y: 450 };
    // Punto despejado hacia el interior superior de la pantalla
    const clearTarget = { x: 100, y: 150 };

    expect(isPointOccluded(occludedTarget, touch, pivot)).toBe(true);
    expect(isPointOccluded(clearTarget, touch, pivot)).toBe(false);
  });

  it('generates a 4-point quadrilateral occlusion polygon', () => {
    const pivot = { x: 400, y: 600 };
    const touch = { x: 200, y: 300 };
    const poly = getOcclusionPolygon(touch, pivot, 38);

    expect(poly.length).toBe(4);
    poly.forEach(vertex => {
      expect(typeof vertex.x).toBe('number');
      expect(typeof vertex.y).toBe('number');
    });
  });
});
