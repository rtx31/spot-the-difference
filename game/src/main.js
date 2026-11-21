// main.js — bootstrap, screens, timer, scoring and the game loop.
// One state object holds everything; the DOM is only a view of it.

import { SCENES } from './scenes.js';
import { SCENE_W, SCENE_H, setupCanvas, circ } from './render.js';
import { buildLevel, hitTest, starsForLevel, pointsForFind, mulberry32 } from './engine.js';
import { sfx } from './audio.js';
import { loadSave, storeSave, recordLevel, recordScore, dailySeed } from './save.js';
import { toSceneCoords, ZoomLens } from './input.js';
import { stageShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const TIME_PER_LEVEL = 90;
const COMBO_WINDOW_MS = 10000;

const state = {
  screen: 'start', // start | levels | play | pause | complete | over
  mode: 'attack', // attack | zen | daily
  levelIndex: 0,
  scene: null,
  level: null, // { mods, diffs }
  seed: 1,
  found: new Set(),
  score: 0,
  lives: 3,
  timeLeft: TIME_PER_LEVEL,
  hintsUsed: 0,
  combo: 0,
  lastFindAt: 0,
  paused: false,
  shotMode: false,
  hint: null, // { index, until }
  save: loadSave(),
  particles: [],
  rings: [],
  floats: [],
  shakeUntil: 0,
  kbd: { x: SCENE_W / 2, y: SCENE_H / 2, visible: false },
  lensHeld: false,
  lastTickSecond: -1,
};

// --- canvases -------------------------------------------------------------
const panelL = $('panelL');
const panelR = $('panelR');
const fx = $('fx');
const lensCanvas = $('lens');
const ctxL = setupCanvas(panelL);
const ctxR = setupCanvas(panelR);
const ctxFx = fx.getContext('2d');
const dpr = Math.min(window.devicePixelRatio || 1, 2);
const offL = document.createElement('canvas');
const offR = document.createElement('canvas');
offL.width = Math.round(SCENE_W * dpr);
offL.height = Math.round(SCENE_H * dpr);
offR.width = offL.width;
offR.height = offL.height;
const offCtxL = offL.getContext('2d');
const offCtxR = offR.getContext('2d');
offCtxL.setTransform(dpr, 0, 0, dpr, 0, 0);
offCtxR.setTransform(dpr, 0, 0, dpr, 0, 0);
const lens = new ZoomLens(lensCanvas);

function sizeFx() {
  const rect = $('panelsWrap').getBoundingClientRect();
  fx.width = Math.round(rect.width * dpr);
  fx.height = Math.round(rect.height * dpr);
  fx.style.width = `${rect.width}px`;
  fx.style.height = `${rect.height}px`;
  ctxFx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// --- level flow ------------------------------------------------------------
function diffCountFor(levelIndex) {
  if (levelIndex < 4) return 5;
  if (levelIndex < 8) return 6;
  return 7;
}

export function startLevel(levelIndex, mode = 'attack', seed = null, diffCountOverride = null) {
  const scene = SCENES[levelIndex % SCENES.length];
  state.scene = scene;
  state.levelIndex = levelIndex;
  state.mode = mode;
  state.seed = seed ?? ((levelIndex * 1000003) ^ (Date.now() & 0xffff));
  state.level = buildLevel(scene, state.seed, diffCountOverride ?? diffCountFor(levelIndex));
  state.found = new Set();
  state.score = 0;
  state.lives = 3;
  state.timeLeft = TIME_PER_LEVEL;
  state.hintsUsed = 0;
  state.combo = 0;
  state.lastFindAt = 0;
  state.hint = null;
  state.particles = [];
  state.rings = [];
  state.paused = false;
  state.lastTickSecond = -1;
  renderScenes();
  showScreen('play');
  updateHud();
  announce(`${scene.name}: find ${state.level.diffs.length} differences.`);
}

function renderScenes() {
  const { scene, level } = state;
  offCtxL.clearRect(0, 0, SCENE_W, SCENE_H);
  offCtxR.clearRect(0, 0, SCENE_W, SCENE_H);
  scene.draw(offCtxL, {});
  scene.draw(offCtxR, level.mods);
  drawPanels();
}

function drawPanels() {
  ctxL.clearRect(0, 0, SCENE_W, SCENE_H);
  ctxR.clearRect(0, 0, SCENE_W, SCENE_H);
  ctxL.drawImage(offL, 0, 0, SCENE_W, SCENE_H);
  ctxR.drawImage(offR, 0, 0, SCENE_W, SCENE_H);
  drawFoundCircles(ctxL);
  drawFoundCircles(ctxR);
  if (state.hint) drawHintCircle(ctxL);
  if (state.hint) drawHintCircle(ctxR);
}

function markerColor() {
  return state.save.colorblind ? '#2563eb' : '#22c55e';
}

function drawFoundCircles(ctx) {
  const color = markerColor();
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (const i of state.found) {
    const d = state.level.diffs[i];
    ctx.beginPath();
    ctx.arc(d.x, d.y, Math.max(d.r + 6, 26), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', d.x, d.y - Math.max(d.r + 6, 26) - 8);
  }
  ctx.restore();
}

function drawHintCircle(ctx) {
  if (!state.hint) return;
  const d = state.level.diffs[state.hint.index];
  const pulse = 1 + 0.18 * Math.sin(performance.now() / 140);
  ctx.save();
  ctx.strokeStyle = '#f6b93b';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(d.x, d.y, Math.max(d.r + 8, 28) * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// --- scoring & clicks -------------------------------------------------------
function onPick(sceneX, sceneY, clientX, clientY) {
  if (state.screen !== 'play' || state.paused) return;
  const idx = hitTest(state.level.diffs, state.found, sceneX, sceneY);
  if (idx >= 0) foundDiff(idx, sceneX, sceneY);
  else wrongPick(sceneX, sceneY);
}

function foundDiff(idx, sceneX, sceneY) {
  state.found.add(idx);
  const now = performance.now();
  state.combo = now - state.lastFindAt < COMBO_WINDOW_MS ? state.combo + 1 : 1;
  state.lastFindAt = now;
  const pts = pointsForFind(state.combo);
  state.score += pts;
  sfx.pop();
  burst(sceneX, sceneY);
  state.rings.push({ x: sceneX, y: sceneY, t: 0 });
  floatText(`+${pts}`, sceneX, sceneY - 30);
  if (state.combo >= 2) showCombo();
  drawPanels();
  updateHud();
  const d = state.level.diffs[idx];
  announce(`Found: ${d.label}. ${state.found.size} of ${state.level.diffs.length}.`);
  if (state.found.size === state.level.diffs.length) levelComplete();
}

function wrongPick(sceneX, sceneY) {
  sfx.thud();
  state.shakeUntil = performance.now() + 350;
  $('panelsWrap').classList.remove('shake');
  void $('panelsWrap').offsetWidth;
  $('panelsWrap').classList.add('shake');
  state.rings.push({ x: sceneX, y: sceneY, t: 0, wrong: true });
  if (state.mode !== 'zen') {
    state.lives -= 1;
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    state.combo = 0;
  }
  updateHud();
  announce(`Not a difference. ${state.lives} lives left.`);
  if (state.lives <= 0) gameOver('Out of lives!');
}

function useHint() {
  if (state.screen !== 'play' || state.paused || state.hint) return;
  const remaining = state.level.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
  if (remaining.length === 0) return;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - 30);
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hint = { index: pick, until: performance.now() + 2000 };
  sfx.hint();
  drawPanels();
  updateHud();
  setTimeout(() => {
    state.hint = null;
    if (state.screen === 'play') drawPanels();
  }, 2000);
  announce('Hint: look at the pulsing circle.');
}

function levelComplete() {
  const timeBonus = state.mode === 'zen' ? 0 : Math.round(state.timeLeft) * 5;
  const noHintBonus = state.hintsUsed === 0 ? 50 : 0;
  const stars = starsForLevel({ mode: state.mode, timeLeft: state.timeLeft, hintsUsed: state.hintsUsed });
  state.score += timeBonus + noHintBonus;
  const levelId = state.mode === 'daily' ? 'daily' : String(state.levelIndex);
  recordLevel(state.save, levelId, stars, state.score);
  if (state.mode === 'daily') {
    const { key } = dailySeed();
    state.save.daily[key] = { score: state.score, found: state.level.diffs.length, total: state.level.diffs.length };
    storeSave(state.save);
  }
  recordScore(state.save, { score: state.score, level: state.scene.name, mode: state.mode, date: new Date().toISOString().slice(0, 10) });
  sfx.win();
  updateHud();
  showScreen('complete');
  $('starsRow').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('breakdown').innerHTML =
    `<div><span>Found all ${state.level.diffs.length} differences</span><b>${state.score - timeBonus - noHintBonus} pts</b></div>` +
    (state.mode !== 'zen' ? `<div><span>Time bonus (${Math.round(state.timeLeft)}s left)</span><b>+${timeBonus}</b></div>` : '') +
    (noHintBonus ? `<div><span>No-hint bonus</span><b>+${noHintBonus}</b></div>` : '') +
    `<div class="total"><span>Total score</span><b>${state.score}</b></div>`;
  confetti();
  renderLevelGrids();
  announce(`Level complete! ${stars} stars, ${state.score} points.`);
}

/** Level complete, callable from the screenshot staging (same real path). */
export function completeLevelForShot() {
  levelComplete();
}

/** Hero preview on the start screen: the beach scene with 3 circles. */
function drawHero() {
  const hero = $('heroCanvas');
  if (!hero) return;
  const ctx = hero.getContext('2d');
  const scene = SCENES[0];
  const level = buildLevel(scene, 1, 6);
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  scene.draw(ctx, level.mods);
  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i += 1) {
    const d = level.diffs[i];
    ctx.beginPath();
    ctx.arc(d.x, d.y, Math.max(d.r + 6, 26), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function gameOver(reason) {
  sfx.lose();
  if (state.score > 0) {
    recordScore(state.save, { score: state.score, level: state.scene.name, mode: state.mode, date: new Date().toISOString().slice(0, 10) });
  }
  updateHud();
  showScreen('over');
  $('overTitle').textContent = reason;
  $('overScore').textContent = `${state.score} points · ${state.found.size}/${state.level.diffs.length} found`;
  renderLevelGrids();
  announce(`Game over. ${reason}`);
}

// --- HUD --------------------------------------------------------------------
function updateHud() {
  $('levelName').textContent = state.mode === 'daily' ? `Daily · ${state.scene.name}` : `Level ${state.levelIndex + 1} · ${state.scene.name}`;
  $('scoreVal').textContent = state.score;
  $('timeVal').textContent = state.mode === 'zen' ? '∞' : `${Math.ceil(state.timeLeft)}s`;
  $('timeVal').classList.toggle('low', state.mode !== 'zen' && state.timeLeft <= 10);
  $('livesVal').textContent = state.mode === 'zen' ? '∞' : '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives));
  $('foundVal').textContent = `${state.found.size}/${state.level.diffs.length} found`;
  $('hintBtn').textContent = `💡 Hint (−30)`;
}

function announce(text) {
  $('status').textContent = text;
}

// --- particles, rings, confetti (fx canvas) ----------------------------------
function burst(x, y) {
  const colors = ['#f6b93b', '#f472b6', '#4ade80', '#3b82f6', '#f97316'];
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 60 + Math.random() * 140;
    state.particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 40,
      life: 0.7 + Math.random() * 0.3,
      t: 0,
      color: colors[i % colors.length],
      r: 2.5 + Math.random() * 3,
    });
  }
}

function confetti() {
  const rect = $('panelsWrap').getBoundingClientRect();
  const colors = ['#f6b93b', '#f472b6', '#4ade80', '#3b82f6', '#f97316', '#a855f7'];
  const rng = mulberry32(state.seed + 99);
  for (let i = 0; i < 130; i += 1) {
    // In shot mode the frame is frozen, so spread the pieces across the
    // picture instead of starting them above it.
    const startY = state.shotMode ? rng() * rect.height : -20 - rng() * 120;
    state.particles.push({
      x: rng() * rect.width,
      y: startY,
      vx: state.shotMode ? 0 : (rng() - 0.5) * 60,
      vy: state.shotMode ? 0 : 90 + rng() * 120,
      life: 2.2 + rng() * 0.8,
      t: 0,
      color: colors[i % colors.length],
      r: 3 + rng() * 4,
      rect: rng() > 0.5,
    });
  }
}

function floatText(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-score';
  el.textContent = text;
  const wrap = $('panelsWrap').getBoundingClientRect();
  const panel = panelL.getBoundingClientRect();
  el.style.left = `${panel.left - wrap.left + (x / SCENE_W) * panel.width}px`;
  el.style.top = `${panel.top - wrap.top + (y / SCENE_H) * panel.height}px`;
  $('floatLayer').appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

let comboTimer = null;
function showCombo() {
  const el = $('comboToast');
  el.textContent = state.combo >= 3 ? `COMBO x2! ${state.combo} in a row` : `Combo x${state.combo}`;
  el.classList.add('show');
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => el.classList.remove('show'), 1200);
}

// --- screens ------------------------------------------------------------------
const SCREENS = ['startScreen', 'levelsScreen', 'howtoModal', 'pauseModal', 'completeModal', 'overModal'];
function showScreen(name) {
  state.screen = name;
  $('hud').classList.toggle('hidden', name === 'start' || name === 'levels');
  $('stage').classList.toggle('hidden', name === 'start' || name === 'levels');
  for (const id of SCREENS) $(id).classList.add('hidden');
  if (name === 'start') $('startScreen').classList.remove('hidden');
  if (name === 'levels') $('levelsScreen').classList.remove('hidden');
  if (name === 'pause') $('pauseModal').classList.remove('hidden');
  if (name === 'complete') $('completeModal').classList.remove('hidden');
  if (name === 'over') $('overModal').classList.remove('hidden');
  if (name === 'play') {
    state.paused = false;
    sizeFx();
  }
}

// --- level select ---------------------------------------------------------------
function thumbFor(scene, seed) {
  const c = document.createElement('canvas');
  c.width = 168;
  c.height = 126;
  const ctx = c.getContext('2d');
  ctx.scale(168 / SCENE_W, 126 / SCENE_H);
  scene.draw(ctx, {});
  return c;
}

function renderLevelGrids() {
  const grids = [
    { id: 'levelGrid', scenes: SCENES.slice(0, 6) },
    { id: 'levelsGrid', scenes: SCENES },
  ];
  for (const { id, scenes } of grids) {
    const grid = $(id);
    grid.innerHTML = '';
    scenes.forEach((scene) => {
      const i = SCENES.indexOf(scene);
      const stars = state.save.stars[String(i)] || 0;
      const locked = i > 0 && !(state.save.stars[String(i - 1)] >= 1);
      const card = document.createElement('button');
      card.className = `level-card${locked ? ' locked' : ''}`;
      card.disabled = locked;
      card.setAttribute('aria-label', `${scene.name}, ${stars} stars${locked ? ', locked' : ''}`);
      card.appendChild(thumbFor(scene, i * 7919 + 7));
      const name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = `${i + 1}. ${scene.name}`;
      card.appendChild(name);
      const starRow = document.createElement('span');
      starRow.className = 'level-stars';
      starRow.textContent = locked ? '🔒' : '★'.repeat(stars) + '☆'.repeat(3 - stars);
      card.appendChild(starRow);
      card.addEventListener('click', () => {
        sfx.unlock();
        sfx.click();
        startLevel(i, 'attack');
      });
      grid.appendChild(card);
    });
  }
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = $('leaderboardList');
  const top = state.save.leaderboard.slice(0, 5);
  list.innerHTML = top.length === 0
    ? '<li>No scores yet — be the first!</li>'
    : top.map((e, i) => `<li><b>#${i + 1}</b> ${e.score} pts · ${e.level} · ${e.mode}</li>`).join('');
}

// --- modes -----------------------------------------------------------------------
function startDaily() {
  const { key, seed } = dailySeed();
  const levelIndex = seed % SCENES.length;
  startLevel(levelIndex, 'daily', seed);
  $('dailyNote').textContent = `Daily challenge · ${key} · same scene for everyone today`;
}

// --- input wiring ------------------------------------------------------------------
function wirePanels() {
  for (const [canvas, off] of [[panelL, offL], [panelR, offR]]) {
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        state.lensHeld = true;
        const p = toSceneCoords(canvas, e.clientX, e.clientY);
        lens.showAt(e.clientX, e.clientY, off, p.x, p.y);
        e.preventDefault();
        return;
      }
      sfx.unlock();
      const p = toSceneCoords(canvas, e.clientX, e.clientY);
      onPick(p.x, p.y, e.clientX, e.clientY);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!state.lensHeld) return;
      const p = toSceneCoords(canvas, e.clientX, e.clientY);
      lens.showAt(e.clientX, e.clientY, off, p.x, p.y);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  window.addEventListener('pointerup', () => {
    state.lensHeld = false;
    lens.hide();
  });
  $('lensBtn').addEventListener('click', () => {
    state.lensHeld = !state.lensHeld;
    if (!state.lensHeld) lens.hide();
    $('lensBtn').classList.toggle('active', state.lensHeld);
  });
}

function wireKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (state.screen === 'play') {
      const step = e.shiftKey ? 8 : 24;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        state.kbd.visible = true;
        if (e.key === 'ArrowLeft') state.kbd.x = Math.max(10, state.kbd.x - step);
        if (e.key === 'ArrowRight') state.kbd.x = Math.min(SCENE_W - 10, state.kbd.x + step);
        if (e.key === 'ArrowUp') state.kbd.y = Math.max(10, state.kbd.y - step);
        if (e.key === 'ArrowDown') state.kbd.y = Math.min(SCENE_H - 10, state.kbd.y + step);
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        state.kbd.visible = true;
        onPick(state.kbd.x, state.kbd.y, 0, 0);
        e.preventDefault();
      } else if (e.key === 'h' || e.key === 'H') {
        useHint();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    } else if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && state.screen === 'pause') {
      togglePause();
    }
  });
}

function togglePause() {
  if (state.screen === 'play') {
    state.paused = true;
    showScreen('pause');
    announce('Paused.');
  } else if (state.screen === 'pause') {
    state.paused = false;
    showScreen('play');
    announce('Resumed.');
  }
}

function toggleSound() {
  state.save.sound = !state.save.sound;
  sfx.setEnabled(state.save.sound);
  storeSave(state.save);
  $('soundBtn').textContent = state.save.sound ? '🔊 Sound' : '🔇 Muted';
  $('startSoundBtn').textContent = state.save.sound ? '🔊 Sound on' : '🔇 Muted';
}

function toggleColorblind() {
  state.save.colorblind = !state.save.colorblind;
  storeSave(state.save);
  document.body.classList.toggle('colorblind', state.save.colorblind);
  $('cbBtn').textContent = state.save.colorblind ? '👁 CB on' : '👁 CB off';
  if (state.screen === 'play') drawPanels();
}

// --- buttons -----------------------------------------------------------------------
function wireButtons() {
  $('playBtn').addEventListener('click', () => {
    sfx.unlock();
    sfx.click();
    const next = SCENES.findIndex((_, i) => !(state.save.stars[String(i)] >= 1));
    startLevel(next === -1 ? 0 : next, 'attack');
  });
  $('zenBtn').addEventListener('click', () => {
    sfx.unlock();
    sfx.click();
    startLevel(0, 'zen');
  });
  $('dailyBtn').addEventListener('click', () => {
    sfx.unlock();
    sfx.click();
    startDaily();
  });
  $('howtoBtn').addEventListener('click', () => {
    sfx.click();
    $('howtoModal').classList.remove('hidden');
  });
  $('howtoCloseBtn').addEventListener('click', () => {
    sfx.click();
    $('howtoModal').classList.add('hidden');
  });
  $('levelsBtn').addEventListener('click', () => {
    sfx.click();
    renderLevelGrids();
    showScreen('levels');
  });
  $('seeAllBtn').addEventListener('click', () => {
    sfx.click();
    renderLevelGrids();
    showScreen('levels');
  });
  $('levelsBackBtn').addEventListener('click', () => {
    sfx.click();
    showScreen('start');
  });
  $('hintBtn').addEventListener('click', useHint);
  $('pauseBtn').addEventListener('click', togglePause);
  $('soundBtn').addEventListener('click', toggleSound);
  $('startSoundBtn').addEventListener('click', toggleSound);
  $('cbBtn').addEventListener('click', toggleColorblind);
  $('menuBtn').addEventListener('click', () => {
    sfx.click();
    showScreen('start');
    renderLevelGrids();
  });
  $('resumeBtn').addEventListener('click', togglePause);
  $('restartBtn').addEventListener('click', () => {
    sfx.click();
    startLevel(state.levelIndex, state.mode);
  });
  $('quitBtn').addEventListener('click', () => {
    sfx.click();
    showScreen('start');
    renderLevelGrids();
  });
  $('nextBtn').addEventListener('click', () => {
    sfx.click();
    const next = (state.levelIndex + 1) % SCENES.length;
    startLevel(next, state.mode === 'daily' ? 'attack' : state.mode);
  });
  $('replayBtn').addEventListener('click', () => {
    sfx.click();
    startLevel(state.levelIndex, state.mode);
  });
  $('completeLevelsBtn').addEventListener('click', () => {
    sfx.click();
    renderLevelGrids();
    showScreen('levels');
  });
  $('retryBtn').addEventListener('click', () => {
    sfx.click();
    startLevel(state.levelIndex, state.mode);
  });
  $('overLevelsBtn').addEventListener('click', () => {
    sfx.click();
    renderLevelGrids();
    showScreen('levels');
  });
}

// --- game loop -----------------------------------------------------------------------
let lastFrame = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (state.screen === 'play' && !state.paused && !state.shotMode) {
    if (state.mode !== 'zen') {
      state.timeLeft -= dt;
      const sec = Math.ceil(state.timeLeft);
      if (sec !== state.lastTickSecond) {
        state.lastTickSecond = sec;
        if (sec <= 10 && sec > 0) sfx.tick();
        updateHud();
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        updateHud();
        gameOver("Time's up!");
      }
    }
  }
  drawFx(dt);
  requestAnimationFrame(loop);
}

function drawFx(dt) {
  const rect = $('panelsWrap').getBoundingClientRect();
  if (rect.width === 0) return;
  // The stage is hidden on the start screen, so the fx canvas starts at
  // 0x0; resize it the first time the play stage is actually visible.
  if (fx.width !== Math.round(rect.width * dpr) || fx.height !== Math.round(rect.height * dpr)) sizeFx();
  ctxFx.clearRect(0, 0, rect.width, rect.height);
  // rings (expanding circles on finds / wrong clicks)
  // In shot mode the frame is frozen, so rings stay at their staged size.
  state.rings = state.rings.filter((r) => r.t < 0.6);
  for (const r of state.rings) {
    if (!state.shotMode) r.t += dt;
    const panel = panelL.getBoundingClientRect();
    const scale = panel.width / SCENE_W;
    const cx = panel.left - rect.left + r.x * scale;
    const cy = panel.top - rect.top + r.y * scale;
    const pr = (r.t / 0.6) * 46 + 10;
    ctxFx.save();
    ctxFx.globalAlpha = 1 - r.t / 0.6;
    ctxFx.strokeStyle = r.wrong ? '#ef4444' : markerColor();
    ctxFx.lineWidth = 4;
    ctxFx.beginPath();
    ctxFx.arc(cx, cy, pr, 0, Math.PI * 2);
    ctxFx.stroke();
    ctxFx.restore();
    // mirror on the right panel
    const panelRRect = panelR.getBoundingClientRect();
    const cx2 = panelRRect.left - rect.left + r.x * scale;
    ctxFx.save();
    ctxFx.globalAlpha = 1 - r.t / 0.6;
    ctxFx.strokeStyle = r.wrong ? '#ef4444' : markerColor();
    ctxFx.lineWidth = 4;
    ctxFx.beginPath();
    ctxFx.arc(cx2, cy, pr, 0, Math.PI * 2);
    ctxFx.stroke();
    ctxFx.restore();
  }
  // particles (frozen in shot mode so the frame is deterministic)
  state.particles = state.particles.filter((p) => p.t < p.life);
  for (const p of state.particles) {
    if (!state.shotMode) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
    }
    const a = 1 - p.t / p.life;
    ctxFx.save();
    ctxFx.globalAlpha = a;
    ctxFx.fillStyle = p.color;
    if (p.rect) ctxFx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r * 0.7);
    else {
      ctxFx.beginPath();
      ctxFx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctxFx.fill();
    }
    ctxFx.restore();
  }
  // keyboard cursor (same spot on both panels)
  if (state.kbd.visible && state.screen === 'play') {
    const panel = panelL.getBoundingClientRect();
    const scale = panel.width / SCENE_W;
    for (const p of [panelL, panelR]) {
      const r = p.getBoundingClientRect();
      const cx = r.left - rect.left + state.kbd.x * scale;
      const cy = r.top - rect.top + state.kbd.y * scale;
      ctxFx.save();
      ctxFx.strokeStyle = '#8a5a3b';
      ctxFx.lineWidth = 2.5;
      ctxFx.setLineDash([5, 4]);
      ctxFx.beginPath();
      ctxFx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctxFx.stroke();
      ctxFx.restore();
    }
  }
}

// --- bootstrap -----------------------------------------------------------------------
function init() {
  sfx.setEnabled(state.save.sound);
  document.body.classList.toggle('colorblind', state.save.colorblind);
  $('soundBtn').textContent = state.save.sound ? '🔊 Sound' : '🔇 Muted';
  $('startSoundBtn').textContent = state.save.sound ? '🔊 Sound on' : '🔇 Muted';
  $('cbBtn').textContent = state.save.colorblind ? '👁 CB on' : '👁 CB off';
  sizeFx();
  window.addEventListener('resize', () => {
    sizeFx();
    if (state.screen === 'play') drawPanels();
  });
  wirePanels();
  wireKeyboard();
  wireButtons();
  renderLevelGrids();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    state.shotMode = true;
    const seed = Number(params.get('seed') || '1');
    stageShot(shot, seed, {
      state,
      startLevel,
      showScreen,
      updateHud,
      drawPanels,
      renderLevelGrids,
      drawHero,
      completeLevelForShot,
    });
  } else {
    showScreen('start');
    drawHero();
  }
  requestAnimationFrame(loop);
  // Test handle for automated playtests (not a cheat: it only exposes state).
  window.__spot = {
    state,
    startLevel,
    useHint,
    togglePause,
    onPick,
    save: state.save,
  };
}

document.addEventListener('DOMContentLoaded', init);
