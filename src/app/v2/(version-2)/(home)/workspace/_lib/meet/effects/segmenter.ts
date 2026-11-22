import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import { EffectsError } from "./support";

// Person segmentation (MediaPipe ImageSegmenter, selfie model). Everything it needs is self-hosted under /public/meet-effects:
//   /meet-effects/wasm/*                  the MediaPipe runtime (copied from node_modules/@mediapipe/tasks-vision/wasm)
//   /meet-effects/selfie_segmenter.tflite the model (float16)
// Loaded lazily the first time an effect other than "none" is used, shared by every pipeline, closed again when idle.

export const EFFECTS_BASE_PATH = "/meet-effects";
const IDLE_CLOSE_MS = 15_000;

type Delegate = "GPU" | "CPU";

export interface SegmenterLease {
  /** The shared segmenter. Re-read it after `downgradeToCpu()`. */
  readonly segmenter: ImageSegmenter;
  /** A timestamp that is strictly increasing across every pipeline (MediaPipe requires it in video mode). */
  nextTimestamp(): number;
  /** The GPU delegate failed while running: rebuild on the CPU. */
  downgradeToCpu(): Promise<void>;
  release(): void;
}

let current: ImageSegmenter | null = null;
let loading: Promise<ImageSegmenter> | null = null;
let delegate: Delegate = "GPU";
let refs = 0;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let lastTimestamp = 0;

async function create(wanted: Delegate): Promise<ImageSegmenter> {
  const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(`${EFFECTS_BASE_PATH}/wasm`);
  const make = (d: Delegate) =>
    ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${EFFECTS_BASE_PATH}/selfie_segmenter.tflite`, delegate: d },
      runningMode: "VIDEO",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
  if (wanted === "GPU") {
    try {
      return await make("GPU");
    } catch {
      delegate = "CPU";
    }
  }
  return make("CPU");
}

function dispose() {
  closeTimer = null;
  if (refs > 0) return;
  try {
    current?.close();
  } catch {
    /* already closed */
  }
  current = null;
  loading = null;
}

export async function acquireSegmenter(): Promise<SegmenterLease> {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  refs++;
  try {
    loading ??= create(delegate).then((segmenter) => (current = segmenter));
    current = await loading;
  } catch (error) {
    refs--;
    loading = null;
    throw new EffectsError(
      error instanceof Error && /fetch|network|404|load/i.test(error.message)
        ? "The background effects files could not be loaded. Check your connection and try again."
        : "Background effects could not start on this device.",
    );
  }

  let released = false;
  return {
    get segmenter() {
      return current as ImageSegmenter;
    },
    nextTimestamp() {
      lastTimestamp = Math.max(lastTimestamp + 1, Math.round(performance.now()));
      return lastTimestamp;
    },
    async downgradeToCpu() {
      if (delegate === "CPU") return;
      delegate = "CPU";
      const old = current;
      loading = create("CPU").then((segmenter) => (current = segmenter));
      current = await loading;
      try {
        old?.close();
      } catch {
        /* ignore */
      }
    },
    release() {
      if (released) return;
      released = true;
      refs = Math.max(0, refs - 1);
      if (refs === 0 && !closeTimer) closeTimer = setTimeout(dispose, IDLE_CLOSE_MS);
    },
  };
}
