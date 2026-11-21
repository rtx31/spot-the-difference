// engine.js — the Difference Engine.
// One scene description draws both panels; the variant is the same drawing
// with a few `mods` applied. That guarantees every difference is findable
// and the two pictures line up pixel-perfect — there are never two images.

/** Small deterministic PRNG (mulberry32). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `diffCount` slots from a scene (seeded shuffle, anchors kept at least
 * 64px apart so two differences never overlap) and build the variant mods.
 * Returns { mods, diffs } where each diff carries its hit zones.
 */
export function buildLevel(scene, seed, diffCount) {
  const rng = mulberry32(seed);
  const order = [...scene.slots];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const picked = [];
  for (const slot of order) {
    if (picked.length >= diffCount) break;
    if (picked.some((p) => Math.hypot(p.x - slot.x, p.y - slot.y) < 64)) continue;
    picked.push(slot);
  }
  // Extremely small scenes could run out of spaced slots; fill up anyway.
  for (const slot of order) {
    if (picked.length >= diffCount) break;
    if (!picked.includes(slot)) picked.push(slot);
  }
  const mods = {};
  const diffs = picked.map((slot) => {
    mods[slot.id] = slot.alt;
    return {
      x: slot.x,
      y: slot.y,
      r: slot.r,
      tier: slot.tier,
      kind: slot.kind,
      label: slot.label,
      zones: slot.zones || [{ x: slot.x, y: slot.y, r: slot.r }],
    };
  });
  return { mods, diffs };
}

/**
 * Hit test in scene coordinates. A difference counts when the click lands
 * within its radius, with a minimum tolerance of 22px so small hard
 * differences are still fair to tap. Returns the diff index or -1.
 */
export function hitTest(diffs, found, x, y) {
  for (let i = 0; i < diffs.length; i += 1) {
    if (found.has(i)) continue;
    const d = diffs[i];
    for (const z of d.zones) {
      if (Math.hypot(x - z.x, y - z.y) <= Math.max(z.r, 22)) return i;
    }
  }
  return -1;
}

/** Stars for a finished level: 3 is a clean, fast run. */
export function starsForLevel({ mode, timeLeft, hintsUsed }) {
  if (mode === 'zen') {
    if (hintsUsed === 0) return 3;
    if (hintsUsed === 1) return 2;
    return 1;
  }
  if (hintsUsed === 0 && timeLeft >= 40) return 3;
  if (timeLeft >= 15) return 2;
  return 1;
}

/** Points for one find: 100 base, combo adds 25 per step, 3+ in a row doubles. */
export function pointsForFind(combo) {
  const base = 100 + Math.max(0, combo - 1) * 25;
  return combo >= 3 ? base * 2 : base;
}
