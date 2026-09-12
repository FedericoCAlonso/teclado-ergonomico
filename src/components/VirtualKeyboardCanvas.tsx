import React, { useState, useRef, useCallback } from 'react';
import type { LayoutDefinition, KeyDefinition, ShiftMode } from '../types';
import type { Point2D } from '../biomechanics/polarModel';
import { getOcclusionPolygon } from '../biomechanics/polarModel';

export type { ShiftMode };

interface VirtualKeyboardCanvasProps {
  layout: LayoutDefinition;
  accentPending: boolean;
  shiftState: ShiftMode;
  showOcclusionShadow: boolean;
  showBiomechanicArcs: boolean;
  onKeyPress: (char: string, keyDef: KeyDefinition, touchPoint: Point2D) => void;
  onMoveCursor: (delta: number) => void;
}

const VOWEL_CHARS = new Set(['a', 'e', 'i', 'o', 'u']);

export const VirtualKeyboardCanvas: React.FC<VirtualKeyboardCanvasProps> = ({
  layout,
  accentPending,
  shiftState,
  showOcclusionShadow,
  showBiomechanicArcs,
  onKeyPress,
  onMoveCursor
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeTouch, setActiveTouch] = useState<Point2D | null>(null);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);

  // Estados para el control gestual del cursor sobre la superficie del teclado
  const isGestureActiveRef = useRef<boolean>(false);
  const touchStartPosRef = useRef<Point2D | null>(null);
  const lastScrubXRef = useRef<number>(0);
  const hasScrubbedRef = useRef<boolean>(false);
  const touchStartKeyRef = useRef<KeyDefinition | null>(null);
  const isFlickActiveRef = useRef<boolean>(false);
  const [isFlicking, setIsFlicking] = useState<boolean>(false);

  const getSvgCoordinates = useCallback((e: React.PointerEvent<SVGSVGElement>): Point2D | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : layout.width;
    const height = rect.height > 0 ? rect.height : layout.height;
    const scaleX = layout.width / width;
    const scaleY = layout.height / height;
    return {
      x: (e.clientX - (rect.left || 0)) * scaleX,
      y: (e.clientY - (rect.top || 0)) * scaleY
    };
  }, [layout.width, layout.height]);

  const findClosestKey = (pt: Point2D): KeyDefinition | null => {
    const pivot = layout.pivotPoints.right ?? layout.pivotPoints.left ?? { x: 332, y: 325 };
    const distToPivot = Math.hypot(pt.x - pivot.x, pt.y - pivot.y);

    // Detección táctil en el segmento de arco de la barra espaciadora
    const spaceKey = layout.keys.find(k => k.type === 'space');
    if (spaceKey) {
      const minSpaceR = (layout.arcRadii?.[3] ?? 98) * 0.40;
      const maxSpaceR = (layout.arcRadii?.[3] ?? 98) * 0.85;
      if (distToPivot >= minSpaceR && distToPivot <= maxSpaceR) {
        return spaceKey;
      }
    }

    let closestKey: KeyDefinition | null = null;
    let minDist = 9999;

    for (const key of layout.keys) {
      if (key.type === 'space') continue;
      const d = Math.hypot(pt.x - key.x, pt.y - key.y);
      if (d < minDist) {
        minDist = d;
        closestKey = key;
      }
    }

    return minDist < 34 ? closestKey : null;
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
    isFlickActiveRef.current = false;
    setIsFlicking(false);

    isGestureActiveRef.current = true;
    touchStartPosRef.current = pt;
    lastScrubXRef.current = pt.x;
    hasScrubbedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);
    if (!pt || !isGestureActiveRef.current || !touchStartPosRef.current) return;

    setActiveTouch(pt);

    // 1. Navegación de cursor por desplazamiento horizontal sobre la barra de espacio
    if (touchStartKeyRef.current?.type === 'space') {
      const totalDistX = pt.x - touchStartPosRef.current.x;
      if (Math.abs(totalDistX) > 14 || hasScrubbedRef.current) {
        const deltaFromLast = pt.x - lastScrubXRef.current;
        const scrubThreshold = 14;
        if (Math.abs(deltaFromLast) >= scrubThreshold) {
          const steps = Math.trunc(deltaFromLast / scrubThreshold);
          onMoveCursor(steps);

          if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
            navigator.vibrate(6);
          }

          lastScrubXRef.current = pt.x;
          hasScrubbedRef.current = true;
          setActiveKeyId(null);
        }
      }
      return;
    }

    // 2. Detección de micro-flick para teclas con carácter secundario
    if (touchStartKeyRef.current?.secondaryChar) {
      const dx = pt.x - touchStartPosRef.current.x;
      const dy = pt.y - touchStartPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= 11) {
        if (!isFlickActiveRef.current) {
          isFlickActiveRef.current = true;
          setIsFlicking(true);
          if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
            navigator.vibrate(6);
          }
        }
      } else if (dist < 7) {
        if (isFlickActiveRef.current) {
          isFlickActiveRef.current = false;
          setIsFlicking(false);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e) ?? activeTouch;

    if (!hasScrubbedRef.current && touchStartKeyRef.current && pt) {
      const key = touchStartKeyRef.current;
      if (isFlickActiveRef.current && key.secondaryChar) {
        // Gesto Flick: emite el carácter secundario
        onKeyPress(key.secondaryChar, key, pt);
        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          navigator.vibrate(12);
        }
      } else {
        // Toque simple (Tap): emite el carácter primario
        onKeyPress(key.char, key, pt);
        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          navigator.vibrate(8);
        }
      }
    }

    isGestureActiveRef.current = false;
    touchStartPosRef.current = null;
    hasScrubbedRef.current = false;
    touchStartKeyRef.current = null;
    isFlickActiveRef.current = false;
    setIsFlicking(false);
    setActiveTouch(null);
    setActiveKeyId(null);
  };

  const handlePointerCancel = () => {
    isGestureActiveRef.current = false;
    touchStartPosRef.current = null;
    hasScrubbedRef.current = false;
    touchStartKeyRef.current = null;
    isFlickActiveRef.current = false;
    setIsFlicking(false);
    setActiveTouch(null);
    setActiveKeyId(null);
  };

  const primaryPivot = layout.pivotPoints.right ?? layout.pivotPoints.left ?? { x: 332, y: 325 };

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
        data-testid="virtual-keyboard-canvas"
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
          <linearGradient id="spacebarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="keyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Fondo del Teclado */}
        <rect width={layout.width} height={layout.height} rx="16" fill="#070b13" />

        {/* 1. Arcos Biomecánicos Concéntricos Guía */}
        {showBiomechanicArcs && (
          <g className="pointer-events-none opacity-25">
            {layout.pivotPoints.right && (
              <>
                {(layout.arcRadii ?? [236, 196, 154, 110]).map((r, idx) => (
                  <circle
                    key={`arc-r-${idx}`}
                    cx={layout.pivotPoints.right!.x}
                    cy={layout.pivotPoints.right!.y}
                    r={r}
                    fill="none"
                    stroke={idx === 2 ? '#10b981' : '#06b6d4'}
                    strokeDasharray={idx === 2 ? undefined : '3 3'}
                    strokeWidth={idx === 2 ? 1.5 : 1}
                  />
                ))}
                <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="5" fill="#10b981" />
              </>
            )}
            {layout.pivotPoints.left && (
              <>
                {(layout.arcRadii ?? [236, 196, 154, 110]).map((r, idx) => (
                  <circle
                    key={`arc-l-${idx}`}
                    cx={layout.pivotPoints.left!.x}
                    cy={layout.pivotPoints.left!.y}
                    r={r}
                    fill="none"
                    stroke={idx === 2 ? '#10b981' : '#06b6d4'}
                    strokeDasharray={idx === 2 ? undefined : '3 3'}
                    strokeWidth={idx === 2 ? 1.5 : 1}
                  />
                ))}
                <circle cx={layout.pivotPoints.left.x} cy={layout.pivotPoints.left.y} r="5" fill="#10b981" />
              </>
            )}
          </g>
        )}

        {/* 2. Sombra de Oclusión Anatómica del Pulgar */}
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

        {/* 3. Teclas Fijas Ergonómicas (Opción C: Tap vs Flick) */}
        {layout.keys.map(key => {
          const isActive = activeKeyId === key.id;
          const isSpace = key.type === 'space';
          const isAction = key.type === 'action';
          const isNumber = key.type === 'number';
          const isTildeKey = key.char === '´';
          const isShiftKey = key.char === 'shift';
          const isVowel = VOWEL_CHARS.has(key.char.toLowerCase());
          const hasSecondary = Boolean(key.secondaryChar);

          let keyFill = '#172033';
          let textColor = '#f1f5f9';
          let borderColor = '#2d3b55';
          let strokeWidth = 1.2;

          if (isActive) {
            if (isFlicking && hasSecondary) {
              keyFill = '#1c1917';
              textColor = '#94a3b8';
              borderColor = '#fbbf24';
              strokeWidth = 2.8;
            } else {
              keyFill = '#38bdf8';
              textColor = '#0f172a';
              borderColor = '#bae6fd';
              strokeWidth = 2.5;
            }
          } else if (isTildeKey) {
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
          } else if (isShiftKey) {
            if (shiftState === 'caps') {
              keyFill = '#0284c7';
              textColor = '#ffffff';
              borderColor = '#38bdf8';
              strokeWidth = 2.4;
            } else if (shiftState === 'shift') {
              keyFill = '#0369a1';
              textColor = '#38bdf8';
              borderColor = '#38bdf8';
              strokeWidth = 2.0;
            } else {
              keyFill = '#1e293b';
              textColor = '#94a3b8';
              borderColor = '#334155';
            }
          } else if (accentPending && isVowel) {
            borderColor = '#f59e0b';
            strokeWidth = 2.0;
            keyFill = '#1e2538';
          } else if (isNumber) {
            keyFill = '#0b1120';
            textColor = '#38bdf8';
            borderColor = '#1e293b';
          } else if (isSpace) {
            keyFill = 'url(#spacebarGradient)';
            borderColor = '#0284c7';
            textColor = '#38bdf8';
          } else if (isAction) {
            keyFill = '#1e293b';
            borderColor = '#475569';
            textColor = '#e2e8f0';
          }

          const primaryDisplay = (isShiftKey && shiftState === 'caps') ? '⇪' : key.display;
          const secondaryDisplay = key.secondaryChar
            ? (key.secondaryChar.length === 1 && /[a-zñ]/i.test(key.secondaryChar)
                ? key.secondaryChar.toUpperCase()
                : key.secondaryChar)
            : null;

          return (
            <g key={key.id} filter="url(#keyGlow)">
              {isSpace && key.path ? (
                /* Barra Espaciadora en Segmento de Arco (Curva Ergonómica) */
                <g>
                  <path
                    d={key.path}
                    fill={keyFill}
                    stroke={borderColor}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <text
                    x={key.x}
                    y={key.y}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="10px"
                    fontWeight="bold"
                    className="pointer-events-none select-none font-sans tracking-wider"
                  >
                    ESPACIO ⟷
                  </text>
                </g>
              ) : (
                /* Teclas Circulares Concéntricas */
                <g>
                  <circle
                    cx={key.x}
                    cy={key.y}
                    r={key.radius}
                    fill={keyFill}
                    stroke={borderColor}
                    strokeWidth={strokeWidth}
                  />

                  {/* Letra o Función Principal (Tap) */}
                  <text
                    x={hasSecondary ? key.x - key.radius * 0.16 : key.x}
                    y={key.y + (hasSecondary ? key.radius * 0.28 : (isAction && key.display.length === 1 ? 5 : 4.5))}
                    textAnchor="middle"
                    fill={isActive && isFlicking && hasSecondary ? '#64748b' : textColor}
                    fontSize={
                      hasSecondary
                        ? `${Math.round(key.radius * 0.95)}px`
                        : isNumber
                        ? '12.5px'
                        : isAction
                        ? '13px'
                        : '14px'
                    }
                    fontWeight={isActive || isNumber || hasSecondary ? '800' : '600'}
                    className="pointer-events-none select-none font-sans"
                  >
                    {primaryDisplay}
                  </text>

                  {/* Carácter Secundario (Flick) en la esquina superior derecha */}
                  {secondaryDisplay && (
                    <text
                      x={key.x + key.radius * 0.42}
                      y={key.y - key.radius * 0.28}
                      textAnchor="middle"
                      fill={isActive && isFlicking ? '#fbbf24' : '#94a3b8'}
                      fontSize={
                        isActive && isFlicking
                          ? `${Math.round(key.radius * 0.75)}px`
                          : `${Math.max(8, Math.round(key.radius * 0.52))}px`
                      }
                      fontWeight={isActive && isFlicking ? '900' : '700'}
                      className="pointer-events-none select-none font-sans"
                    >
                      {secondaryDisplay}
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
