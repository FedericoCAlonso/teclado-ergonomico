import React, { useState, useRef, useCallback } from 'react';
import type { LayoutDefinition, KeyDefinition } from '../types';
import type { TouchStroke, DecodeResult } from '../decoder/bayesianDecoder';
import { decodeTouchStroke } from '../decoder/bayesianDecoder';
import type { Point2D } from '../biomechanics/polarModel';
import { getOcclusionPolygon } from '../biomechanics/polarModel';

interface VirtualKeyboardCanvasProps {
  layout: LayoutDefinition;
  textHistory: string;
  showOcclusionShadow: boolean;
  showBiomechanicArcs: boolean;
  onKeyProcessed: (result: DecodeResult, touchPoint: { x: number; y: number }) => void;
}

export const VirtualKeyboardCanvas: React.FC<VirtualKeyboardCanvasProps> = ({
  layout,
  textHistory,
  showOcclusionShadow,
  showBiomechanicArcs,
  onKeyProcessed
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeTouch, setActiveTouch] = useState<Point2D | null>(null);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [gestureVector, setGestureVector] = useState<{ start: Point2D; current: Point2D } | null>(null);
  const strokeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const pt = getSvgCoordinates(e);
    if (!pt) return;

    strokeStartRef.current = { x: pt.x, y: pt.y, time: Date.now() };
    setActiveTouch(pt);
    setGestureVector({ start: pt, current: pt });

    // Encontrar tecla más cercana para feedback visual inmediato
    let closestKey: KeyDefinition | null = null;
    let minDist = 9999;
    for (const key of layout.keys) {
      const d = Math.hypot(pt.x - key.x, pt.y - key.y);
      if (d < minDist) {
        minDist = d;
        closestKey = key;
      }
    }
    setActiveKeyId(closestKey && minDist < 45 ? closestKey.id : null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!strokeStartRef.current) return;
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setActiveTouch(pt);
    setGestureVector({ start: { x: strokeStartRef.current.x, y: strokeStartRef.current.y }, current: pt });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!strokeStartRef.current) return;
    const pt = getSvgCoordinates(e) ?? activeTouch;
    const start = strokeStartRef.current;

    const stroke: TouchStroke = {
      startX: start.x,
      startY: start.y,
      endX: pt ? pt.x : start.x,
      endY: pt ? pt.y : start.y,
      durationMs: Date.now() - start.time
    };

    const decodeResult = decodeTouchStroke(stroke, layout, textHistory);

    // Feedback háptico en móviles
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(8);
    }

    onKeyProcessed(decodeResult, { x: stroke.endX, y: stroke.endY });

    // Resetear estados visuales
    strokeStartRef.current = null;
    setActiveTouch(null);
    setActiveKeyId(null);
    setGestureVector(null);
  };

  const handlePointerCancel = () => {
    strokeStartRef.current = null;
    setActiveTouch(null);
    setActiveKeyId(null);
    setGestureVector(null);
  };

  const primaryPivot = layout.pivotPoints.right ?? layout.pivotPoints.left ?? { x: 360, y: 320 };

  // Polígono de oclusión anatómica proyectado desde el toque actual hasta el pivote de la mano
  const occlusionPoly = (showOcclusionShadow && activeTouch)
    ? getOcclusionPolygon(activeTouch, primaryPivot)
    : null;

  const occlusionPointsString = occlusionPoly
    ? occlusionPoly.map(p => `${p.x},${p.y}`).join(' ')
    : '';

  return (
    <div className="relative w-full max-w-md mx-auto touch-none select-none bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-2 overflow-hidden">
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
          {/* Gradientes y filtros para estética ergonómica moderna */}
          <radialGradient id="puckGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="occlusionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.10" />
          </linearGradient>
          <filter id="keyShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Fondo del Teclado */}
        <rect width={layout.width} height={layout.height} rx="16" fill="#090d16" />

        {/* 1. Arcos Biomecánicos Guía (Zona Neutra / Sweet Spot) */}
        {showBiomechanicArcs && (
          <g className="pointer-events-none opacity-40">
            {layout.pivotPoints.right && (
              <>
                <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="165" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
                <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="215" fill="none" stroke="#10b981" strokeWidth="1.5" />
                <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="265" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
                <circle cx={layout.pivotPoints.right.x} cy={layout.pivotPoints.right.y} r="5" fill="#10b981" />
              </>
            )}
            {layout.pivotPoints.left && (
              <>
                <circle cx={layout.pivotPoints.left.x} cy={layout.pivotPoints.left.y} r="165" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
                <circle cx={layout.pivotPoints.left.x} cy={layout.pivotPoints.left.y} r="215" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                <circle cx={layout.pivotPoints.left.x} cy={layout.pivotPoints.left.y} r="265" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
                <circle cx={layout.pivotPoints.left.x} cy={layout.pivotPoints.left.y} r="5" fill="#06b6d4" />
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
            strokeDasharray="3 3"
            className="pointer-events-none animate-pulse"
          />
        )}

        {/* 3. Teclas Fijas (Muscle Memory) */}
        {layout.keys.map(key => {
          const isActive = activeKeyId === key.id;
          const isSpace = key.type === 'space';
          const isAction = key.type === 'action';
          const isPunctuation = key.type === 'punctuation';

          // Color del botón según función o mano
          let keyFill = '#1e293b';
          let textColor = '#f8fafc';
          let borderColor = '#334155';

          if (isActive) {
            keyFill = '#38bdf8';
            textColor = '#0f172a';
            borderColor = '#7dd3fc';
          } else if (isSpace) {
            keyFill = '#0f172a';
            borderColor = '#38bdf8';
            textColor = '#38bdf8';
          } else if (isAction) {
            keyFill = '#334155';
            borderColor = '#475569';
            textColor = '#e2e8f0';
          } else if (isPunctuation) {
            keyFill = '#1e293b';
            borderColor = '#475569';
            textColor = '#94a3b8';
          } else if (key.handAssigned === 'left') {
            borderColor = '#0284c7';
          } else if (key.handAssigned === 'right') {
            borderColor = '#059669';
          }

          return (
            <g key={key.id} filter="url(#keyShadow)" className="transition-transform duration-75">
              {/* Cuerpo de la Tecla */}
              {isSpace ? (
                <rect
                  x={key.x - key.radius * 1.8}
                  y={key.y - key.radius * 0.7}
                  width={key.radius * 3.6}
                  height={key.radius * 1.4}
                  rx={key.radius * 0.7}
                  fill={keyFill}
                  stroke={borderColor}
                  strokeWidth="1.5"
                />
              ) : (
                <circle
                  cx={key.x}
                  cy={key.y}
                  r={key.radius}
                  fill={keyFill}
                  stroke={borderColor}
                  strokeWidth={isActive ? 2.5 : 1.2}
                />
              )}

              {/* Letra Principal */}
              <text
                x={key.x}
                y={key.y + (isSpace ? 4 : 5)}
                textAnchor="middle"
                fill={textColor}
                fontSize={isSpace ? '11px' : isAction ? '14px' : '15px'}
                fontWeight={isActive ? '800' : '600'}
                fontFamily="system-ui, -apple-system, sans-serif"
                className="pointer-events-none select-none"
              >
                {key.display}
              </text>

              {/* Carácter Secundario (Número o Símbolo al deslizar abajo) */}
              {key.secondaryChar && !isSpace && (
                <text
                  x={key.x + key.radius * 0.45}
                  y={key.y - key.radius * 0.35}
                  textAnchor="middle"
                  fill={isActive ? '#0f172a' : '#94a3b8'}
                  fontSize="9px"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {key.secondaryChar}
                </text>
              )}

              {/* Indicador de Tilde o Acento (al deslizar arriba/afuera) */}
              {key.accentChar && !isSpace && (
                <circle
                  cx={key.x - key.radius * 0.5}
                  cy={key.y - key.radius * 0.4}
                  r="2"
                  fill={isActive ? '#0f172a' : '#38bdf8'}
                  className="pointer-events-none"
                />
              )}
            </g>
          );
        })}

        {/* 4. Trazo del Gesto en Tiempo Real (Flick o Tap Puck) */}
        {gestureVector && (
          <g className="pointer-events-none">
            <line
              x1={gestureVector.start.x}
              y1={gestureVector.start.y}
              x2={gestureVector.current.x}
              y2={gestureVector.current.y}
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 2"
            />
            <circle
              cx={gestureVector.current.x}
              cy={gestureVector.current.y}
              r="14"
              fill="url(#puckGlow)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
