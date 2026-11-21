# spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rtx31/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rtx31/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Cozy Hunt** — a spot-the-difference game with 12 hand-drawn scenes, a zoom lens for the really tiny differences, three modes, stars, and a local leaderboard. Every picture is drawn in code with Canvas 2D — no images, no fonts, no network. It plays fully offline from its own files.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Any static server works too:

```sh
python3 -m http.server --directory game
# or: npx serve game
```

## How to play

- Two pictures sit side by side. They look identical — but **5–7 differences** are hiding.
- Click a difference on **either** picture: green circle, pop sound, **+100 points**.
- Find 3 quickly in a row for a **combo x2**. Finish fast for a **time bonus**.
- Wrong click: **−5 seconds** and one life. 3 lives, 90 seconds per level.
- **Hint (−30 pts)** pulses a circle around one difference for 2 seconds.
- **Zoom lens:** hold the right mouse button on a picture to magnify it.
- Keyboard: arrow keys move the cursor, **Enter** picks, **H** hint, **P** pause, **M** mute.

## Features

- **12 scenes** — Beach Day, Space Station, Haunted House, Sushi Bar, Jungle, Cyberpunk City, Underwater, Coffee Shop, Farm Morning, Winter Cabin, Toy Room, Candy Shop.
- **Difference Engine** — each scene is drawn once in code; the second picture is the same drawing with a few mutations (remove, recolor, move, flip, resize, add, change text), so differences are always findable and pixel-perfect aligned.
- **3 modes** — Time Attack (90s, 3 lives), Zen (no timer, no lives), Daily Challenge (same scene for everyone, seeded by date).
- **Progression** — level-select map with scene thumbnails, 1–3 stars per level, next level unlocks at 1 star, progress saved in localStorage.
- **Feel** — particle bursts, expanding rings, floating scores, confetti, synthesized WebAudio sounds (no audio files), screen shake on wrong clicks.
- **Accessible** — click tolerance 22px, keyboard play, colorblind-friendly markers (differences never rely on color alone), no flashing.
- **Offline** — zero network requests; all art and sound are generated in code.

## Screenshots

Staged deterministically with `?shot=start|play|end|levels&seed=N` (see `shots.json`).
Regenerate them with the shot script in the kit, or open the URLs directly while serving locally.

---

<sub>Entered on [make.fun](https://make.fun/?ref=4gvpf9bn&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
