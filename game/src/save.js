// save.js — progress, stars, scores and settings in localStorage.
// One key, one JSON object, nothing else leaves the browser.

const KEY = 'cozy-spot-save-v1';

function blank() {
  return {
    stars: {}, // levelId -> 1..3
    best: {}, // levelId -> best score
    sound: true,
    colorblind: false,
    leaderboard: [], // {score, level, mode, date}
    daily: {}, // 'YYYY-MM-DD' -> {score, found, total}
    played: 0,
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return { ...blank(), ...parsed };
  } catch {
    return blank();
  }
}

export function storeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Storage full or blocked (private mode): the game still plays.
  }
}

/** Record stars for a level (keeps the best) and the best score. */
export function recordLevel(save, levelId, stars, score) {
  save.stars[levelId] = Math.max(save.stars[levelId] || 0, stars);
  save.best[levelId] = Math.max(save.best[levelId] || 0, score);
  save.played += 1;
  storeSave(save);
}

/** Add a score to the local leaderboard (top 8 kept). */
export function recordScore(save, entry) {
  save.leaderboard.push(entry);
  save.leaderboard.sort((a, b) => b.score - a.score);
  save.leaderboard = save.leaderboard.slice(0, 8);
  storeSave(save);
}

/** Seeded daily challenge: same scene + diffs for everyone on the same day. */
export function dailySeed(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  let seed = 0;
  for (let i = 0; i < key.length; i += 1) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  return { key, seed };
}
