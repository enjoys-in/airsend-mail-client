export { useVideoEffects, EFFECT_STORAGE_KEY } from "./use-video-effects";
export type { UseVideoEffectsOptions, UseVideoEffectsResult } from "./use-video-effects";
export { EffectsPipeline } from "./pipeline";
export type { BackgroundSource, PipelineEffect, PipelineOptions } from "./pipeline";
export { effectsSupportError, EffectsError } from "./support";
export { getPresetOptions, renderPreset, isPresetId } from "./presets";
export {
  addCustomBackground,
  listCustomBackgrounds,
  removeCustomBackground,
  loadCustomBackgroundCanvas,
  MAX_CUSTOM_BACKGROUNDS,
} from "./custom-backgrounds";
