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
    const chars = new Set<string>();
    radialSingleThumbLayout.keys.forEach(k => {
      chars.add(k.char.toLowerCase());
      if (k.secondaryChar) chars.add(k.secondaryChar.toLowerCase());
      if (k.alternateChar) chars.add(k.alternateChar.toLowerCase());
    });
    spanishAlphabet.forEach(letter => {
      expect(chars.has(letter), `Missing letter ${letter} in radial layout`).toBe(true);
    });
    expect(chars.has('ñ')).toBe(true);
    expect(chars.has(' ')).toBe(true);
    expect(chars.has('\b')).toBe(true);
    expect(chars.has('\n')).toBe(true);
    expect(chars.has('´')).toBe(true); // Dedicated dead-key tilde
    // All digits 0-9
    for (let d = 0; d <= 9; d++) {
      expect(chars.has(d.toString()), `Missing digit ${d} in radial layout`).toBe(true);
    }
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

  it('strictly increases button count as curvature radius increases (5 < 6 < 8 < 10)', () => {
    const pivot = radialSingleThumbLayout.pivotPoints.right!;
    const keysWithoutSpace = radialSingleThumbLayout.keys.filter(k => k.type !== 'space');

    // Group keys by their radius from the pivot
    const radiusBuckets = new Map<number, number>();
    keysWithoutSpace.forEach(k => {
      const r = Math.round(Math.hypot(k.x - pivot.x, k.y - pivot.y));
      // Cluster within 8px
      let matchedBucket = [...radiusBuckets.keys()].find(b => Math.abs(b - r) <= 8);
      if (matchedBucket === undefined) {
        matchedBucket = r;
      }
      radiusBuckets.set(matchedBucket, (radiusBuckets.get(matchedBucket) ?? 0) + 1);
    });

    // Sort buckets by increasing radius
    const sortedRadii = [...radiusBuckets.keys()].sort((a, b) => a - b);
    expect(sortedRadii.length).toBe(4); // 4 concentric rows (Controls, Golden, Upper, Numbers)

    const counts = sortedRadii.map(r => radiusBuckets.get(r)!);
    expect(counts).toEqual([5, 6, 8, 10]);

    // Check strictly increasing: each arc has more buttons than all smaller arcs
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThan(counts[i - 1]);
    }
  });
});
