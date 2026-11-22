import type { BackgroundOption } from "../types";

// Built-in backgrounds, drawn procedurally (no image files to ship). Every scene is drawn relative to the canvas size, so the same
// code produces the 1280x720 background the pipeline uses and the small thumbnail in the picker.

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

interface Preset {
  id: string;
  label: string;
  draw: Draw;
}

/** Deterministic pseudo-random numbers so a scene looks the same every time it is drawn. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function linear(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace("ALPHA", String(alpha)));
  g.addColorStop(1, color.replace("ALPHA", "0"));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const office: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [[0, "#ece8df"], [1, "#d6cfc1"]]);
  ctx.fillRect(0, 0, w, h);

  // window with a light shaft
  const wx = w * 0.55, wy = h * 0.1, ww = w * 0.34, wh = h * 0.55;
  ctx.fillStyle = "#f6f3ec";
  roundRect(ctx, wx - w * 0.012, wy - h * 0.02, ww + w * 0.024, wh + h * 0.04, 6);
  ctx.fill();
  ctx.fillStyle = linear(ctx, 0, wy, 0, wy + wh, [[0, "#bfe3fb"], [1, "#eaf6ff"]]);
  ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = "#f6f3ec";
  ctx.fillRect(wx + ww / 2 - 3, wy, 6, wh);
  ctx.fillRect(wx, wy + wh / 2 - 3, ww, 6);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh);
  ctx.lineTo(wx + ww, wy + wh);
  ctx.lineTo(wx + ww * 0.55, h);
  ctx.lineTo(wx - ww * 0.45, h);
  ctx.closePath();
  ctx.fill();

  // wall frames
  ctx.fillStyle = "#2f3a4a";
  ctx.fillRect(w * 0.1, h * 0.16, w * 0.12, h * 0.2);
  ctx.fillStyle = "#e8eef5";
  ctx.fillRect(w * 0.11, h * 0.18, w * 0.1, h * 0.16);
  ctx.fillStyle = "#6c8fb8";
  ctx.fillRect(w * 0.12, h * 0.27, w * 0.08, h * 0.06);
  ctx.fillStyle = "#2f3a4a";
  ctx.fillRect(w * 0.26, h * 0.2, w * 0.07, h * 0.12);
  ctx.fillStyle = "#f3d9a4";
  ctx.fillRect(w * 0.268, h * 0.222, w * 0.054, h * 0.076);

  // desk + plant + lamp
  ctx.fillStyle = "#8b6b4a";
  ctx.fillRect(0, h * 0.82, w, h * 0.04);
  ctx.fillStyle = "#6f5238";
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
  ctx.fillStyle = "#c9764a";
  roundRect(ctx, w * 0.08, h * 0.7, w * 0.07, h * 0.12, 6);
  ctx.fill();
  ctx.fillStyle = "#4f9a5b";
  for (const [dx, dy, r] of [[0.115, 0.64, 0.045], [0.09, 0.67, 0.032], [0.14, 0.67, 0.034], [0.115, 0.6, 0.03]]) {
    ctx.beginPath();
    ctx.ellipse(w * dx, h * dy, w * r * 0.7, h * r * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#3d4655";
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(w * 0.9, h * 0.82);
  ctx.lineTo(w * 0.9, h * 0.62);
  ctx.lineTo(w * 0.86, h * 0.55);
  ctx.stroke();
  ctx.fillStyle = "#f3c969";
  ctx.beginPath();
  ctx.moveTo(w * 0.84, h * 0.58);
  ctx.lineTo(w * 0.88, h * 0.52);
  ctx.lineTo(w * 0.9, h * 0.58);
  ctx.closePath();
  ctx.fill();
};

const studio: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [[0, "#3b4a63"], [1, "#161c28"]]);
  ctx.fillRect(0, 0, w, h);
  glow(ctx, w * 0.3, h * 0.35, w * 0.55, "rgba(140,170,220,ALPHA)", 0.55);
  glow(ctx, w * 0.85, h * 0.8, w * 0.4, "rgba(110,90,200,ALPHA)", 0.3);
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.95);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
};

const bookshelf: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [[0, "#4a3a2e"], [1, "#2e241c"]]);
  ctx.fillRect(0, 0, w, h);
  const rand = rng(7);
  const palette = ["#b5533c", "#3f6b8c", "#d9a441", "#5b8c5a", "#7a4a8c", "#d8d2c4", "#2f4858", "#c97b84"];
  const rows = 4;
  const rowH = h / rows;
  for (let r = 0; r < rows; r++) {
    const top = r * rowH;
    let x = w * 0.02;
    while (x < w * 0.98) {
      const bw = w * (0.012 + rand() * 0.018);
      const bh = rowH * (0.55 + rand() * 0.35);
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      ctx.fillRect(x, top + rowH * 0.94 - bh, bw, bh);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x, top + rowH * 0.94 - bh, bw * 0.18, bh);
      x += bw + w * 0.0012;
      if (rand() < 0.07) x += w * (0.03 + rand() * 0.05); // a gap
    }
    ctx.fillStyle = "#6b5440";
    ctx.fillRect(0, top + rowH * 0.94, w, rowH * 0.06);
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
};

const sunset: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [[0, "#2b1055"], [0.45, "#b8307a"], [0.75, "#ff8a5c"], [1, "#ffd27a"]]);
  ctx.fillRect(0, 0, w, h);
  glow(ctx, w * 0.5, h * 0.66, w * 0.5, "rgba(255,220,150,ALPHA)", 0.7);
  ctx.fillStyle = "#fff0c4";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.66, h * 0.11, 0, Math.PI * 2);
  ctx.fill();
  const layers: [number, string, number][] = [
    [0.74, "#6a2b6d", 0.9],
    [0.8, "#3f1d5c", 1.4],
    [0.88, "#1d1240", 2.1],
  ];
  layers.forEach(([base, color, freq], i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += w / 60) {
      const y = h * base + Math.sin((x / w) * Math.PI * freq + i * 1.7) * h * 0.035 + Math.sin((x / w) * Math.PI * freq * 2.3 + i) * h * 0.012;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });
};

const abstract: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [[0, "#0f2027"], [0.5, "#203a43"], [1, "#2c5364"]]);
  ctx.fillRect(0, 0, w, h);
  glow(ctx, w * 0.2, h * 0.3, w * 0.45, "rgba(0,214,189,ALPHA)", 0.55);
  glow(ctx, w * 0.75, h * 0.25, w * 0.4, "rgba(150,90,255,ALPHA)", 0.5);
  glow(ctx, w * 0.6, h * 0.85, w * 0.45, "rgba(255,90,150,ALPHA)", 0.4);
  glow(ctx, w * 0.1, h * 0.9, w * 0.3, "rgba(80,160,255,ALPHA)", 0.35);
};

const city: Draw = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [[0, "#070b1f"], [0.7, "#1b2550"], [1, "#2d3a73"]]);
  ctx.fillRect(0, 0, w, h);
  const rand = rng(21);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 70; i++) ctx.fillRect(rand() * w, rand() * h * 0.5, 1.5, 1.5);
  ctx.fillStyle = "#f4f1de";
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.18, h * 0.06, 0, Math.PI * 2);
  ctx.fill();
  glow(ctx, w * 0.82, h * 0.18, h * 0.25, "rgba(244,241,222,ALPHA)", 0.25);
  for (const [shade, minH, maxH] of [["#10163a", 0.3, 0.55], ["#0a0e27", 0.2, 0.42]] as const) {
    let x = -w * 0.01;
    while (x < w) {
      const bw = w * (0.04 + rand() * 0.05);
      const bh = h * (minH + rand() * (maxH - minH));
      ctx.fillStyle = shade;
      ctx.fillRect(x, h - bh, bw, bh);
      ctx.fillStyle = "rgba(255,214,102,0.8)";
      for (let wy = h - bh + h * 0.03; wy < h - h * 0.03; wy += h * 0.045) {
        for (let wx = x + bw * 0.12; wx < x + bw * 0.85; wx += bw * 0.24) {
          if (rand() < 0.42) ctx.fillRect(wx, wy, bw * 0.12, h * 0.02);
        }
      }
      x += bw + w * 0.004;
    }
  }
};

const PRESETS: Preset[] = [
  { id: "preset-office", label: "Office", draw: office },
  { id: "preset-studio", label: "Soft studio", draw: studio },
  { id: "preset-bookshelf", label: "Bookshelf", draw: bookshelf },
  { id: "preset-sunset", label: "Sunset", draw: sunset },
  { id: "preset-abstract", label: "Aurora", draw: abstract },
  { id: "preset-city", label: "City night", draw: city },
];

export const isPresetId = (id: string) => PRESETS.some((p) => p.id === id);

/** A preset drawn at full size, ready for the pipeline. null for an unknown id (or on the server). */
export function renderPreset(id: string, width = 1280, height = 720): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  preset.draw(ctx, width, height);
  return canvas;
}

let thumbnails: BackgroundOption[] | null = null;

/** The built-in backgrounds for the picker (thumbnails are drawn once). Empty on the server. */
export function getPresetOptions(): BackgroundOption[] {
  if (typeof document === "undefined") return [];
  if (thumbnails) return thumbnails;
  thumbnails = PRESETS.map((preset) => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");
    if (ctx) preset.draw(ctx, 160, 90);
    return { id: preset.id, label: preset.label, kind: "preset" as const, thumbnail: canvas.toDataURL("image/jpeg", 0.82) };
  });
  return thumbnails;
}
