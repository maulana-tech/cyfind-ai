"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * AsciiLiquidLogin
 * A split sign-in card floating over living water. The left half of the card is
 * a glass lens that re-renders the water beneath it as coloured ASCII; the right
 * half holds the form. The scene is a procedurally painted pond, or any image
 * you upload (drawn sharp with WebGL ripples and refraction).
 *
 * Little extras: press and hold anywhere on the water to charge a ripple, and a
 * successful sign-in dissolves the whole screen into drifting glyphs.
 */

/* ---- Types ---- */
export type MotionSpeed = "flow" | "calm" | "still";
export type GlyphStyle = "ascii" | "braille";
export type AuthMode = "signin" | "signup";

export interface AsciiLiquidLoginProps {
  title?: string;
  subtitle?: string | null;
  backLabel?: string;
  motionSpeed?: MotionSpeed;
  glyphStyle?: GlyphStyle;
  backgroundGlyphOpacity?: number;
  customImageSrc?: string | null;
  showImageUpload?: boolean;
  dissolveOnSuccess?: boolean;
  successTitle?: string;
  isCoverMode?: boolean;
  enterLabel?: string;
  /** Password-only mode (no email field, no sign-up toggle) — for single-secret auth. */
  passwordOnly?: boolean;
  /** Pre-fill the password field (e.g. demo credentials). */
  initialPassword?: string;
  /** Small hint shown under the password field (e.g. "Demo credentials pre-filled"). */
  demoHint?: string;
  onEnterFromCover?: () => void;
  onSubmit?: (data: { mode: AuthMode; email: string; password: string }) => unknown;
  onDissolveEnd?: () => void;
  onForgotPassword?: () => void;
  onImageChange?: (file: File | null) => void;
  onBack?: () => void;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  strength: number;
  bg: boolean;
}
interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface Art {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}
interface FxCell {
  x: number;
  y: number;
  delay: number;
  idx: number;
  color: string;
  vx: number;
  vy: number;
}
interface Fx {
  start: number;
  ox: number;
  oy: number;
  maxR: number;
  cellH: number;
  style: GlyphStyle;
  chars: string;
  cells: FxCell[];
  onDone: () => void;
}
interface Hold {
  active: boolean;
  x: number;
  y: number;
  start: number;
  lastEmit: number;
}
interface Engine {
  time: number;
  speed: number;
  glyphStyle: GlyphStyle;
  chop: number;
  glare: number;
  wakeIntensity: number;
  vw: number;
  vh: number;
  dpr: number;
  lensRect: Rect;
  ripples: Ripple[];
  lastPointer: { x: number; y: number };
  art: Art | null;
  artSource: HTMLCanvasElement | null;
  maxTexture: number;
  texDirty: boolean;
  dirty: boolean;
  hold: Hold;
  fx: Fx | null;
}
interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: ImageData | null;
}
type Field = "email" | "password";
interface Feedback {
  type: "error" | "success";
  text: string;
  field?: Field;
}
interface Rgb {
  r: number;
  g: number;
  b: number;
}
type Phase = "idle" | "dissolving" | "done";

/* ---- Painted pond palette ---- */
const SUBMERGED_BLOBS = [
  { x: 0.06, y: 0.27, rx: 0.07, ry: 0.025, angle: -0.2, r: 165, g: 38, b: 28, weight: 1.2 },
  { x: 0.08, y: 0.42, rx: 0.09, ry: 0.04, angle: -0.35, r: 18, g: 32, b: 52, weight: 1.3 },
  { x: 0.14, y: 0.4, rx: 0.08, ry: 0.035, angle: -0.3, r: 220, g: 92, b: 28, weight: 1.15 },
  { x: 0.28, y: 0.36, rx: 0.13, ry: 0.05, angle: -0.25, r: 242, g: 175, b: 52, weight: 1.1 },
  { x: 0.45, y: 0.4, rx: 0.12, ry: 0.045, angle: -0.2, r: 215, g: 168, b: 58, weight: 1.0 },
  { x: 0.26, y: 0.54, rx: 0.14, ry: 0.055, angle: -0.35, r: 235, g: 98, b: 24, weight: 1.35 },
  { x: 0.18, y: 0.57, rx: 0.09, ry: 0.045, angle: -0.4, r: 212, g: 58, b: 26, weight: 1.3 },
  { x: 0.08, y: 0.59, rx: 0.08, ry: 0.04, angle: -0.3, r: 15, g: 45, b: 92, weight: 1.3 },
  { x: 0.36, y: 0.61, rx: 0.08, ry: 0.05, angle: 0.15, r: 215, g: 64, b: 28, weight: 1.3 },
  { x: 0.47, y: 0.55, rx: 0.11, ry: 0.05, angle: -0.15, r: 230, g: 135, b: 35, weight: 1.1 },
  { x: 0.12, y: 0.72, rx: 0.07, ry: 0.06, angle: 0.1, r: 198, g: 38, b: 24, weight: 1.4 },
  { x: 0.04, y: 0.74, rx: 0.06, ry: 0.07, angle: 0.0, r: 10, g: 18, b: 28, weight: 1.5 },
  { x: 0.21, y: 0.69, rx: 0.09, ry: 0.065, angle: -0.2, r: 38, g: 102, b: 205, weight: 1.25 },
  { x: 0.3, y: 0.73, rx: 0.08, ry: 0.055, angle: 0.25, r: 238, g: 132, b: 32, weight: 1.25 },
  { x: 0.45, y: 0.72, rx: 0.11, ry: 0.07, angle: -0.1, r: 162, g: 196, b: 118, weight: 1.15 },
  { x: 0.56, y: 0.68, rx: 0.09, ry: 0.06, angle: 0.2, r: 235, g: 178, b: 50, weight: 1.2 },
  { x: 0.38, y: 0.84, rx: 0.12, ry: 0.08, angle: -0.25, r: 95, g: 135, b: 78, weight: 1.25 },
  { x: 0.42, y: 0.92, rx: 0.08, ry: 0.06, angle: 0.1, r: 58, g: 122, b: 56, weight: 1.3 },
  { x: 0.76, y: 0.66, rx: 0.09, ry: 0.055, angle: -0.1, r: 14, g: 48, b: 96, weight: 1.35 },
  { x: 0.85, y: 0.82, rx: 0.13, ry: 0.09, angle: 0.15, r: 44, g: 98, b: 52, weight: 1.35 },
  { x: 0.72, y: 0.85, rx: 0.1, ry: 0.08, angle: -0.15, r: 52, g: 108, b: 84, weight: 1.2 },
  { x: 0.26, y: 0.9, rx: 0.08, ry: 0.06, angle: -0.3, r: 238, g: 115, b: 28, weight: 1.4 },
  { x: 0.14, y: 0.92, rx: 0.1, ry: 0.07, angle: -0.35, r: 16, g: 38, b: 72, weight: 1.45 },
  { x: 0.58, y: 0.89, rx: 0.09, ry: 0.075, angle: 0.08, r: 236, g: 112, b: 24, weight: 1.45 },
  { x: 0.68, y: 0.95, rx: 0.08, ry: 0.06, angle: 0.0, r: 175, g: 38, b: 24, weight: 1.4 },
  { x: 0.8, y: 0.95, rx: 0.07, ry: 0.06, angle: -0.1, r: 12, g: 26, b: 58, weight: 1.45 },
  { x: 0.93, y: 0.94, rx: 0.08, ry: 0.06, angle: 0.2, r: 230, g: 118, b: 28, weight: 1.35 },
].map((b) => ({ ...b, cos: Math.cos(b.angle), sin: Math.sin(b.angle) }));

interface GlyphSet {
  cellSize: number;
  chars: string;
}
const GLYPHS: { [K in GlyphStyle]: GlyphSet } = {
  ascii: { cellSize: 7, chars: " .:;!)]}?$S0O8" },
  braille: { cellSize: 8, chars: " ⠁⠃⠇⠏⠟⠿⡿⣿" },
};

const SPEED_MAP: { [K in MotionSpeed]: number } = { flow: 1.0, calm: 0.35, still: 0.0 };
const MAX_RIPPLES = 16;
const RIPPLE_LIFE = 2.2;

const FX_SWEEP = 0.85;
const FX_LIFE = 0.95;
const FX_CELL = 14;

const HOLD_FULL = 1400;
const HOLD_EMIT_EVERY = 170;

const UI_FONT = "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

const INK = "#151310";
const PAPER = "#f4f0e8";

const FOCUS_ON_DARK = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";
const FOCUS_ON_LIGHT =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151310]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f0e8]";

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const lifeFade = (rp: Ripple) => Math.pow(Math.max(0, 1 - rp.age / rp.maxAge), 1.5);

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const IMG_REFRACT_BASE = 0.004;
const IMG_REFRACT_DEPTH = 0.008;
const IMG_SPEC = 0.18;

/* ---- Water field (CPU) ---- */
function evaluateWaveField(eng: Engine, u: number, v: number, t: number, waves = true, bgOnly = false) {
  if (!waves && !eng.ripples.length) return { height: 0, slopeX: 0, slopeY: 0 };
  const depthScale = 0.22 + 0.78 * Math.pow(v, 1.15);
  const invDepth = 1.0 / depthScale;

  const px = ((u - 0.5) * 9.0) / Math.sqrt(depthScale);
  const py = Math.pow(v, 0.52) * 26.0;

  const a1 = px * 1.35 + py * 1.85 - t * 2.1;
  const a2 = px * 2.4 - py * 1.45 - t * 1.65;
  const a3 = px * 3.8 + py * 2.9 - t * 2.8;

  const w1 = Math.sin(a1 + 0.7 * Math.sin(px * 0.9 - t * 0.8));
  const w2 = Math.sin(a2 + 0.55 * Math.cos(py * 1.2 + t * 0.9));
  const w3 = Math.cos(a3) * 0.45;
  const w4 = Math.sin((px - py * 0.6) * 4.5 + t * 3.1) * 0.25 * (0.4 + 0.6 * v);

  const c1 = Math.cos(a1);
  const c2 = Math.cos(a2);
  const s3 = Math.sin(a3);
  const yk = invDepth * 0.45;

  const k = waves ? 1 : 0;
  let height = (w1 + w2 * 0.75 + w3 + w4) * 0.45 * k;
  let slopeX = (1.35 * c1 + 1.8 * c2 - 1.71 * s3) * 0.35 * k;
  let slopeY = (1.85 * c1 - 1.0875 * c2 - 1.305 * s3) * yk * 0.35 * k;

  const aspect = eng.vw / Math.max(1, eng.vh);
  for (let i = 0; i < eng.ripples.length; i++) {
    const rp = eng.ripples[i];
    if (bgOnly && !rp.bg) continue;
    const dx = (u - rp.x) * aspect;
    const dy = (v - rp.y) / (0.48 + 0.52 * v);
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
    const band = dist - rp.age * 0.23;

    if (Math.abs(band) < 0.09) {
      const env = Math.exp(-band * band * 260.0) * lifeFade(rp) * rp.strength;
      const phase = band * 85.0 - rp.age * 11.0;
      const c = Math.cos(phase) * env * 3.2;
      height += Math.sin(phase) * env * 0.24;
      slopeX += (dx / dist) * c;
      slopeY += (dy / dist) * c;
    }
  }

  return { height, slopeX, slopeY };
}

function sampleWaterColor(
  eng: Engine,
  u: number,
  v: number,
  height: number,
  slopeX: number,
  slopeY: number,
  refractBoost = 1,
): Rgb {
  const chop = eng.chop;

  if (eng.art) {
    const art = eng.art;
    const refract = (IMG_REFRACT_BASE + IMG_REFRACT_DEPTH * v) * chop * refractBoost;
    const ru = clamp(u + slopeX * refract, 0, 1);
    const rv = clamp(v + slopeY * refract, 0, 1);
    const sc = Math.max(eng.vw / art.w, eng.vh / art.h);
    const ix = clamp(Math.floor((ru * eng.vw - (eng.vw - art.w * sc) * 0.5) / sc), 0, art.w - 1);
    const iy = clamp(Math.floor((rv * eng.vh - (eng.vh - art.h * sc) * 0.5) / sc), 0, art.h - 1);
    const idx = (iy * art.w + ix) * 4;

    let r = art.data[idx];
    let g = art.data[idx + 1];
    let b = art.data[idx + 2];

    const spec = clamp((height * 0.42 + slopeY * 0.36) * eng.glare * IMG_SPEC, -0.15, 0.35);
    if (spec > 0) {
      r = mix(r, 255, spec);
      g = mix(g, 248, spec);
      b = mix(b, 220, spec * 0.85);
    } else {
      r = mix(r, 8, -spec);
      g = mix(g, 20, -spec);
      b = mix(b, 36, -spec);
    }
    return { r, g, b };
  }

  const refractScale = (0.022 + 0.045 * v) * chop;
  const ru = clamp(u + slopeX * refractScale, 0.0, 1.0);
  const rv = clamp(v + slopeY * refractScale * 0.85, 0.0, 1.0);

  const vPow = Math.pow(v, 0.75);
  let skyR = mix(158, 72, vPow);
  let skyG = mix(206, 146, vPow);
  let skyB = mix(236, 204, vPow);

  const skyTilt = clamp((slopeY * 0.45 + height * 0.55) * chop, -1.0, 1.0);
  if (skyTilt > 0) {
    skyR = mix(skyR, 208, skyTilt * 0.65);
    skyG = mix(skyG, 232, skyTilt * 0.65);
    skyB = mix(skyB, 248, skyTilt * 0.65);
  } else {
    const deepT = -skyTilt * 0.7;
    skyR = mix(skyR, 28, deepT);
    skyG = mix(skyG, 88, deepT);
    skyB = mix(skyB, 142, deepT);
  }

  let subR = 28;
  let subG = 88;
  let subB = 142;
  let totalBlobWeight = 0.0;

  for (let i = 0; i < SUBMERGED_BLOBS.length; i++) {
    const b = SUBMERGED_BLOBS[i];
    const dx = ru - b.x;
    const dy = rv - b.y;
    if (Math.abs(dx) > b.rx * 2.4 || Math.abs(dy) > b.ry * 2.4) continue;

    const lx = (dx * b.cos - dy * b.sin) / b.rx;
    const ly = (dx * b.sin + dy * b.cos) / b.ry;
    const d2 = lx * lx + ly * ly;

    if (d2 < 3.2) {
      const w = Math.exp(-d2 * 1.35) * b.weight;
      const kk = clamp(w, 0, 1);
      subR = mix(subR, b.r, kk);
      subG = mix(subG, b.g, kk);
      subB = mix(subB, b.b, kk);
      totalBlobWeight += w;
    }
  }

  const depthVisibility = clamp(
    Math.pow(v, 0.85) * 0.78 + (0.25 - height * 0.38) * chop + clamp(totalBlobWeight * 0.22, 0, 0.38),
    0.06,
    0.92,
  );

  let r = mix(skyR, subR, depthVisibility);
  let g = mix(skyG, subG, depthVisibility);
  let b = mix(skyB, subB, depthVisibility);

  const slopeMag = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
  const causticRidge = clamp((slopeMag - 0.65) * 1.4 * chop, 0.0, 1.0);
  if (causticRidge > 0.05) {
    r = mix(r, 235, causticRidge * 0.42);
    g = mix(g, 168, causticRidge * 0.38);
    b = mix(b, 48, causticRidge * 0.35);
  }

  const sunCenterX = 0.64 - 0.1 * v;
  const distToSunAxis = Math.abs(u + slopeX * 0.08 * chop - sunCenterX);
  const columnWidth = 0.19 * (1.0 - 0.42 * v) + 0.05;
  const sunColumnFactor =
    Math.exp(-Math.pow(distToSunAxis / columnWidth, 2.0)) * Math.pow(1.0 - v * 0.55, 1.15);
  const facetSparkle = clamp((height * 0.65 + slopeY * 0.55 + 0.35) * chop, 0.0, 1.6);
  const sunGlint = clamp(sunColumnFactor * facetSparkle * eng.glare, 0.0, 1.35);

  if (sunGlint > 0.02) {
    const goldFactor = clamp(sunGlint * 1.1, 0.0, 1.0);
    r = mix(r, 255, goldFactor);
    g = mix(g, 212, goldFactor * 0.92);
    b = mix(b, 82, goldFactor * 0.75);

    if (sunGlint > 0.52) {
      const coreFactor = clamp((sunGlint - 0.52) * 1.9, 0.0, 1.0);
      r = mix(r, 255, coreFactor);
      g = mix(g, 250, coreFactor);
      b = mix(b, 232, coreFactor);
    }
  }

  return { r, g, b };
}

const sampleAt = (eng: Engine, u: number, v: number, waves = true, bgOnly = false, boost = 1): Rgb => {
  const w = evaluateWaveField(eng, u, v, eng.time, waves, bgOnly);
  return sampleWaterColor(eng, u, v, w.height, w.slopeX, w.slopeY, boost);
};

const PREVIEW_REFRACT_BOOST = 2.6;

/* ---- 2D renderers ---- */
function drawPainted(
  ctx: CanvasRenderingContext2D,
  surface: Surface,
  eng: Engine,
  x0: number,
  y0: number,
  w: number,
  h: number,
  scale: number,
) {
  const pw = Math.max(16, Math.ceil(w / scale));
  const ph = Math.max(16, Math.ceil(h / scale));
  const { canvas, ctx: sctx } = surface;
  if (canvas.width !== pw || canvas.height !== ph || !surface.img) {
    canvas.width = pw;
    canvas.height = ph;
    surface.img = sctx.createImageData(pw, ph);
  }
  const img = surface.img as ImageData;
  const data = img.data;
  let p = 0;
  for (let y = 0; y < ph; y++) {
    const v = clamp((y0 + (y / (ph - 1)) * h) / eng.vh, 0, 1);
    for (let x = 0; x < pw; x++) {
      const col = sampleAt(eng, clamp((x0 + (x / (pw - 1)) * w) / eng.vw, 0, 1), v);
      data[p++] = col.r;
      data[p++] = col.g;
      data[p++] = col.b;
      data[p++] = 255;
    }
  }
  sctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, w, h);
}

function drawImageSharp(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, eng: Engine) {
  const sc = Math.max(eng.vw / src.width, eng.vh / src.height);
  const dw = src.width * sc;
  const dh = src.height * sc;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, (eng.vw - dw) * 0.5, (eng.vh - dh) * 0.5, dw, dh);
}

const BRAILLE_ORDER: [number, number][] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [0, 3],
  [1, 3],
];

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  style: GlyphStyle,
  chars: string,
  idx: number,
  px: number,
  py: number,
  cellW: number,
  cellH: number,
) {
  if (style !== "braille") {
    ctx.fillText(chars[idx], px, py);
    return;
  }
  const d = Math.max(1, cellW * 0.24);
  const h = d / 2;
  for (let i = 0; i < idx && i < 8; i++) {
    const [c, row] = BRAILLE_ORDER[i];
    ctx.fillRect(px + cellW * (0.3 + 0.4 * c) - h, py + cellH * (0.14 + 0.24 * row) - h, d, d);
  }
}

function drawLensGlyphs(
  ctx: CanvasRenderingContext2D,
  eng: Engine,
  rect: Rect,
  cellH: number,
  chars: string,
  inset: number,
) {
  const { left, top, width: w, height: h } = rect;
  ctx.fillStyle = "#070f17";
  ctx.fillRect(0, 0, w, h);

  const cellW = cellH * 0.6;
  const gw = Math.max(0, w - inset * 2);
  const gh = Math.max(0, h - inset * 2);
  const cols = Math.floor(gw / cellW);
  const rows = Math.floor(gh / cellH);
  const ox = inset + (gw - cols * cellW) * 0.5;
  const oy = inset + (gh - rows * cellH) * 0.5;
  const len = chars.length;

  ctx.font = `600 ${cellH}px ${MONO_FONT}`;
  ctx.textBaseline = "top";

  for (let r = 0; r < rows; r++) {
    const py = oy + r * cellH;
    const v = clamp((top + py + cellH * 0.5) / eng.vh, 0, 1);
    for (let c = 0; c < cols; c++) {
      const px = ox + c * cellW;
      const col = sampleAt(
        eng,
        clamp((left + px + cellW * 0.5) / eng.vw, 0, 1),
        v,
        true,
        false,
        PREVIEW_REFRACT_BOOST,
      );
      const lum = Math.pow((0.299 * col.r + 0.587 * col.g + 0.114 * col.b) / 255, 0.8);
      const idx = clamp(Math.floor(lum * (len - 1) + 0.5), 1, len - 1);

      ctx.fillStyle = `rgb(${Math.min(255, col.r * 1.08 + 44) | 0},${
        Math.min(255, col.g * 1.08 + 44) | 0
      },${Math.min(255, col.b * 1.08 + 50) | 0})`;
      drawGlyph(ctx, eng.glyphStyle, chars, idx, px, py, cellW, cellH);
    }
  }
}

function drawBackgroundGlyphs(
  ctx: CanvasRenderingContext2D,
  eng: Engine,
  opacity: number,
  sample: (u: number, v: number) => Rgb,
) {
  const w = eng.vw;
  const h = eng.vh;
  ctx.clearRect(0, 0, w, h);
  if (opacity <= 0) return;
  const style = eng.glyphStyle;
  const { chars } = GLYPHS[style] || GLYPHS.ascii;
  const cellH = 13;
  const cellW = cellH * 0.6;
  const len = chars.length;
  ctx.font = `600 ${cellH}px ${MONO_FONT}`;
  ctx.textBaseline = "top";
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#eef1f4";
  for (let py = 0; py < h; py += cellH) {
    const v = clamp((py + cellH * 0.5) / h, 0, 1);
    for (let px = 0; px < w; px += cellW) {
      const col = sample(clamp((px + cellW * 0.5) / w, 0, 1), v);
      const lum = (0.299 * col.r + 0.587 * col.g + 0.114 * col.b) / 255;
      const idx = clamp(Math.floor(lum * (len - 1) + 0.5), 1, len - 1);
      drawGlyph(ctx, style, chars, idx, px, py, cellW, cellH);
    }
  }
  ctx.globalAlpha = 1;
}

/* ---- WebGL renderer for uploaded images ---- */
const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec4 uRect;
uniform vec2 uImg;
uniform float uTime;
uniform float uChop;
uniform float uGlare;
uniform float uWave;
uniform vec4 uRip[${MAX_RIPPLES}];
uniform float uRipN;

void main() {
  vec2 sv = (uRect.xy + vUv * uRect.zw) / uRes;
  float u = sv.x;
  float v = sv.y;
  float t = uTime;
  float depth = 0.22 + 0.78 * pow(v, 1.15);
  float yk = 0.45 / depth;
  float px = (u - 0.5) * 9.0 / sqrt(depth);
  float py = pow(v, 0.52) * 26.0;

  float a1 = px * 1.35 + py * 1.85 - t * 2.1;
  float a2 = px * 2.4 - py * 1.45 - t * 1.65;
  float a3 = px * 3.8 + py * 2.9 - t * 2.8;
  float w1 = sin(a1 + 0.7 * sin(px * 0.9 - t * 0.8));
  float w2 = sin(a2 + 0.55 * cos(py * 1.2 + t * 0.9));
  float w3 = cos(a3) * 0.45;
  float w4 = sin((px - py * 0.6) * 4.5 + t * 3.1) * 0.25 * (0.4 + 0.6 * v);
  float c1 = cos(a1);
  float c2 = cos(a2);
  float s3 = sin(a3);

  float h = (w1 + w2 * 0.75 + w3 + w4) * 0.45 * uWave;
  vec2 s = vec2(1.35 * c1 + 1.8 * c2 - 1.71 * s3, (1.85 * c1 - 1.0875 * c2 - 1.305 * s3) * yk) * 0.35 * uWave;

  float aspect = uRes.x / uRes.y;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (float(i) >= uRipN) break;
    vec4 rp = uRip[i];
    float dx = (u - rp.x) * aspect;
    float dy = (v - rp.y) / (0.48 + 0.52 * v);
    float d = sqrt(dx * dx + dy * dy) + 0.0001;
    float band = d - rp.z * 0.23;
    if (abs(band) < 0.09) {
      float env = exp(-band * band * 260.0) * rp.w;
      float ph = band * 85.0 - rp.z * 11.0;
      float c = cos(ph) * env * 3.2;
      h += sin(ph) * env * 0.24;
      s += vec2(dx, dy) / d * c;
    }
  }

  float refr = (${IMG_REFRACT_BASE.toFixed(4)} + ${IMG_REFRACT_DEPTH.toFixed(4)} * v) * uChop;
  vec2 q = clamp(vec2(u, v) + s * refr, 0.0, 1.0);
  float sc = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 iuv = (q * uRes - (uRes - uImg * sc) * 0.5) / (uImg * sc);
  vec3 col = texture2D(uTex, clamp(iuv, 0.0, 1.0)).rgb;

  float spec = clamp((h * 0.42 + s.y * 0.36) * uGlare * ${IMG_SPEC.toFixed(3)}, -0.15, 0.35);
  if (spec > 0.0) {
    col = mix(col, vec3(1.0, 0.973, 0.863), vec3(spec, spec, spec * 0.85));
  } else {
    col = mix(col, vec3(0.03, 0.08, 0.14), -spec);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

function createGLRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type) as WebGLShader;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return null;
  const prog = gl.createProgram() as WebGLProgram;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const loc = (n: string) => gl.getUniformLocation(prog, n);
  const U = {
    res: loc("uRes"),
    rect: loc("uRect"),
    img: loc("uImg"),
    time: loc("uTime"),
    chop: loc("uChop"),
    glare: loc("uGlare"),
    wave: loc("uWave"),
    rip: loc("uRip"),
    ripN: loc("uRipN"),
    tex: loc("uTex"),
  };

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(U.tex, 0);

  const ripData = new Float32Array(MAX_RIPPLES * 4);
  let imgW = 1;
  let imgH = 1;

  return {
    maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    upload(source: HTMLCanvasElement) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      imgW = source.width;
      imgH = source.height;
    },
    resize(w: number, h: number) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    draw(eng: Engine, rect: Rect, waves: boolean, bgOnly: boolean) {
      ripData.fill(0);
      let n = 0;
      for (let i = 0; i < eng.ripples.length && n < MAX_RIPPLES; i++) {
        const rp = eng.ripples[i];
        if (bgOnly && !rp.bg) continue;
        ripData[n * 4] = rp.x;
        ripData[n * 4 + 1] = rp.y;
        ripData[n * 4 + 2] = rp.age;
        ripData[n * 4 + 3] = rp.strength * lifeFade(rp);
        n++;
      }
      gl.uniform2f(U.res, eng.vw, eng.vh);
      gl.uniform4f(U.rect, rect.left, rect.top, rect.width, rect.height);
      gl.uniform1f(U.wave, waves ? 1 : 0);
      gl.uniform2f(U.img, imgW, imgH);
      gl.uniform1f(U.time, eng.time);
      gl.uniform1f(U.chop, eng.chop);
      gl.uniform1f(U.glare, eng.glare);
      gl.uniform4fv(U.rip, ripData);
      gl.uniform1f(U.ripN, n);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

/* ---- Small inline icons ---- */
type IconProps = { className?: string };
const Icon = ({ children, className = "h-4 w-4" }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
);
const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Icon>
);
const UploadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </Icon>
);
const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
const EyeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const EyeOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
    <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a13 13 0 0 1-1.7 2.7" />
    <path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
    <path d="m2 2 20 20" />
  </Icon>
);
const Spinner = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ---- Component ---- */
export function AsciiLiquidLogin({
  title = "Autonomous\nSecurity, Alive",
  subtitle = null,
  backLabel = "Back",
  motionSpeed = "flow",
  glyphStyle = "ascii",
  backgroundGlyphOpacity = 0.32,
  customImageSrc = null,
  showImageUpload = true,
  dissolveOnSuccess = true,
  successTitle = "You’re in.",
  isCoverMode = false,
  enterLabel = "Continue",
  passwordOnly = false,
  initialPassword = "",
  demoHint,
  onEnterFromCover,
  onSubmit,
  onDissolveEnd,
  onForgotPassword,
  onImageChange,
  onBack,
  className = "",
}: AsciiLiquidLoginProps) {
  const [imageSrc, setImageSrc] = useState(customImageSrc as string | null);
  const [imageName, setImageName] = useState(null as string | null);
  const [imageError, setImageError] = useState(null as string | null);
  const [dragging, setDragging] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null as Feedback | null);
  const [phase, setPhase] = useState("idle" as Phase);

  useEffect(() => setImageSrc(customImageSrc), [customImageSrc]);

  const containerRef = useRef(null as HTMLDivElement | null);
  const sceneRef = useRef(null as HTMLDivElement | null);
  const bgCanvasRef = useRef(null as HTMLCanvasElement | null);
  const glCanvasRef = useRef(null as HTMLCanvasElement | null);
  const fxCanvasRef = useRef(null as HTMLCanvasElement | null);
  const lensCanvasRef = useRef(null as HTMLCanvasElement | null);
  const bgGlyphCanvasRef = useRef(null as HTMLCanvasElement | null);
  const bgGlyphOpacityRef = useRef(backgroundGlyphOpacity);
  const lensContainerRef = useRef(null as HTMLDivElement | null);
  const formPanelRef = useRef(null as HTMLDivElement | null);
  const submitRef = useRef(null as HTMLButtonElement | null);
  const emailRef = useRef(null as HTMLInputElement | null);
  const passwordRef = useRef(null as HTMLInputElement | null);
  const holdRingRef = useRef(null as HTMLDivElement | null);
  const fileInputRef = useRef(null as HTMLInputElement | null);
  const dragDepth = useRef(0);

  const [initialEngine] = useState(
    (): Engine => ({
      time: 0,
      speed: SPEED_MAP[motionSpeed] ?? 1.0,
      glyphStyle,
      chop: 1.28,
      glare: 1.22,
      wakeIntensity: 0.18,
      vw: 1200,
      vh: 800,
      dpr: 1,
      lensRect: { left: 0, top: 0, width: 560, height: 620 },
      ripples: [],
      lastPointer: { x: -1, y: -1 },
      art: null,
      artSource: null,
      maxTexture: 4096,
      texDirty: false,
      dirty: true,
      hold: { active: false, x: 0, y: 0, start: 0, lastEmit: 0 },
      fx: null,
    }),
  );
  const engineRef = useRef(initialEngine);

  useEffect(() => {
    const eng = engineRef.current;
    eng.speed = prefersReducedMotion() ? 0 : (SPEED_MAP[motionSpeed] ?? 1.0);
    eng.dirty = true;
  }, [motionSpeed]);

  useEffect(() => {
    engineRef.current.glyphStyle = glyphStyle;
    engineRef.current.dirty = true;
  }, [glyphStyle]);

  useEffect(() => {
    bgGlyphOpacityRef.current = clamp(backgroundGlyphOpacity, 0, 1);
    engineRef.current.dirty = true;
  }, [backgroundGlyphOpacity]);

  useEffect(() => {
    const eng = engineRef.current;
    setImageError(null);
    if (!imageSrc) {
      eng.art = null;
      eng.artSource = null;
      eng.dirty = true;
      return undefined;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;

      const cap = Math.min(eng.maxTexture, 4096);
      const big = Math.min(1, cap / Math.max(iw, ih));
      const full = document.createElement("canvas");
      full.width = Math.max(1, Math.round(iw * big));
      full.height = Math.max(1, Math.round(ih * big));
      const fctx = full.getContext("2d") as CanvasRenderingContext2D;
      fctx.imageSmoothingQuality = "high";
      fctx.drawImage(img, 0, 0, full.width, full.height);

      const small = Math.min(1, 480 / Math.max(iw, ih));
      const sw = Math.max(1, Math.round(iw * small));
      const sh = Math.max(1, Math.round(ih * small));
      const sCanvas = document.createElement("canvas");
      sCanvas.width = sw;
      sCanvas.height = sh;
      const sctx = sCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
      sctx.drawImage(img, 0, 0, sw, sh);

      eng.art = { data: sctx.getImageData(0, 0, sw, sh).data, w: sw, h: sh };
      eng.artSource = full;
      eng.texDirty = true;
      eng.dirty = true;
    };
    img.onerror = () => {
      if (!cancelled) setImageError("That image could not be loaded.");
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  const spawnRipple = useCallback(
    (normX: number, normY: number, baseStrength = 0.32, maxAge = RIPPLE_LIFE, bg = true) => {
      const eng = engineRef.current;
      eng.ripples.push({
        x: normX,
        y: normY,
        age: 0,
        maxAge,
        strength: baseStrength * eng.wakeIntensity,
        bg,
      });
      if (eng.ripples.length > MAX_RIPPLES) eng.ripples.shift();
    },
    [],
  );

  useEffect(() => {
    const eng = engineRef.current;
    const bg = bgCanvasRef.current;
    const glCanvas = glCanvasRef.current;
    const lens = lensCanvasRef.current;
    const bgGlyphs = bgGlyphCanvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!bg || !lens || !glCanvas || !fxCanvas || !bgGlyphs) return undefined;

    const bgCtx = bg.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
    const lensCtx = lens.getContext("2d") as CanvasRenderingContext2D;
    const bgGlyphCtx = bgGlyphs.getContext("2d") as CanvasRenderingContext2D;
    const fxCtx = fxCanvas.getContext("2d") as CanvasRenderingContext2D;
    const glr = createGLRenderer(glCanvas);
    if (glr) eng.maxTexture = glr.maxTexture;

    const makeSurface = (): Surface => {
      const c = document.createElement("canvas");
      return { canvas: c, ctx: c.getContext("2d") as CanvasRenderingContext2D, img: null };
    };
    const bgSurface = makeSurface();
    const readPainted = (u: number, v: number): Rgb => {
      const img = bgSurface.img;
      if (!img) return { r: 0, g: 0, b: 0 };
      const x = Math.min(img.width - 1, Math.round(u * (img.width - 1)));
      const y = Math.min(img.height - 1, Math.round(v * (img.height - 1)));
      const i = (y * img.width + x) * 4;
      return { r: img.data[i], g: img.data[i + 1], b: img.data[i + 2] };
    };
    const readStill = (u: number, v: number): Rgb => sampleAt(eng, u, v, false, true);
    const fullRect = (): Rect => ({ left: 0, top: 0, width: eng.vw, height: eng.vh });

    const updateDimensions = () => {
      if (!containerRef.current || !lensContainerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cb = containerRef.current.getBoundingClientRect();
      const lb = lensContainerRef.current.getBoundingClientRect();

      eng.dpr = dpr;
      eng.vw = Math.max(320, cb.width);
      eng.vh = Math.max(320, cb.height);
      eng.lensRect = {
        left: lb.left - cb.left,
        top: lb.top - cb.top,
        width: Math.max(1, lb.width),
        height: Math.max(1, lb.height),
      };

      const W = Math.round(eng.vw * dpr);
      const H = Math.round(eng.vh * dpr);
      bg.width = W;
      bg.height = H;
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fxCanvas.width = W;
      fxCanvas.height = H;
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgGlyphs.width = W;
      bgGlyphs.height = H;
      bgGlyphCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (glr) glr.resize(W, H);

      const LW = Math.round(eng.lensRect.width * dpr);
      const LH = Math.round(eng.lensRect.height * dpr);
      lens.width = LW;
      lens.height = LH;
      lensCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      eng.dirty = true;
    };

    let imageMode = false;
    let frameNo = 0;
    let lastGlyphKey = "";
    const renderScene = () => {
      frameNo++;
      if (eng.texDirty && eng.artSource) {
        if (glr) glr.upload(eng.artSource);
        eng.texDirty = false;
      }
      const useGL = !!(glr && eng.art && eng.artSource);
      if (useGL !== imageMode) {
        imageMode = useGL;
        glCanvas.style.opacity = useGL ? "1" : "0";
      }
      const lr = eng.lensRect;
      const hasImage = !!eng.artSource;
      const bgRipple = eng.ripples.some((r) => r.bg);

      if (useGL && glr) glr.draw(eng, fullRect(), false, true);
      else if (hasImage && eng.artSource) drawImageSharp(bgCtx, eng.artSource, eng);
      else drawPainted(bgCtx, bgSurface, eng, 0, 0, eng.vw, eng.vh, 6);

      const key = `${eng.vw}x${eng.vh}|${eng.glyphStyle}|${bgGlyphOpacityRef.current}|${hasImage}|${eng.art ? eng.art.w : 0}`;
      const glyphsDue = hasImage
        ? key !== lastGlyphKey || bgRipple || eng.dirty
        : key !== lastGlyphKey || eng.speed === 0 || frameNo % 3 === 0 || eng.dirty;
      if (glyphsDue) {
        drawBackgroundGlyphs(bgGlyphCtx, eng, bgGlyphOpacityRef.current, hasImage ? readStill : readPainted);
        lastGlyphKey = key;
      }

      const palette = GLYPHS[eng.glyphStyle] || GLYPHS.ascii;
      const inset = lr.width < 400 ? 18 : 32;
      drawLensGlyphs(lensCtx, eng, lr, palette.cellSize * 1.5, palette.chars, inset);
    };

    const needsFrame = () => eng.speed > 0 || eng.dirty || eng.texDirty;

    const renderFx = (now: number) => {
      const fx = eng.fx;
      const scene = sceneRef.current;
      if (!fx || !scene) return;
      const t = (now - fx.start) / 1000;
      const R = fx.maxR * Math.pow(clamp(t / FX_SWEEP, 0, 1), 2);
      const edge = 70;
      const mask = `radial-gradient(circle at ${fx.ox}px ${fx.oy}px, transparent ${R}px, #000 ${R + edge}px)`;
      scene.style.webkitMaskImage = mask;
      scene.style.maskImage = mask;

      fxCtx.clearRect(0, 0, eng.vw, eng.vh);
      fxCtx.font = `600 ${fx.cellH}px ${MONO_FONT}`;
      fxCtx.textBaseline = "top";
      for (let i = 0; i < fx.cells.length; i++) {
        const c = fx.cells[i];
        const a = t - c.delay;
        if (a < 0 || a > FX_LIFE) continue;
        fxCtx.globalAlpha = 1 - a / FX_LIFE;
        fxCtx.fillStyle = c.color;
        drawGlyph(fxCtx, fx.style, fx.chars, c.idx, c.x + c.vx * a, c.y + c.vy * a - 90 * a * a, fx.cellH * 0.6, fx.cellH);
      }
      fxCtx.globalAlpha = 1;

      if (t > FX_SWEEP + FX_LIFE + 0.1) {
        fxCtx.clearRect(0, 0, eng.vw, eng.vh);
        const done = fx.onDone;
        eng.fx = null;
        done();
      }
    };

    const updateHold = (now: number) => {
      const h = eng.hold;
      const ring = holdRingRef.current;
      if (!h.active) {
        if (ring && ring.style.opacity !== "0") ring.style.opacity = "0";
        return;
      }
      const charge = clamp((now - h.start) / HOLD_FULL, 0, 1);
      if (now - h.lastEmit > HOLD_EMIT_EVERY) {
        h.lastEmit = now;
        spawnRipple(h.x / eng.vw, h.y / eng.vh, 0.5 + 1.3 * charge, 1.6);
      }
      if (ring) {
        const size = 28 + 90 * charge;
        ring.style.opacity = String(0.25 + 0.6 * charge);
        ring.style.transform = `translate(${h.x - size / 2}px, ${h.y - size / 2}px)`;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(containerRef.current as Element);
    ro.observe(lensContainerRef.current as Element);
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions, { passive: true });

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      eng.time += dt * eng.speed;

      updateHold(now);

      if (eng.ripples.length) {
        for (const rp of eng.ripples) rp.age += dt;
        eng.ripples = eng.ripples.filter((rp) => rp.age < rp.maxAge);
        eng.dirty = true;
      }

      if (needsFrame()) {
        renderScene();
        eng.dirty = false;
      }
      if (eng.fx) renderFx(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [spawnRipple]);

  const local = (e: { clientX: number; clientY: number }) => {
    const rect = (containerRef.current as HTMLDivElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (phase !== "idle") return;
    const eng = engineRef.current;
    const p = local(e);
    if (eng.hold.active) {
      eng.hold.x = p.x;
      eng.hold.y = p.y;
      return;
    }
    const nx = p.x / eng.vw;
    const ny = p.y / eng.vh;
    const dx = nx - eng.lastPointer.x;
    const dy = ny - eng.lastPointer.y;
    if (dx * dx + dy * dy > 0.0009) {
      spawnRipple(nx, ny, 0.32, RIPPLE_LIFE, false);
      eng.lastPointer = { x: nx, y: ny };
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== "idle" || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, button, a, label, [data-no-ripple]")) return;
    const eng = engineRef.current;
    const p = local(e);
    spawnRipple(p.x / eng.vw, p.y / eng.vh, 1.2);
    const now = performance.now();
    eng.hold = { active: true, x: p.x, y: p.y, start: now, lastEmit: now };
  };

  useEffect(() => {
    const release = () => {
      const eng = engineRef.current;
      const h = eng.hold;
      if (!h.active) return;
      const charge = clamp((performance.now() - h.start) / HOLD_FULL, 0, 1);
      h.active = false;
      if (charge > 0.25) spawnRipple(h.x / eng.vw, h.y / eng.vh, 2 + 3.5 * charge, 3.2);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, [spawnRipple]);

  const rippleFromLens = (strength = 1.4) => {
    const eng = engineRef.current;
    const lr = eng.lensRect;
    spawnRipple((lr.left + lr.width / 2) / eng.vw, (lr.top + lr.height / 2) / eng.vh, strength);
  };

  const startDissolve = (onDone: () => void) => {
    const eng = engineRef.current;
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) {
      onDone();
      return;
    }
    const cb = container.getBoundingClientRect();
    const rel = (el: Element | null): Rect | null => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left - cb.left, top: r.top - cb.top, width: r.width, height: r.height };
    };
    const inside = (r: Rect | null, x: number, y: number) =>
      !!r && x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height;

    const btn = rel(submitRef.current);
    const ox = btn ? btn.left + btn.width / 2 : eng.vw / 2;
    const oy = btn ? btn.top + btn.height / 2 : eng.vh / 2;
    const form = rel(formPanelRef.current);
    const maxR = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(eng.vw - ox, oy),
      Math.hypot(ox, eng.vh - oy),
      Math.hypot(eng.vw - ox, eng.vh - oy),
    );

    const cellH = FX_CELL;
    const cellW = cellH * 0.6;
    const chars = (GLYPHS[eng.glyphStyle] || GLYPHS.ascii).chars;
    const cells: FxCell[] = [];
    for (let y = 0; y < eng.vh; y += cellH) {
      for (let x = 0; x < eng.vw; x += cellW) {
        const cx = x + cellW / 2;
        const cy = y + cellH / 2;
        let color: string;
        let lum: number;
        if (inside(form, cx, cy)) {
          const k = 0.88 + Math.random() * 0.12;
          color = `rgb(${(244 * k) | 0},${(240 * k) | 0},${(232 * k) | 0})`;
          lum = 0.5 + Math.random() * 0.5;
        } else {
          const col = sampleAt(eng, cx / eng.vw, cy / eng.vh);
          lum = (0.299 * col.r + 0.587 * col.g + 0.114 * col.b) / 255;
          color = `rgb(${Math.min(255, col.r * 1.05 + 25) | 0},${Math.min(255, col.g * 1.05 + 25) | 0},${
            Math.min(255, col.b * 1.05 + 30) | 0
          })`;
        }
        const dist = Math.hypot(cx - ox, cy - oy) + 0.001;
        const idx = clamp(Math.floor(lum * (chars.length - 1) + 0.5), 1, chars.length - 1);
        const push = 24 + Math.random() * 46;
        cells.push({
          x,
          y,
          delay: FX_SWEEP * Math.sqrt(dist / maxR) + Math.random() * 0.06,
          idx,
          color,
          vx: ((cx - ox) / dist) * push + (Math.random() - 0.5) * 20,
          vy: ((cy - oy) / dist) * push * 0.6 - (20 + Math.random() * 60),
        });
      }
    }

    spawnRipple(ox / eng.vw, oy / eng.vh, 3.5, 2.6);
    eng.fx = { start: performance.now(), ox, oy, maxR: maxR + 80, cellH, style: eng.glyphStyle, chars, cells, onDone };
  };

  const resetAfterSuccess = () => {
    const scene = sceneRef.current;
    if (scene) {
      scene.style.webkitMaskImage = "";
      scene.style.maskImage = "";
    }
    setPhase("idle");
    setPassword("");
    setShowPassword(false);
    setFeedback(null);
    rippleFromLens(1.6);
  };

  const loadFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setImageName(file.name);
      if (onImageChange) onImageChange(file);
      rippleFromLens(1.8);
    };
    reader.onerror = () => setImageError("That image could not be read.");
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageSrc(null);
    setImageName(null);
    if (onImageChange) onImageChange(null);
  };

  const handleFileInput = (e: React.ChangeEvent) => {
    const input = e.target as HTMLInputElement;
    loadFile(input.files && input.files[0]);
    input.value = "";
  };

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types || []).includes("Files");
  const onDragEnter = (e: React.DragEvent) => {
    if (!showImageUpload || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (showImageUpload && hasFiles(e)) e.preventDefault();
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    if (!showImageUpload || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const switchMode = () => {
    setIsSignUp((s) => !s);
    setPassword("");
    setShowPassword(false);
    setFeedback(null);
  };

  const fail = (field: Field | undefined, text: string) => {
    setFeedback({ type: "error", field, text });
    if (field === "email") emailRef.current?.focus();
    if (field === "password") passwordRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || phase !== "idle") return;
    const cleanEmail = email.trim();
    if (!passwordOnly) {
      if (!cleanEmail) return fail("email", "Enter your email address.");
      if (!EMAIL_RE.test(cleanEmail)) return fail("email", "That email address doesn’t look right.");
    }
    if (!password) return fail("password", "Enter your password.");
    if (isSignUp && password.length < 8) return fail("password", "Use at least 8 characters.");

    setPending(true);
    setFeedback(null);
    rippleFromLens();
    try {
      if (onSubmit) {
        await onSubmit({ mode: isSignUp ? "signup" : "signin", email: cleanEmail, password });
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setPending(false);
      if (dissolveOnSuccess) {
        setPhase("dissolving");
        startDissolve(() => {
          setPhase("done");
          if (onDissolveEnd) onDissolveEnd();
        });
      } else {
        setFeedback({
          type: "success",
          text: isSignUp ? "Account created. Check your inbox to confirm." : `Signed in as ${cleanEmail}.`,
        });
      }
    } catch (err) {
      setPending(false);
      fail(undefined, (err instanceof Error && err.message) || "Something went wrong. Please try again.");
    }
  };

  const eyebrow = subtitle ?? (isSignUp ? "Sign up to" : "Login to");
  const emailInvalid = feedback?.type === "error" && feedback.field === "email";
  const passwordInvalid = feedback?.type === "error" && feedback.field === "password";
  const locked = pending || phase !== "idle";

  const inputClass =
    "h-12 w-full rounded-xl border bg-white/75 px-4 text-[14px] text-[#151310] " +
    "placeholder:text-[#8d867b] outline-none focus-visible:ring-4 transition-[border-color,background-color,box-shadow] " +
    "focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ";
  const inputState = (invalid: boolean) =>
    invalid
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-[#e2dccf] hover:border-[#d1c9ba] focus:border-[#151310]/45 focus:ring-[#151310]/[0.06]";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative isolate min-h-[100svh] w-full touch-manipulation select-none overflow-hidden bg-[#06111c] antialiased ${className}`}
      style={{ fontFamily: UI_FONT }}
    >
      <style>{`@keyframes alq-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {phase !== "idle" && (
        <div
          className="absolute inset-0 grid place-items-center px-6 text-center text-white"
          style={{ background: "radial-gradient(120% 90% at 50% 40%, #0d2033 0%, #06111c 70%)" }}
        >
          {phase === "done" && (
            <div style={{ animation: "alq-in 600ms cubic-bezier(.2,.7,.2,1) both" }} aria-live="polite">
              <p className="text-[15px] font-medium text-white/60">
                {isSignUp ? "Account created for" : "Signed in as"} {email.trim()}
              </p>
              <h2 className="mt-2 text-[40px] font-medium leading-[1.06] tracking-[-0.025em] sm:text-[48px]">
                {successTitle}
              </h2>
              <button
                type="button"
                onClick={resetAfterSuccess}
                className={`mt-8 inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-[15px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 ${FOCUS_ON_DARK}`}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to login
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={sceneRef}
        aria-hidden={phase === "done" || undefined}
        className={`absolute inset-0 ${phase === "done" ? "invisible" : ""}`}
      >
        <canvas ref={bgCanvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas
          ref={glCanvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full transition-opacity duration-500"
          style={{ opacity: 0 }}
        />
        <canvas ref={bgGlyphCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_45%,transparent_55%,rgba(3,10,18,0.45))]"
        />

        <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 pb-20 pt-8 sm:px-8 sm:pt-12">
          <section
            aria-label={isCoverMode ? "Welcome" : isSignUp ? "Create account" : "Log in"}
            className="grid w-full max-w-[1080px] overflow-hidden rounded-3xl shadow-[0_50px_120px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/40 md:min-h-[min(580px,calc(100svh-140px))] md:grid-cols-2"
          >
            <div ref={lensContainerRef} className="relative h-40 overflow-hidden bg-[#0a1520] sm:h-52 md:h-auto">
              <canvas ref={lensCanvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/10"
              />
            </div>

            <div
              ref={formPanelRef}
              data-no-ripple
              className="relative flex select-text flex-col px-7 py-7 text-[#151310] sm:px-12 sm:py-10 md:px-10 lg:px-14"
              style={{ backgroundColor: PAPER }}
            >
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className={`group -ml-1.5 inline-flex h-8 w-fit items-center gap-1.5 rounded-lg px-1.5 text-[12px] font-normal text-[#151310] transition-opacity hover:opacity-70 ${FOCUS_ON_LIGHT}`}
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  {backLabel}
                </button>
              ) : null}

              <div className="flex flex-1 flex-col justify-center pt-8">
                <p className="text-[14px] font-normal leading-tight text-[#151310]">{eyebrow}</p>
                <h1 className="mt-2 text-[30px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[34px] md:text-[30px] lg:text-[40px] xl:text-[44px]">
                  {title.split("\n").map((line, i) => (
                    <span key={i} className="block whitespace-nowrap">
                      {line}
                    </span>
                  ))}
                </h1>

                {isCoverMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      rippleFromLens(1.8);
                      if (onEnterFromCover) onEnterFromCover();
                    }}
                    className={`mt-8 h-12 w-full rounded-xl text-[14px] font-medium text-white transition-colors hover:bg-black ${FOCUS_ON_LIGHT}`}
                    style={{ backgroundColor: INK }}
                  >
                    {enterLabel}
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col">
                    {!passwordOnly && (
                      <>
                        <label className="block">
                          <span className="sr-only">Email</span>
                          <input
                            ref={emailRef}
                            type="email"
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            spellCheck={false}
                            placeholder="Enter email"
                            value={email}
                            disabled={locked}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (feedback?.field === "email" || feedback?.type === "success") setFeedback(null);
                            }}
                            aria-invalid={emailInvalid || undefined}
                            aria-describedby={emailInvalid ? "alq-email-error" : undefined}
                            className={inputClass + inputState(emailInvalid)}
                          />
                        </label>
                        {emailInvalid && (
                          <p id="alq-email-error" role="alert" className="mt-2 text-[12px] text-rose-600">
                            {feedback?.text}
                          </p>
                        )}
                      </>
                    )}

                    <label className={`${passwordOnly ? "" : "mt-3"} block`}>
                      <span className="sr-only">Password</span>
                      <span className="relative block">
                        <input
                          ref={passwordRef}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete={isSignUp ? "new-password" : "current-password"}
                          placeholder={isSignUp ? "Create a password" : "Enter password"}
                          value={password}
                          disabled={locked}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (feedback?.field === "password" || feedback?.type === "success") setFeedback(null);
                          }}
                          aria-invalid={passwordInvalid || undefined}
                          aria-describedby={passwordInvalid ? "alq-password-error" : undefined}
                          className={`${inputClass}${inputState(passwordInvalid)} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          disabled={locked}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                          className={`absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#151310]/45 transition-colors hover:bg-[#151310]/5 hover:text-[#151310] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${FOCUS_ON_LIGHT}`}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </span>
                    </label>

                    {passwordInvalid && (
                      <p id="alq-password-error" role="alert" className="mt-2 text-[12px] text-rose-600">
                        {feedback?.text}
                      </p>
                    )}

                    {demoHint && !passwordInvalid && (
                      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#151310]/55">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {demoHint}
                      </p>
                    )}

                    {!isSignUp && onForgotPassword && (
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        disabled={locked}
                        className={`mt-3 self-start rounded text-[12px] font-normal text-[#151310]/70 underline-offset-4 transition-colors hover:text-[#151310] hover:underline disabled:opacity-60 ${FOCUS_ON_LIGHT}`}
                      >
                        Forgot password?
                      </button>
                    )}

                    <button
                      ref={submitRef}
                      type="submit"
                      disabled={locked}
                      aria-busy={pending || undefined}
                      className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-medium text-white transition-[background-color,transform] hover:bg-black active:scale-[0.99] disabled:cursor-progress disabled:hover:bg-[#151310] ${FOCUS_ON_LIGHT}`}
                      style={{ backgroundColor: INK }}
                    >
                      {pending && <Spinner />}
                      {pending
                        ? isSignUp
                          ? "Creating account…"
                          : "Signing in…"
                        : isSignUp
                          ? "Create account"
                          : enterLabel}
                    </button>

                    <p
                      id="alq-feedback"
                      role={feedback?.type === "error" ? "alert" : "status"}
                      className={`text-center text-[12px] ${feedback && !feedback.field ? "mt-3" : "sr-only"} ${
                        feedback?.type === "error" ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {feedback && !feedback.field ? feedback.text : ""}
                    </p>

                    {!passwordOnly && (
                      <p className="mt-6 text-center text-[12px] font-normal text-[#151310]">
                        {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
                        <button
                          type="button"
                          onClick={switchMode}
                          disabled={locked}
                          className={`rounded font-semibold text-[#151310] underline-offset-4 hover:underline disabled:opacity-60 ${FOCUS_ON_LIGHT}`}
                        >
                          {isSignUp ? "Log in" : "Sign up"}
                        </button>
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </section>
        </main>

        {showImageUpload && (
          <div className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4 sm:bottom-6">
            {imageError && (
              <p role="alert" className="rounded-full bg-rose-500/90 px-3 py-1 text-[13px] font-medium text-white">
                {imageError}
              </p>
            )}
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#06121f]/55 p-1 text-white backdrop-blur-xl">
              {imageSrc ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Replace image"
                    className={`flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 transition-colors hover:bg-white/10 ${FOCUS_ON_DARK}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt="Current scene"
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-white/40"
                    />
                    <span className="max-w-[140px] truncate text-[13px] text-white/85">
                      {imageName || "Custom image"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    aria-label="Remove image"
                    title="Remove image"
                    className={`grid h-7 w-7 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white ${FOCUS_ON_DARK}`}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/10 ${FOCUS_ON_DARK}`}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                  Upload image
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
            </div>
          </div>
        )}

        <div
          ref={holdRingRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-30 rounded-full border border-white/80 shadow-[0_0_24px_rgba(255,255,255,0.35)]"
          style={{ opacity: 0, width: 28, height: 28, transition: "opacity 200ms" }}
        />
      </div>

      <canvas ref={fxCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 h-full w-full" />

      {dragging && (
        <div className="pointer-events-none absolute inset-3 z-50 grid place-items-center rounded-3xl border-2 border-dashed border-white/70 bg-[#06121f]/40 backdrop-blur-sm">
          <p className="rounded-full bg-white/90 px-4 py-2 text-[14px] font-medium text-[#151310]">
            Drop an image to set the scene
          </p>
        </div>
      )}
    </div>
  );
}

export default AsciiLiquidLogin;
