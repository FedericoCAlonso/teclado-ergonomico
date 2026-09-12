import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Root Workbench', () => {
  it('renders title, metrics panel, and virtual keyboard canvas', () => {
    render(<App />);

    expect(screen.getByText(/Cotizador Polar/i)).toBeDefined();
    expect(screen.getByText(/Telemetría en Vivo/i)).toBeDefined();
    expect(screen.getByText(/Distribución de Teclado/i)).toBeDefined();
  });
});
