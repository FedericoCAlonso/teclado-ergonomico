import React, { useState, useRef, useCallback } from 'react';
import type { LayoutDefinition, KeyDefinition } from '../types';
import type { Point2D } from '../biomechanics/polarModel';
import { getOcclusionPolygon } from '../biomechanics/polarModel';

interface VirtualKeyboardCanvasProps {
  layout: LayoutDefinition;
  accentPending: boolean;
  showOcclusionShadow: boolean;
  showBiomechanicArcs: boolean;
  onKeyPress: (char: string, keyDef: KeyDefinition, touchPoint: Point2D) => void;
  onMoveCursor: (delta: number) => void;
}

const VOWEL_CHARS = new Set(['a', 'e', 'i', 'o', 'u']);

export const VirtualKeyboardCanvas: React.FC<VirtualKeyboardCanvasProps> = ({
  layout,
  accentPending,
  showOcclusionShadow,
  showBiomechanicArcs,
  onKeyPress,
  onMoveCursor
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeTouch, setActiveTouch] = useState<Point2D | null>(null);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);

  // Estados para el control del cursor mediante deslizamiento gestual en la barra de espacio
  const isScrubbingRef = useRef<boolean>(false);
  const scrubStartPointRef = useRef<Point2D | null>(null);
  const scrubLastXRef = useRef<number>(0);
  const hasScrubbedRef = useRef<boolean>(false);
  const touchStartKeyRef = useRef<KeyDefinition | null>(null);

  const getSvgCoordinates = useCallback((e: React.PointerEvent<SVGSVGElement>): Point2D | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = layout.width / rect.width;
    const scaleY = layout.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [layout.width, layout.height]);

  const findClosestKey = (pt: Point2D): KeyDefinition | null => {
    let closestKey: KeyDefinition | null = null;
    let minDist = 9999;

    for (const key of layout.keys) {
      if (key.type === 'space') {
        // La barra de espacio tiene una bounding box amplia
        const dx = Math.abs(pt.x - key.x);
        const dy = Math.abs(pt.y - key.y);
        if (dx < 65 && dy < 24) {
          return key;
        }
      }

      const d = Math.hypot(pt.x - key.x, pt.y - key.y);
      if (d < minDist) {
        minDist = d;
        closestKey = key;
      }
    }

    return minDist < 38 ? closestKey : null;
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setActiveTouch(pt);
    const key = findClosestKey(pt);
    touchStartKeyRef.current = key;
    setActiveKeyId(key ? key.id : null);

    // Si toca la barra de espacio, iniciar modo de arrastre de cursor (scrubbing)
    if (key?.type === 'space') {
      isScrubbingRef.current = true;
      scrubStartPointRef.current = pt;
      scrubLastXRef.current = pt.x;
      hasScrubbedRef.current = false;
    } else {
      isScrubbingRef.current = false;
      scrubStartPointRef.current = null;
      hasScrubbedRef.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setActiveTouch(pt);

    // Control de Cursor por Gesto en Barra de Espacio (Scrubbing horizontal)
    if (isScrubbingRef.current && scrubStartPointRef.current) {
      const deltaFromLast = pt.x - scrubLastXRef.current;
      const scrubThreshold = 14; // Umbral de movimiento por carácter (px)

      if (Math.abs(deltaFromLast) >= scrubThreshold) {
        const steps = Math.trunc(deltaFromLast / scrubThreshold);
        onMoveCursor(steps);

        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          navigator.vibrate(5);
        }

        scrubLastXRef.current = pt.x;
        hasScrubbedRef.current = true;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e) ?? activeTouch;

    if (isScrubbingRef.current) {
      // Si fue arrastrado para mover el cursor, no escribir el espacio
      if (!hasScrubbedRef.current && touchStartKeyRef.current) {
        onKeyPress(' ', touchStartKeyRef.current, pt ?? { x: 180, y: 280 });
        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          navigator.vibrate(8);
        }
      }
    } else if (touchStartKeyRef.current && pt) {
      // Escritura determinista directa al soltar
      const key = touchStartKeyRef.current;
      onKeyPress(key.char, key, pt);

      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(8);
      }
    }

    // Resetear estados
    isScrubbingRef.current = false;
    scrubStartPointRef.current = null;
    hasScrubbedRef.current = false;
    touchStartKeyRef.current = null;
    setActiveTouch(null);
    setActiveKeyId(null);
  };

  const handlePointerCancel = () => {
    isScrubbingRef.current = false;
    scrubStartPointRef.current = null;
    hasScrubbedRef.current = false;
    touchStartKeyRef.current = null;
    setActiveTouch(null);
    setActiveKeyId(null);
  };

  const primaryPivot = layout.pivotPoints.right ?? layout.pivotPoints.left ?? { x: 360, y: 320 };

  const occlusionPoly = (showOcclusionShadow && activeTouch)
    ? getOcclusionPolygon(activeTouch, primaryPivot)
    : null;

  const occlusionPointsString = occlusionPoly
    ? occlusionPoly.map(p => `${p.x},${p.y}`).join(' ')
    : '';

  return (
    <div className="relative w-full max-w-md mx-auto touch-none select-none bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-1.5 overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="w-full h-auto cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <defs>
          <linearGradient id="occlusionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.05" />
          </linearGradient>
          <filter id="keyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Fondo del Teclado */}
        <rect width={layout.width} height={layout.height} rx="16" fill="#070b13" />

        {/* 1. Arcos Biomecánicos Guía */}
        {showBiomechanicArcs && layout.pivotPoints.right && (
          <g className="pointer-events-none opacity-25">
            <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="215" fill="none" stroke="#10b981" strokeWidth="1.5" />
            <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="275" fill="none" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1" />
            <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="335" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
          </g>
        )}

        {/* 2. Sombra de Oclusión Anatómica */}
        {showOcclusionShadow && occlusionPointsString && (
          <polygon
            points={occlusionPointsString}
            fill="url(#occlusionGradient)"
            stroke="#f87171"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="pointer-events-none"
          />
        )}

        {/* 3. Teclas Fijas Ergonómicas */}
        {layout.keys.map(key => {
          const isActive = activeKeyId === key.id;
          const isSpace = key.type === 'space';
          const isAction = key.type === 'action';
          const isNumber = key.type === 'number';
          const isTildeKey = key.char === '´';
          const isVowel = VOWEL_CHARS.has(key.char.toLowerCase());

          // Estilo base de tecla
          let keyFill = '#172033';
          let textColor = '#f1f5f9';
          let borderColor = '#2d3b55';
          let strokeWidth = 1.2;

          if (isActive) {
            keyFill = '#38bdf8';
            textColor = '#0f172a';
            borderColor = '#bae6fd';
            strokeWidth = 2.5;
          } else if (isTildeKey) {
            // Tecla de Tilde Muerta
            if (accentPending) {
              keyFill = '#f59e0b';
              textColor = '#0f172a';
              borderColor = '#fde68a';
              strokeWidth = 2.2;
            } else {
              keyFill = '#1e293b';
              borderColor = '#f59e0b';
              textColor = '#f59e0b';
            }
          } else if (accentPending && isVowel) {
            // Si la tilde está pendiente, resaltar vocales para indicar que se acentuarán
            borderColor = '#f59e0b';
            strokeWidth = 2.0;
            keyFill = '#1e2538';
          } else if (isNumber) {
            keyFill = '#0f172a';
            textColor = '#38bdf8';
            borderColor = '#1e293b';
          } else if (isSpace) {
            keyFill = '#0f172a';
            borderColor = '#0284c7';
            textColor = '#38bdf8';
          } else if (isAction) {
            keyFill = '#1e293b';
            borderColor = '#475569';
            textColor = '#e2e8f0';
          }

          return (
            <g key={key.id} filter="url(#keyGlow)">
              {isSpace ? (
                <g>
                  <rect
                    x={key.x - 60}
                    y={key.y - 18}
                    width={120}
                    height={36}
                    rx={18}
                    fill={keyFill}
                    stroke={borderColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={key.x}
                    y={key.y + 4}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="11px"
                    fontWeight="bold"
                    className="pointer-events-none select-none font-sans"
                  >
                    ESPACIO ⟷
                  </text>
                </g>
              ) : (
                <g>
                  <circle
                    cx={key.x}
                    cy={key.y}
                    r={key.radius}
                    fill={keyFill}
                    stroke={borderColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={key.x}
                    y={key.y + (isAction && key.display.length === 1 ? 5 : 4.5)}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={isNumber ? '13px' : isAction ? '13px' : '14px'}
                    fontWeight={isActive || isNumber ? '800' : '600'}
                    className="pointer-events-none select-none font-sans"
                  >
                    {key.display}
                  </text>
                  {/* Carácter secundario sutil en la esquina superior derecha */}
                  {key.secondaryChar && (
                    <text
                      x={key.x + key.radius * 0.45}
                      y={key.y - key.radius * 0.35}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="8px"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {key.secondaryChar}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
