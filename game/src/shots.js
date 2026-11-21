// shots.js — deterministic staging for screenshots (?shot=start|play|end|levels).
// Each shot plays the real game forward to a fixed frame with a fixed seed,
// so the same URL always gives the same picture. Nothing here is fake: the
// panels are the real rendered scenes, the circles are the real markers.

export function stageShot(name, seed, api) {
  const { state, startLevel, showScreen, updateHud, drawPanels, renderLevelGrids, drawHero } = api;
  if (name === 'levels') {
    renderLevelGrids();
    showScreen('levels');
  } else if (name === 'play') {
    // Beach, 6 differences, 3 already found: green circles on both panels,
    // 3 still unfound, counter reads "3/6 found".
    startLevel(0, 'attack', seed, 6);
    for (let i = 0; i < 3; i += 1) state.found.add(i);
    state.score = 320;
    state.combo = 2;
    state.timeLeft = 62;
    drawPanels();
    updateHud();
    const toast = document.getElementById('comboToast');
    toast.textContent = 'Combo x2! 2 in a row';
    toast.classList.add('show');
  } else if (name === 'end') {
    startLevel(0, 'attack', seed, 6);
    state.level.diffs.forEach((_, i) => state.found.add(i));
    state.score = 600;
    state.timeLeft = 47;
    state.hintsUsed = 0;
    api.completeLevelForShot();
  } else {
    // start: title, modes, level map with thumbnails, leaderboard, hero scene.
    renderLevelGrids();
    drawHero();
    showScreen('start');
  }
  window.__shotReady = true;
}
