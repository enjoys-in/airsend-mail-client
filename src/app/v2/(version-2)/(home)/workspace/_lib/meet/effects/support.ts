// Can this browser run camera background effects? (segmentation needs WebAssembly + WebGL2; output needs canvas capture.)

export class EffectsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EffectsError";
  }
}

let cached: string | null | undefined;

/** null when effects are supported, otherwise a short reason that is safe to show to the user. Client-only; cached. */
export function effectsSupportError(): string | null {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined" || typeof document === "undefined") return null; // SSR: decided on the client

  const unsupported = (reason: string) => (cached = reason);

  if (typeof WebAssembly === "undefined") return unsupported("Background effects need WebAssembly, which this browser does not have.");
  if (typeof HTMLCanvasElement === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
    return unsupported("This browser cannot send an edited camera picture, so background effects are not available.");
  }
  try {
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2")) return unsupported("Background effects need WebGL, which is turned off or missing in this browser.");
  } catch {
    return unsupported("Background effects need WebGL, which is turned off or missing in this browser.");
  }
  return (cached = null);
}

/** `ctx.filter` (cheap, smooth canvas blur) exists in Chromium and Firefox but not in Safari. */
export function canvasFilterSupported(): boolean {
  return typeof CanvasRenderingContext2D !== "undefined" && "filter" in CanvasRenderingContext2D.prototype;
}
