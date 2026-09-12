import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypingTracker } from './typingTracker';

describe('TypingTracker Session Metrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with clean metrics before typing starts', () => {
    const tracker = new TypingTracker();
    const metrics = tracker.getMetrics();
    expect(metrics.wpm).toBe(0);
    expect(metrics.keystrokesCount).toBe(0);
    expect(metrics.accuracy).toBe(100);
  });

  it('accumulates distance and calculates WPM accurately over time', () => {
    const tracker = new TypingTracker();
    tracker.start();

    // Type 10 characters over 6 seconds
    for (let i = 0; i < 10; i++) {
      tracker.recordKeystroke({ x: 100 + i * 10, y: 100 }, 'a');
    }

    vi.advanceTimersByTime(6000); // 6 seconds = 0.1 minute
    const metrics = tracker.getMetrics();

    // 10 chars = 2 words in 0.1 min => 20 WPM
    expect(metrics.wpm).toBe(20);
    expect(metrics.keystrokesCount).toBe(10);
    expect(metrics.kspc).toBe(1.0);
    expect(metrics.totalDistancePx).toBe(90);
    expect(metrics.accuracy).toBe(100);
  });

  it('accounts for backspaces, updating correctionsCount and reducing accuracy', () => {
    const tracker = new TypingTracker();
    tracker.start();

    tracker.recordKeystroke({ x: 100, y: 100 }, 'h');
    tracker.recordKeystroke({ x: 120, y: 100 }, 'o');
    tracker.recordKeystroke({ x: 140, y: 100 }, 'x'); // error
    tracker.recordKeystroke({ x: 160, y: 100 }, '\b'); // correction
    tracker.recordKeystroke({ x: 180, y: 100 }, 'l');
    tracker.recordKeystroke({ x: 200, y: 100 }, 'a');

    vi.advanceTimersByTime(5000);
    const metrics = tracker.getMetrics();

    expect(metrics.keystrokesCount).toBe(6);
    expect(metrics.correctionsCount).toBe(1);
    expect(metrics.accuracy).toBeLessThan(100);
    expect(metrics.kspc).toBeGreaterThan(1.0);
  });
});
