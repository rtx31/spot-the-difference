// render.js — small Canvas 2D helpers shared by every scene.
// Every scene is drawn in a 600x450 logical space, so one scene description
// paints both panels and the two pictures always line up pixel-perfect.

export const SCENE_W = 600;
export const SCENE_H = 450;

/** Size a canvas backing store for the device pixel ratio (capped at 2). */
export function setupCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(SCENE_W * dpr);
  canvas.height = Math.round(SCENE_H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Rounded-rectangle path. */
export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function circ(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/** Five-pointed star path centred at (x, y) with outer radius r. */
export function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Fluffy cloud made of circles. */
export function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  circ(ctx, x, y, 16 * s);
  ctx.fill();
  circ(ctx, x + 16 * s, y - 6 * s, 20 * s);
  ctx.fill();
  circ(ctx, x + 34 * s, y, 16 * s);
  ctx.fill();
  rr(ctx, x - 14 * s, y - 2 * s, 62 * s, 18 * s, 9 * s);
  ctx.fill();
}

/** Sun with rays (rays=false draws a bare disc). */
export function sun(ctx, x, y, r, color, rays = true) {
  ctx.fillStyle = color;
  if (rays) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
      ctx.lineTo(x + Math.cos(a) * (r + 16), y + Math.sin(a) * (r + 16));
      ctx.stroke();
    }
  }
  circ(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  circ(ctx, x - r * 0.3, y - r * 0.3, r * 0.35);
  ctx.fill();
}

/** Crescent moon. */
export function moon(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  circ(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.0)';
  ctx.globalCompositeOperation = 'destination-out';
  circ(ctx, x + r * 0.45, y - r * 0.2, r * 0.85);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

/** Simple round tree: trunk + three leaf blobs. */
export function tree(ctx, x, y, s, leaf, trunk = '#8a5a3b') {
  ctx.fillStyle = trunk;
  rr(ctx, x - 5 * s, y - 34 * s, 10 * s, 36 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = leaf;
  circ(ctx, x, y - 52 * s, 22 * s);
  ctx.fill();
  circ(ctx, x - 16 * s, y - 38 * s, 16 * s);
  ctx.fill();
  circ(ctx, x + 16 * s, y - 38 * s, 16 * s);
  ctx.fill();
}

/** Palm tree leaning right. */
export function palm(ctx, x, y, s, leaf = '#4e9b5f') {
  ctx.strokeStyle = '#8a5a3b';
  ctx.lineWidth = 9 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 8 * s, y - 55 * s, x + 22 * s, y - 88 * s);
  ctx.stroke();
  ctx.fillStyle = leaf;
  const topX = x + 22 * s;
  const topY = y - 88 * s;
  for (let i = 0; i < 5; i += 1) {
    const a = Math.PI * (0.15 + i * 0.18);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * 34 * s,
      topY + Math.sin(a) * 26 * s - 14 * s,
      topX + Math.cos(a) * 44 * s,
      topY + Math.sin(a) * 30 * s + 6 * s,
    );
    ctx.quadraticCurveTo(topX + Math.cos(a) * 26 * s, topY + Math.sin(a) * 18 * s, topX, topY);
    ctx.fill();
  }
  ctx.fillStyle = '#6b4a2f';
  circ(ctx, topX - 6 * s, topY + 4 * s, 5 * s);
  ctx.fill();
  circ(ctx, topX + 6 * s, topY + 8 * s, 5 * s);
  ctx.fill();
}

/** Daisy-like flower. */
export function flower(ctx, x, y, s, petal, center = '#f6b93b') {
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i += 1) {
    const a = (i * Math.PI) / 3;
    ellipse(ctx, x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 7 * s, 7 * s);
    ctx.fill();
  }
  ctx.fillStyle = center;
  circ(ctx, x, y, 6 * s);
  ctx.fill();
}

/** Side-view fish; flip=true faces left. */
export function fish(ctx, x, y, s, body, fin = body, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = fin;
  ctx.beginPath();
  ctx.moveTo(-14 * s, 0);
  ctx.lineTo(-26 * s, -10 * s);
  ctx.lineTo(-26 * s, 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = body;
  ellipse(ctx, 0, 0, 20 * s, 12 * s);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ellipse(ctx, -2 * s, -4 * s, 12 * s, 5 * s);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, 10 * s, -2 * s, 2.5 * s);
  ctx.fill();
  ctx.restore();
}

/** Five-armed starfish. */
export function starfish(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  star(ctx, x, y, 14 * s);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 5; i += 1) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    circ(ctx, x + Math.cos(a) * 7 * s, y + Math.sin(a) * 7 * s, 1.8 * s);
    ctx.fill();
  }
}

/** Friendly ghost. */
export function ghost(ctx, x, y, s, body = '#f7f3ea') {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, y + 22 * s);
  ctx.lineTo(x - 18 * s, y - 6 * s);
  ctx.arc(x, y - 6 * s, 18 * s, Math.PI, 0);
  ctx.lineTo(x + 18 * s, y + 22 * s);
  for (let i = 0; i < 3; i += 1) {
    const bx = x + 18 * s - (i + 0.5) * 12 * s;
    ctx.quadraticCurveTo(bx + 3 * s, y + 14 * s, bx - 3 * s, y + 22 * s);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, x - 6 * s, y - 8 * s, 3 * s);
  ctx.fill();
  circ(ctx, x + 6 * s, y - 8 * s, 3 * s);
  ctx.fill();
  ellipse(ctx, x, y + 2 * s, 3.5 * s, 5 * s);
  ctx.fill();
}

/** Sitting cat, side view; tailUp lifts the tail, eyesOpen=false sleeps. */
export function cat(ctx, x, y, s, color, tailUp = true, eyesOpen = true) {
  ctx.fillStyle = color;
  // tail
  ctx.strokeStyle = color;
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 16 * s, y - 6 * s);
  if (tailUp) ctx.quadraticCurveTo(x - 30 * s, y - 8 * s, x - 28 * s, y - 26 * s);
  else ctx.quadraticCurveTo(x - 30 * s, y - 2 * s, x - 26 * s, y + 6 * s);
  ctx.stroke();
  // body
  ellipse(ctx, x, y - 8 * s, 17 * s, 14 * s);
  ctx.fill();
  // head + ears
  circ(ctx, x + 12 * s, y - 26 * s, 11 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 4 * s, y - 32 * s);
  ctx.lineTo(x + 6 * s, y - 42 * s);
  ctx.lineTo(x + 12 * s, y - 34 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14 * s, y - 34 * s);
  ctx.lineTo(x + 20 * s, y - 42 * s);
  ctx.lineTo(x + 22 * s, y - 32 * s);
  ctx.closePath();
  ctx.fill();
  // face
  ctx.fillStyle = '#2b2b2b';
  if (eyesOpen) {
    circ(ctx, x + 9 * s, y - 28 * s, 1.6 * s);
    ctx.fill();
    circ(ctx, x + 16 * s, y - 28 * s, 1.6 * s);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(x + 7 * s, y - 28 * s);
    ctx.lineTo(x + 11 * s, y - 28 * s);
    ctx.moveTo(x + 14 * s, y - 28 * s);
    ctx.lineTo(x + 18 * s, y - 28 * s);
    ctx.stroke();
  }
}

/** Simple bird perched (parrot-ish). */
export function bird(ctx, x, y, s, body, wing, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = body;
  ellipse(ctx, 0, 0, 16 * s, 12 * s);
  ctx.fill();
  circ(ctx, 12 * s, -10 * s, 8 * s);
  ctx.fill();
  ctx.fillStyle = wing;
  ellipse(ctx, -2 * s, 1 * s, 10 * s, 6 * s);
  ctx.fill();
  ctx.fillStyle = '#f6b93b';
  ctx.beginPath();
  ctx.moveTo(18 * s, -11 * s);
  ctx.lineTo(26 * s, -8 * s);
  ctx.lineTo(18 * s, -6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, 13 * s, -12 * s, 1.8 * s);
  ctx.fill();
  ctx.restore();
}

/** Butterfly with two wing colours. */
export function butterfly(ctx, x, y, s, c1, c2, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = c1;
  ellipse(ctx, -9 * s, -6 * s, 9 * s, 7 * s);
  ctx.fill();
  ellipse(ctx, -8 * s, 6 * s, 7 * s, 5 * s);
  ctx.fill();
  ctx.fillStyle = c2;
  ellipse(ctx, 9 * s, -6 * s, 9 * s, 7 * s);
  ctx.fill();
  ellipse(ctx, 8 * s, 6 * s, 7 * s, 5 * s);
  ctx.fill();
  ctx.fillStyle = '#3b2f2f';
  rr(ctx, -2 * s, -8 * s, 4 * s, 16 * s, 2 * s);
  ctx.fill();
  ctx.restore();
}

/** Heart shape. */
export function heart(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + 8 * s);
  ctx.bezierCurveTo(x - 14 * s, y - 4 * s, x - 8 * s, y - 14 * s, x, y - 6 * s);
  ctx.bezierCurveTo(x + 8 * s, y - 14 * s, x + 14 * s, y - 4 * s, x, y + 8 * s);
  ctx.fill();
}

/** Little bubble with a highlight. */
export function bubble(ctx, x, y, r) {
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  circ(ctx, x, y, r);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  circ(ctx, x - r * 0.35, y - r * 0.35, r * 0.22);
  ctx.fill();
}

/** Coffee cup with optional steam. */
export function cup(ctx, x, y, s, color, steam = true) {
  if (steam) {
    ctx.strokeStyle = 'rgba(120,110,100,0.6)';
    ctx.lineWidth = 2 * s;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + i * 7 * s, y - 14 * s);
      ctx.quadraticCurveTo(x + i * 7 * s + 4 * s, y - 20 * s, x + i * 7 * s, y - 26 * s);
      ctx.stroke();
    }
  }
  ctx.fillStyle = color;
  rr(ctx, x - 13 * s, y - 14 * s, 26 * s, 22 * s, 4 * s);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(x + 14 * s, y - 3 * s, 6 * s, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, x - 16 * s, y + 8 * s, 32 * s, 4 * s, 2 * s);
  ctx.fill();
}

/** Vertical gradient sky for a scene. */
export function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

/** Flat ground band. */
export function ground(ctx, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, SCENE_W, SCENE_H - y);
}
