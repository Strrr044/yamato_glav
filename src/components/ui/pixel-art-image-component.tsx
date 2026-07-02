"use client";
import React from "react";
import { cn } from "@/lib/utils";

type PixelatedCanvasProps = {
  src: string;
  width?: number;
  height?: number;
  cellSize?: number;
  dotScale?: number;
  shape?: "circle" | "square";
  backgroundColor?: string;
  grayscale?: boolean;
  className?: string;
  responsive?: boolean;
  dropoutStrength?: number;
  interactive?: boolean;
  distortionStrength?: number;
  distortionRadius?: number;
  distortionMode?: "repel" | "attract" | "swirl";
  followSpeed?: number;
  sampleAverage?: boolean;
  tintColor?: string;
  tintStrength?: number;
  maxFps?: number;
  objectFit?: "cover" | "contain" | "fill" | "none";
  jitterStrength?: number;
  jitterSpeed?: number;
  fadeOnLeave?: boolean;
  fadeSpeed?: number;
};

type Sample = {
  x: number;
  y: number;
  cx: number; // center x of the cell
  cy: number; // center y of the cell
  r: number;
  g: number;
  b: number;
  a: number;
  drop: boolean;
  seed: number;
};

export const PixelatedCanvas: React.FC<PixelatedCanvasProps> = ({
  src,
  width = 400,
  height = 500,
  cellSize = 3,
  dotScale = 0.9,
  shape = "square",
  backgroundColor = "#000000",
  grayscale = false,
  className,
  responsive = false,
  dropoutStrength = 0.4,
  interactive = true,
  distortionStrength = 3,
  distortionRadius = 80,
  distortionMode = "swirl",
  followSpeed = 0.2,
  sampleAverage = true,
  tintColor = "#FFFFFF",
  tintStrength = 0.2,
  maxFps = 60,
  objectFit = "cover",
  jitterStrength = 4,
  jitterSpeed = 4,
  fadeOnLeave = true,
  fadeSpeed = 0.1,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const samplesRef = React.useRef<Sample[]>([]);
  const baseCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const dirtyIndexRef = React.useRef<Uint32Array | null>(null); // grid index -> sample index+1
  const gridColsRef = React.useRef(0);
  const gridRowsRef = React.useRef(0);
  const dimsRef = React.useRef<{ width: number; height: number; dot: number } | null>(null);
  const targetMouseRef = React.useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const animMouseRef = React.useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef(0);
  const runningRef = React.useRef(false);
  const pointerInsideRef = React.useRef(false);
  const activityRef = React.useRef(0);
  const activityTargetRef = React.useRef(0);
  const visibleRef = React.useRef(true);

  React.useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = src;

    const drawSample = (
      ctx: CanvasRenderingContext2D,
      s: Sample,
      drawX: number,
      drawY: number,
      dot: number,
    ) => {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(drawX, drawY, dot / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(drawX - dot / 2, drawY - dot / 2, dot, dot);
      }
    };

    // Pre-render the static "resting" state to an offscreen canvas so the
    // animation loop can just blit it and only overdraw the dots affected
    // by the pointer.
    const renderBase = () => {
      const dims = dimsRef.current;
      if (!dims) return;
      let base = baseCanvasRef.current;
      if (!base) {
        base = document.createElement("canvas");
        baseCanvasRef.current = base;
      }
      base.width = dims.width;
      base.height = dims.height;
      const bctx = base.getContext("2d");
      if (!bctx) return;
      if (backgroundColor && backgroundColor !== "transparent") {
        bctx.fillStyle = backgroundColor;
        bctx.fillRect(0, 0, dims.width, dims.height);
      } else {
        bctx.clearRect(0, 0, dims.width, dims.height);
      }
      const samples = samplesRef.current;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        if (s.drop || s.a <= 0) continue;
        drawSample(bctx, s, s.cx, s.cy, dims.dot);
      }
      bctx.globalAlpha = 1;
    };

    const compute = () => {
      if (!canvas) return;
      // Cap DPR — pixelated dots don't visually benefit from >1 and it
      // quarters GPU/CPU cost on retina.
      const dpr = 1;
      const displayWidth = width ?? img.naturalWidth;
      const displayHeight = height ?? img.naturalHeight;

      canvas.width = Math.max(1, Math.floor(displayWidth * dpr));
      canvas.height = Math.max(1, Math.floor(displayHeight * dpr));
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const offscreen = document.createElement("canvas");
      offscreen.width = Math.max(1, Math.floor(displayWidth));
      offscreen.height = Math.max(1, Math.floor(displayHeight));
      const off = offscreen.getContext("2d", { willReadFrequently: true });
      if (!off) return;

      const iw = img.naturalWidth || displayWidth;
      const ih = img.naturalHeight || displayHeight;
      let dw = displayWidth;
      let dh = displayHeight;
      let dx = 0;
      let dy = 0;
      if (objectFit === "cover") {
        const scale = Math.max(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "contain") {
        const scale = Math.min(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "fill") {
        dw = displayWidth;
        dh = displayHeight;
      } else {
        dw = iw;
        dh = ih;
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      }
      off.drawImage(img, dx, dy, dw, dh);

      let imageData: ImageData;
      try {
        imageData = off.getImageData(0, 0, offscreen.width, offscreen.height);
      } catch {
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        return;
      }

      const data = imageData.data;
      const stride = offscreen.width * 4;
      const effectiveDotSize = Math.max(1, Math.floor(cellSize * dotScale));
      dimsRef.current = { width: displayWidth, height: displayHeight, dot: effectiveDotSize };

      const luminanceAt = (px: number, py: number) => {
        const ix = px < 0 ? 0 : px >= offscreen.width ? offscreen.width - 1 : px;
        const iy = py < 0 ? 0 : py >= offscreen.height ? offscreen.height - 1 : py;
        const i = iy * stride + ix * 4;
        return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      };

      const hash2D = (ix: number, iy: number) => {
        const s = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453123;
        return s - Math.floor(s);
      };

      let tintRGB: [number, number, number] | null = null;
      if (tintColor && tintStrength > 0) {
        const parse = (c: string): [number, number, number] | null => {
          if (c.startsWith("#")) {
            const hex = c.slice(1);
            if (hex.length === 3) {
              return [
                parseInt(hex[0] + hex[0], 16),
                parseInt(hex[1] + hex[1], 16),
                parseInt(hex[2] + hex[2], 16),
              ];
            }
            return [
              parseInt(hex.slice(0, 2), 16),
              parseInt(hex.slice(2, 4), 16),
              parseInt(hex.slice(4, 6), 16),
            ];
          }
          const m = c.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
          if (m) return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
          return null;
        };
        tintRGB = parse(tintColor);
      }

      const samples: Sample[] = [];
      const cols = Math.ceil(offscreen.width / cellSize);
      const rows = Math.ceil(offscreen.height / cellSize);
      gridColsRef.current = cols;
      gridRowsRef.current = rows;
      // grid index -> sample index + 1 (0 means empty/dropped)
      const dirty = new Uint32Array(cols * rows);

      const halfCell = Math.floor(cellSize / 2);
      const tintK = tintRGB ? Math.max(0, Math.min(1, tintStrength)) : 0;

      for (let gy = 0; gy < rows; gy++) {
        const y = gy * cellSize;
        const cy = Math.min(offscreen.height - 1, y + halfCell);
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * cellSize;
          const cx = Math.min(offscreen.width - 1, x + halfCell);

          let r = 0, g = 0, b = 0, a = 0;
          if (!sampleAverage) {
            const idx = cy * stride + cx * 4;
            r = data[idx]; g = data[idx + 1]; b = data[idx + 2]; a = data[idx + 3] / 255;
          } else {
            let count = 0;
            for (let oy = -1; oy <= 1; oy++) {
              const sy = cy + oy < 0 ? 0 : cy + oy >= offscreen.height ? offscreen.height - 1 : cy + oy;
              const row = sy * stride;
              for (let ox = -1; ox <= 1; ox++) {
                const sx = cx + ox < 0 ? 0 : cx + ox >= offscreen.width ? offscreen.width - 1 : cx + ox;
                const sIdx = row + sx * 4;
                r += data[sIdx]; g += data[sIdx + 1]; b += data[sIdx + 2];
                a += data[sIdx + 3] / 255;
                count++;
              }
            }
            r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
            a = a / count;
          }

          if (grayscale) {
            const L = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
            r = L; g = L; b = L;
          } else if (tintRGB && tintK > 0) {
            r = Math.round(r * (1 - tintK) + tintRGB[0] * tintK);
            g = Math.round(g * (1 - tintK) + tintRGB[1] * tintK);
            b = Math.round(b * (1 - tintK) + tintRGB[2] * tintK);
          }

          const Lc = luminanceAt(cx, cy);
          const Lx1 = luminanceAt(cx - 1, cy);
          const Lx2 = luminanceAt(cx + 1, cy);
          const Ly1 = luminanceAt(cx, cy - 1);
          const Ly2 = luminanceAt(cx, cy + 1);
          const grad =
            Math.abs(Lx2 - Lx1) + Math.abs(Ly2 - Ly1) +
            Math.abs(Lc - (Lx1 + Lx2 + Ly1 + Ly2) / 4);
          const gradientNorm = grad > 255 ? 1 : grad / 255;
          const dropoutProb = (1 - gradientNorm) * dropoutStrength;
          const drop = hash2D(cx, cy) < dropoutProb;
          const seed = hash2D(cx, cy);

          const sampleIdx = samples.length;
          samples.push({
            x,
            y,
            cx: x + cellSize / 2,
            cy: y + cellSize / 2,
            r, g, b, a, drop, seed,
          });
          if (!drop && a > 0) {
            dirty[gy * cols + gx] = sampleIdx + 1;
          }
        }
      }

      samplesRef.current = samples;
      dirtyIndexRef.current = dirty;
      renderBase();

      // Blit static base to visible canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      const base = baseCanvasRef.current;
      if (base) ctx.drawImage(base, 0, 0);
    };

    const stopRaf = () => {
      runningRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    let onPointerEnter: (() => void) | null = null;
    let onPointerLeave: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let onVisibility: (() => void) | null = null;

    const startAnimation = () => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      if (runningRef.current) return;
      runningRef.current = true;
      lastFrameRef.current = 0;

      const animate = () => {
        if (!runningRef.current) return;
        const now = performance.now();
        const minDelta = 1000 / Math.max(1, maxFps);
        if (now - lastFrameRef.current < minDelta) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }
        lastFrameRef.current = now;
        const ctx = canvasEl.getContext("2d");
        const dims = dimsRef.current;
        const samples = samplesRef.current;
        const base = baseCanvasRef.current;
        if (!ctx || !dims || !samples || !base) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        animMouseRef.current.x += (targetMouseRef.current.x - animMouseRef.current.x) * followSpeed;
        animMouseRef.current.y += (targetMouseRef.current.y - animMouseRef.current.y) * followSpeed;

        if (fadeOnLeave) {
          activityRef.current += (activityTargetRef.current - activityRef.current) * fadeSpeed;
        } else {
          activityRef.current = pointerInsideRef.current ? 1 : 0;
        }

        const activity = activityRef.current < 0 ? 0 : activityRef.current > 1 ? 1 : activityRef.current;

        // Only redraw the region around the pointer that could actually be
        // affected. Everything else is already correctly drawn in the base
        // layer under the cursor's previous position.
        const mx = animMouseRef.current.x;
        const my = animMouseRef.current.y;

        // Effective radius where influence > 0.0005:
        //   exp(-d^2 / (2*sigma^2)) > 0.0005 -> d < sigma * sqrt(-2*ln(0.0005))
        //   ~= sigma * 3.9
        const sigma = Math.max(1, distortionRadius * 0.5);
        const effR = sigma * 3.9 + distortionStrength + jitterStrength + dims.dot;
        // Add a small margin for the last pointer position too so we clear
        // the previous frame's affected region.
        const clearR = effR + distortionRadius;

        const cols = gridColsRef.current;
        const rows = gridRowsRef.current;

        // Clear the affected region on the visible canvas and re-blit that
        // portion of the static base.
        const rx0 = Math.max(0, Math.floor(mx - clearR));
        const ry0 = Math.max(0, Math.floor(my - clearR));
        const rx1 = Math.min(dims.width, Math.ceil(mx + clearR));
        const ry1 = Math.min(dims.height, Math.ceil(my + clearR));
        const rw = rx1 - rx0;
        const rh = ry1 - ry0;
        if (rw > 0 && rh > 0) {
          ctx.clearRect(rx0, ry0, rw, rh);
          ctx.drawImage(base, rx0, ry0, rw, rh, rx0, ry0, rw, rh);
        }

        // If pointer is essentially inactive, skip per-dot pass and stop
        // the RAF loop once fade has settled.
        if (activity < 0.002 && Math.abs(activityTargetRef.current - activityRef.current) < 0.002) {
          ctx.globalAlpha = 1;
          stopRaf();
          return;
        }

        // Iterate only grid cells within the influence radius.
        const gx0 = Math.max(0, Math.floor((mx - effR) / cellSize));
        const gy0 = Math.max(0, Math.floor((my - effR) / cellSize));
        const gx1 = Math.min(cols - 1, Math.ceil((mx + effR) / cellSize));
        const gy1 = Math.min(rows - 1, Math.ceil((my + effR) / cellSize));

        const t = now * 0.001 * jitterSpeed;
        const twoSigmaSq = 2 * sigma * sigma;
        const dirty = dirtyIndexRef.current;

        if (dirty) {
          for (let gy = gy0; gy <= gy1; gy++) {
            const rowBase = gy * cols;
            for (let gx = gx0; gx <= gx1; gx++) {
              const enc = dirty[rowBase + gx];
              if (enc === 0) continue;
              const s = samples[enc - 1];
              let drawX = s.cx;
              let drawY = s.cy;
              const dx = drawX - mx;
              const dy = drawY - my;
              const dist2 = dx * dx + dy * dy;
              const falloff = Math.exp(-dist2 / twoSigmaSq);
              const influence = falloff * activity;
              if (influence <= 0.0005) continue;
              if (distortionMode === "repel") {
                const dist = Math.sqrt(dist2) + 0.0001;
                drawX += (dx / dist) * distortionStrength * influence;
                drawY += (dy / dist) * distortionStrength * influence;
              } else if (distortionMode === "attract") {
                const dist = Math.sqrt(dist2) + 0.0001;
                drawX -= (dx / dist) * distortionStrength * influence;
                drawY -= (dy / dist) * distortionStrength * influence;
              } else {
                // swirl
                const angle = distortionStrength * 0.05 * influence;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const rx = cosA * dx - sinA * dy;
                const ry = sinA * dx + cosA * dy;
                drawX = mx + rx;
                drawY = my + ry;
              }
              if (jitterStrength > 0) {
                const k = s.seed * 43758.5453;
                drawX += Math.sin(t + k) * jitterStrength * influence;
                drawY += Math.cos(t + k * 1.13) * jitterStrength * influence;
              }
              drawSample(ctx, s, drawX, drawY, dims.dot);
            }
          }
          ctx.globalAlpha = 1;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const kickAnimation = () => {
      if (!visibleRef.current) return;
      if (!runningRef.current) startAnimation();
    };

    img.onload = () => {
      if (isCancelled) return;
      compute();
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      if (!interactive) return; // static-only, base already drawn

      onPointerMove = (e: PointerEvent) => {
        const rect = canvasEl.getBoundingClientRect();
        targetMouseRef.current.x = e.clientX - rect.left;
        targetMouseRef.current.y = e.clientY - rect.top;
        pointerInsideRef.current = true;
        activityTargetRef.current = 1;
        kickAnimation();
      };
      onPointerEnter = () => {
        pointerInsideRef.current = true;
        activityTargetRef.current = 1;
        kickAnimation();
      };
      onPointerLeave = () => {
        pointerInsideRef.current = false;
        if (fadeOnLeave) {
          activityTargetRef.current = 0;
          kickAnimation(); // keep animating until fade completes
        } else {
          targetMouseRef.current.x = -9999;
          targetMouseRef.current.y = -9999;
        }
      };
      canvasEl.addEventListener("pointermove", onPointerMove);
      canvasEl.addEventListener("pointerenter", onPointerEnter);
      canvasEl.addEventListener("pointerleave", onPointerLeave);

      // Pause work when offscreen or tab hidden.
      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              visibleRef.current = e.isIntersecting;
              if (!e.isIntersecting) stopRaf();
              else if (pointerInsideRef.current || activityRef.current > 0.002) kickAnimation();
            }
          },
          { threshold: 0 },
        );
        observer.observe(canvasEl);
      }
      onVisibility = () => {
        if (document.hidden) stopRaf();
        else if (visibleRef.current && (pointerInsideRef.current || activityRef.current > 0.002)) kickAnimation();
      };
      document.addEventListener("visibilitychange", onVisibility);
    };

    img.onerror = () => {
      console.error("Failed to load image for PixelatedCanvas:", src);
    };

    let onResize: (() => void) | null = null;
    if (responsive) {
      onResize = () => {
        if (img.complete && img.naturalWidth) {
          compute();
          if (interactive) kickAnimation();
        }
      };
      window.addEventListener("resize", onResize);
    }

    return () => {
      isCancelled = true;
      stopRaf();
      const canvasEl = canvasRef.current;
      if (canvasEl) {
        if (onPointerMove) canvasEl.removeEventListener("pointermove", onPointerMove);
        if (onPointerEnter) canvasEl.removeEventListener("pointerenter", onPointerEnter);
        if (onPointerLeave) canvasEl.removeEventListener("pointerleave", onPointerLeave);
      }
      if (onResize) window.removeEventListener("resize", onResize);
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      if (observer) observer.disconnect();
      baseCanvasRef.current = null;
      samplesRef.current = [];
      dirtyIndexRef.current = null;
    };
  }, [
    src, width, height, cellSize, dotScale, shape, backgroundColor, grayscale,
    responsive, dropoutStrength, interactive, distortionStrength, distortionRadius,
    distortionMode, followSpeed, sampleAverage, tintColor, tintStrength, maxFps,
    objectFit, jitterStrength, jitterSpeed, fadeOnLeave, fadeSpeed,
  ]);

  return <canvas ref={canvasRef} className={cn(className)} />;
};
