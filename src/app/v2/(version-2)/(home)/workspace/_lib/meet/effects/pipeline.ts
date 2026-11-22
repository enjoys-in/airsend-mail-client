import type { ImageSegmenterResult } from "@mediapipe/tasks-vision";
import { acquireSegmenter, type SegmenterLease } from "./segmenter";
import { canvasFilterSupported, EffectsError } from "./support";

// ---------------------------------------------------------------------------
// EffectsPipeline: camera MediaStream in, processed MediaStream out.
//
//   camera video track --> <video> --> segment person --> background (blurred camera | picture) + person on top
//                                                              --> canvas.captureStream(30) --> output video track
//   the ORIGINAL audio tracks are passed through untouched (the output stream shares them: stop() never stops them)
//
// The output video track is what gets sent to the peers (replaceTrack on every sender), so everyone sees the effect.
// ---------------------------------------------------------------------------

/** A picture already prepared by the caller (presets are drawn to a canvas, custom backgrounds are decoded). */
export type BackgroundSource = HTMLCanvasElement | HTMLImageElement | ImageBitmap;

export type PipelineEffect =
  | { kind: "blur"; level: "light" | "strong" }
  | { kind: "image"; source: BackgroundSource };

export interface PipelineOptions {
  /** Output is capped to this width (keeps the CPU/GPU cost sane on 1080p cameras). Default 1280. */
  maxWidth?: number;
  /** The camera track ended (unplugged, permission revoked). The pipeline has already stopped itself. */
  onEnded?: () => void;
}

// Blur strength: the camera frame is drawn small and scaled back up (cheap), plus a canvas blur on the small copy where supported.
const BLUR: Record<"light" | "strong", { divisor: number; px: number }> = {
  light: { divisor: 8, px: 2 },
  strong: { divisor: 16, px: 3 },
};

// Soft threshold of the person confidence (0..1): below LOW is background, above HIGH is person, smooth in between.
const EDGE_LOW = 0.35;
const EDGE_HIGH = 0.7;
const MASK_SMOOTHING = 0.45; // weight of the previous mask: calms flicker at the edges
const CALIBRATION_FRAMES = 30;

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

function sourceSize(source: BackgroundSource): { w: number; h: number } {
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) return { w: source.naturalWidth, h: source.naturalHeight };
  return { w: (source as HTMLCanvasElement | ImageBitmap).width, h: (source as HTMLCanvasElement | ImageBitmap).height };
}

function makeCanvas(): HTMLCanvasElement {
  return document.createElement("canvas");
}

export class EffectsPipeline {
  private readonly input: MediaStream;
  private readonly maxWidth: number;
  private readonly onEnded?: () => void;

  private video: HTMLVideoElement | null = null;
  private sourceTrack: MediaStreamTrack | null = null;
  private outputTrack: MediaStreamTrack | null = null;
  private output: MediaStream | null = null;
  private lease: SegmenterLease | null = null;

  private readonly out = makeCanvas();
  private readonly person = makeCanvas();
  private readonly small = makeCanvas();
  private readonly maskCanvas = makeCanvas();
  private readonly bgCanvas = makeCanvas();
  private outCtx!: CanvasRenderingContext2D;
  private personCtx!: CanvasRenderingContext2D;
  private smallCtx!: CanvasRenderingContext2D;
  private maskCtx!: CanvasRenderingContext2D;
  private bgCtx!: CanvasRenderingContext2D;

  private width = 0;
  private height = 0;

  private effect: PipelineEffect = { kind: "blur", level: "light" };
  private bgDirty = true;
  private smallKey = "";

  private maskImage: ImageData | null = null;
  private mask32: Uint32Array | null = null;
  private maskPrev: Float32Array | null = null;
  private personIndex = 1;
  private inverted = false;
  private calibrated = false;
  private calibFrames = 0;
  private centreSum = 0;
  private borderSum = 0;
  private hasMask = false;

  private frame = 0;
  private interval = 1; // segment every Nth frame (adaptive, reuses the last mask in between)
  private avgMs = 0;
  private lastVideoTime = -1;
  private useFilter = false;

  private paused = false;
  private stopped = false;
  private started = false;
  private videoFrameHandle: number | null = null;
  private rafHandle: number | null = null;
  private ticker: { stop: () => void } | null = null;
  private readonly endedListener = () => {
    this.stop();
    this.onEnded?.();
  };
  private readonly visibilityListener = () => this.reschedule();

  constructor(input: MediaStream, options: PipelineOptions = {}) {
    this.input = input;
    this.maxWidth = options.maxWidth ?? 1280;
    this.onEnded = options.onEnded;
  }

  /** The processed stream. Only valid after `start()` resolved. */
  get outputStream(): MediaStream {
    if (!this.output) throw new EffectsError("The video effect has not started yet.");
    return this.output;
  }

  /** Swap what the background looks like. Cheap; can be called any time, before or after `start()`. */
  setEffect(effect: PipelineEffect): void {
    this.effect = effect;
    this.bgDirty = true;
  }

  /** Camera switched off: stop spending CPU, send a disabled (black) track. Follows the source track's `enabled` too. */
  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  async start(): Promise<void> {
    if (this.started || this.stopped) return;
    this.started = true;

    const track = this.input.getVideoTracks()[0];
    if (!track || track.readyState !== "live") throw new EffectsError("There is no camera picture to apply an effect to.");
    this.sourceTrack = track;

    const get = (canvas: HTMLCanvasElement, opts?: CanvasRenderingContext2DSettings) => {
      const ctx = canvas.getContext("2d", opts);
      if (!ctx) throw new EffectsError("This browser could not set up the video effect.");
      return ctx;
    };
    this.outCtx = get(this.out, { alpha: false, desynchronized: true });
    this.personCtx = get(this.person);
    this.smallCtx = get(this.small, { alpha: false });
    this.maskCtx = get(this.maskCanvas);
    this.bgCtx = get(this.bgCanvas, { alpha: false });
    this.useFilter = canvasFilterSupported();

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = new MediaStream([track]);
    this.video = video;
    try {
      await video.play();
    } catch {
      /* autoplay of a muted stream is allowed everywhere that matters; readyState below decides */
    }
    await this.waitForFirstFrame(video);
    if (this.stopped) return;

    this.resize(video.videoWidth, video.videoHeight);

    const lease = await acquireSegmenter();
    if (this.stopped) {
      lease.release();
      return;
    }
    this.lease = lease;

    // Draw a first frame before capturing so the output never starts black.
    this.process(true);

    const captured = this.out.captureStream(30).getVideoTracks()[0];
    if (!captured) throw new EffectsError("This browser could not capture the edited picture.");
    this.outputTrack = captured;
    captured.enabled = this.sourceTrack.enabled && !this.paused;
    this.output = new MediaStream([captured, ...this.input.getAudioTracks()]);

    track.addEventListener("ended", this.endedListener);
    document.addEventListener("visibilitychange", this.visibilityListener);
    this.reschedule();
  }

  /** Releases everything. Safe to call twice. Never stops the camera or microphone tracks. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;

    this.cancelSchedule();
    document.removeEventListener("visibilitychange", this.visibilityListener);
    this.sourceTrack?.removeEventListener("ended", this.endedListener);
    this.outputTrack?.stop(); // the canvas track only
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
    this.lease?.release();
    this.lease = null;
    for (const canvas of [this.out, this.person, this.small, this.maskCanvas, this.bgCanvas]) {
      canvas.width = 0;
      canvas.height = 0;
    }
    this.maskImage = null;
    this.mask32 = null;
    this.maskPrev = null;
    this.video = null;
  }

  // ── scheduling ────────────────────────────────────────────────────────────

  private waitForFirstFrame(video: HTMLVideoElement): Promise<void> {
    if (video.readyState >= 2 && video.videoWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => done(new EffectsError("The camera did not produce a picture in time.")), 6000);
      const check = () => {
        if (video.readyState >= 2 && video.videoWidth > 0) done();
      };
      const done = (error?: Error) => {
        clearTimeout(timeout);
        video.removeEventListener("loadeddata", check);
        video.removeEventListener("resize", check);
        if (error) reject(error);
        else resolve();
      };
      video.addEventListener("loadeddata", check);
      video.addEventListener("resize", check);
    });
  }

  private cancelSchedule() {
    const video = this.video;
    if (this.videoFrameHandle !== null && video && "cancelVideoFrameCallback" in video) {
      (video as HTMLVideoElement & { cancelVideoFrameCallback(h: number): void }).cancelVideoFrameCallback(this.videoFrameHandle);
    }
    if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
    this.videoFrameHandle = null;
    this.rafHandle = null;
    this.ticker?.stop();
    this.ticker = null;
  }

  /**
   * Visible tab: one callback per camera frame (requestVideoFrameCallback, else rAF).
   * Hidden tab: those stop firing, which would freeze the picture the other people see, so a worker-driven timer takes over.
   */
  private reschedule() {
    if (this.stopped || !this.video) return;
    this.cancelSchedule();
    if (typeof document !== "undefined" && document.hidden) {
      this.ticker = startBackgroundTicker(() => this.process(false), 66);
      return;
    }
    const video = this.video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    const loop = () => {
      if (this.stopped) return;
      this.process(false);
      if (this.stopped) return;
      if (video.requestVideoFrameCallback) this.videoFrameHandle = video.requestVideoFrameCallback(loop);
      else this.rafHandle = requestAnimationFrame(loop);
    };
    if (video.requestVideoFrameCallback) this.videoFrameHandle = video.requestVideoFrameCallback(loop);
    else this.rafHandle = requestAnimationFrame(loop);
  }

  // ── per frame ─────────────────────────────────────────────────────────────

  private process(force: boolean) {
    const video = this.video;
    const source = this.sourceTrack;
    if (this.stopped || !video || !source) return;

    // The output follows the camera's `enabled` (camera off = disabled track = black picture, nothing to compute).
    const live = source.enabled && !this.paused && source.readyState === "live";
    if (this.outputTrack && this.outputTrack.enabled !== live) this.outputTrack.enabled = live;
    if (!live) return;

    if (video.readyState < 2 || video.videoWidth === 0) return;
    if (!force && video.currentTime === this.lastVideoTime) return; // no new camera frame yet
    this.lastVideoTime = video.currentTime;

    if (video.videoWidth !== this.srcWidth || video.videoHeight !== this.srcHeight) this.resize(video.videoWidth, video.videoHeight);

    if (this.lease && this.frame % this.interval === 0) this.segment(video);
    this.frame++;
    this.compose(video);
  }

  private srcWidth = 0;
  private srcHeight = 0;

  private resize(videoWidth: number, videoHeight: number) {
    this.srcWidth = videoWidth;
    this.srcHeight = videoHeight;
    const w = even(Math.min(videoWidth, this.maxWidth));
    const h = even((videoHeight * w) / videoWidth);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.out.width = this.person.width = this.bgCanvas.width = w;
    this.out.height = this.person.height = this.bgCanvas.height = h;
    this.bgDirty = true;
    this.smallKey = "";
  }

  private segment(video: HTMLVideoElement) {
    const lease = this.lease;
    if (!lease) return;
    const started = performance.now();
    try {
      lease.segmenter.segmentForVideo(video, lease.nextTimestamp(), (result) => this.readMask(result));
    } catch {
      // A GPU delegate that loaded but cannot run: rebuild once on the CPU, keep the last mask meanwhile.
      void lease.downgradeToCpu().catch(() => {});
      return;
    }
    // Adapt: slow devices segment every 2nd/3rd frame and reuse the mask in between.
    const ms = performance.now() - started;
    this.avgMs = this.avgMs === 0 ? ms : this.avgMs * 0.85 + ms * 0.15;
    this.interval = this.avgMs > 45 ? 3 : this.avgMs > 22 ? 2 : 1;
  }

  /** Confidence mask -> alpha of `maskCanvas` (soft threshold + temporal smoothing). Runs inside the segmenter callback. */
  private readMask(result: ImageSegmenterResult) {
    const masks = result.confidenceMasks;
    if (!masks || masks.length === 0) return;
    const mask = masks[Math.min(this.personIndex, masks.length - 1)];
    const data = mask.getAsFloat32Array();
    const mw = mask.width;
    const mh = mask.height;
    const count = mw * mh;

    if (!this.maskImage || this.maskImage.width !== mw || this.maskImage.height !== mh) {
      this.maskImage = this.maskCtx.createImageData(mw, mh);
      this.mask32 = new Uint32Array(this.maskImage.data.buffer);
      this.maskPrev = new Float32Array(count);
      this.maskCanvas.width = mw;
      this.maskCanvas.height = mh;
      this.hasMask = false;
    }
    const out32 = this.mask32!;
    const prev = this.maskPrev!;

    if (!this.calibrated) this.calibrate(data, mw, mh);

    const invert = this.inverted;
    const first = !this.hasMask;
    const span = EDGE_HIGH - EDGE_LOW;
    for (let i = 0; i < count; i++) {
      let v = data[i];
      if (invert) v = 1 - v;
      if (!first) v = prev[i] * MASK_SMOOTHING + v * (1 - MASK_SMOOTHING);
      prev[i] = v;
      let t = (v - EDGE_LOW) / span;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const alpha = (t * t * (3 - 2 * t) * 255) | 0;
      out32[i] = (alpha << 24) | 0x00ffffff; // little-endian RGBA: white with the person alpha
    }
    this.maskCtx.putImageData(this.maskImage, 0, 0);
    this.hasMask = true;
  }

  /**
   * Models differ in which mask is "person". For the first frames compare the middle of the picture with its border: the person is
   * normally in the middle, so a border that is clearly "more confident" means the mask is the background and must be inverted.
   */
  private calibrate(data: Float32Array, w: number, h: number) {
    const x0 = Math.floor(w * 0.35);
    const x1 = Math.floor(w * 0.65);
    const y0 = Math.floor(h * 0.3);
    const y1 = Math.floor(h * 0.7);
    let centre = 0;
    let centreN = 0;
    for (let y = y0; y < y1; y += 4) {
      for (let x = x0; x < x1; x += 4) {
        centre += data[y * w + x];
        centreN++;
      }
    }
    const bx = Math.max(1, Math.floor(w * 0.1));
    const by = Math.max(1, Math.floor(h * 0.1));
    let border = 0;
    let borderN = 0;
    for (let y = 0; y < by; y += 2) {
      for (let x = 0; x < w; x += 4) {
        border += data[y * w + x];
        borderN++;
      }
    }
    for (let y = by; y < h; y += 4) {
      for (let x = 0; x < bx; x += 2) {
        border += data[y * w + x];
        borderN++;
      }
    }
    this.centreSum += centre / Math.max(1, centreN);
    this.borderSum += border / Math.max(1, borderN);
    this.calibFrames++;
    if (this.calibFrames < CALIBRATION_FRAMES) return;
    this.calibrated = true;
    this.inverted = this.borderSum - this.centreSum > this.calibFrames * 0.15;
  }

  private compose(video: HTMLVideoElement) {
    const { outCtx: o, personCtx: p, width: w, height: h } = this;
    if (w === 0 || h === 0) return;

    // 1. The person: the camera frame cut out with the mask.
    if (this.hasMask) {
      p.globalCompositeOperation = "copy";
      p.drawImage(video, 0, 0, w, h);
      p.globalCompositeOperation = "destination-in";
      p.imageSmoothingEnabled = true;
      p.imageSmoothingQuality = "high";
      p.drawImage(this.maskCanvas, 0, 0, w, h);
      p.globalCompositeOperation = "source-over";
    }

    // 2. The background.
    const effect = this.effect;
    if (effect.kind === "image") {
      if (this.bgDirty) this.renderBackground(effect.source);
      o.drawImage(this.bgCanvas, 0, 0);
    } else {
      this.drawBlurredBackground(video, effect.level);
    }

    // 3. The person on top (before the first mask arrives the plain camera frame shows instead).
    if (this.hasMask) o.drawImage(this.person, 0, 0);
    else if (effect.kind === "image") o.drawImage(video, 0, 0, w, h);
  }

  private drawBlurredBackground(video: HTMLVideoElement, level: "light" | "strong") {
    const { divisor, px } = BLUR[level];
    const sw = even(this.width / divisor);
    const sh = even(this.height / divisor);
    const key = `${sw}x${sh}`;
    if (key !== this.smallKey) {
      this.small.width = sw;
      this.small.height = sh;
      this.smallKey = key;
    }
    const s = this.smallCtx;
    if (this.useFilter) s.filter = `blur(${px}px)`;
    s.drawImage(video, 0, 0, sw, sh);
    if (this.useFilter) s.filter = "none";

    const o = this.outCtx;
    o.imageSmoothingEnabled = true;
    o.imageSmoothingQuality = "high";
    o.drawImage(this.small, 0, 0, this.width, this.height);
  }

  /** Cover-fit the picture into `bgCanvas` once (and again only when the picture or the output size changes). */
  private renderBackground(source: BackgroundSource) {
    this.bgDirty = false;
    const { w: sw, h: sh } = sourceSize(source);
    const ctx = this.bgCtx;
    if (!sw || !sh) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, this.width, this.height);
      return;
    }
    const scale = Math.max(this.width / sw, this.height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);
  }
}

// ── background-tab ticker ────────────────────────────────────────────────────

/** A timer that keeps firing in a hidden tab: a worker's setInterval is not throttled like the main thread's. Falls back to setInterval. */
function startBackgroundTicker(callback: () => void, everyMs: number): { stop: () => void } {
  try {
    const url = URL.createObjectURL(new Blob([`setInterval(() => postMessage(0), ${everyMs});`], { type: "text/javascript" }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = () => callback();
    return { stop: () => worker.terminate() };
  } catch {
    const handle = setInterval(callback, everyMs);
    return { stop: () => clearInterval(handle) };
  }
}
