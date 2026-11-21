// audio.js — every sound is synthesized with WebAudio oscillators.
// No audio files, no network, nothing to download.

let audioCtx = null;
let enabled = true;
let masterGain = null;

function ensureCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** A short tone that slides from f1 to f2. */
function tone(f1, f2, dur, type, vol, delay = 0) {
  if (!enabled) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** Call once from a user gesture so the browser unlocks audio. */
  unlock() {
    ensureCtx();
  },
  setEnabled(value) {
    enabled = value;
  },
  isEnabled() {
    return enabled;
  },
  /** Happy pop when a difference is found. */
  pop() {
    tone(520, 940, 0.14, 'sine', 0.5);
    tone(780, 1180, 0.1, 'triangle', 0.25, 0.03);
  },
  /** Soft UI click. */
  click() {
    tone(660, 660, 0.06, 'sine', 0.25);
  },
  /** Dull thud for a wrong click. */
  thud() {
    tone(150, 60, 0.22, 'square', 0.35);
  },
  /** Sparkle when a hint is used. */
  hint() {
    tone(880, 880, 0.09, 'sine', 0.3);
    tone(1174, 1174, 0.12, 'sine', 0.3, 0.09);
  },
  /** Short tick when the timer is nearly out. */
  tick() {
    tone(980, 980, 0.05, 'sine', 0.18);
  },
  /** Level-complete arpeggio. */
  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => tone(n, n, 0.22, 'triangle', 0.35, i * 0.11));
    tone(1318, 1318, 0.4, 'sine', 0.25, 0.48);
  },
  /** Game-over descending notes. */
  lose() {
    const notes = [392, 330, 262];
    notes.forEach((n, i) => tone(n, n * 0.94, 0.25, 'triangle', 0.3, i * 0.16));
  },
};
