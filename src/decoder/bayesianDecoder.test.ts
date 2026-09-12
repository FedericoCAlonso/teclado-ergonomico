import { describe, it, expect } from 'vitest';
import {
  decodeTouchStroke,
  classifyGesture,
  autoAccentBuffer
} from './bayesianDecoder';
import type { TouchStroke } from './bayesianDecoder';
import { radialSingleThumbLayout } from '../layouts/radialSingleThumbLayout';

describe('Bayesian Touch Decoder', () => {
  it('classifies quick tap with minimal displacement as tap', () => {
    const stroke: TouchStroke = { startX: 200, startY: 200, endX: 202, endY: 201 };
    const gesture = classifyGesture(stroke, radialSingleThumbLayout);
    expect(gesture).toBe('tap');
  });

  it('classifies downward swipe as flick_down', () => {
    const stroke: TouchStroke = { startX: 200, startY: 200, endX: 202, endY: 235 };
    const gesture = classifyGesture(stroke, radialSingleThumbLayout);
    expect(gesture).toBe('flick_down');
  });

  it('decodes direct tap on letter E key accurately', () => {
    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const stroke: TouchStroke = {
      startX: keyE.x,
      startY: keyE.y,
      endX: keyE.x,
      endY: keyE.y
    };

    const result = decodeTouchStroke(stroke, radialSingleThumbLayout, '');
    expect(result.primaryKey.char).toBe('e');
    expect(result.char).toBe('e');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('resolves flick_up/flick_outward on vowel E to accented é', () => {
    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    // Drag upwards / outward away from pivot (360, 320)
    const stroke: TouchStroke = {
      startX: keyE.x,
      startY: keyE.y,
      endX: keyE.x - 25,
      endY: keyE.y - 25
    };

    const result = decodeTouchStroke(stroke, radialSingleThumbLayout, '');
    expect(result.primaryKey.char).toBe('e');
    expect(result.char).toBe('é');
  });

  it('resolves flick_down on key to its secondary character (number or symbol)', () => {
    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const stroke: TouchStroke = {
      startX: keyE.x,
      startY: keyE.y,
      endX: keyE.x,
      endY: keyE.y + 25
    };

    const result = decodeTouchStroke(stroke, radialSingleThumbLayout, '');
    expect(result.primaryKey.char).toBe('e');
    expect(result.char).toBe('6'); // Secondary char of E in layout
  });

  it('uses linguistic context to resolve ambiguous touch between two neighboring keys', () => {
    // If user types 'q', next letter is overwhelmingly likely to be 'u' in Spanish
    const keyU = radialSingleThumbLayout.keys.find(k => k.char === 'u')!;
    // Point slightly between keyU and neighbor
    const stroke: TouchStroke = {
      startX: keyU.x + 10,
      startY: keyU.y,
      endX: keyU.x + 10,
      endY: keyU.y
    };

    const resultWithQ = decodeTouchStroke(stroke, radialSingleThumbLayout, 'q');
    expect(resultWithQ.candidates.some(c => c.char === 'u')).toBe(true);
  });

  it('autoAccentBuffer replaces unaccented known Spanish words', () => {
    expect(autoAccentBuffer('la cancion')).toBe('la canción');
    expect(autoAccentBuffer('un arbol')).toBe('un árbol');
    expect(autoAccentBuffer('telefono')).toBe('teléfono');
  });
});
