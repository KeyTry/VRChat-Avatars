// ============================================================
// engine.js — per-frame context, defaults, camera, scene timeline
// ============================================================
const SCENES = [];
function scene(t0, t1, name, frame, chapter) { SCENES.push({ t0, t1, name, frame, chapter }); }

const PATH0 = new Float32Array(32);
function defaults() {
  const fog = [.02, .014, .06];
  return {
    draw3D: true, bg: [0, 0, 0],
    sky: { uMode: 0, uTop: [.008, .01, .045], uHor: [.06, .03, .13], uGlow: [.55, .2, .6], uGlowAmt: .45, uStars: 1, uMilky: 0,
      uSunDir: [0, .08, 1], uSun: 0, uSunCol: [1, .55, .3], uSwirl: 0, uRays: 0, uVent: 0, uPlanetC: [0, 0, 0], uPlanetR: 1000, uDawn: 0, uCityLights: 1 },
    ground: { on: true, uFog: fog, uFogDen: .00042, uRoad: 1, uTrail: 1, uTrailLen: 14, uTrailSpeed: 30, uSched: 1, uGrid: 0, uCity: 1, uWater: 0, uRing: 0,
      uGridCol: [.2, .6, 1], uHeadCol: [.85, .95, 1], uTailCol: [1, .12, .35], uRingCol: [.3, .8, 1], uWave: [0, 0, -1e4, 10], uWaveCol: [.3, .85, 1], uWaveMan: 0,
      uLyre: [0, 0, 0], uLyreCol: [1, .2, .8], uPath: PATH0, uPathAmt: 0, uPathN: 0, uSunDir: [0, .08, 1], uSunCol: [1, .55, .3], uSun: 0, uRipT: -1, uRipC: [0, 0] },
    city: { on: true, uWinA: [.35, .72, 1], uWinB: [1, .2, .8], uFacade: [.022, .026, .065], uEdgeCol: [.25, .55, 1], uFog: fog, uFogDen: .00042,
      uLit: .6, uSched: 1, uOff: 0, uMixB: 0, uEdge: .12, uHue: 0, uBright: 1, uWarm: .28, uPulse: 0, uWave: [0, 0, -1e4, 10], uWaveCol: [.3, .85, 1],
      uMixC: [0, 0, -1], uLyre: [0, 0, 0], uPath: PATH0, uPathAmt: 0, uPathN: 0, uRoofAmt: 0, uRoofR: [-700, -700, 1400, 1400], uTwist: 0, uTwistC: [0, 0], uRise: 1, uLift: 0 },
    body: { on: false, u: { uWinA: [.45, .85, 1], uWinB: [1, .25, .85], uFacade: [.03, .04, .13], uEdgeCol: [.45, .85, 1], uLit: .9, uSched: 1, uOff: 0, uMixB: 0, uEdge: .55,
      uBright: 1.25, uTwist: 0, uRise: 1, uLift: 0, uMixC: [0, 0, -1], uPathAmt: 0, uWarm: 0, uRoofAmt: 0, uHue: 0, uPulse: 0, uFogDen: .0004 } },
    parts: { on: false, uMode: 0, uBox: [400, 200, 400], uVel: [0, 0, 0], uCenter: [0, 0, 0], uSize: 1, uStreak: 0, uSpin: 1, uCol1: [.5, .8, 1], uCol2: [1, .3, .85], uAmt: .5 },
    post: { fb: 0, fbZoom: 1, fbRot: 0, fbHue: 0, fbMode: 0, fbShift: [0, 0], kal: 0, kalMix: 1, glitch: 0, glSeed: 0, warp: 0, mirror: 0, bleed: 0, pix: 0,
      chroma: .6, bloom: .9, bloomThr: .5, sceneSat: 1, sceneDim: 1, exposure: 1, contrast: 1.05, sat: 1.12, invert: 0, flash: 0, flashCol: [1, 1, 1], scan: .06, vig: .55, grain: .045, fade: 0, tint: [1, 1, 1], lift: [0, 0, 0] },
  };
}

// camera & projection
function setCam(F, pos, target, fov = 50, roll = 0, near = 1.5, far = 16000) {
  let up = [0, 1, 0];
  const fwd = V.norm(V.sub(target, pos));
  if (Math.abs(fwd[1]) > .995) up = [0, 0, -1];
  if (roll) { const r0 = V.norm(V.cross(fwd, up)); const u0 = V.cross(r0, fwd); up = V.add(V.mul(u0, Math.cos(roll)), V.mul(r0, Math.sin(roll))); }
  const view = M4.lookAt(pos, target, up);
  const proj = M4.persp(fov * Math.PI / 180, VW / VH, near, far);
  const vp = M4.mul(proj, view);
  const right = [view[0], view[4], view[8]], upv = [view[1], view[5], view[9]];
  F.cam = { pos, target, fov, vp, invVP: M4.invert(vp), right, up: upv, proj: proj[5], fwd };
}
function project(F, p) {
  const m = F.cam.vp; const x = p[0], y = p[1], z = p[2];
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw < .5) return { vis: false, x: 0, y: 0, s: 0, w: cw };
  return { vis: true, x: (cx / cw * .5 + .5) * VW, y: (1 - (cy / cw * .5 + .5)) * VH, s: F.cam.proj * (VH / 2) / cw, w: cw };
}
const orbitPos = (c, r, h, a) => [c[0] + Math.cos(a) * r, h, c[2] + Math.sin(a) * r];
function shake(F, amt, t) { const p = F.cam.pos, tg = F.cam.target; return [[p[0] + noise1(t * 23) * amt, p[1] + noise1(t * 29 + 5) * amt, p[2] + noise1(t * 19 + 9) * amt], tg]; }

// frequently used looks
function night(F, o = {}) {
  F.sky.uStars = o.stars ?? 1; F.city.uLit = o.lit ?? .62;
  F.ground.uTrail = o.trail ?? 1;
}
function setPath(F, pts, amt) {
  const a = new Float32Array(32); const n = Math.min(16, pts.length);
  for (let i = 0; i < n; i++) { a[i * 2] = pts[i][0]; a[i * 2 + 1] = pts[i][1]; }
  F.ground.uPath = a; F.city.uPath = a; F.ground.uPathN = n; F.city.uPathN = n; F.ground.uPathAmt = amt; F.city.uPathAmt = amt;
}
function cutIn(F, lt, amt = .6, col = [1, 1, 1], d = .12) { F.post.flash = Math.max(F.post.flash, amt * Math.exp(-lt / d)); F.post.flashCol = col; }
function kickFx(F, t, amt = 1) { const k = kick(t); F.post.chroma += k * 1.2 * amt; F.city.uPulse += k * .5 * amt; return k; }
// standard corner HUD
function hud(F, label, o = {}) {
  const g = F.g, t = F.t, col = o.col || '#5ff2ff', a = o.a ?? .85;
  g.save(); g.globalAlpha = a;
  D2.txt(g, label, 36, 44, { size: 14, color: col, ls: 3 });
  D2.txt(g, o.sub || 'GYRE // MUNICIPAL COGNITION', 36, 64, { size: 11, color: col, ls: 2, alpha: .7 });
  const s = Math.floor(t); D2.txt(g, `T+${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`, VW - 36, 44, { size: 13, color: col, align: 'right', ls: 2 });
  if (!o.noFrame) { D2.brackets(g, 20, 20, VW - 40, VH - 40, col, 22, 1.5); }
  g.restore();
}
function clock(t0, add) { // "19:00:00" style clock starting at t0 seconds of day
  const s = Math.floor(t0 + add); return `${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
// placing LYRE in 3D space: returns screen info and draws her
function lyreAt(F, wpos, heightM, o = {}) {
  const pr = project(F, wpos);
  if (!pr.vis) return pr;
  drawLyre(F.g, Object.assign({ x: pr.x, y: pr.y, s: pr.s * heightM, t: F.t }, o));
  return pr;
}

// ============================================================
// frame driver
// ============================================================
const Engine = {
  over: null, g: null, roof: null, rg: null, lastT: -1, off: null,
  init(overCanvas) {
    this.over = overCanvas; this.g = overCanvas.getContext('2d');
    this.roof = document.createElement('canvas'); this.roof.width = 128; this.roof.height = 128; this.rg = this.roof.getContext('2d');
    this.off = document.createElement('canvas');
  },
  sceneAt(t) { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].t0) return SCENES[i]; return SCENES[0]; },
  // build a frame for time t; returns the render state for GLR
  frame(t, opts = {}) {
    const F = defaults();
    F.t = t; F.dt = this.lastT < 0 ? 0 : t - this.lastT; F.seek = Math.abs(F.dt) > .25; this.lastT = t;
    const g = this.g; const cw = this.over.width, ch = this.over.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cw, ch);
    g.setTransform(cw / VW, 0, 0, ch / VH, 0, 0);
    F.g = g; F.L = GLR.lines; F.B = GLR.body; F.rg = this.rg; F.roofDirty = false; F.off = this.off;
    GLR.lines.reset(); GLR.body.reset();
    setCam(F, [0, 800, 1200], [0, 0, 0], 50);
    const sc = opts.forceScene || this.sceneAt(t);
    F.scene = sc; F.lt = t - sc.t0; F.p = clamp(F.lt / (sc.t1 - sc.t0));
    if (sc !== this.lastScene) { this.lastScene = sc; if (!opts.keepFb) GLR.clearFeedback(); }
    g.save();
    sc.frame(F);
    g.restore();
    // always touch the overlay so the browser flushes it (an otherwise cleared canvas can upload a stale frame)
    g.fillStyle = 'rgba(0,0,0,0.004)'; g.fillRect(0, 0, 1, 1);
    if (F.roofDirty) GLR.uploadRoof(this.roof);
    // safety limits for the reduced-flash option
    if (Engine.reduceFlash) { F.post.flash = Math.min(F.post.flash, .25); F.post.glitch = Math.min(F.post.glitch, .25); F.post.invert = Math.min(F.post.invert, .15); F.post.chroma = Math.min(F.post.chroma, 2.5); }
    F.post.glSeed = F.post.glSeed || Math.floor(t * 12);
    F.hasOverlay = true;
    F.tr = F.tFreeze === undefined ? t : F.tFreeze;
    return F;
  },
  // render another scene at another time into the current frame (used by the montage)
  borrow(F, t) {
    const sc = this.sceneAt(t);
    const saved = { t: F.t, lt: F.lt, p: F.p, scene: F.scene };
    F.t = t; F.lt = t - sc.t0; F.p = clamp(F.lt / (sc.t1 - sc.t0)); F.scene = sc;
    sc.frame(F);
    Object.assign(F, saved);
  },
};
