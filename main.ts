// Cozy Hunt — hand-in program for the make.fun spot-the-difference bounty.
//
// The game itself is plain static files in game/ (index.html plus its ES
// modules and stylesheet), playable offline in a desktop browser with no
// build step. This program is what the grader runs: it gathers game/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json, the summary the judge reads, using the vendored make.fun
// library. Node 22, standard library only.
//
// Local check: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The gate's caps: text_max_bytes is the only one that shapes the dossier's
// bytes; the rest refuse an entry the scorer would refuse anyway (more than
// 4 screenshots, one over 256 KiB, more than 993 files or 48 MiB of game
// files, or a game path over 1000 bytes).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
