/**
 * Modelo lingüístico del idioma español: frecuencias de unigramas y bigramas fonotácticos.
 * Basado en estadísticas consolidadas de la Real Academia Española (CREA) y corpus estándar.
 */

// Frecuencias relativas de letras en español (%)
export const SPANISH_LETTER_FREQUENCIES: Record<string, number> = {
  'e': 13.68,
  'a': 12.53,
  'o': 8.68,
  's': 7.98,
  'r': 6.87,
  'n': 6.71,
  'i': 6.25,
  'd': 5.86,
  'l': 4.97,
  'c': 4.68,
  't': 4.63,
  'u': 3.93,
  'm': 3.15,
  'p': 2.51,
  'b': 1.42,
  'g': 1.01,
  'v': 0.90,
  'y': 0.90,
  'q': 0.88,
  'h': 0.70,
  'f': 0.69,
  'z': 0.52,
  'j': 0.44,
  'ñ': 0.31,
  'x': 0.22,
  'w': 0.04,
  'k': 0.02,
  ' ': 17.50, // El espacio es el carácter más frecuente en texto continuo
  '.': 1.60,
  ',': 1.40,
  'á': 0.50,
  'é': 0.43,
  'í': 0.72,
  'ó': 0.82,
  'ú': 0.16,
};

// Matriz de transiciones de bigramas más frecuentes en español normalizados
export const TOP_SPANISH_BIGRAMS: Record<string, number> = {
  'de': 2.85, 'es': 2.50, 'en': 2.45, 'el': 2.10, 'la': 2.05,
  'os': 1.85, 'on': 1.80, 'as': 1.75, 'er': 1.70, 'ra': 1.65,
  'te': 1.55, 'ad': 1.50, 'al': 1.45, 'co': 1.40, 'se': 1.38,
  'da': 1.35, 're': 1.30, 'no': 1.25, 'qu': 1.22, 'ue': 1.20,
  'ci': 1.18, 'io': 1.15, 'ta': 1.12, 'to': 1.10, 'do': 1.08,
  'di': 1.05, 'an': 1.02, 'or': 1.00, 'nt': 0.98, 'st': 0.95,
  'ar': 0.93, 'me': 0.90, 'un': 0.88, 'in': 0.85, 'ia': 0.82,
  'pa': 0.80, 'pe': 0.78, 'po': 0.75, 'pr': 0.72, 'tr': 0.70,
  'ca': 0.68, 'ce': 0.65, 'su': 0.62, 'si': 0.60, 'so': 0.58,
  'ha': 0.55, 'he': 0.52, 'le': 0.50, 'lo': 0.48, 'ma': 0.45,
  'mo': 0.42, 'mi': 0.40, 'ba': 0.38, 'va': 0.35, 've': 0.32,
  'vi': 0.30, 'za': 0.28, 'zo': 0.25, 'ña': 0.15, 'ño': 0.12,
};

// Diccionario de auto-tildado común determinista en español
export const DETERMINISTIC_ACCENT_WORDS: Record<string, string> = {
  'accion': 'acción',
  'cancion': 'canción',
  'atencion': 'atención',
  'tambien': 'también',
  'ademas': 'además',
  'despues': 'después',
  'arbol': 'árbol',
  'telefono': 'teléfono',
  'musica': 'música',
  'facil': 'fácil',
  'dificil': 'difícil',
  'numero': 'número',
  'linea': 'línea',
  'ano': 'año',
  'manana': 'mañana',
  'espanol': 'español',
  'senor': 'señor',
  'pequeno': 'pequeño',
  'nino': 'niño',
};

/**
 * Retorna la probabilidad a priori P(c) de una letra individual.
 */
export function getUnigramProbability(char: string): number {
  const c = char.toLowerCase();
  const freq = SPANISH_LETTER_FREQUENCIES[c];
  if (freq !== undefined) return freq / 100;
  return 0.0001; // Smoothing para caracteres raros
}

/**
 * Retorna la probabilidad condicional P(c_curr | c_prev) según n-gramas del español.
 */
export function getBigramProbability(prevChar: string, currChar: string): number {
  const bigram = (prevChar + currChar).toLowerCase();
  const freq = TOP_SPANISH_BIGRAMS[bigram];

  if (freq !== undefined) {
    return freq / 10;
  }

  // Backoff a la probabilidad unigrama suavizada si no está en la tabla superior
  return getUnigramProbability(currChar) * 0.1;
}

/**
 * Infiere si una palabra escrita sin tilde o ñ tiene reemplazo determinista en español.
 */
export function resolveDeterministicAccent(word: string): string {
  const clean = word.toLowerCase().trim();
  return DETERMINISTIC_ACCENT_WORDS[clean] ?? word;
}
