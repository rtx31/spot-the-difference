// scenes.js — the 12 scenes of Cozy Hunt.
// Each scene draws ONE picture from code (Canvas 2D shapes). The variant is the
// same drawing with a few `mods` applied, so the two panels always line up
// pixel-perfect and every difference is findable by construction.
// A slot is one thing that can change: { id, x, y, r, tier, kind, label, alt }.
// The engine picks slots and sets mods[slot.id] = slot.alt; the draw function
// branches on that value. `zones` (optional) lists extra hit areas, e.g. the
// old position of a moved object.

import {
  SCENE_W, SCENE_H, rr, circ, ellipse, star, cloud, sun, moon, tree, palm,
  flower, fish, starfish, ghost, cat, bird, butterfly, heart, bubble, cup,
  sky, ground,
} from './render.js';

/* ---------- small composite drawings used by several scenes ---------- */

function drawBoat(ctx, x, y, sail = '#f97316') {
  ctx.fillStyle = '#8a5a3b';
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x + 26, y);
  ctx.lineTo(x + 16, y + 14);
  ctx.lineTo(x - 16, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 34);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(x, y - 34);
  ctx.lineTo(x, y - 4);
  ctx.lineTo(x + 20, y - 4);
  ctx.closePath();
  ctx.fill();
}

function drawUmbrella(ctx, x, y, canopy) {
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 42);
  ctx.lineTo(x, y - 26);
  ctx.stroke();
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.moveTo(x - 46, y - 14);
  ctx.quadraticCurveTo(x, y - 52, x + 46, y - 14);
  ctx.quadraticCurveTo(x + 23, y - 24, x, y - 14);
  ctx.quadraticCurveTo(x - 23, y - 24, x - 46, y - 14);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(x - 23, y - 18);
  ctx.quadraticCurveTo(x, y - 40, x + 23, y - 18);
  ctx.quadraticCurveTo(x + 12, y - 24, x, y - 18);
  ctx.quadraticCurveTo(x - 12, y - 24, x - 23, y - 18);
  ctx.fill();
}

function drawCastle(ctx, x, y, mods) {
  ctx.fillStyle = '#f2c98a';
  rr(ctx, x - 34, y - 44, 68, 46, 6);
  ctx.fill();
  rr(ctx, x - 48, y - 26, 22, 28, 5);
  ctx.fill();
  rr(ctx, x + 26, y - 26, 22, 28, 5);
  ctx.fill();
  ctx.fillStyle = '#e8b06a';
  rr(ctx, x - 34, y - 52, 68, 12, 5);
  ctx.fill();
  // flag pole + flag
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 52);
  ctx.lineTo(x, y - 78);
  ctx.stroke();
  ctx.fillStyle = mods.flag === 'blue' ? '#3b82f6' : '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x, y - 78);
  ctx.lineTo(x + 20, y - 72);
  ctx.lineTo(x, y - 66);
  ctx.closePath();
  ctx.fill();
  // door + windows
  ctx.fillStyle = '#8a5a3b';
  rr(ctx, x - 9, y - 18, 18, 20, 8);
  ctx.fill();
  ctx.fillStyle = '#7a4a2f';
  circ(ctx, x - 22, y - 34, 4);
  ctx.fill();
  circ(ctx, x + 22, y - 34, 4);
  ctx.fill();
  // bucket
  if (mods.bucket !== 'gone') {
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x + 40, y - 6);
    ctx.lineTo(x + 56, y - 6);
    ctx.lineTo(x + 53, y + 8);
    ctx.lineTo(x + 43, y + 8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCrab(ctx, x, y) {
  ctx.fillStyle = '#ef6a4a';
  ellipse(ctx, x, y, 20, 14);
  ctx.fill();
  ctx.fillStyle = '#ef6a4a';
  circ(ctx, x - 16, y - 10, 7);
  ctx.fill();
  circ(ctx, x + 16, y - 10, 7);
  ctx.fill();
  ctx.strokeStyle = '#ef6a4a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 14);
  ctx.lineTo(x - 8, y - 24);
  ctx.moveTo(x + 8, y - 14);
  ctx.lineTo(x + 8, y - 24);
  ctx.stroke();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, x - 8, y - 25, 2.5);
  ctx.fill();
  circ(ctx, x + 8, y - 25, 2.5);
  ctx.fill();
  ctx.strokeStyle = '#d14a2f';
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 8);
  ctx.lineTo(x - 28, y + 14);
  ctx.moveTo(x + 18, y + 8);
  ctx.lineTo(x + 28, y + 14);
  ctx.stroke();
}

function drawBall(ctx, x, y, swapped) {
  const c1 = swapped ? '#f472b6' : '#f97316';
  const c2 = swapped ? '#f97316' : '#f472b6';
  ctx.fillStyle = '#ffffff';
  circ(ctx, x, y, 20);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 14, y + 14);
  ctx.lineTo(x - 14, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x - 14, y + 14);
  ctx.lineTo(x - 20, y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#d9a05b';
  ctx.lineWidth = 2;
  circ(ctx, x, y, 20);
  ctx.stroke();
}

function drawAstronaut(ctx, x, y, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = '#f7f3ea';
  rr(ctx, -16, -18, 32, 40, 12);
  ctx.fill();
  ctx.fillStyle = '#d9d2c2';
  rr(ctx, -16, 2, 32, 8, 4);
  ctx.fill();
  circ(ctx, 0, -30, 17);
  ctx.fill();
  ctx.fillStyle = '#9fd8ef';
  circ(ctx, 2, -30, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circ(ctx, -2, -34, 4);
  ctx.fill();
  ctx.fillStyle = '#f97316';
  rr(ctx, -6, -8, 12, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#f7f3ea';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.lineTo(-26, 6);
  ctx.moveTo(14, -10);
  ctx.lineTo(26, -2);
  ctx.moveTo(-10, 20);
  ctx.lineTo(-14, 32);
  ctx.moveTo(10, 20);
  ctx.lineTo(14, 32);
  ctx.stroke();
  ctx.restore();
}

function drawRobot(ctx, x, y, antenna, eyeColor) {
  ctx.fillStyle = '#9aa7c7';
  rr(ctx, x - 18, y - 16, 36, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#7a8ab0';
  rr(ctx, x - 14, y - 40, 28, 26, 8);
  ctx.fill();
  if (antenna !== 'gone') {
    ctx.strokeStyle = '#7a8ab0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x, y - 52);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    circ(ctx, x, y - 55, 5);
    ctx.fill();
  }
  ctx.fillStyle = eyeColor;
  circ(ctx, x - 6, y - 30, 3.5);
  ctx.fill();
  circ(ctx, x + 6, y - 30, 3.5);
  ctx.fill();
  ctx.fillStyle = '#f6b93b';
  rr(ctx, x - 8, y - 6, 16, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#9aa7c7';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 8);
  ctx.lineTo(x - 30, y + 4);
  ctx.moveTo(x + 18, y - 8);
  ctx.lineTo(x + 30, y + 4);
  ctx.stroke();
  ctx.fillStyle = '#7a8ab0';
  rr(ctx, x - 12, y + 18, 10, 12, 3);
  ctx.fill();
  rr(ctx, x + 2, y + 18, 10, 12, 3);
  ctx.fill();
}

function drawBat(ctx, x, y, s) {
  ctx.fillStyle = '#3a2f4a';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y);
  ctx.quadraticCurveTo(x - 10 * s, y - 12 * s, x, y - 4 * s);
  ctx.quadraticCurveTo(x + 10 * s, y - 12 * s, x + 20 * s, y);
  ctx.quadraticCurveTo(x + 10 * s, y + 6 * s, x, y + 2 * s);
  ctx.quadraticCurveTo(x - 10 * s, y + 6 * s, x - 20 * s, y);
  ctx.fill();
  circ(ctx, x, y - 2 * s, 5 * s);
  ctx.fill();
  ctx.fillStyle = '#f5eeda';
  circ(ctx, x - 2 * s, y - 3 * s, 1.2 * s);
  ctx.fill();
  circ(ctx, x + 2 * s, y - 3 * s, 1.2 * s);
  ctx.fill();
}

function drawPumpkin(ctx, x, y, r, face) {
  ctx.fillStyle = '#f97316';
  circ(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = '#ea7a1e';
  ellipse(ctx, x - r * 0.45, y, r * 0.28, r * 0.8);
  ctx.fill();
  ellipse(ctx, x + r * 0.45, y, r * 0.28, r * 0.8);
  ctx.fill();
  ctx.fillStyle = '#4e9b5f';
  rr(ctx, x - 3, y - r - 6, 6, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8);
  ctx.lineTo(x - 6, y - 2);
  ctx.lineTo(x - 12, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 8);
  ctx.lineTo(x + 6, y - 2);
  ctx.lineTo(x + 12, y + 2);
  ctx.closePath();
  ctx.fill();
  if (face === 'round') {
    ellipse(ctx, x, y + 10, 8, 6);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 8);
    ctx.lineTo(x - 4, y + 14);
    ctx.lineTo(x + 4, y + 8);
    ctx.lineTo(x + 12, y + 14);
    ctx.lineTo(x + 12, y + 8);
    ctx.lineTo(x - 12, y + 8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLantern(ctx, x, y, color, mark) {
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 42);
  ctx.lineTo(x, y - 30);
  ctx.stroke();
  ctx.fillStyle = color;
  ellipse(ctx, x, y, 24, 30);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y + i * 10, 22 - Math.abs(i) * 4, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b2b2b';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mark, x, y);
}

function drawChef(ctx, x, y, hatShort, apron) {
  ctx.fillStyle = '#f7f3ea';
  rr(ctx, x - 26, y - 10, 52, 66, 10);
  ctx.fill();
  ctx.fillStyle = apron;
  rr(ctx, x - 20, y + 12, 40, 42, 8);
  ctx.fill();
  circ(ctx, x, y - 26, 18);
  ctx.fillStyle = '#f7c9a0';
  circ(ctx, x, y - 26, 18);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, x - 6, y - 28, 2);
  ctx.fill();
  circ(ctx, x + 6, y - 28, 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 22, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  const hatH = hatShort ? 16 : 30;
  rr(ctx, x - 20, y - 62 - (hatShort ? 0 : 0), 40, hatH + 12, 10);
  ctx.fill();
  ctx.fillStyle = '#f7f3ea';
  rr(ctx, x - 22, y - 50, 44, 10, 5);
  ctx.fill();
}

function drawMonkey(ctx, x, y, banana, tailStraight) {
  ctx.fillStyle = '#8a5a3b';
  ellipse(ctx, x, y, 22, 18);
  ctx.fill();
  circ(ctx, x + 2, y - 22, 16);
  ctx.fill();
  ctx.fillStyle = '#d9a05b';
  ellipse(ctx, x + 4, y - 18, 11, 9);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circ(ctx, x - 2, y - 26, 2);
  ctx.fill();
  circ(ctx, x + 10, y - 26, 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a3b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 4);
  if (tailStraight) ctx.lineTo(x - 34, y + 22);
  else ctx.quadraticCurveTo(x - 36, y - 6, x - 26, y - 20);
  ctx.stroke();
  if (banana !== 'gone') {
    ctx.strokeStyle = '#f6b93b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 2);
    ctx.quadraticCurveTo(x + 30, y + 8, x + 26, y + 20);
    ctx.stroke();
  }
}

/* ============================ THE 12 SCENES ============================ */

export const SCENES = [
  {
    id: 'beach',
    name: 'Beach Day',
    tag: 'Sun, sea and a sneaky crab',
    draw(ctx, mods) {
      sky(ctx, '#aee3f5', '#e8f7fd');
      ctx.fillStyle = '#5fb8e6';
      ctx.fillRect(0, 238, SCENE_W, 62);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (const wx of [40, 160, 280, 400, 520]) {
        ctx.beginPath();
        ctx.arc(wx, 252, 24, Math.PI, 0);
        ctx.fill();
      }
      ground(ctx, 300, '#f6d9a0');
      sun(ctx, 88, 74, 26, '#fbbf24', mods.sunrays !== 'gone');
      if (mods.cloud1 !== 'gone') cloud(ctx, 210, 58, 1, '#ffffff');
      cloud(ctx, 420, 48, 0.8, '#ffffff');
      const boatX = mods.boatmove === 'moved' ? 480 : 390;
      drawBoat(ctx, boatX, 238);
      drawUmbrella(ctx, 140, 300, mods.umbrellacolor === 'pink' ? '#f472b6' : '#f97316');
      drawCastle(ctx, 300, 332, mods);
      if (mods.crabgone !== 'gone') drawCrab(ctx, 480, 362);
      drawBall(ctx, 220, 382, mods.ballstripes === 'swapped');
      starfish(ctx, 520, 322, 1, '#f97316');
      if (mods.starfishextra === 'extra') starfish(ctx, 84, 392, 0.9, '#f97316');
      palm(ctx, 540, 302, 1);
      ctx.fillStyle = '#6b4a2f';
      circ(ctx, 556, 214, 5);
      ctx.fill();
      circ(ctx, 566, 220, 5);
      ctx.fill();
      if (mods.coconut === 'extra') {
        circ(ctx, 548, 222, 5);
        ctx.fill();
      }
    },
    slots: [
      { id: 'sunrays', x: 88, y: 74, r: 34, tier: 'easy', kind: 'remove', label: 'sun rays', alt: 'gone' },
      { id: 'cloud1', x: 230, y: 58, r: 26, tier: 'easy', kind: 'remove', label: 'cloud', alt: 'gone' },
      { id: 'umbrellacolor', x: 140, y: 286, r: 28, tier: 'easy', kind: 'color', label: 'umbrella color', alt: 'pink' },
      { id: 'crabgone', x: 480, y: 362, r: 24, tier: 'easy', kind: 'remove', label: 'crab', alt: 'gone' },
      { id: 'boatmove', x: 480, y: 246, r: 30, tier: 'medium', kind: 'move', label: 'boat moved', alt: 'moved', zones: [{ x: 480, y: 246, r: 30 }, { x: 390, y: 246, r: 30 }] },
      { id: 'ballstripes', x: 220, y: 382, r: 22, tier: 'medium', kind: 'color', label: 'beach ball stripes', alt: 'swapped' },
      { id: 'bucket', x: 348, y: 336, r: 14, tier: 'medium', kind: 'remove', label: 'castle bucket', alt: 'gone' },
      { id: 'flag', x: 308, y: 262, r: 12, tier: 'hard', kind: 'color', label: 'castle flag', alt: 'blue' },
      { id: 'starfishextra', x: 84, y: 392, r: 16, tier: 'hard', kind: 'add', label: 'extra starfish', alt: 'extra' },
      { id: 'coconut', x: 548, y: 222, r: 12, tier: 'hard', kind: 'add', label: 'extra coconut', alt: 'extra' },
    ],
  },
  {
    id: 'space',
    name: 'Space Station',
    tag: 'Earth out the window, robot on duty',
    draw(ctx, mods) {
      sky(ctx, '#232a4a', '#3a4a7a');
      ctx.fillStyle = '#4a5a80';
      ctx.fillRect(0, 340, SCENE_W, 110);
      ctx.fillStyle = '#5a6b8f';
      ctx.fillRect(0, 340, SCENE_W, 6);
      // stars
      ctx.fillStyle = '#ffffff';
      for (const [sx, sy, sr] of [[80, 60, 2], [160, 90, 2.5], [540, 140, 2], [60, 180, 2], [520, 220, 2.5], [240, 50, 2]]) {
        circ(ctx, sx, sy, sr);
        ctx.fill();
      }
      if (mods.star1 !== 'gone') {
        circ(ctx, 480, 70, 2.5);
        ctx.fill();
      }
      // round window with Earth
      ctx.fillStyle = '#9aa7c7';
      circ(ctx, 300, 150, 92);
      ctx.fill();
      ctx.fillStyle = '#10182e';
      circ(ctx, 300, 150, 82);
      ctx.fill();
      const er = mods.earthsize === 'small' ? 30 : 46;
      ctx.fillStyle = '#3b82f6';
      circ(ctx, 300, 150, er);
      ctx.fill();
      ctx.fillStyle = '#4e9b5f';
      ellipse(ctx, 288, 138, 14, 8);
      ctx.fill();
      ellipse(ctx, 312, 162, 12, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ellipse(ctx, 300, 128, 16, 5);
      ctx.fill();
      if (mods.saturn !== 'gone') {
        ctx.fillStyle = '#e8b06a';
        circ(ctx, 360, 108, 10);
        ctx.fill();
        ctx.strokeStyle = '#f6d9a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(360, 108, 18, 5, -0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      // flag on the wall
      ctx.fillStyle = mods.flagcolor === 'yellow' ? '#f6b93b' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(90, 160);
      ctx.lineTo(114, 166);
      ctx.lineTo(90, 172);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9aa7c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(90, 156);
      ctx.lineTo(90, 196);
      ctx.stroke();
      drawAstronaut(ctx, 150, 280, mods.astroflip === 'flipped');
      drawRobot(ctx, 450, 290, mods.antenna, mods.roboteye === 'green' ? '#4ade80' : '#3b82f6');
      // control panel
      ctx.fillStyle = '#2c3550';
      rr(ctx, 240, 372, 120, 34, 8);
      ctx.fill();
      const btnColors = ['#4ade80', '#f6b93b', '#ef4444', '#3b82f6'];
      if (mods.button === 'red') btnColors[2] = '#f6b93b';
      btnColors.forEach((c, i) => {
        ctx.fillStyle = c;
        circ(ctx, 258 + i * 28, 389, 8);
        ctx.fill();
      });
      // plant
      ctx.fillStyle = '#c96a3b';
      ctx.beginPath();
      ctx.moveTo(508, 386);
      ctx.lineTo(532, 386);
      ctx.lineTo(528, 406);
      ctx.lineTo(512, 406);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4e9b5f';
      ellipse(ctx, 514, 378, 6, 12);
      ctx.fill();
      ellipse(ctx, 526, 378, 6, 12);
      ctx.fill();
      if (mods.plantleaf === 'extra') {
        ellipse(ctx, 520, 368, 6, 12);
        ctx.fill();
      }
    },
    slots: [
      { id: 'earthsize', x: 300, y: 150, r: 40, tier: 'medium', kind: 'size', label: 'Earth smaller', alt: 'small' },
      { id: 'star1', x: 480, y: 70, r: 12, tier: 'hard', kind: 'remove', label: 'missing star', alt: 'gone' },
      { id: 'astroflip', x: 150, y: 280, r: 30, tier: 'medium', kind: 'flip', label: 'astronaut flipped', alt: 'flipped' },
      { id: 'antenna', x: 450, y: 238, r: 12, tier: 'easy', kind: 'remove', label: 'robot antenna', alt: 'gone' },
      { id: 'roboteye', x: 450, y: 262, r: 12, tier: 'medium', kind: 'color', label: 'robot eyes', alt: 'green' },
      { id: 'button', x: 314, y: 389, r: 12, tier: 'medium', kind: 'color', label: 'panel button', alt: 'red' },
      { id: 'flagcolor', x: 100, y: 166, r: 16, tier: 'easy', kind: 'color', label: 'wall flag', alt: 'yellow' },
      { id: 'plantleaf', x: 520, y: 368, r: 14, tier: 'hard', kind: 'add', label: 'extra leaf', alt: 'extra' },
      { id: 'saturn', x: 360, y: 108, r: 16, tier: 'easy', kind: 'remove', label: 'Saturn in window', alt: 'gone' },
    ],
  },
  {
    id: 'haunted',
    name: 'Haunted House',
    tag: 'A friendly ghost and one grumpy pumpkin',
    draw(ctx, mods) {
      sky(ctx, '#2c2140', '#4a3560');
      ground(ctx, 330, '#3a2f4a');
      moon(ctx, 480, 80, 26, '#f5eeda');
      if (mods.mooncrater === 'dot') {
        ctx.fillStyle = '#d9cba8';
        circ(ctx, 490, 72, 4);
        ctx.fill();
      }
      ctx.fillStyle = '#d9cba8';
      circ(ctx, 472, 88, 3);
      ctx.fill();
      // house
      ctx.fillStyle = '#5b3a5e';
      ctx.fillRect(220, 180, 160, 150);
      ctx.fillStyle = '#3a2440';
      ctx.beginPath();
      ctx.moveTo(205, 182);
      ctx.lineTo(300, 120);
      ctx.lineTo(395, 182);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = mods.window === 'dark' ? '#2c2140' : '#ffd97a';
      ctx.fillRect(240, 210, 30, 30);
      ctx.fillStyle = '#ffd97a';
      ctx.fillRect(330, 210, 30, 30);
      ctx.fillStyle = mods.door === 'blue' ? '#3b82f6' : '#7a4a3a';
      rr(ctx, 285, 280, 30, 50, 12);
      ctx.fill();
      ctx.fillStyle = '#f6b93b';
      circ(ctx, 308, 306, 3);
      ctx.fill();
      // ghost
      if (mods.ghostgone !== 'gone') ghost(ctx, 140, 180, 1);
      drawPumpkin(ctx, 420, 360, 26, mods.pumpkinface === 'round' ? 'round' : 'jagged');
      drawBat(ctx, 200, 90, 1);
      if (mods.bat !== 'gone') drawBat(ctx, 260, 70, 0.9);
      drawBat(ctx, 320, 95, 1);
      // candle
      ctx.fillStyle = '#f7f3ea';
      rr(ctx, 84, 348, 12, 26, 3);
      ctx.fill();
      ctx.fillStyle = '#f6b93b';
      if (mods.flame === 'big') {
        ctx.beginPath();
        ctx.moveTo(90, 328);
        ctx.quadraticCurveTo(98, 340, 90, 348);
        ctx.quadraticCurveTo(82, 340, 90, 328);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(90, 336);
        ctx.quadraticCurveTo(95, 342, 90, 348);
        ctx.quadraticCurveTo(85, 342, 90, 336);
        ctx.fill();
      }
      // spider web, top-right corner
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(600, 20 + i * 12);
        ctx.lineTo(540 - i * 8, 0);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(600, 0, 34, Math.PI / 2, Math.PI);
      ctx.stroke();
      if (mods.web === 'extra') {
        ctx.beginPath();
        ctx.arc(600, 0, 52, Math.PI / 2, Math.PI);
        ctx.stroke();
      }
      // fence
      ctx.fillStyle = '#2c2140';
      for (let i = 0; i < 12; i += 1) {
        const fx = 60 + i * 42;
        if (mods.picket === 'gone' && i === 3) continue;
        ctx.fillRect(fx, 344, 8, 26);
        ctx.beginPath();
        ctx.moveTo(fx, 344);
        ctx.lineTo(fx + 4, 336);
        ctx.lineTo(fx + 8, 344);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillRect(56, 356, 500, 4);
    },
    slots: [
      { id: 'window', x: 255, y: 225, r: 16, tier: 'medium', kind: 'color', label: 'dark window', alt: 'dark' },
      { id: 'door', x: 300, y: 305, r: 18, tier: 'easy', kind: 'color', label: 'blue door', alt: 'blue' },
      { id: 'mooncrater', x: 490, y: 72, r: 10, tier: 'hard', kind: 'add', label: 'moon crater', alt: 'dot' },
      { id: 'ghostgone', x: 140, y: 180, r: 26, tier: 'easy', kind: 'remove', label: 'ghost', alt: 'gone' },
      { id: 'pumpkinface', x: 420, y: 360, r: 26, tier: 'medium', kind: 'pattern', label: 'pumpkin mouth', alt: 'round' },
      { id: 'bat', x: 260, y: 70, r: 18, tier: 'easy', kind: 'remove', label: 'bat', alt: 'gone' },
      { id: 'flame', x: 90, y: 338, r: 12, tier: 'medium', kind: 'size', label: 'candle flame', alt: 'big' },
      { id: 'web', x: 566, y: 34, r: 20, tier: 'hard', kind: 'add', label: 'web strand', alt: 'extra' },
      { id: 'picket', x: 190, y: 352, r: 10, tier: 'hard', kind: 'remove', label: 'fence picket', alt: 'gone' },
    ],
  },
  {
    id: 'sushi',
    name: 'Sushi Bar',
    tag: 'Fresh fish, warm lanterns, one sleepy cat',
    draw(ctx, mods) {
      sky(ctx, '#f3d9b8', '#eecfa8');
      ctx.fillStyle = '#d9a06b';
      ctx.fillRect(0, 340, SCENE_W, 110);
      ctx.fillStyle = '#b07a4a';
      ctx.fillRect(0, 300, SCENE_W, 44);
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(0, 300, SCENE_W, 5);
      drawLantern(ctx, 120, 90, mods.lanterncolor === 'yellow' ? '#f6b93b' : '#ef4444', mods.lanterntext === 'two' ? '二' : '一');
      // menu board
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 430, 84, 110, 76, 8);
      ctx.fill();
      ctx.fillStyle = '#f7f3ea';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('SUSHI  5', 442, 108);
      ctx.fillText('RAMEN  7', 442, 130);
      ctx.fillText('TEA   3', 442, 150);
      if (mods.price === 'eight') {
        ctx.fillStyle = '#3b2f2f';
        ctx.fillRect(500, 100, 12, 16);
        ctx.fillStyle = '#f7f3ea';
        ctx.fillText('8', 502, 108);
      }
      drawChef(ctx, 300, 220, mods.hat === 'short', mods.apron === 'blue' ? '#3b82f6' : '#4e9b5f');
      // plates
      for (const px of [140, 260]) {
        ctx.fillStyle = '#f7f3ea';
        ellipse(ctx, px, 320, 26, 9);
        ctx.fill();
        ctx.fillStyle = '#e8b06a';
        circ(ctx, px, 318, 6);
        ctx.fill();
      }
      if (mods.plate !== 'gone') {
        ctx.fillStyle = '#f7f3ea';
        ellipse(ctx, 200, 320, 26, 9);
        ctx.fill();
        ctx.fillStyle = '#e8b06a';
        circ(ctx, 200, 318, 6);
        ctx.fill();
      }
      // sushi pieces
      ctx.fillStyle = '#f7f3ea';
      rr(ctx, 404, 308, 26, 12, 4);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      rr(ctx, 404, 304, 26, 6, 3);
      ctx.fill();
      if (mods.fish !== 'gone') {
        ctx.fillStyle = '#f7f3ea';
        rr(ctx, 436, 308, 26, 12, 4);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        rr(ctx, 436, 304, 26, 6, 3);
        ctx.fill();
      }
      // chopsticks
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(472, 318);
      ctx.lineTo(498, 332);
      ctx.moveTo(474, 330);
      ctx.lineTo(500, 340);
      ctx.stroke();
      if (mods.chop === 'extra') {
        ctx.beginPath();
        ctx.moveTo(512, 316);
        ctx.lineTo(536, 330);
        ctx.moveTo(514, 328);
        ctx.lineTo(538, 338);
        ctx.stroke();
      }
      cat(ctx, 520, 300, 1, '#e8b06a', mods.cattail === 'down');
    },
    slots: [
      { id: 'lanterncolor', x: 120, y: 90, r: 26, tier: 'easy', kind: 'color', label: 'lantern color', alt: 'yellow' },
      { id: 'lanterntext', x: 120, y: 90, r: 20, tier: 'hard', kind: 'text', label: 'lantern mark', alt: 'two' },
      { id: 'hat', x: 300, y: 172, r: 20, tier: 'medium', kind: 'size', label: 'chef hat', alt: 'short' },
      { id: 'apron', x: 300, y: 252, r: 24, tier: 'easy', kind: 'color', label: 'apron color', alt: 'blue' },
      { id: 'plate', x: 200, y: 320, r: 18, tier: 'easy', kind: 'remove', label: 'plate', alt: 'gone' },
      { id: 'fish', x: 449, y: 312, r: 14, tier: 'medium', kind: 'remove', label: 'sushi piece', alt: 'gone' },
      { id: 'chop', x: 524, y: 328, r: 14, tier: 'medium', kind: 'add', label: 'extra chopsticks', alt: 'extra' },
      { id: 'price', x: 506, y: 108, r: 12, tier: 'hard', kind: 'text', label: 'menu price', alt: 'eight' },
      { id: 'cattail', x: 500, y: 290, r: 16, tier: 'hard', kind: 'pattern', label: 'cat tail', alt: 'down' },
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle',
    tag: 'Monkeys, parrots and one very sneaky snake',
    draw(ctx, mods) {
      sky(ctx, '#cfeecb', '#a8dba0');
      ground(ctx, 320, '#7cb35a');
      // waterfall
      ctx.fillStyle = '#8ecfe8';
      rr(ctx, 452, 120, 56, 200, 10);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(462, 130, 6, 180);
      ctx.fillRect(480, 140, 6, 170);
      ctx.fillStyle = '#7a6a5a';
      ellipse(ctx, 480, 322, 40, 14);
      ctx.fill();
      if (mods.rock === 'extra') {
        ctx.fillStyle = '#7a6a5a';
        ellipse(ctx, 446, 300, 14, 9);
        ctx.fill();
      }
      // vines
      ctx.strokeStyle = '#4e9b5f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(220, 0);
      ctx.quadraticCurveTo(228, 60, 220, mods.vine === 'short' ? 70 : 120);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(360, 0);
      ctx.quadraticCurveTo(352, 50, 360, 96);
      ctx.stroke();
      tree(ctx, 70, 300, 1.1, '#3e8a4f');
      tree(ctx, 550, 310, 0.9, '#4e9b5f');
      sun(ctx, 60, 60, 22, '#fbbf24', mods.sungone !== 'gone');
      // branch + parrot
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(260, 116);
      ctx.lineTo(350, 116);
      ctx.stroke();
      bird(ctx, 305, 102, 1, '#ef4444', mods.parrotwing === 'blue' ? '#3b82f6' : '#f6b93b', mods.parrotflip === 'flipped');
      drawMonkey(ctx, 140, 300, mods.banana, mods.monkeytail === 'straight');
      flower(ctx, 90, 380, 1, mods.flowercolor === 'pink' ? '#f472b6' : '#ef4444');
      flower(ctx, 250, 392, 0.9, '#f6b93b');
      flower(ctx, 380, 386, 1, '#ffffff');
      butterfly(ctx, 420, 140, 1, mods.butterflywing === 'pink' ? '#f472b6' : '#f6b93b', '#3b82f6', false);
      if (mods.snakegone !== 'gone') {
        ctx.strokeStyle = '#4e9b5f';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(500, 300);
        ctx.quadraticCurveTo(520, 280, 540, 300);
        ctx.quadraticCurveTo(550, 316, 536, 322);
        ctx.stroke();
        ctx.fillStyle = '#2b2b2b';
        circ(ctx, 536, 318, 3);
        ctx.fill();
      }
    },
    slots: [
      { id: 'rock', x: 446, y: 300, r: 14, tier: 'hard', kind: 'add', label: 'rock by waterfall', alt: 'extra' },
      { id: 'banana', x: 164, y: 310, r: 14, tier: 'easy', kind: 'remove', label: 'monkey banana', alt: 'gone' },
      { id: 'monkeytail', x: 116, y: 306, r: 16, tier: 'medium', kind: 'pattern', label: 'monkey tail', alt: 'straight' },
      { id: 'parrotwing', x: 305, y: 102, r: 22, tier: 'medium', kind: 'color', label: 'parrot wing', alt: 'blue' },
      { id: 'parrotflip', x: 305, y: 102, r: 22, tier: 'medium', kind: 'flip', label: 'parrot flipped', alt: 'flipped' },
      { id: 'vine', x: 220, y: 86, r: 22, tier: 'medium', kind: 'size', label: 'vine length', alt: 'short' },
      { id: 'flowercolor', x: 90, y: 380, r: 14, tier: 'easy', kind: 'color', label: 'flower color', alt: 'pink' },
      { id: 'butterflywing', x: 420, y: 140, r: 16, tier: 'hard', kind: 'color', label: 'butterfly wing', alt: 'pink' },
      { id: 'snakegone', x: 520, y: 300, r: 18, tier: 'easy', kind: 'remove', label: 'snake', alt: 'gone' },
      { id: 'sungone', x: 60, y: 60, r: 26, tier: 'easy', kind: 'remove', label: 'sun', alt: 'gone' },
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    tag: 'Neon rain and a flying car',
    draw(ctx, mods) {
      sky(ctx, '#3a2b5c', '#7a3b6e');
      ground(ctx, 360, '#241a33');
      // buildings
      const towers = [
        { x: 60, y: 140, w: 90, h: 220, c: '#2c2140' },
        { x: 170, y: 90, w: 80, h: 270, c: '#33254d' },
        { x: 270, y: 170, w: 100, h: 190, c: '#2c2140' },
        { x: 390, y: 110, w: 84, h: 250, c: '#33254d' },
        { x: 494, y: 190, w: 106, h: 170, c: '#2c2140' },
      ];
      for (const t of towers) {
        ctx.fillStyle = t.c;
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.fillStyle = mods.windows === 'off' && t.x === 170 ? '#2c2140' : '#ffd97a';
        for (let wy = t.y + 18; wy < 340; wy += 30) {
          for (let wx = t.x + 14; wx < t.x + t.w - 14; wx += 26) {
            ctx.fillRect(wx, wy, 12, 14);
          }
        }
      }
      // neon sign
      ctx.fillStyle = mods.neoncolor === 'cyan' ? '#22d3ee' : '#f472b6';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.fillText(mods.neontext === 'SUSHI' ? 'SUSHI' : 'RAMEN', 84, 150);
      ctx.shadowBlur = 0;
      // moon
      moon(ctx, 60, 70, 22, mods.mooncolor === 'pink' ? '#f472b6' : '#f5eeda');
      // hologram
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      if (mods.hologram === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(300, 96);
        ctx.lineTo(324, 140);
        ctx.lineTo(276, 140);
        ctx.closePath();
        ctx.stroke();
      } else {
        circ(ctx, 300, 118, 22);
        ctx.stroke();
        circ(ctx, 300, 118, 12);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(34,211,238,0.25)';
      ctx.fillRect(280, 140, 40, 4);
      // flying car
      const carY = mods.carmove === 'down' ? 190 : 140;
      ctx.fillStyle = '#f6b93b';
      rr(ctx, 388, carY - 12, 64, 20, 9);
      ctx.fill();
      ctx.fillStyle = '#9fd8ef';
      rr(ctx, 404, carY - 20, 30, 12, 5);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      circ(ctx, 396, carY + 10, 4);
      ctx.fill();
      circ(ctx, 444, carY + 10, 4);
      ctx.fill();
      // robot on the street
      drawRobot(ctx, 120, 330, 'on', mods.roboteye === 'red' ? '#ef4444' : '#3b82f6');
      // rooftop cat
      if (mods.catgone !== 'gone') cat(ctx, 500, 178, 0.9, '#1a1226', true);
      // rain
      ctx.strokeStyle = 'rgba(160,200,255,0.5)';
      ctx.lineWidth = 2;
      for (const [rx, ry] of [[240, 80], [330, 60], [420, 90], [520, 60], [180, 210], [300, 240], [470, 250]]) {
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 16);
        ctx.stroke();
      }
      if (mods.rain !== 'gone') {
        ctx.beginPath();
        ctx.moveTo(300, 100);
        ctx.lineTo(296, 116);
        ctx.stroke();
      }
    },
    slots: [
      { id: 'windows', x: 210, y: 200, r: 30, tier: 'medium', kind: 'pattern', label: 'dark tower windows', alt: 'off' },
      { id: 'neoncolor', x: 130, y: 150, r: 28, tier: 'easy', kind: 'color', label: 'neon sign color', alt: 'cyan' },
      { id: 'neontext', x: 130, y: 150, r: 28, tier: 'hard', kind: 'text', label: 'neon sign text', alt: 'SUSHI' },
      { id: 'carmove', x: 420, y: 190, r: 28, tier: 'medium', kind: 'move', label: 'flying car moved', alt: 'down', zones: [{ x: 420, y: 190, r: 28 }, { x: 420, y: 140, r: 28 }] },
      { id: 'roboteye', x: 120, y: 312, r: 16, tier: 'easy', kind: 'color', label: 'robot eyes', alt: 'red' },
      { id: 'rain', x: 300, y: 108, r: 12, tier: 'hard', kind: 'remove', label: 'rain streak', alt: 'gone' },
      { id: 'hologram', x: 300, y: 118, r: 24, tier: 'medium', kind: 'pattern', label: 'hologram shape', alt: 'triangle' },
      { id: 'catgone', x: 500, y: 178, r: 16, tier: 'easy', kind: 'remove', label: 'rooftop cat', alt: 'gone' },
      { id: 'mooncolor', x: 60, y: 70, r: 22, tier: 'easy', kind: 'color', label: 'moon color', alt: 'pink' },
    ],
  },
  {
    id: 'underwater',
    name: 'Underwater',
    tag: 'A diver, an octopus and buried treasure',
    draw(ctx, mods) {
      sky(ctx, '#3d9ec9', '#7fd0e8');
      ground(ctx, 380, '#f0d9a0');
      // light rays
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (const rx of [120, 300, 480]) {
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx + 40, 0);
        ctx.lineTo(rx - 20, 380);
        ctx.lineTo(rx - 60, 380);
        ctx.closePath();
        ctx.fill();
      }
      // coral
      ctx.strokeStyle = mods.coralcolor === 'purple' ? '#a855f7' : '#f472b6';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(90, 380);
      ctx.quadraticCurveTo(84, 350, 90, 330);
      ctx.moveTo(90, 360);
      ctx.quadraticCurveTo(70, 340, 66, 322);
      ctx.moveTo(90, 360);
      ctx.quadraticCurveTo(108, 344, 112, 326);
      ctx.stroke();
      if (mods.coralbranch === 'extra') {
        ctx.beginPath();
        ctx.moveTo(90, 344);
        ctx.quadraticCurveTo(76, 330, 72, 312);
        ctx.stroke();
      }
      // seaweed
      ctx.strokeStyle = '#4e9b5f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(56, 380);
      ctx.quadraticCurveTo(48, 350, 58, 330);
      ctx.moveTo(70, 380);
      ctx.quadraticCurveTo(76, 356, 68, 338);
      ctx.stroke();
      if (mods.seaweed !== 'gone') {
        ctx.beginPath();
        ctx.moveTo(42, 380);
        ctx.quadraticCurveTo(36, 356, 44, 340);
        ctx.stroke();
      }
      // clownfish
      fish(ctx, 250, 200, 1, '#f97316', '#f97316', false);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(244, 190, 5, 20);
      if (mods.stripes !== 'two') ctx.fillRect(258, 190, 5, 20);
      // blue fish school
      fish(ctx, 350, 120, 0.8, '#3b82f6', '#3b82f6', false);
      if (mods.fishgone !== 'gone') fish(ctx, 386, 128, 0.8, '#3b82f6', '#3b82f6', true);
      fish(ctx, 320, 132, 0.7, '#3b82f6', '#3b82f6', false);
      // diver
      ctx.fillStyle = '#2c3550';
      rr(ctx, 400, 160, 40, 26, 10);
      ctx.fill();
      ctx.fillStyle = '#f7c9a0';
      circ(ctx, 440, 168, 11);
      ctx.fill();
      ctx.fillStyle = mods.tank === 'yellow' ? '#f6b93b' : '#9aa7c7';
      rr(ctx, 402, 148, 10, 22, 4);
      ctx.fill();
      ctx.strokeStyle = '#2c3550';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(404, 186);
      ctx.lineTo(392, 198);
      ctx.moveTo(432, 186);
      ctx.lineTo(444, 196);
      ctx.stroke();
      bubble(ctx, 452, 148, 6);
      bubble(ctx, 462, 134, 4);
      if (mods.bubbles === 'more') bubble(ctx, 446, 122, 5);
      // treasure chest
      ctx.fillStyle = '#8a5a3b';
      rr(ctx, 272, 380, 56, 26, 5);
      ctx.fill();
      ctx.fillStyle = '#6b4a2f';
      if (mods.chest === 'open') {
        ctx.save();
        ctx.translate(272, 380);
        ctx.rotate(-0.7);
        rr(ctx, 0, -14, 56, 14, 5);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#f6b93b';
        circ(ctx, 288, 376, 5);
        ctx.fill();
        circ(ctx, 300, 374, 5);
        ctx.fill();
        circ(ctx, 312, 376, 5);
        ctx.fill();
      } else {
        rr(ctx, 272, 366, 56, 14, 7);
        ctx.fill();
      }
      ctx.fillStyle = '#f6b93b';
      rr(ctx, 296, 372, 8, 10, 2);
      ctx.fill();
      // octopus
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(500, 300, 24, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(476, 300, 48, 10);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      const tentacles = mods.tentacle === 'seven' ? 7 : 6;
      for (let i = 0; i < tentacles; i += 1) {
        const tx = 480 + i * 8;
        ctx.beginPath();
        ctx.moveTo(tx, 308);
        ctx.quadraticCurveTo(tx + (i % 2 === 0 ? 6 : -6), 326, tx, 338);
        ctx.stroke();
      }
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 492, 292, 3);
      ctx.fill();
      circ(ctx, 508, 292, 3);
      ctx.fill();
      // shell
      const shellX = mods.shellmove === 'moved' ? 240 : 180;
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(shellX, 400, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#d14a8a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shellX, 400);
      ctx.lineTo(shellX, 388);
      ctx.moveTo(shellX - 7, 398);
      ctx.lineTo(shellX - 4, 388);
      ctx.moveTo(shellX + 7, 398);
      ctx.lineTo(shellX + 4, 388);
      ctx.stroke();
    },
    slots: [
      { id: 'coralcolor', x: 90, y: 330, r: 26, tier: 'easy', kind: 'color', label: 'coral color', alt: 'purple' },
      { id: 'coralbranch', x: 112, y: 316, r: 12, tier: 'medium', kind: 'add', label: 'coral branch', alt: 'extra' },
      { id: 'stripes', x: 250, y: 200, r: 22, tier: 'medium', kind: 'pattern', label: 'clownfish stripes', alt: 'two' },
      { id: 'tank', x: 407, y: 159, r: 14, tier: 'easy', kind: 'color', label: 'diver tank', alt: 'yellow' },
      { id: 'bubbles', x: 446, y: 122, r: 12, tier: 'hard', kind: 'add', label: 'extra bubble', alt: 'more' },
      { id: 'chest', x: 300, y: 388, r: 28, tier: 'medium', kind: 'pattern', label: 'treasure chest open', alt: 'open' },
      { id: 'tentacle', x: 500, y: 318, r: 24, tier: 'hard', kind: 'pattern', label: 'octopus tentacle', alt: 'seven' },
      { id: 'shellmove', x: 240, y: 400, r: 16, tier: 'medium', kind: 'move', label: 'shell moved', alt: 'moved', zones: [{ x: 240, y: 400, r: 16 }, { x: 180, y: 400, r: 16 }] },
      { id: 'seaweed', x: 42, y: 360, r: 14, tier: 'easy', kind: 'remove', label: 'seaweed frond', alt: 'gone' },
      { id: 'fishgone', x: 386, y: 128, r: 14, tier: 'easy', kind: 'remove', label: 'blue fish', alt: 'gone' },
    ],
  },
  {
    id: 'coffee',
    name: 'Coffee Shop',
    tag: 'Warm cups, fresh croissants, one lazy cat',
    draw(ctx, mods) {
      sky(ctx, '#f7e3c8', '#f3d9b8');
      ctx.fillStyle = '#d9a06b';
      ctx.fillRect(0, 340, SCENE_W, 110);
      ctx.fillStyle = '#a5714a';
      ctx.fillRect(0, 310, SCENE_W, 34);
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(0, 310, SCENE_W, 5);
      // window with sun + curtain
      ctx.fillStyle = '#ffffff';
      rr(ctx, 420, 80, 130, 110, 8);
      ctx.fill();
      ctx.fillStyle = '#aee3f5';
      ctx.fillRect(428, 88, 114, 94);
      sun(ctx, 500, 120, 18, '#fbbf24', true);
      ctx.fillStyle = '#4e9b5f';
      ctx.fillRect(428, 160, 114, 22);
      if (mods.window === 'curtain') {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(428, 88, 24, 94);
      }
      cat(ctx, 486, 196, 0.9, '#e8b06a', true, mods.catsleep === 'awake');
      // menu board
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 270, 76, 110, 74, 8);
      ctx.fill();
      ctx.fillStyle = '#f7f3ea';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(mods.menuitem === 'cake' ? 'CAKE   4' : 'LATTE  4', 282, 100);
      ctx.fillText('MOCHA  5', 282, 122);
      ctx.fillText('TEA    3', 282, 142);
      // hanging lamp
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(250, 66);
      ctx.stroke();
      ctx.fillStyle = '#3b2f2f';
      ctx.beginPath();
      ctx.moveTo(232, 78);
      ctx.lineTo(268, 78);
      ctx.lineTo(258, 62);
      ctx.lineTo(242, 62);
      ctx.closePath();
      ctx.fill();
      if (mods.lamp !== 'off') {
        ctx.fillStyle = 'rgba(246,185,59,0.5)';
        circ(ctx, 250, 88, 16);
        ctx.fill();
      }
      // barista
      ctx.fillStyle = '#f7f3ea';
      rr(ctx, 154, 230, 52, 66, 10);
      ctx.fill();
      ctx.fillStyle = mods.apron === 'green' ? '#4e9b5f' : '#8a5a3b';
      rr(ctx, 160, 252, 40, 42, 8);
      ctx.fill();
      ctx.fillStyle = '#f7c9a0';
      circ(ctx, 180, 214, 18);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 174, 212, 2);
      ctx.fill();
      circ(ctx, 186, 212, 2);
      ctx.fill();
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(180, 218, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 162, 192, 36, 8, 4);
      ctx.fill();
      if (mods.cuphand !== 'gone') cup(ctx, 214, 282, 0.8, '#ef4444', true);
      // cups on the counter
      cup(ctx, 300, 296, 1, '#3b82f6', true);
      if (mods.cupgone !== 'gone') cup(ctx, 340, 296, 1, '#f6b93b', mods.cupsteam !== 'off');
      cup(ctx, 380, 296, 1, '#4e9b5f', true);
      // croissant
      ctx.fillStyle = '#e8a34a';
      ellipse(ctx, 440, 322, 22, 12);
      ctx.fill();
      ctx.fillStyle = '#d98a2a';
      ctx.beginPath();
      ctx.moveTo(424, 314);
      ctx.lineTo(456, 314);
      ctx.lineTo(440, 322);
      ctx.closePath();
      ctx.fill();
      if (mods.crumbs === 'extra') {
        ctx.fillStyle = '#8a5a3b';
        circ(ctx, 466, 330, 2);
        ctx.fill();
        circ(ctx, 472, 326, 2);
        ctx.fill();
        circ(ctx, 460, 334, 2);
        ctx.fill();
      }
      // plant
      ctx.fillStyle = '#c96a3b';
      ctx.beginPath();
      ctx.moveTo(68, 300);
      ctx.lineTo(92, 300);
      ctx.lineTo(88, 320);
      ctx.lineTo(72, 320);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4e9b5f';
      ellipse(ctx, 74, 292, 6, 12);
      ctx.fill();
      ellipse(ctx, 86, 292, 6, 12);
      ctx.fill();
      if (mods.leaf === 'extra') {
        ellipse(ctx, 80, 282, 6, 12);
        ctx.fill();
      }
    },
    slots: [
      { id: 'window', x: 470, y: 130, r: 28, tier: 'medium', kind: 'pattern', label: 'window curtain', alt: 'curtain' },
      { id: 'apron', x: 180, y: 272, r: 24, tier: 'easy', kind: 'color', label: 'barista apron', alt: 'green' },
      { id: 'cuphand', x: 214, y: 282, r: 14, tier: 'medium', kind: 'remove', label: 'cup in hand', alt: 'gone' },
      { id: 'cupgone', x: 340, y: 296, r: 16, tier: 'easy', kind: 'remove', label: 'yellow cup', alt: 'gone' },
      { id: 'cupsteam', x: 340, y: 276, r: 12, tier: 'hard', kind: 'remove', label: 'cup steam', alt: 'off' },
      { id: 'crumbs', x: 466, y: 328, r: 12, tier: 'hard', kind: 'add', label: 'croissant crumbs', alt: 'extra' },
      { id: 'catsleep', x: 492, y: 176, r: 16, tier: 'medium', kind: 'pattern', label: 'cat awake', alt: 'awake' },
      { id: 'leaf', x: 80, y: 282, r: 12, tier: 'hard', kind: 'add', label: 'extra leaf', alt: 'extra' },
      { id: 'menuitem', x: 320, y: 100, r: 24, tier: 'hard', kind: 'text', label: 'menu item', alt: 'cake' },
      { id: 'lamp', x: 250, y: 86, r: 16, tier: 'medium', kind: 'pattern', label: 'lamp light', alt: 'off' },
    ],
  },
  {
    id: 'farm',
    name: 'Farm Morning',
    tag: 'Fresh eggs, red barn, one proud cow',
    draw(ctx, mods) {
      sky(ctx, '#bfe8f5', '#e8f7fd');
      ground(ctx, 310, '#8cc168');
      sun(ctx, 520, 70, 24, '#fbbf24', mods.sunrays !== 'gone');
      cloud(ctx, 90, 60, 1, '#ffffff');
      cloud(ctx, 300, 50, 0.8, '#ffffff');
      // barn
      ctx.fillStyle = '#c94a3b';
      ctx.fillRect(80, 200, 120, 110);
      ctx.fillStyle = '#8a2f28';
      ctx.beginPath();
      ctx.moveTo(70, 200);
      ctx.lineTo(140, 150);
      ctx.lineTo(210, 200);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = mods.barnwindow === 'dark' ? '#3b2f2f' : '#ffd97a';
      ctx.fillRect(104, 214, 20, 20);
      ctx.fillStyle = '#ffd97a';
      ctx.fillRect(156, 214, 20, 20);
      ctx.fillStyle = mods.door === 'open' ? '#3b2f2f' : '#8a2f28';
      rr(ctx, 128, 260, 26, 50, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(128, 282, 26, 4);
      // fence
      ctx.fillStyle = '#d9a05b';
      for (let i = 0; i < 10; i += 1) {
        const fx = 220 + i * 38;
        if (mods.picket === 'gone' && i === 1) continue;
        ctx.fillRect(fx, 340, 8, 26);
      }
      ctx.fillRect(216, 348, 380, 5);
      ctx.fillRect(216, 360, 380, 5);
      // cow
      ctx.fillStyle = '#f7f3ea';
      ellipse(ctx, 350, 330, 40, 26);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      ellipse(ctx, 336, 322, 10, 7);
      ctx.fill();
      ellipse(ctx, 364, 340, 8, 6);
      ctx.fill();
      if (mods.spots === 'extra') {
        ellipse(ctx, 352, 312, 7, 5);
        ctx.fill();
      }
      ctx.fillStyle = '#f7f3ea';
      circ(ctx, 392, 316, 16);
      ctx.fill();
      ctx.fillStyle = '#f7c9d9';
      ellipse(ctx, 402, 320, 9, 6);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 398, 310, 2);
      ctx.fill();
      circ(ctx, 406, 310, 2);
      ctx.fill();
      if (mods.bell !== 'gone') {
        ctx.fillStyle = '#f6b93b';
        circ(ctx, 380, 342, 5);
        ctx.fill();
      }
      ctx.strokeStyle = '#f7f3ea';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(316, 330);
      ctx.lineTo(306, 348);
      ctx.stroke();
      // chicken
      if (mods.chickengone !== 'gone') {
        ctx.fillStyle = '#ffffff';
        ellipse(ctx, 480, 380, 14, 11);
        ctx.fill();
        circ(ctx, 490, 368, 8);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(488, 360);
        ctx.lineTo(492, 354);
        ctx.lineTo(496, 360);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f6b93b';
        ctx.beginPath();
        ctx.moveTo(497, 367);
        ctx.lineTo(504, 369);
        ctx.lineTo(497, 371);
        ctx.closePath();
        ctx.fill();
      }
      if (mods.egg === 'extra') {
        ctx.fillStyle = '#f7f3ea';
        ellipse(ctx, 508, 394, 6, 8);
        ctx.fill();
      }
      // tractor
      ctx.fillStyle = '#c94a3b';
      rr(ctx, 196, 372, 56, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#9fd8ef';
      rr(ctx, 216, 352, 26, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 208, 400, 12);
      ctx.fill();
      circ(ctx, 244, 400, 12);
      ctx.fill();
      ctx.fillStyle = mods.wheel === 'yellow' ? '#f6b93b' : '#8a8a8a';
      circ(ctx, 208, 400, 5);
      ctx.fill();
      circ(ctx, 244, 400, 5);
      ctx.fill();
      // hay bale
      ctx.fillStyle = '#e8c96a';
      circ(ctx, 80, 380, 20);
      ctx.fill();
      ctx.strokeStyle = '#c9a83b';
      ctx.lineWidth = 2;
      circ(ctx, 80, 380, 13);
      ctx.stroke();
      if (mods.hay === 'extra') {
        circ(ctx, 120, 388, 14);
        ctx.fill();
        circ(ctx, 120, 388, 9);
        ctx.stroke();
      }
      flower(ctx, 300, 420, 1, mods.flowercolor === 'pink' ? '#f472b6' : '#ef4444');
      flower(ctx, 540, 420, 0.9, '#ffffff');
    },
    slots: [
      { id: 'door', x: 141, y: 285, r: 22, tier: 'medium', kind: 'pattern', label: 'barn door open', alt: 'open' },
      { id: 'barnwindow', x: 114, y: 224, r: 12, tier: 'easy', kind: 'color', label: 'barn window', alt: 'dark' },
      { id: 'spots', x: 352, y: 312, r: 10, tier: 'medium', kind: 'add', label: 'extra cow spot', alt: 'extra' },
      { id: 'bell', x: 380, y: 342, r: 10, tier: 'hard', kind: 'remove', label: 'cow bell', alt: 'gone' },
      { id: 'sunrays', x: 520, y: 70, r: 30, tier: 'easy', kind: 'remove', label: 'sun rays', alt: 'gone' },
      { id: 'picket', x: 262, y: 352, r: 10, tier: 'hard', kind: 'remove', label: 'fence picket', alt: 'gone' },
      { id: 'chickengone', x: 484, y: 376, r: 18, tier: 'easy', kind: 'remove', label: 'chicken', alt: 'gone' },
      { id: 'egg', x: 508, y: 394, r: 10, tier: 'medium', kind: 'add', label: 'fresh egg', alt: 'extra' },
      { id: 'wheel', x: 208, y: 400, r: 12, tier: 'medium', kind: 'color', label: 'tractor wheel hub', alt: 'yellow' },
      { id: 'hay', x: 120, y: 388, r: 14, tier: 'easy', kind: 'add', label: 'extra hay bale', alt: 'extra' },
      { id: 'flowercolor', x: 300, y: 420, r: 12, tier: 'easy', kind: 'color', label: 'flower color', alt: 'pink' },
    ],
  },
  {
    id: 'winter',
    name: 'Winter Cabin',
    tag: 'Snow, smoke and a very cold carrot',
    draw(ctx, mods) {
      sky(ctx, '#cfe0f2', '#e8f1fa');
      ground(ctx, 320, '#ffffff');
      moon(ctx, 60, 70, 22, '#f5eeda');
      if (mods.mooncrater === 'dot') {
        ctx.fillStyle = '#d9cba8';
        circ(ctx, 66, 64, 3.5);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      for (const [fx, fy, fr] of [[200, 80, 3], [300, 60, 2.5], [420, 70, 3], [520, 100, 2.5], [140, 140, 2.5], [360, 120, 2]]) {
        if (mods.flake === 'gone' && fx === 200 && fy === 80) continue;
        circ(ctx, fx, fy, fr);
        ctx.fill();
      }
      // cabin
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(240, 210, 140, 110);
      ctx.fillStyle = '#5b3a2f';
      ctx.beginPath();
      ctx.moveTo(228, 212);
      ctx.lineTo(310, 160);
      ctx.lineTo(392, 212);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(228, 212);
      ctx.lineTo(310, 160);
      ctx.lineTo(392, 212);
      ctx.lineTo(392, 222);
      ctx.lineTo(228, 222);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5b3a2f';
      ctx.fillRect(360, 150, 22, 40);
      ctx.fill();
      if (mods.smoke !== 'gone') {
        ctx.fillStyle = 'rgba(180,180,180,0.8)';
        circ(ctx, 374, 136, 8);
        ctx.fill();
        circ(ctx, 380, 122, 10);
        ctx.fill();
        circ(ctx, 388, 106, 12);
        ctx.fill();
      }
      ctx.fillStyle = mods.lights === 'off' ? '#3b2f2f' : '#ffd97a';
      ctx.fillRect(262, 240, 26, 26);
      ctx.fillStyle = '#ffd97a';
      ctx.fillRect(330, 240, 26, 26);
      ctx.fillStyle = '#5b3a2f';
      rr(ctx, 300, 276, 22, 44, 4);
      ctx.fill();
      // snowman
      ctx.fillStyle = '#ffffff';
      circ(ctx, 140, 388, 26);
      ctx.fill();
      circ(ctx, 140, 350, 20);
      ctx.fill();
      circ(ctx, 140, 318, 15);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 134, 314, 2);
      ctx.fill();
      circ(ctx, 146, 314, 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      if (mods.carrot === 'down') {
        ctx.beginPath();
        ctx.moveTo(136, 322);
        ctx.lineTo(144, 322);
        ctx.lineTo(140, 334);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(140, 318);
        ctx.lineTo(156, 321);
        ctx.lineTo(140, 326);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = mods.hat === 'blue' ? '#3b82f6' : '#2b2b2b';
      rr(ctx, 128, 298, 24, 8, 2);
      ctx.fill();
      rr(ctx, 132, 286, 16, 14, 2);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 140, 344, 2.5);
      ctx.fill();
      circ(ctx, 140, 356, 2.5);
      ctx.fill();
      if (mods.buttons !== 'two') {
        circ(ctx, 140, 368, 2.5);
        ctx.fill();
      }
      // pine tree with ornaments
      ctx.fillStyle = '#3e8a4f';
      ctx.beginPath();
      ctx.moveTo(480, 230);
      ctx.lineTo(452, 300);
      ctx.lineTo(508, 300);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(480, 252);
      ctx.lineTo(458, 312);
      ctx.lineTo(502, 312);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6b4a2f';
      ctx.fillRect(474, 312, 12, 14);
      ctx.fillStyle = mods.ornament === 'red' ? '#ef4444' : '#f6b93b';
      circ(ctx, 470, 282, 5);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      circ(ctx, 492, 296, 5);
      ctx.fill();
      // skis
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(200, 392);
      ctx.lineTo(250, 408);
      ctx.stroke();
      if (mods.skis !== 'gone') {
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(204, 410);
        ctx.lineTo(254, 394);
        ctx.stroke();
      }
      // mug on a bench
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(360, 384, 60, 8);
      cup(ctx, 390, 378, 0.8, '#ef4444', mods.steam !== 'off');
      // sled
      const sledX = mods.sledmove === 'moved' ? 120 : 60;
      ctx.fillStyle = '#c94a3b';
      rr(ctx, sledX - 20, 396, 40, 10, 5);
      ctx.fill();
      ctx.strokeStyle = '#8a2f28';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sledX - 16, 406);
      ctx.lineTo(sledX - 16, 414);
      ctx.moveTo(sledX + 16, 406);
      ctx.lineTo(sledX + 16, 414);
      ctx.stroke();
    },
    slots: [
      { id: 'smoke', x: 380, y: 122, r: 16, tier: 'medium', kind: 'remove', label: 'chimney smoke', alt: 'gone' },
      { id: 'lights', x: 275, y: 253, r: 16, tier: 'easy', kind: 'color', label: 'cabin window lights', alt: 'off' },
      { id: 'hat', x: 140, y: 294, r: 14, tier: 'easy', kind: 'color', label: 'snowman hat', alt: 'blue' },
      { id: 'carrot', x: 146, y: 322, r: 10, tier: 'hard', kind: 'pattern', label: 'carrot direction', alt: 'down' },
      { id: 'buttons', x: 140, y: 368, r: 10, tier: 'medium', kind: 'remove', label: 'snowman button', alt: 'two' },
      { id: 'ornament', x: 470, y: 282, r: 10, tier: 'medium', kind: 'color', label: 'tree ornament', alt: 'red' },
      { id: 'skis', x: 228, y: 402, r: 18, tier: 'easy', kind: 'remove', label: 'blue ski', alt: 'gone' },
      { id: 'steam', x: 390, y: 362, r: 10, tier: 'hard', kind: 'remove', label: 'mug steam', alt: 'off' },
      { id: 'sledmove', x: 120, y: 402, r: 18, tier: 'medium', kind: 'move', label: 'sled moved', alt: 'moved', zones: [{ x: 120, y: 402, r: 18 }, { x: 60, y: 402, r: 18 }] },
      { id: 'flake', x: 200, y: 80, r: 10, tier: 'hard', kind: 'remove', label: 'snowflake', alt: 'gone' },
      { id: 'mooncrater', x: 66, y: 64, r: 10, tier: 'hard', kind: 'add', label: 'moon crater', alt: 'dot' },
    ],
  },
  {
    id: 'toyroom',
    name: 'Toy Room',
    tag: 'Teddy, trains and one red rocket',
    draw(ctx, mods) {
      sky(ctx, '#fdeecf', '#f7e3c8');
      ground(ctx, 330, '#e8b48a');
      ellipse(ctx, 300, 400, 180, 34);
      ctx.fillStyle = '#d98a5f';
      ctx.fill();
      // shelf with books
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(440, 70, 120, 8);
      const bookColors = ['#ef4444', '#3b82f6', '#4e9b5f', '#f6b93b'];
      if (mods.book === 'red') bookColors[2] = '#ef4444';
      bookColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(448 + i * 26, 36, 22, 34);
      });
      // kite on the wall
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(520, 108);
      ctx.lineTo(544, 132);
      ctx.lineTo(520, 156);
      ctx.lineTo(496, 132);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(520, 156);
      if (mods.kitetail === 'short') ctx.lineTo(520, 176);
      else {
        ctx.quadraticCurveTo(528, 172, 520, 186);
        ctx.quadraticCurveTo(512, 200, 520, 212);
      }
      ctx.stroke();
      // lamp
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 66, 176, 28, 34, 6);
      ctx.fill();
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(80, 210);
      ctx.lineTo(80, 260);
      ctx.stroke();
      if (mods.lamp !== 'off') {
        ctx.fillStyle = 'rgba(246,185,59,0.55)';
        circ(ctx, 80, 193, 20);
        ctx.fill();
        ctx.fillStyle = '#f6b93b';
        circ(ctx, 80, 193, 8);
        ctx.fill();
      }
      // teddy
      ctx.fillStyle = '#b07a4a';
      ellipse(ctx, 140, 306, 26, 24);
      ctx.fill();
      circ(ctx, 140, 268, 20);
      ctx.fill();
      circ(ctx, 122, 252, 8);
      ctx.fill();
      circ(ctx, 158, 252, 8);
      ctx.fill();
      ctx.fillStyle = '#d9a05b';
      ellipse(ctx, 140, 274, 11, 8);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      if (mods.teddyeye === 'wink') {
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(130, 264);
        ctx.lineTo(136, 264);
        ctx.stroke();
      } else {
        circ(ctx, 133, 264, 2);
        ctx.fill();
      }
      circ(ctx, 147, 264, 2);
      ctx.fill();
      ctx.fillStyle = mods.bow === 'blue' ? '#3b82f6' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(140, 288);
      ctx.lineTo(128, 280);
      ctx.lineTo(128, 296);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(140, 288);
      ctx.lineTo(152, 280);
      ctx.lineTo(152, 296);
      ctx.closePath();
      ctx.fill();
      // blocks with letters
      const letters = ['A', mods.letter === 'B' ? 'B' : 'C', 'D'];
      const blockColors = ['#ef4444', '#3b82f6', '#f6b93b'];
      letters.forEach((L, i) => {
        ctx.fillStyle = blockColors[i];
        rr(ctx, 272 + i * 34, 336, 30, 30, 5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L, 287 + i * 34, 352);
      });
      // rocket
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(450, 160);
      ctx.quadraticCurveTo(472, 190, 470, 220);
      ctx.lineTo(430, 220);
      ctx.quadraticCurveTo(428, 190, 450, 160);
      ctx.fill();
      ctx.fillStyle = mods.rocketwindow === 'blue' ? '#3b82f6' : '#9fd8ef';
      circ(ctx, 450, 196, 9);
      ctx.fill();
      ctx.fillStyle = '#f6b93b';
      if (mods.flame === 'big') {
        ctx.beginPath();
        ctx.moveTo(438, 220);
        ctx.lineTo(450, 252);
        ctx.lineTo(462, 220);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(440, 220);
        ctx.lineTo(450, 240);
        ctx.lineTo(460, 220);
        ctx.closePath();
        ctx.fill();
      }
      // train
      ctx.fillStyle = '#3b82f6';
      rr(ctx, 180, 388, 40, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#f6b93b';
      rr(ctx, 224, 392, 34, 20, 5);
      ctx.fill();
      if (mods.traincar !== 'two') {
        ctx.fillStyle = '#4e9b5f';
        rr(ctx, 262, 392, 34, 20, 5);
        ctx.fill();
      }
      ctx.fillStyle = '#2b2b2b';
      circ(ctx, 192, 414, 7);
      ctx.fill();
      circ(ctx, 210, 414, 7);
      ctx.fill();
      circ(ctx, 240, 414, 7);
      ctx.fill();
      if (mods.traincar !== 'two') {
        circ(ctx, 278, 414, 7);
        ctx.fill();
      }
      // striped ball
      drawBall(ctx, 380, 400, mods.ballstripes === 'swapped');
    },
    slots: [
      { id: 'bow', x: 140, y: 288, r: 14, tier: 'easy', kind: 'color', label: 'teddy bow', alt: 'blue' },
      { id: 'teddyeye', x: 133, y: 264, r: 8, tier: 'hard', kind: 'pattern', label: 'teddy wink', alt: 'wink' },
      { id: 'letter', x: 321, y: 351, r: 12, tier: 'hard', kind: 'text', label: 'block letter', alt: 'B' },
      { id: 'flame', x: 450, y: 240, r: 14, tier: 'medium', kind: 'size', label: 'rocket flame', alt: 'big' },
      { id: 'rocketwindow', x: 450, y: 196, r: 12, tier: 'easy', kind: 'color', label: 'rocket window', alt: 'blue' },
      { id: 'traincar', x: 279, y: 402, r: 16, tier: 'medium', kind: 'remove', label: 'train car', alt: 'two' },
      { id: 'kitetail', x: 520, y: 194, r: 14, tier: 'medium', kind: 'size', label: 'kite tail', alt: 'short' },
      { id: 'lamp', x: 80, y: 193, r: 18, tier: 'easy', kind: 'pattern', label: 'lamp light', alt: 'off' },
      { id: 'ballstripes', x: 380, y: 400, r: 18, tier: 'medium', kind: 'color', label: 'ball stripes', alt: 'swapped' },
      { id: 'book', x: 500, y: 53, r: 12, tier: 'hard', kind: 'color', label: 'green book', alt: 'red' },
    ],
  },
  {
    id: 'candy',
    name: 'Candy Shop',
    tag: 'Lollipops, cupcakes and one sweet tooth',
    draw(ctx, mods) {
      sky(ctx, '#ffd9e8', '#ffeef5');
      ctx.fillStyle = '#d9a05b';
      ctx.fillRect(0, 340, SCENE_W, 110);
      ctx.fillStyle = '#c98a5e';
      ctx.fillRect(0, 310, SCENE_W, 34);
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(0, 310, SCENE_W, 5);
      // awning
      const awnColors = mods.awning === 'pink' ? ['#f472b6', '#ffffff'] : ['#ef4444', '#ffffff'];
      for (let i = 0; i < 10; i += 1) {
        ctx.fillStyle = awnColors[i % 2];
        ctx.fillRect(i * 60, 0, 60, 44);
      }
      ctx.fillStyle = '#8a5a3b';
      ctx.fillRect(0, 44, SCENE_W, 5);
      // sign
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 230, 70, 140, 44, 10);
      ctx.fill();
      ctx.fillStyle = '#ffd97a';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mods.signtext === 'SWEETS' ? 'SWEETS' : 'CANDY', 300, 93);
      // lollipop jars
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      rr(ctx, 84, 250, 76, 52, 8);
      ctx.fill();
      ctx.strokeStyle = '#8a5a3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 300);
      ctx.lineTo(100, 262);
      ctx.moveTo(120, 300);
      ctx.lineTo(120, 258);
      ctx.moveTo(140, 300);
      ctx.lineTo(140, 262);
      ctx.stroke();
      const lollyColors = ['#ef4444', '#3b82f6', '#f6b93b'];
      const lollyCount = mods.lollipop === 'less' ? 2 : 3;
      for (let i = 0; i < lollyCount; i += 1) {
        ctx.fillStyle = lollyColors[i];
        circ(ctx, 100 + i * 20, 252, 9);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        circ(ctx, 100 + i * 20, 252, 3);
        ctx.fill();
      }
      // cupcakes
      for (const cx of [280, 330]) {
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(cx - 14, 316);
        ctx.lineTo(cx + 14, 316);
        ctx.lineTo(cx + 9, 332);
        ctx.lineTo(cx - 9, 332);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        circ(ctx, cx, 312, 12);
        ctx.fill();
      }
      if (mods.cherry !== 'gone') {
        ctx.fillStyle = '#ef4444';
        circ(ctx, 280, 298, 5);
        ctx.fill();
      }
      ctx.fillStyle = '#ef4444';
      circ(ctx, 330, 298, 5);
      ctx.fill();
      // gumball machine
      ctx.fillStyle = mods.machinecolor === 'blue' ? '#3b82f6' : '#ef4444';
      rr(ctx, 428, 268, 46, 40, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      circ(ctx, 451, 246, 22);
      ctx.fill();
      const gumColors = ['#ef4444', '#3b82f6', '#4e9b5f', '#f6b93b', '#a855f7'];
      const gumCount = mods.gumballs === 'less' ? 3 : 5;
      for (let i = 0; i < gumCount; i += 1) {
        ctx.fillStyle = gumColors[i];
        circ(ctx, 438 + (i % 3) * 13, 236 + Math.floor(i / 3) * 13, 5);
        ctx.fill();
      }
      ctx.fillStyle = '#3b2f2f';
      rr(ctx, 446, 308, 10, 12, 2);
      ctx.fill();
      // candy cane
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(520, 384);
      ctx.lineTo(520, 344);
      ctx.quadraticCurveTo(520, 332, 532, 332);
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      const caneStripes = mods.cane === 'flipped' ? [[520, 372, 528, 368], [520, 356, 528, 352]] : [[520, 372, 512, 368], [520, 356, 512, 352]];
      for (const [x1, y1, x2, y2] of caneStripes) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // donut
      ctx.fillStyle = '#e8a34a';
      circ(ctx, 200, 360, 18);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      circ(ctx, 200, 360, 15);
      ctx.fill();
      ctx.fillStyle = '#e8a34a';
      circ(ctx, 200, 360, 6);
      ctx.fill();
      const sprinkleCount = mods.sprinkles === 'more' ? 9 : 5;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < sprinkleCount; i += 1) {
        const a = (i * 2.4) % (Math.PI * 2);
        circ(ctx, 200 + Math.cos(a) * 11, 360 + Math.sin(a) * 11, 1.6);
        ctx.fill();
      }
      cat(ctx, 80, 380, 0.9, '#e8b06a', true);
      if (mods.catgone === 'gone') {
        ctx.fillStyle = '#d9a05b';
        ctx.fillRect(50, 350, 58, 34);
      }
    },
    slots: [
      { id: 'awning', x: 150, y: 22, r: 22, tier: 'easy', kind: 'color', label: 'awning stripes', alt: 'pink' },
      { id: 'lollipop', x: 120, y: 252, r: 22, tier: 'medium', kind: 'pattern', label: 'lollipop count', alt: 'less' },
      { id: 'cherry', x: 280, y: 298, r: 12, tier: 'easy', kind: 'remove', label: 'cupcake cherry', alt: 'gone' },
      { id: 'gumballs', x: 451, y: 242, r: 18, tier: 'hard', kind: 'pattern', label: 'gumball count', alt: 'less' },
      { id: 'machinecolor', x: 451, y: 288, r: 18, tier: 'easy', kind: 'color', label: 'machine color', alt: 'blue' },
      { id: 'cane', x: 524, y: 360, r: 14, tier: 'medium', kind: 'pattern', label: 'candy cane stripes', alt: 'flipped' },
      { id: 'sprinkles', x: 200, y: 360, r: 16, tier: 'hard', kind: 'pattern', label: 'donut sprinkles', alt: 'more' },
      { id: 'signtext', x: 300, y: 93, r: 28, tier: 'hard', kind: 'text', label: 'shop sign text', alt: 'SWEETS' },
      { id: 'catgone', x: 80, y: 380, r: 18, tier: 'easy', kind: 'remove', label: 'shop cat', alt: 'gone' },
    ],
  },
];
