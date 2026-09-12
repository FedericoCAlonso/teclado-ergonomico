import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { radialSingleThumbLayout } from './layouts/radialSingleThumbLayout';
import type { KeyDefinition } from './types';

function tapKey(svg: SVGSVGElement, key: KeyDefinition) {
  fireEvent.pointerDown(svg, { clientX: key.x, clientY: key.y, pointerId: 1 });
  fireEvent.pointerUp(svg, { clientX: key.x, clientY: key.y, pointerId: 1 });
}

function flickKey(svg: SVGSVGElement, key: KeyDefinition) {
  fireEvent.pointerDown(svg, { clientX: key.x, clientY: key.y, pointerId: 1 });
  // Displacement of 15px triggers the flick threshold (>= 11px)
  fireEvent.pointerMove(svg, { clientX: key.x + 15, clientY: key.y - 15, pointerId: 1 });
  fireEvent.pointerUp(svg, { clientX: key.x + 15, clientY: key.y - 15, pointerId: 1 });
}

describe('App Root Workbench & Keyboard Interactions', () => {
  it('renders title, metrics panel, and virtual keyboard canvas', () => {
    render(<App />);

    expect(screen.getByText(/Cotizador Polar/i)).toBeDefined();
    expect(screen.getByText(/Telemetría en Vivo/i)).toBeDefined();
    expect(screen.getByText(/Distribución de Teclado/i)).toBeDefined();
  });

  it('types regular letters and handles backspace correctly', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const keyL = radialSingleThumbLayout.keys.find(k => k.char === 'l')!;
    const keyBksp = radialSingleThumbLayout.keys.find(k => k.char === '\b')!;

    tapKey(svg, keyE);
    tapKey(svg, keyL);
    expect(screen.getByText(/2 caracteres/i)).toBeDefined();

    tapKey(svg, keyBksp);
    expect(screen.getByText(/1 caracteres/i)).toBeDefined();
  });

  it('handles dead-key tilde: ´ followed by a produces á', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyTilde = radialSingleThumbLayout.keys.find(k => k.char === '´')!;
    const keyA = radialSingleThumbLayout.keys.find(k => k.char === 'a')!;

    tapKey(svg, keyTilde);
    tapKey(svg, keyA);

    expect(screen.getByText('á')).toBeDefined();
  });

  it('handles Shift for capital letters and reverts to none after one key', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyShift = radialSingleThumbLayout.keys.find(k => k.char === 'shift')!;
    const keyA = radialSingleThumbLayout.keys.find(k => k.char === 'a')!;

    tapKey(svg, keyShift);
    tapKey(svg, keyA);
    // Next character should be lowercase
    tapKey(svg, keyA);

    expect(screen.getByText('Aa')).toBeDefined();
  });

  it('supports Option C dual buttons: Tap emits primary letter, Flick emits secondary letter', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyEJ = radialSingleThumbLayout.keys.find(k => k.id === 'k_ej')!;
    const keyAK = radialSingleThumbLayout.keys.find(k => k.id === 'k_ak')!;

    // Tap on E·J produces 'e'
    tapKey(svg, keyEJ);
    expect(screen.getByText('e')).toBeDefined();

    // Flick on E·J produces 'j'
    flickKey(svg, keyEJ);
    expect(screen.getByText('ej')).toBeDefined();

    // Tap on A·K produces 'a'
    tapKey(svg, keyAK);
    expect(screen.getByText('eja')).toBeDefined();

    // Flick on A·K produces 'k'
    flickKey(svg, keyAK);
    expect(screen.getByText('ejak')).toBeDefined();
  });

  it('inserts Tab character with Flick gesture on Shift key', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyShift = radialSingleThumbLayout.keys.find(k => k.id === 'k_shift')!;
    flickKey(svg, keyShift);

    expect(screen.getByText(/1 caracteres/i)).toBeDefined();
  });

  it('supports Numbers Arc: Tap emits digit, Flick emits symbol', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const key1 = radialSingleThumbLayout.keys.find(k => k.id === 'k_1')!;

    // Tap produces digit '1'
    tapKey(svg, key1);

    // Flick produces symbol '!'
    flickKey(svg, key1);
    expect(screen.getByText('1!')).toBeDefined();
  });

  it('navigates cursor by scrubbing across spacebar without typing a space', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const keySpace = radialSingleThumbLayout.keys.find(k => k.type === 'space')!;

    tapKey(svg, keyE);
    tapKey(svg, keyE);
    expect(screen.getByText('ee')).toBeDefined();

    // Scrub across spacebar
    fireEvent.pointerDown(svg, { clientX: keySpace.x, clientY: keySpace.y, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: keySpace.x + 35, clientY: keySpace.y, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: keySpace.x + 35, clientY: keySpace.y, pointerId: 1 });

    // Text should still be 'ee' with 2 chars (no extra space character inserted because scrubbing occurred)
    expect(screen.getByText('ee')).toBeDefined();
    expect(screen.getByText(/2 caracteres/i)).toBeDefined();
  });
});
