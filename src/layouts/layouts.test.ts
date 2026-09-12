import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_LAYOUTS,
  radialSingleThumbLayout,
  radialSingleThumbLeftLayout,
  bimanualSplitLayout,
  hybridLayout,
  qwertyBaselineLayout
} from './index';

describe('Ergonomic Keyboard Layouts', () => {
  const spanishAlphabet = 'abcdefghijklmnñopqrstuvwxyz'.split('');

  it('exports all 5 layout variants', () => {
    expect(AVAILABLE_LAYOUTS.length).toBe(5);
  });

  it('ensures radialSingleThumbLayout contains all Spanish letters including Ñ and essential controls', () => {
    const chars = new Set(radialSingleThumbLayout.keys.map(k => k.char.toLowerCase()));
    spanishAlphabet.forEach(letter => {
      expect(chars.has(letter), `Missing letter ${letter} in radial layout`).toBe(true);
    });
    expect(chars.has('ñ')).toBe(true);
    expect(chars.has(' ')).toBe(true);
    expect(chars.has('\b')).toBe(true);
    expect(chars.has('\n')).toBe(true);
  });

  it('ensures bimanualSplitLayout contains all letters and assigned hands', () => {
    const chars = new Set(bimanualSplitLayout.keys.map(k => k.char.toLowerCase()));
    spanishAlphabet.forEach(letter => {
      expect(chars.has(letter), `Missing letter ${letter} in bimanual layout`).toBe(true);
    });
    bimanualSplitLayout.keys.forEach(k => {
      expect(['left', 'right']).toContain(k.handAssigned);
    });
  });

  it('ensures hybridLayout contains all letters and coordinates within canvas', () => {
    const chars = new Set(hybridLayout.keys.map(k => k.char.toLowerCase()));
    spanishAlphabet.forEach(letter => {
      expect(chars.has(letter), `Missing letter ${letter} in hybrid layout`).toBe(true);
    });
    hybridLayout.keys.forEach(k => {
      expect(k.x).toBeGreaterThanOrEqual(0);
      expect(k.x).toBeLessThanOrEqual(hybridLayout.width);
      expect(k.y).toBeGreaterThanOrEqual(0);
      expect(k.y).toBeLessThanOrEqual(hybridLayout.height);
    });
  });

  it('mirrors left-handed radial layout correctly from right-handed layout', () => {
    expect(radialSingleThumbLeftLayout.keys.length).toBe(radialSingleThumbLayout.keys.length);
    const rightE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const leftE = radialSingleThumbLeftLayout.keys.find(k => k.char === 'e')!;
    expect(leftE.x).toBe(360 - rightE.x);
    expect(leftE.y).toBe(rightE.y);
  });

  it('has qwertyBaselineLayout with correct mode and keys', () => {
    expect(qwertyBaselineLayout.mode).toBe('qwerty-baseline');
    expect(qwertyBaselineLayout.keys.length).toBeGreaterThanOrEqual(30);
  });
});
