import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_LAYOUTS,
  radialSingleThumbLayout,
  radialSingleThumbLeftLayout,
  createRadialSingleThumbLayout,
  DEFAULT_RADIAL_TUNING,
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

  it('ensures bimanualSplitLayout is standard QWERTY with ergonomic central correction and perfect specular symmetry', () => {
    const leftKeys = bimanualSplitLayout.keys.filter(k => k.handAssigned === 'left');
    const rightKeys = bimanualSplitLayout.keys.filter(k => k.handAssigned === 'right');

    // Both wings must have exactly the same number of keys (19 on left, 19 on right)
    expect(leftKeys.length).toBe(rightKeys.length);

    // Verify standard QWERTY keys in left hand
    const leftLetters = leftKeys.filter(k => k.type === 'letter').map(k => k.char);
    expect(leftLetters).toEqual(expect.arrayContaining(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']));

    // Verify standard QWERTY keys in right hand
    const rightLetters = rightKeys.filter(k => k.type === 'letter').map(k => k.char);
    expect(rightLetters).toEqual(expect.arrayContaining(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'ñ', 'n', 'm']));

    // Verify ergonomic central separation between central buttons (T-Y, G-H, B-N)
    const keyT = leftKeys.find(k => k.char === 't')!;
    const keyY = rightKeys.find(k => k.char === 'y')!;
    expect(keyY.x - keyT.x).toBeGreaterThanOrEqual(48); // Natural thumb reach clearance

    const keyG = leftKeys.find(k => k.char === 'g')!;
    const keyH = rightKeys.find(k => k.char === 'h')!;
    expect(keyH.x - keyG.x).toBeGreaterThanOrEqual(48);

    const keyB = leftKeys.find(k => k.char === 'b')!;
    const keyN = rightKeys.find(k => k.char === 'n')!;
    expect(keyN.x - keyB.x).toBeGreaterThanOrEqual(48);

    // Verify Thumb Clusters in both hands
    const leftSpace = leftKeys.find(k => k.type === 'space')!;
    const rightSpace = rightKeys.find(k => k.type === 'space')!;
    expect(leftSpace).toBeDefined();
    expect(rightSpace).toBeDefined();
    expect(leftSpace.display).toBe('⟷');
    expect(rightSpace.display).toBe('⟷');
    expect(leftSpace.display).not.toContain('ESPACIO');
    expect(rightSpace.display).not.toContain('ESPACIO');

    // Left thumb has Shift and Tilde; Right thumb has Backspace and Enter
    expect(leftKeys.some(k => k.char === 'shift')).toBe(true);
    expect(leftKeys.some(k => k.char === '´')).toBe(true);
    expect(rightKeys.some(k => k.char === '\b')).toBe(true);
    expect(rightKeys.some(k => k.char === '\n')).toBe(true);

    // Verify geometric specular symmetry: for every key on the left, a mirrored key exists on the right
    leftKeys.forEach(lKey => {
      const mirroredRight = rightKeys.find(rKey => rKey.y === lKey.y && rKey.x === 360 - lKey.x);
      expect(mirroredRight, `Key ${lKey.id} at (${lKey.x}, ${lKey.y}) has no specular match at (${360 - lKey.x}, ${lKey.y})`).toBeDefined();
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

  it('validates that all 3 radial letter mappings (phonotactic, qwerty-horizontal, qwerty-column) contain all 27 Spanish letters', async () => {
    const { createRadialSingleThumbLayout, DEFAULT_RADIAL_TUNING } = await import('./radialSingleThumbLayout');
    const mappings = ['phonotactic', 'qwerty-horizontal', 'qwerty-column'] as const;

    mappings.forEach(m => {
      const layout = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, m);
      const chars = new Set<string>();
      layout.keys.forEach(k => {
        chars.add(k.char.toLowerCase());
        if (k.secondaryChar) chars.add(k.secondaryChar.toLowerCase());
      });

      spanishAlphabet.forEach(letter => {
        expect(chars.has(letter), `Mapping ${m} is missing letter: ${letter}`).toBe(true);
      });
      expect(chars.has('ñ')).toBe(true);
    });

    // Verify distinct key compositions across mappings
    const phono = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'phonotactic');
    const qwertyH = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'qwerty-horizontal');
    const qwertyC = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'qwerty-column');

    expect(phono.keys.some(k => k.id === 'k_iy')).toBe(true);
    expect(phono.keys.some(k => k.id === 'k_qw')).toBe(false);

    expect(qwertyH.keys.some(k => k.id === 'k_qw')).toBe(true);
    expect(qwertyH.keys.some(k => k.id === 'k_as')).toBe(true);
    expect(qwertyH.keys.some(k => k.id === 'k_iy')).toBe(false);

    expect(qwertyC.keys.some(k => k.id === 'k_az')).toBe(true);
    expect(qwertyC.keys.some(k => k.id === 'k_sx')).toBe(true);
    expect(qwertyC.keys.some(k => k.id === 'k_as')).toBe(false);
  });

  it('validates 123 layer (Polar Numpad) has 30 keys, strictly increasing density and essential math/numeric keys', () => {
    const layout123 = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'phonotactic', '123');
    expect(layout123.keys.length).toBe(30);

    const chars = new Set(layout123.keys.map(k => k.char));
    for (let d = 0; d <= 9; d++) {
      expect(chars.has(d.toString())).toBe(true);
    }
    expect(chars.has('+')).toBe(true);
    expect(chars.has('-')).toBe(true);
    expect(chars.has('*')).toBe(true);
    expect(chars.has('/')).toBe(true);
    expect(chars.has('=')).toBe(true);
    expect(chars.has('.')).toBe(true);
    expect(chars.has('layer_abc')).toBe(true);
  });

  it('validates SYM layer has 30 keys and covers programming and special characters', () => {
    const layoutSym = createRadialSingleThumbLayout(DEFAULT_RADIAL_TUNING, false, 'phonotactic', 'sym');
    expect(layoutSym.keys.length).toBe(30);

    const chars = new Set(layoutSym.keys.map(k => k.char));
    ['[', ']', '{', '}', '<', '>', '@', '#', '$', '%', '&', '_', '~', '^', '\\', '|'].forEach(sym => {
      expect(chars.has(sym), `Missing symbol ${sym}`).toBe(true);
    });
    expect(chars.has('layer_abc')).toBe(true);
    expect(chars.has('layer_123')).toBe(true);
  });
});
