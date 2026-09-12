import { describe, it, expect } from 'vitest';
import { evaluateLayoutCost, DEFAULT_COST_WEIGHTS } from './costFunction';
import type { LayoutDefinition } from '../types';

describe('Cost Function Optimizer Engine', () => {
  const mockCompactLayout: LayoutDefinition = {
    id: 'mock-compact',
    name: 'Mock Compact',
    description: 'Keys tightly placed near sweet spot',
    mode: 'single-thumb-right',
    width: 360,
    height: 400,
    pivotPoints: {
      right: { x: 360, y: 400 }
    },
    keys: [
      { id: 'k_e', char: 'e', display: 'E', type: 'letter', x: 260, y: 300, radius: 22 },
      { id: 'k_a', char: 'a', display: 'A', type: 'letter', x: 230, y: 280, radius: 22 },
      { id: 'k_o', char: 'o', display: 'O', type: 'letter', x: 200, y: 260, radius: 22 },
      { id: 'k_s', char: 's', display: 'S', type: 'letter', x: 180, y: 240, radius: 22 },
      { id: 'k_space', char: ' ', display: 'ESP', type: 'space', x: 280, y: 340, radius: 28 }
    ]
  };

  const mockFarLayout: LayoutDefinition = {
    id: 'mock-far',
    name: 'Mock Far Dispersed',
    description: 'Keys placed far away from thumb pivot',
    mode: 'single-thumb-right',
    width: 360,
    height: 400,
    pivotPoints: {
      right: { x: 360, y: 400 }
    },
    keys: [
      { id: 'k_e', char: 'e', display: 'E', type: 'letter', x: 30, y: 30, radius: 22 },
      { id: 'k_a', char: 'a', display: 'A', type: 'letter', x: 330, y: 30, radius: 22 },
      { id: 'k_o', char: 'o', display: 'O', type: 'letter', x: 30, y: 350, radius: 22 },
      { id: 'k_s', char: 's', display: 'S', type: 'letter', x: 330, y: 350, radius: 22 },
      { id: 'k_space', char: ' ', display: 'ESP', type: 'space', x: 180, y: 380, radius: 28 }
    ]
  };

  it('calculates higher reach and movement cost for dispersed layout than compact layout', () => {
    const text = 'eso es esa sea';
    const compactResult = evaluateLayoutCost(mockCompactLayout, text);
    const farResult = evaluateLayoutCost(mockFarLayout, text);

    expect(farResult.reachCost).toBeGreaterThan(compactResult.reachCost);
    expect(farResult.movementCost).toBeGreaterThan(compactResult.movementCost);
    expect(farResult.totalCost).toBeGreaterThan(compactResult.totalCost);
  });

  it('returns valid breakdown structure and positive numbers', () => {
    const text = 'ea oa se';
    const result = evaluateLayoutCost(mockCompactLayout, text, DEFAULT_COST_WEIGHTS);

    expect(result.evalTextLength).toBe(text.length);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.movementCost).toBeGreaterThanOrEqual(0);
    expect(result.reachCost).toBeGreaterThanOrEqual(0);
    expect(result.transitionCost).toBeGreaterThanOrEqual(0);
    expect(result.occlusionCost).toBeGreaterThanOrEqual(0);
  });

  it('handles empty text and text with unrecognized characters gracefully', () => {
    const emptyResult = evaluateLayoutCost(mockCompactLayout, '');
    expect(emptyResult.totalCost).toBe(0);

    const unknownResult = evaluateLayoutCost(mockCompactLayout, 'xyz123');
    expect(unknownResult.totalCost).toBe(0);
  });
});
