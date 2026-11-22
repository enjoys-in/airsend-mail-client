import type { BackgroundOption } from "../types";
import { EffectsError } from "./support";

// The user's own background pictures: validated, downscaled to at most 1280x720, kept in this browser's IndexedDB (they never leave
// the device). Plain IndexedDB, no library. Everything is SSR-safe (functions only touch `indexedDB` when called).

const DB_NAME = "airsend-meet";
const STORE = "backgrounds";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_CUSTOM_BACKGROUNDS = 8;
const MAX_W = 1280;
const MAX_H = 720;
const THUMB_W = 160;
const THUMB_H = 90;

interface StoredBackground {
  id: string;
  label: string;
  /** The downscaled picture (JPEG). */
  blob: Blob;
  /** Small data URL for the picker. */
  thumb: string;
  createdAt: number;
}

// ── IndexedDB plumbing ───────────────────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new EffectsError("This browser cannot store your own backgrounds."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new EffectsError("Your own backgrounds could not be opened (is private browsing on?)."));
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = work(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(new EffectsError("Your own backgrounds could not be saved."));
      tx.onabort = () => reject(new EffectsError("Your own backgrounds could not be saved (storage may be full)."));
    });
  } finally {
    db.close();
  }
}

const toOption = (item: StoredBackground): BackgroundOption => ({ id: item.id, label: item.label, kind: "custom", thumbnail: item.thumb });

// ── validation + downscale ───────────────────────────────────────────────────

/** png / jpeg / webp, decided by the first bytes, not by the file name or the browser-reported type. */
async function sniffImage(file: Blob): Promise<"png" | "jpeg" | "webp" | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "png";
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  const ascii = (from: number, to: number) => String.fromCharCode(...head.slice(from, to));
  if (head.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

async function decode(file: Blob): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new EffectsError("That picture could not be read. Try a different PNG, JPEG or WebP.");
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new EffectsError("That picture could not be processed."))), "image/jpeg", quality),
  );
}

function labelFor(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return (base || "My background").slice(0, 32);
}

// ── public API ───────────────────────────────────────────────────────────────

export async function listCustomBackgrounds(): Promise<BackgroundOption[]> {
  const all = await run<StoredBackground[]>("readonly", (store) => store.getAll() as IDBRequest<StoredBackground[]>);
  return all.sort((a, b) => a.createdAt - b.createdAt).map(toOption);
}

export async function addCustomBackground(file: File): Promise<BackgroundOption> {
  if (file.size === 0) throw new EffectsError("That file is empty.");
  if (file.size > MAX_FILE_BYTES) throw new EffectsError("That picture is larger than 8 MB. Choose a smaller one.");
  if (!(await sniffImage(file))) throw new EffectsError("Choose a PNG, JPEG or WebP picture.");

  const count = await run<number>("readonly", (store) => store.count());
  if (count >= MAX_CUSTOM_BACKGROUNDS) {
    throw new EffectsError(`You can keep up to ${MAX_CUSTOM_BACKGROUNDS} of your own backgrounds. Remove one first.`);
  }

  const image = await decode(file);
  try {
    if (image.width < 2 || image.height < 2) throw new EffectsError("That picture is too small to use.");

    const scale = Math.min(1, MAX_W / image.width, MAX_H / image.height);
    const w = Math.max(2, Math.round(image.width * scale));
    const h = Math.max(2, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new EffectsError("That picture could not be processed.");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#000"; // flatten transparent PNGs
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(image.source, 0, 0, w, h);
    const blob = await toBlob(canvas, 0.88);

    // thumbnail: cover-fit into 160x90
    const thumb = document.createElement("canvas");
    thumb.width = THUMB_W;
    thumb.height = THUMB_H;
    const tctx = thumb.getContext("2d");
    if (tctx) {
      const s = Math.max(THUMB_W / w, THUMB_H / h);
      tctx.drawImage(canvas, (THUMB_W - w * s) / 2, (THUMB_H - h * s) / 2, w * s, h * s);
    }

    const item: StoredBackground = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      label: labelFor(file),
      blob,
      thumb: thumb.toDataURL("image/jpeg", 0.82),
      createdAt: Date.now(),
    };
    await run("readwrite", (store) => store.put(item));
    return toOption(item);
  } finally {
    image.close();
  }
}

export async function removeCustomBackground(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

/** The stored picture drawn onto a canvas, ready for the pipeline. null when it no longer exists. */
export async function loadCustomBackgroundCanvas(id: string): Promise<HTMLCanvasElement | null> {
  const item = await run<StoredBackground | undefined>("readonly", (store) => store.get(id) as IDBRequest<StoredBackground | undefined>);
  if (!item) return null;
  const image = await decode(item.blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d")?.drawImage(image.source, 0, 0);
    return canvas;
  } finally {
    image.close();
  }
}
