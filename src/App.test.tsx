import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { radialSingleThumbLayout } from './layouts/radialSingleThumbLayout';
import type { KeyDefinition } from './types';

function tapKey(svg: SVGSVGElement, key: KeyDefinition) {
  fireEvent.pointerDown(svg, { clientX: key.x, clientY: key.y, pointerId: 1 });
  fireEvent.pointerUp(svg, { clientX: key.x, clientY: key.y, pointerId: 1 });
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

  it('resolves phonotactic shared keys: J·H defaults to j, but after c produces h', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyC = radialSingleThumbLayout.keys.find(k => k.char === 'c')!;
    const keyJH = radialSingleThumbLayout.keys.find(k => k.id === 'k_jh')!;

    // Case 1: isolated tap -> 'j'
    tapKey(svg, keyJH);
    expect(screen.getByText('j')).toBeDefined();

    // Clear and test after 'c'
    const clearBtn = screen.getByTitle('Borrar todo');
    fireEvent.click(clearBtn);

    tapKey(svg, keyC);
    tapKey(svg, keyJH);
    expect(screen.getByText('ch')).toBeDefined();
  });

  it('resolves phonotactic shared keys: Z·X after e produces x', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyE = radialSingleThumbLayout.keys.find(k => k.char === 'e')!;
    const keyZX = radialSingleThumbLayout.keys.find(k => k.id === 'k_zx')!;

    tapKey(svg, keyE);
    tapKey(svg, keyZX);
    expect(screen.getByText('ex')).toBeDefined();
  });

  it('toggles shared key to alternate on double tap within timeout', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyKW = radialSingleThumbLayout.keys.find(k => k.id === 'k_kw')!;

    // 1st tap produces 'k'
    tapKey(svg, keyKW);
    expect(screen.getByText('k')).toBeDefined();

    // Immediate 2nd tap toggles 'k' to 'w'
    tapKey(svg, keyKW);
    expect(screen.getByText('w')).toBeDefined();
  });

  it('inserts Tab character with Tab key', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyTab = radialSingleThumbLayout.keys.find(k => k.char === '\t')!;
    tapKey(svg, keyTab);

    expect(screen.getByText(/1 caracteres/i)).toBeDefined();
  });
});
