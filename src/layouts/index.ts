import type { LayoutDefinition } from '../types';
import {
  radialSingleThumbLayout,
  radialSingleThumbLeftLayout,
  createRadialSingleThumbLayout,
  DEFAULT_RADIAL_TUNING,
  type RadialTuningParams
} from './radialSingleThumbLayout';
import { bimanualSplitLayout } from './bimanualSplitLayout';
import { hybridLayout } from './hybridLayout';
import { qwertyBaselineLayout } from './qwertyBaselineLayout';

export {
  radialSingleThumbLayout,
  radialSingleThumbLeftLayout,
  createRadialSingleThumbLayout,
  DEFAULT_RADIAL_TUNING,
  type RadialTuningParams,
  bimanualSplitLayout,
  hybridLayout,
  qwertyBaselineLayout
};

export const AVAILABLE_LAYOUTS: LayoutDefinition[] = [
  radialSingleThumbLayout,
  radialSingleThumbLeftLayout,
  bimanualSplitLayout,
  hybridLayout,
  qwertyBaselineLayout
];

export function getLayoutById(id: string): LayoutDefinition {
  const found = AVAILABLE_LAYOUTS.find(l => l.id === id);
  return found ?? radialSingleThumbLayout;
}
