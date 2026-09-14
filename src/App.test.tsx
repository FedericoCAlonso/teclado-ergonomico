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

    // Default layout is QWERTY 2: k_az (a·z) and k_sx (s·x)
    const keyAZ = radialSingleThumbLayout.keys.find(k => k.id === 'k_az')!;
    const keySX = radialSingleThumbLayout.keys.find(k => k.id === 'k_sx')!;

    // Tap on a·z produces 'a' (present in canvas key and now in input display)
    tapKey(svg, keyAZ);
    expect(screen.getAllByText('a').length).toBeGreaterThanOrEqual(2);

    // Flick on a·z produces 'z'
    flickKey(svg, keyAZ);
    expect(screen.getByText(/az/)).toBeDefined();

    // Tap on s·x produces 's'
    tapKey(svg, keySX);
    expect(screen.getByText(/azs/)).toBeDefined();

    // Flick on s·x produces 'x'
    flickKey(svg, keySX);
    expect(screen.getByText(/azsx/)).toBeDefined();
  });

  it('inserts Tab character with Flick gesture on Shift key', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    const keyShift = radialSingleThumbLayout.keys.find(k => k.id === 'k_shift')!;
    flickKey(svg, keyShift);

    expect(screen.getByText(/1 caracteres/i)).toBeDefined();
  });

  it('supports Polar Numpad: switching to 123 layer allows typing digits and symbols', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    // Outer arc has layer_123 button. Tap to switch to 123 layer
    const keyLayer123 = radialSingleThumbLayout.keys.find(k => k.id === 'k_acc_123')!;
    tapKey(svg, keyLayer123);

    // Now canvas is in 123 layer, verify digits 7, 8, 9 are present
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('9')).toBeDefined();

    // Verify 1 is present in the layout
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);

    // Switch back to ABC
    fireEvent.click(screen.getByText('ABC (Letras)'));
    expect(screen.getByText('123')).toBeDefined();
  });

  it('supports functional accessory keys: Ctrl, Alt, and Supr', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    // Verify accessory keys on outer arc
    expect(screen.getByText('Ctrl')).toBeDefined();
    expect(screen.getByText('Alt')).toBeDefined();
    expect(screen.getByText('Esc')).toBeDefined();
    expect(screen.getByText('Supr')).toBeDefined();
    expect(screen.getByText('Tab')).toBeDefined();
    expect(screen.getByText('↶')).toBeDefined();
    expect(screen.getByText('📋')).toBeDefined();
    expect(screen.getByText('📄')).toBeDefined();

    // Tap on Ctrl activates Sticky Ctrl
    const keyCtrl = radialSingleThumbLayout.keys.find(k => k.id === 'k_acc_ctrl')!;
    tapKey(svg, keyCtrl);
    expect(screen.getByText(/CTRL ●/)).toBeDefined();
  });

  it('allows comparing and switching between all 3 letter distribution variants (Original, QWERTY 1, QWERTY 2)', () => {
    render(<App />);

    // Check that all 3 mapping options are rendered
    expect(screen.getByText('Original')).toBeDefined();
    expect(screen.getByText('QWERTY 1')).toBeDefined();
    expect(screen.getByText('QWERTY 2')).toBeDefined();

    // Switch to QWERTY 1 (Horizontal)
    fireEvent.click(screen.getByText('QWERTY 1'));
    // QWERTY 1 should display 'Horizontal' and update active description
    expect(screen.getByText(/Pares contiguos por filas/i)).toBeDefined();
    // Canvas displays letters in lowercase by default
    expect(screen.getByText('q')).toBeDefined();
    expect(screen.getByText('w')).toBeDefined();

    // Switch to QWERTY 2 (Columnas)
    fireEvent.click(screen.getByText('QWERTY 2'));
    // QWERTY 2 should display 'Columnas' and update active description
    expect(screen.getByText(/Cada letra principal emparejada con su vecina de columna/i)).toBeDefined();
    // In QWERTY 2, a is paired with z (in lowercase)
    expect(screen.getByText('z')).toBeDefined();

    // Switch back to Original
    fireEvent.click(screen.getByText('Original'));
    expect(screen.getByText(/Letras reinas/i)).toBeDefined();
    // In Original, i is paired with y (in lowercase)
    expect(screen.getByText('i')).toBeDefined();
    expect(screen.getByText('y')).toBeDefined();
  });

  it('allows switching to SYM layer and displays technical symbols', () => {
    render(<App />);

    // Click on SYM (Símbolos) button in controls
    fireEvent.click(screen.getByText('SYM (Símbolos)'));

    // Verify symbols in the canvas
    expect(screen.getByText('@')).toBeDefined();
    expect(screen.getByText('#')).toBeDefined();
    expect(screen.getByText('$')).toBeDefined();
    expect(screen.getByText('%')).toBeDefined();
    expect(screen.getByText('&')).toBeDefined();

    // Switch back to ABC
    fireEvent.click(screen.getByText('ABC (Letras)'));
    expect(screen.getByText('123')).toBeDefined();
  });

  it('renders keys in lowercase by default and dynamically switches to uppercase when Shift is active', () => {
    render(<App />);
    const svg = screen.getByTestId('virtual-keyboard-canvas') as unknown as SVGSVGElement;

    // Keys are in lowercase by default
    expect(screen.getByText('a')).toBeDefined();
    expect(screen.getByText('z')).toBeDefined();

    // Tap Shift key
    const keyShift = radialSingleThumbLayout.keys.find(k => k.id === 'k_shift')!;
    tapKey(svg, keyShift);

    // Now keys switch to uppercase
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('Z')).toBeDefined();

    // Tap letter A in uppercase
    const keyAZ = radialSingleThumbLayout.keys.find(k => k.id === 'k_az')!;
    tapKey(svg, keyAZ);

    // After single Shift tap, one uppercase letter is inserted and Shift reverts to none
    expect(screen.getByText('A')).toBeDefined();
    // Keys return to lowercase
    expect(screen.getByText('a')).toBeDefined();
    expect(screen.getByText('z')).toBeDefined();
  });

  it('ensures spacebar does not display the word ESPACIO and shows navigation glyph instead', () => {
    render(<App />);
    expect(screen.queryByText('ESPACIO')).toBeNull();
    expect(screen.queryByText('ESPACIO ⟷')).toBeNull();
    // Shows the ⟷ navigation indicator
    expect(screen.getByText('⟷')).toBeDefined();
  });
});
