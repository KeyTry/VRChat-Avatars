# FIRST NIGHT ALIVE: music video

A 10-minute fan music video for Cacola's *FIRST NIGHT ALIVE* (Azazil-X), rendered live in the browser with WebGL 2 and Canvas 2D.

- `dist/first-night-alive.html` is the finished single-file page. Open it and load your own copy of the track (MP3). The audio isn't bundled. To skip that step when running it locally, save your copy as `dist/first-night-alive.mp3` and the page picks it up automatically. `.gitignore` keeps it out of commits.
- `src/` holds the sources. `python3 build.py` concatenates them into `dist/`.
  - `data.js`: a baked analysis of the track (8 loudness envelopes at 30 fps plus kick and snare times). It's derived data, not audio.
  - `core.js`: math, noise, envelope access, cue sheet (every timestamp measured from the track).
  - `city.js`, `gl.js`: procedural city, instanced blocks, ground, glow lines, particles, post chain (feedback, bloom, chroma, glitch).
  - `draw2d.js`: LYRE (the song construct), HUD kit, GYRE's eye.
  - `giant.js`: GYRE's giant body, assembled from city blocks.
  - `engine.js`, `scenes1.js`, `scenes2.js`: the timeline, about 60 shots.
  - `app.js`, `page.html`: the player UI, audio clock, chapters and local caching.
- `tools/` holds the analysis scripts: stem separation with Demucs, kick and snare extraction, and envelope baking.

Keys: Space play or pause, arrow keys seek 5 s, F fullscreen, `[` and `]` nudge the audio sync by 20 ms.
