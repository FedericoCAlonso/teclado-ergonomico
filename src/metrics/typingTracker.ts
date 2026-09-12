import type { TypingSessionMetrics } from '../types';

export class TypingTracker {
  private startTime: number | null = null;
  private endTime: number | null = null;
  private keystrokesCount: number = 0;
  private correctionsCount: number = 0;
  private totalDistancePx: number = 0;
  private prevPoint: { x: number; y: number } | null = null;
  private producedCharsCount: number = 0;

  public start(): void {
    this.startTime = Date.now();
    this.endTime = null;
    this.keystrokesCount = 0;
    this.correctionsCount = 0;
    this.totalDistancePx = 0;
    this.prevPoint = null;
    this.producedCharsCount = 0;
  }

  public recordKeystroke(
    point: { x: number; y: number },
    charProduced: string
  ): void {
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    this.keystrokesCount++;

    if (this.prevPoint) {
      const dist = Math.hypot(point.x - this.prevPoint.x, point.y - this.prevPoint.y);
      this.totalDistancePx += dist;
    }
    this.prevPoint = point;

    if (charProduced === '\b') {
      this.correctionsCount++;
      if (this.producedCharsCount > 0) {
        this.producedCharsCount--;
      }
    } else {
      this.producedCharsCount++;
    }
  }

  public stop(): void {
    this.endTime = Date.now();
  }

  public reset(): void {
    this.startTime = null;
    this.endTime = null;
    this.keystrokesCount = 0;
    this.correctionsCount = 0;
    this.totalDistancePx = 0;
    this.prevPoint = null;
    this.producedCharsCount = 0;
  }

  public getMetrics(currentTextLength?: number): TypingSessionMetrics {
    if (!this.startTime) {
      return {
        wpm: 0,
        accuracy: 100,
        kspc: 1.0,
        totalDistancePx: 0,
        totalTimeSeconds: 0,
        correctionsCount: 0,
        keystrokesCount: 0
      };
    }

    const effectiveEnd = this.endTime ?? Date.now();
    const elapsedSeconds = Math.max((effectiveEnd - this.startTime) / 1000, 0.1);
    const charCount = currentTextLength ?? this.producedCharsCount;

    // Fórmula estándar: (caracteres / 5) / minutos
    const words = charCount / 5;
    const minutes = elapsedSeconds / 60;
    const rawWpm = minutes > 0 ? words / minutes : 0;

    // KSPC = Keystrokes Per Character (ideal = 1.0, sube con borrados y fallos)
    const kspc = charCount > 0 ? this.keystrokesCount / charCount : 1.0;

    // Precisión basada en proporción de correcciones
    const errorRatio = this.keystrokesCount > 0 ? this.correctionsCount / this.keystrokesCount : 0;
    const accuracy = Math.max(0, Math.min(100, (1 - errorRatio) * 100));

    return {
      wpm: Math.round(rawWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      kspc: Math.round(kspc * 100) / 100,
      totalDistancePx: Math.round(this.totalDistancePx),
      totalTimeSeconds: Math.round(elapsedSeconds * 10) / 10,
      correctionsCount: this.correctionsCount,
      keystrokesCount: this.keystrokesCount
    };
  }
}
