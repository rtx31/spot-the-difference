// input.js — pointer coordinates and the zoom lens.
// Hit testing always happens in scene coordinates (600x450), so clicks stay
// accurate on retina screens and at any window size.

import { SCENE_W, SCENE_H } from './render.js';

/** Convert a pointer event on a panel canvas to scene coordinates. */
export function toSceneCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * SCENE_W,
    y: ((clientY - rect.top) / rect.height) * SCENE_H,
  };
}

/**
 * Zoom lens: a circular magnifier that follows the pointer while the player
 * holds the right mouse button (or the on-screen lens button). It paints a
 * 2.5x crop of the scene's offscreen render, so hard pixel-level differences
 * can be checked up close. No layout work, just one drawImage per move.
 */
export class ZoomLens {
  constructor(lensCanvas, size = 180, zoom = 2.5) {
    this.canvas = lensCanvas;
    this.size = size;
    this.zoom = zoom;
    this.active = false;
    this.ctx = lensCanvas.getContext('2d');
    lensCanvas.width = size;
    lensCanvas.height = size;
  }

  showAt(clientX, clientY, sourceCanvas, sceneX, sceneY) {
    const { ctx, size, zoom } = this;
    // The source canvas is rendered at device-pixel scale; the crop is in
    // scene units, so scale it to source pixels before drawing.
    const scale = sourceCanvas.width / SCENE_W;
    const crop = size / zoom;
    const sx = Math.max(0, Math.min(SCENE_W - crop, sceneX - crop / 2)) * scale;
    const sy = Math.max(0, Math.min(SCENE_H - crop, sceneY - crop / 2)) * scale;
    const sw = crop * scale;
    ctx.save();
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(sourceCanvas, sx, sy, sw, sw, 0, 0, size, size);
    ctx.restore();
    ctx.strokeStyle = '#8a5a3b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(43,43,43,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 8, size / 2);
    ctx.lineTo(size / 2 + 8, size / 2);
    ctx.moveTo(size / 2, size / 2 - 8);
    ctx.lineTo(size / 2, size / 2 + 8);
    ctx.stroke();
    const lens = this.canvas;
    lens.style.display = 'block';
    // Keep the lens inside the viewport, slightly offset from the cursor.
    const left = Math.min(window.innerWidth - size - 12, Math.max(12, clientX + 24));
    const top = Math.min(window.innerHeight - size - 12, Math.max(12, clientY - size - 16));
    lens.style.left = `${left}px`;
    lens.style.top = `${top}px`;
    this.active = true;
  }

  hide() {
    if (!this.active) return;
    this.canvas.style.display = 'none';
    this.active = false;
  }
}
