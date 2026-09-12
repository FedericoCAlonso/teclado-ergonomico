import { describe, it, expect } from 'vitest';
import {
  getUnigramProbability,
  getBigramProbability,
  resolveDeterministicAccent
} from './spanishCorpus';

describe('spanishCorpus (Modelo Lingüístico)', () => {
  it('gives high probability to high-frequency vowels and space', () => {
    const pE = getUnigramProbability('e');
    const pA = getUnigramProbability('a');
    const pK = getUnigramProbability('k');
    const pSpace = getUnigramProbability(' ');

    expect(pE).toBeGreaterThan(0.1);
    expect(pA).toBeGreaterThan(0.1);
    expect(pSpace).toBeGreaterThan(0.15);
    expect(pK).toBeLessThan(0.001);
  });

  it('correctly retrieves high bigram probability for dominant transitions', () => {
    const pDE = getBigramProbability('d', 'e');
    const pES = getBigramProbability('e', 's');
    const pXQ = getBigramProbability('x', 'q');

    expect(pDE).toBeGreaterThan(0.2);
    expect(pES).toBeGreaterThan(0.2);
    expect(pDE).toBeGreaterThan(pXQ);
  });

  it('resolves deterministic accents and ñ correctly without typing diacritics', () => {
    expect(resolveDeterministicAccent('cancion')).toBe('canción');
    expect(resolveDeterministicAccent('tambien')).toBe('también');
    expect(resolveDeterministicAccent('ano')).toBe('año');
    expect(resolveDeterministicAccent('palabra')).toBe('palabra');
  });
});
