// ============================================================
// scenes2.js — PART TWO (3:06–10:05): the words stop; the night begins.
// ============================================================
const SHORE_G = () => [-60, 0, coastZ(-60) - 34];
const SHORE_L = () => [115, 0, coastZ(115) - 34];

// ---------------- 3:06 FIRST NIGHT (schedule: none) ----------------
scene(T.night, T.run, 'First Night', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const root = SHORE_G();
  const close = t > 200.5;
  const J0 = GYRE.joints(GYRE.POSES.sit, root, 0, GSC);
  if (!close) setCam(F, [root[0] + 170 - lt * 3, 55, root[2] + 330], [root[0] - 40, 190 + lt * 3, root[2] - 80], 55);
  else setCam(F, V.add(J0.SR, [55 - (t - 200.5) * 1.2, 10, 38]), V.add(J0.SR, [-6, 10, -10]), 50);
  F.city.uOff = 1; F.city.uLit = .5; F.ground.uRoad = 0; F.ground.uTrail = 0; F.ground.uSched = 0; F.city.uEdge = .05;
  Object.assign(F.sky, { uStars: 2.4, uMilky: 1.1, uGlowAmt: .06, uHor: [.02, .03, .09], uTop: [.004, .006, .03] });
  const first = inv(T.firstLight, T.firstLight + .6, t);
  F.city.uLyre = [root[0] - 120, root[2] - 180, first * .05];
  const J = gyre(F, GYRE.POSES.sit, { root, halo: .35, visor: .7 });
  F.body.u.uLit = .35; F.body.u.uBright = .7; F.body.u.uEdge = .3;
  Object.assign(F.parts, { on: true, uMode: 0, uBox: [260, 160, 260], uSize: .9, uCol1: [.4, .8, 1], uCol2: [1, .35, .85], uAmt: .12 });
  const shoulder = V.add(J.SR, V.mul(J.upv, 3));
  lyreAt(F, shoulder, LYRE_H, { pose: LP.sit(t), sway: .2 });
  F.post.fade = 1 - ease.io(inv(3.4, 9, lt)); F.post.bloom = 1.05; F.post.grain = .06;
  const ha = inv(9, 11, lt) * (1 - inv(19, 21.5, lt));
  D2.txt(g, 'NIGHT CYCLE 00001', VW / 2, VH - 70, { size: 14, align: 'center', ls: 5, alpha: ha * .9 });
  D2.txt(g, 'SCHEDULE: NONE', VW / 2, VH - 46, { size: 12, align: 'center', ls: 5, color: '#ff9ae6', alpha: ha * .8 });
  if (close && t < 201) cutIn(F, t - 200.5, .15);
}, 'First Night');

// ---------------- 3:34 LIFT ----------------
const surfPath = u => [-420 + u * 980, 58 + 34 * Math.sin(u * 7.3) + 20 * Math.sin(u * 17), 60 + 260 * Math.sin(u * 3.1 + .4)];
scene(T.run, T.surf, 'Leap', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const root = SHORE_G();
  const up = ease.io(inv(1.2, 3.8, lt));
  const pose = GYRE.mixPose(GYRE.POSES.sit, GYRE.POSES.stand, up);
  const J = GYRE.joints(pose, root, 0, GSC);
  setCam(F, [root[0] + 300, 90, root[2] + 180], [root[0] - 60, 100, root[2] - 160], 56);
  night(F, { lit: .5 }); F.city.uOff = .6; F.ground.uRoad = .4;
  gyre(F, pose, { root, halo: .6 });
  const start = V.add(J.SR, [0, 4, 0]), land = [root[0] - 70, 0, root[2] - 250];
  const u = ease.io(inv(0, 1.6, lt));
  const p = V.lerp(start, land, u); p[1] = lerp(start[1], 0, u) + Math.sin(u * Math.PI) * 60;
  const trail = []; for (let k = 0; k < 14; k++) { const uu = ease.io(inv(0, 1.6, lt - k * .04)); const q = V.lerp(start, land, uu); q[1] = lerp(start[1], 0, uu) + Math.sin(uu * Math.PI) * 60; trail.push(q); }
  F.L.poly(trail, [1, .25, .85, 1], 5, [1, .6, .95, 0], 1);
  lyreAt(F, p, LYRE_H, { pose: u < 1 ? LP.fly(t) : LP.dance(t, T.run), vel: [2, -1], sway: .5 });
  const on = inv(1.5, 3.9, lt);
  F.city.uLyre = [land[0], land[2], on * 1.2]; F.ground.uLyre = [land[0], land[2], on * 2];
  cutIn(F, lt, .6, [1, .4, .9]); kickFx(F, t, .5);
}, 'Lift');
scene(T.surf, T.rise, 'Surf', F => {
  const t = F.t, lt = F.lt;
  const u = lt / (T.rise - T.surf);
  const p = surfPath(u), pa = surfPath(u + .02), pb = surfPath(u - .03);
  const dir = V.norm(V.sub(pa, p));
  setCam(F, V.add(V.sub(p, V.mul(dir, 26)), [0, 7, 0]), V.add(p, V.mul(dir, 40)), 66, Math.sin(t * 1.3) * .08);
  night(F, { lit: .3 }); F.city.uOff = .3;
  const hist = []; for (let k = 0; k < 16; k++) { const q = surfPath(u - k * .035); hist.push([q[0], q[2]]); }
  setPath(F, hist, 1.3);
  const ahead = []; for (let k = 0; k < 30; k++) ahead.push(surfPath(u + k * .004 - .004));
  F.L.poly(ahead, [1, .3, .85, .9], -2.2, [.5, .9, 1, 0], -.5);
  const behind = []; for (let k = 0; k < 40; k++) behind.push(surfPath(u - k * .004));
  F.L.poly(behind, [1, .5, .9, 1], -1.4, [1, .2, .6, 0], -.2);
  gyre(F, GYRE.walkPose(t, .8), { root: [-40 + u * 160, 0, 300], yaw: Math.PI * .5, halo: .8 });
  lyreAt(F, p, LYRE_H, { pose: LP.surf(t), vel: [0, 0], sway: .8 });
  F.post.fb = .45; F.post.bloom = 1.25; cutIn(F, lt, .4); kickFx(F, t, .6);
  F.ground.uTrailSpeed = 50;
}, 'Surf');
scene(T.rise, T.sky, 'Rise', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const u = inv(0, T.sky - T.rise, lt);
  const c = [150, 0, -250];
  const a = lt * 1.3, r = 60 - u * 20, y = 40 + ease.i(u) * 520;
  const p = [c[0] + Math.cos(a) * r, y, c[2] + Math.sin(a) * r];
  setCam(F, [c[0] + Math.cos(a - .5) * (r + 60), y - 25, c[2] + Math.sin(a - .5) * (r + 60)], [p[0], p[1] + 20, p[2]], 64);
  night(F, { lit: .55 }); F.city.uEdge = .3;
  const trail = []; for (let k = 0; k < 60; k++) { const aa = a - k * .05; const yy = 40 + ease.i(inv(0, T.sky - T.rise, lt - k * .05)) * 520; trail.push([c[0] + Math.cos(aa) * r, yy, c[2] + Math.sin(aa) * r]); }
  F.L.poly(trail, [1, .3, .85, 1], -1.4, [.4, .8, 1, 0], -.3);
  lyreAt(F, p, LYRE_H, { pose: LP.fly(t), vel: [0, -2], sway: .6 });
  // cloud layer around 380–440 m
  const cl = Math.exp(-Math.pow((y - 410) / 45, 2));
  Object.assign(F.parts, { on: true, uMode: 0, uBox: [900, 60, 900], uSize: 34, uCol1: [.035, .03, .08], uCol2: [.08, .03, .08], uAmt: .1 });
  F.post.lift = [cl * .12, cl * .1, cl * .16]; F.post.fb = .3 + cl * .3;
  cutIn(F, lt, .3); kickFx(F, t, .5);
}, 'Rise');
scene(T.sky, T.rewind, 'Above the Clouds', F => {
  const t = F.t, lt = F.lt;
  const J0 = GYRE.joints(GYRE.POSES.stand, GROOT, Math.PI, GSC);
  const head = J0.Hd; const a = lt * .22 + 2.2;
  setCam(F, [head[0] + Math.cos(a) * 230, head[1] + 40 + Math.sin(t * .3) * 10, head[2] + Math.sin(a) * 230], V.add(head, [0, 10, 0]), 55);
  night(F, { stars: 2 }); F.city.uLit = .5;
  Object.assign(F.sky, { uMilky: .8, uSunDir: V.norm([.3, .5, -1]), uSun: .35, uSunCol: [.6, .7, 1] });
  gyre(F, GYRE.POSES.stand, { yaw: Math.PI, halo: 1.2, visor: 1.4 });
  Object.assign(F.parts, { on: true, uMode: 0, uBox: [1400, 40, 1400], uSize: 48, uCol1: [.03, .025, .075], uCol2: [.075, .025, .07], uAmt: .14 });
  // LYRE loops around the head, leaving a gyre
  const pos = tt => { const aa = (tt - T.sky) * 1.4; return [head[0] + Math.cos(aa) * 70, head[1] + 30 + Math.sin((tt - T.sky) * 2.1) * 25, head[2] + Math.sin(aa) * 70]; };
  const trail = []; for (let k = 0; k < 70; k++) trail.push(pos(t - k * .04));
  F.L.poly(trail, [1, .3, .85, 1], -1.5, [.4, .8, 1, 0], -.2);
  lyreAt(F, pos(t), LYRE_H, { pose: LP.fly(t), sway: .7 });
  F.post.bloom = 1.2; cutIn(F, lt, .4); kickFx(F, t, .5);
}, 'Above the Clouds');

// ---------------- 4:28 REWIND ----------------
function eraFlash(g, k, t) {
  g.save(); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, VW, VH); g.fillStyle = '#ffffff'; g.globalAlpha = .9;
  const base = 560;
  if (k === 0) { for (let i = 0; i < 14; i++) { const x = i * 95, h = 40 + 60 * hash1(i); g.fillRect(x, base - h, 70, h); g.beginPath(); g.moveTo(x - 6, base - h); g.lineTo(x + 35, base - h - 40); g.lineTo(x + 76, base - h); g.fill(); } }
  if (k === 1) { for (let i = 0; i < 26; i++) { const x = i * 52 + 10, h = 90 + 120 * hash1(i + 4); g.fillRect(x + 12, base - h * .3, 6, h * .3); g.beginPath(); g.moveTo(x, base - h * .25); g.lineTo(x + 15, base - h); g.lineTo(x + 30, base - h * .25); g.fill(); } }
  if (k === 2) { g.beginPath(); g.moveTo(0, base); for (let x = 0; x <= VW; x += 20) g.lineTo(x, base - 120 - 90 * Math.abs(Math.sin(x * .007)) - 40 * noise1(x * .02)); g.lineTo(VW, base); g.fill(); }
  if (k === 3) { g.lineWidth = 6; g.strokeStyle = '#fff'; for (let r = 0; r < 5; r++) { g.beginPath(); for (let x = 0; x <= VW; x += 10) g.lineTo(x, 300 + r * 70 + Math.sin(x * .02 + t * 5 + r) * 20); g.stroke(); } }
  g.fillRect(0, base, VW, VH - base);
  g.restore();
}
const fmtYear = y => { const a = Math.abs(Math.round(y)); const s = a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (y < 0 ? '−' : '') + s; };
scene(T.rewind, T.deep, 'Rewind', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const p = inv(0, T.deep - T.rewind - .2, lt);
  setCam(F, orbitPos([0, 0, 0], 900 - p * 300, 520 - p * 380, 2 - lt * .5), [0, 40, 0], 52);
  night(F); F.city.uRise = 1 - ease.io(inv(.05, .82, p)); F.ground.uTrailSpeed = -260; F.ground.uTrailLen = 90;
  F.ground.uCity = 1 - inv(.55, .75, p); F.ground.uWater = ease.io(inv(.86, 1, p)); F.city.uWarm = .3 + p * .6;
  Object.assign(F.sky, { uHor: V.lerp([.06, .03, .13], [.14, .05, .04], p), uGlowAmt: .45 * (1 - p) });
  const years = Math.pow(10, p * 9.58) - 1;
  F.post.glitch = .22 + snare(t) * .5; F.post.scan = .32; F.post.chroma = 3; F.post.grain = .16; F.post.sat = .85;
  // tape tracking bands
  g.save(); for (let i = 0; i < 4; i++) { const y = (fract(t * .7 + i * .27) * (VH + 80)) - 40; g.fillStyle = `rgba(255,255,255,${.06 + .06 * hash1(i + Math.floor(t * 20))})`; g.fillRect(0, y, VW, 6 + 10 * hash1(i)); } g.restore();
  const hits = [270.12, 272.23, 274.48, 275.67, 277.3, 278.7];
  hits.forEach((h, i) => { if (t > h && t < h + .22) eraFlash(g, i % 4, t); });
  if (fract(t * 1.5) < .6) D2.txt(g, '◀◀ REW', 48, 60, { size: 26, color: '#ffffff', ls: 4 });
  D2.txt(g, 'YEAR ' + fmtYear(2089 - years), VW / 2, VH - 52, { size: 34, align: 'center', color: '#ffffff', ls: 5 });
  cutIn(F, lt, .4);
}, 'Rewind');

// ---------------- 4:41 DEEP TIME (the same thing, backwards) ----------------
function drawCell(g, x, y, r, t, kind, a = 1) {
  if (r <= .5) return;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const th = i / 64 * TAU; let rr = r * (1 + .07 * noise2(Math.cos(th) * 1.5 + t * .6 + (kind ? 9 : 0), Math.sin(th) * 1.5 + t * .4));
    let px = Math.cos(th), py = Math.sin(th);
    if (kind === 0) { const n = 4; const k = Math.pow(Math.pow(Math.abs(px), n) + Math.pow(Math.abs(py), n), -1 / n); px *= k; py *= k; }
    pts.push([px * rr, py * rr]);
  }
  const col = kind === 0 ? ['rgba(40,90,255,.35)', '#5ff2ff'] : ['rgba(255,40,200,.35)', '#ff4fd8'];
  const gr = g.createRadialGradient(0, 0, r * .1, 0, 0, r * 1.1); gr.addColorStop(0, kind === 0 ? 'rgba(160,230,255,.5)' : 'rgba(255,190,240,.5)'); gr.addColorStop(1, col[0]);
  g.fillStyle = gr; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  g.strokeStyle = col[1]; g.lineWidth = Math.max(1.5, r * .06); g.stroke();
  g.lineWidth = 1; g.globalAlpha = a * .5; g.save(); g.scale(.86, .86); g.stroke(); g.restore();
  g.globalAlpha = a; g.fillStyle = '#fff'; g.beginPath(); g.arc(r * .15 * Math.sin(t), r * .1 * Math.cos(t * .7), r * .18, 0, TAU); g.fill();
  for (let i = 0; i < 6; i++) { const aa = t * (.5 + i * .1) + i; g.fillStyle = col[1]; g.beginPath(); g.arc(Math.cos(aa) * r * .55, Math.sin(aa * 1.3) * r * .5, r * .05, 0, TAU); g.fill(); }
  g.restore();
}
scene(T.deep, T.alive, 'Deep Time', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const sw = inv(T.gyre, T.gyre + 6, t);
  const down = ease.io(inv(T.gyre - 2, T.gyre + 4, t));
  const camY = -40 - lt * 1.2;
  setCam(F, [Math.sin(lt * .1) * 8, camY, 0], V.lerp([0, camY - 60, -120], [0.01, camY - 200, 0], down), 60, t * .08 * sw);
  F.ground.on = false; F.city.on = false;
  Object.assign(F.sky, { uMode: 1, uSwirl: sw * 1.1, uRays: 1 - sw * .5, uVent: .4 + sw * .3 });
  if (sw <= 0) Object.assign(F.parts, { on: true, uMode: 1, uVel: [0, -2.5, 0], uBox: [140, 140, 140], uSize: .16, uCol1: [.8, .9, 1], uCol2: [.5, .7, 1], uAmt: .55 });
  else Object.assign(F.parts, { on: true, uMode: 2, uCenter: [0, camY - 180, 0], uBox: [260, 60, 260], uSize: .35, uSpin: .8 + sw, uCol1: [.4, .7, 1], uCol2: [.9, .4, .9], uAmt: .55 });
  F.post.warp = .6; F.post.bloom = 1.1; F.post.fb = .3;
  // sonar pings
  [284.2, 285.9, 287.4, 288.9, 290.4].forEach(pt => { const u = (t - pt) / 1.4; if (u > 0 && u < 1) { g.strokeStyle = `rgba(143,246,255,${(1 - u) * .6})`; g.lineWidth = 2; g.beginPath(); g.arc(640, 400, 30 + u * 420, 0, TAU); g.stroke(); } });
  // the first two
  const born = inv(T.cells, T.cells + 3, t);
  if (born > 0) {
    const c = project(F, [0, camY - 200, 0]); const cx = c.vis ? c.x : 640, cy = c.vis ? c.y : 360;
    const d = t < T.hush1 ? 210 : lerp(210, 122, ease.io(inv(T.hush1, T.alive - .35, t)));
    const a = (t - T.cells) * .7;
    const r = 62 * ease.oBack(born);
    const ax = cx + Math.cos(a) * d / 2, ay = cy + Math.sin(a) * d / 2 * .7, bx = cx - Math.cos(a) * d / 2, by = cy - Math.sin(a) * d / 2 * .7;
    g.save(); g.globalCompositeOperation = 'lighter';
    drawCell(g, ax, ay, r, t, 0); drawCell(g, bx, by, r * .95, t + 3, 1);
    g.restore();
    const la = inv(T.cells + 3.5, T.cells + 5, t) * (1 - inv(T.hush2, T.hush2 + 1, t));
    D2.txt(g, 'ORGANISM 000', ax + 60, ay - 50, { size: 12, ls: 3, alpha: la });
    D2.txt(g, 'ORGANISM 001', bx - 60, by + 64, { size: 12, ls: 3, alpha: la, align: 'right', color: '#ff9ae6' });
    const touch = inv(T.alive - .4, T.alive, t);
    if (touch > 0) { D2.sparkle(g, cx, cy, 30 + touch * 60, '#ffffff', t); }
  }
  D2.txt(g, D2.type('−3.8 × 10⁹ YEARS', inv(1, 3, lt)), VW / 2, VH - 40, { size: 13, align: 'center', ls: 5, alpha: .7 * (1 - inv(T.hush2, T.hush2 + 2, t)) });
  const hush = inv(T.hush1, T.hush1 + .8, t);
  F.post.exposure = 1 - hush * .45 + inv(T.alive - .5, T.alive, t) * .8;
  F.post.fade = t < T.deep + .4 ? 1 - lt / .4 : 0;
}, 'Deep Time');

// ---------------- 5:27 ALIVE (evolution at 145 bpm) ----------------
const PH = i => T.alive + i * BAR * 8;
scene(PH(0), PH(1), 'Helix', F => {
  const t = F.t, lt = F.lt, L = F.L;
  const cz = -lt * 42;
  setCam(F, [Math.cos(t * .35) * 70, Math.sin(t * .35) * 50, cz + 40], [0, 0, cz - 110], 62, t * .05);
  F.ground.on = false; F.city.on = false;
  Object.assign(F.sky, { uMode: 1, uRays: 1.4, uSwirl: .3 });
  for (let z = Math.floor(cz / 6) * 6 + 30; z > cz - 520; z -= 6) {
    const a = z * .07 + t * .9; const A = [Math.cos(a) * 20, Math.sin(a) * 20, z], B = [Math.cos(a + Math.PI) * 20, Math.sin(a + Math.PI) * 20, z];
    const a2 = (z - 6) * .07 + t * .9; const A2 = [Math.cos(a2) * 20, Math.sin(a2) * 20, z - 6], B2 = [Math.cos(a2 + Math.PI) * 20, Math.sin(a2 + Math.PI) * 20, z - 6];
    L.seg(A, A2, [.35, .85, 1, 1], null, 5); L.seg(B, B2, [1, .25, .85, 1], null, 5);
    const hue = hash1(Math.floor(z / 6)); L.seg(A, B, hue > .5 ? [1, .85, .3, .7] : [.8, .9, 1, .6], null, 2);
  }
  Object.assign(F.parts, { on: true, uMode: 0, uBox: [200, 200, 200], uSize: .6, uCol1: [.5, .9, 1], uCol2: [1, .4, .9], uAmt: .35 });
  F.post.bloom = 1.5; F.post.sat = 1.35; F.post.fb = .35;
  cutIn(F, lt, 1, [1, 1, 1], .35); kickFx(F, t, 1);
}, 'Alive');
scene(PH(1), PH(2), 'Tree of Life', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.005, .03, .06];
  const gr = g.createRadialGradient(640, 700, 50, 640, 500, 800); gr.addColorStop(0, 'rgba(60,120,180,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.save(); g.globalCompositeOperation = 'lighter';
  paintedTree(g, 640, 760, 0, 190, 9, ease.o(inv(0, 12, lt)) * 9.2, 7.7, '#8ff6ff', 20);
  for (let i = 0; i < 26; i++) {
    const u = fract(hash1(i) + lt * .04), x = hash1(i + 1) * VW, y = VH - u * (VH + 60);
    const split = fract(lt * .5 + hash1(i + 2)); const d = split * 14;
    drawCell(g, x - d, y, 9, t + i, i % 2, .8); drawCell(g, x + d, y, 9, t + i + 1, i % 2, .8);
  }
  g.restore();
  F.post.bloom = 1.3; cutIn(F, lt, .6); kickFx(F, t, .6);
}, 'Alive');
function jelly(g, x, y, s, t, col, k) {
  const pul = 1 - .18 * k;
  g.save(); g.translate(x, y);
  g.fillStyle = col.replace('A', '.35'); g.beginPath(); g.ellipse(0, 0, s, s * .7 * pul, 0, Math.PI, TAU); g.quadraticCurveTo(0, s * .2, -s, 0); g.fill();
  g.strokeStyle = col.replace('A', '.9'); g.lineWidth = 2; g.stroke();
  for (let i = 0; i < 6; i++) { const x0 = -s * .8 + i * s * .32; g.beginPath(); g.moveTo(x0, s * .05); for (let j = 1; j < 12; j++) g.lineTo(x0 + Math.sin(t * 3 + j * .6 + i) * s * .12, s * .05 + j * s * .16); g.stroke(); }
  g.restore();
}
scene(PH(2), PH(3), 'Bloom', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.01, .05, .12];
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const x = 150 + i * 200 + Math.sin(t * .3 + i) * 40; const gr = g.createLinearGradient(x, 0, x + 120, VH); gr.addColorStop(0, 'rgba(150,220,255,.18)'); gr.addColorStop(1, 'rgba(150,220,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 30, 0); g.lineTo(x + 30, 0); g.lineTo(x + 180, VH); g.lineTo(x + 60, VH); g.fill(); }
  // coral
  for (let i = 0; i < 5; i++) paintedTree(g, 120 + i * 260, 760, (i - 2) * .1, 60, 5, 5, 11 + i, i % 2 ? '#ff7ab8' : '#ffb35a', 7);
  // fish school: a slow gyre of bodies
  for (let i = 0; i < 180; i++) {
    const a = t * .6 + i * .11 + hash1(i) * 2, r = 120 + 90 * hash1(i + 1) + 30 * Math.sin(t + i);
    const x = 640 + Math.cos(a) * r * 1.6, y = 360 + Math.sin(a) * r * .7 + Math.sin(i) * 20;
    const dx = -Math.sin(a), dy = Math.cos(a) * .44;
    g.fillStyle = i === 0 ? '#5ff2ff' : i === 1 ? '#ff4fd8' : 'rgba(200,230,255,.55)';
    const s = i < 2 ? 12 : 5;
    g.beginPath(); g.moveTo(x + dx * s * 2, y + dy * s * 2); g.lineTo(x - dy * s * .6 - dx * s, y + dx * s * .6 - dy * s); g.lineTo(x + dy * s * .6 - dx * s, y - dx * s * .6 - dy * s); g.fill();
  }
  const k = kick(t);
  for (let i = 0; i < 7; i++) jelly(g, 100 + i * 180 + Math.sin(i * 3) * 40, VH - fract(lt * .05 + hash1(i)) * (VH + 200) + 100, 40 + 20 * hash1(i + 3), t + i, i % 2 ? 'rgba(255,79,216,A)' : 'rgba(95,242,255,A)', k);
  g.restore();
  F.post.bloom = 1.3; F.post.warp = .4; cutIn(F, lt, .5); kickFx(F, t, .5);
}, 'Alive');
scene(PH(3), PH(4), 'Land', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false;
  const day = .5 + .5 * Math.sin(beatOf(t, PH(3)) * Math.PI / 4);
  const sky = g.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, `rgb(${Math.round(lerp(8, 60, day))},${Math.round(lerp(10, 110, day))},${Math.round(lerp(40, 200, day))})`);
  sky.addColorStop(1, `rgb(${Math.round(lerp(60, 255, day))},${Math.round(lerp(20, 160, day))},${Math.round(lerp(90, 170, day))})`);
  g.fillStyle = sky; g.fillRect(0, 0, VW, 520);
  const sa = beatOf(t, PH(3)) * Math.PI / 4; D2.sparkle(g, 640 + Math.cos(sa) * 520, 520 - Math.abs(Math.sin(sa)) * 380, 30, day > .5 ? '#fff4c0' : '#dfe6ff');
  g.fillStyle = '#060a18'; g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 16) g.lineTo(x, 520 - 40 * noise1(x * .006 + 3) - 20); g.lineTo(VW, VH); g.fill();
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) { // ferns unfurling
    const x = 80 + i * 140, grow = ease.o(inv(i * .6, i * .6 + 5, lt));
    g.strokeStyle = i % 2 ? '#5ff2ff' : '#7dffb0'; g.lineWidth = 3; g.beginPath();
    for (let j = 0; j <= 60 * grow; j++) { const u = j / 60; const a = u * 9 * (1 - grow * .6); const r = (1 - u) * 90 + 8; const px = x + Math.sin(a) * r * .5 + u * 30, py = 540 - u * 160 * grow - Math.cos(a) * r * .3; j ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
  }
  for (let i = 0; i < 6; i++) paintedTree(g, 60 + i * 230, 560, 0, 55, 6, ease.o(inv(4 + i * .4, 10, lt)) * 6, 21 + i, '#5fffc0', 6);
  g.restore();
  // a pair walking together
  const wx = -120 + lt * 70;
  for (const [dx, col, round] of [[0, '#5ff2ff', false], [70, '#ff4fd8', true]]) {
    const x = wx + dx, y = 600, ph = t * 6 + dx;
    g.fillStyle = col;
    if (round) { g.beginPath(); g.ellipse(x, y - 34, 32, 22, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 34, y - 48, 13, 0, TAU); g.fill(); }
    else { g.fillRect(x - 32, y - 56, 64, 36); g.fillRect(x + 26, y - 74, 22, 22); }
    for (let l = 0; l < 4; l++) g.fillRect(x - 26 + l * 16 + Math.sin(ph + l * 1.6) * 5, y - 22, 6, 22);
  }
  F.post.bloom = 1.1; cutIn(F, lt, .5); kickFx(F, t, .4);
}, 'Alive');
scene(PH(4), PH(5), 'Fire', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.005, .006, .03];
  const fall = ease.io(inv(6.6, 12, lt));
  // stars (sparks that rose) and later villages
  for (let i = 0; i < 90; i++) {
    const born = hash1(i) * 6; if (lt < born) continue;
    const sx = hash1(i + 1) * VW, sy = 40 + hash1(i + 2) * 330;
    const vx = sx, vy = 470 + hash1(i + 3) * 40;
    const x = lerp(sx, vx, fall), y = lerp(sy, vy, fall);
    D2.sparkle(g, x, y, 2 + 3 * hash1(i + 4) * (.6 + .4 * Math.sin(t * 4 + i)), fall > .5 ? '#ffc07a' : '#ffffff');
  }
  g.fillStyle = '#02030a'; g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 16) g.lineTo(x, 520 - 30 * noise1(x * .005 + 9)); g.lineTo(VW, VH); g.fill();
  // fire
  const fx = 640, fy = 610;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const h = 60 + 40 * noise1(t * 4 + i) + 25 * kick(t), w = 34 - i * 3;
    g.fillStyle = ['rgba(255,70,30,.22)', 'rgba(255,130,30,.2)', 'rgba(255,200,90,.16)', 'rgba(255,47,208,.18)'][i % 4];
    g.beginPath(); g.moveTo(fx - w, fy); g.quadraticCurveTo(fx - w * .5 + noise1(t * 5 + i) * 10, fy - h * .6, fx + noise1(t * 3 + i * 2) * 12, fy - h); g.quadraticCurveTo(fx + w * .5, fy - h * .5, fx + w, fy); g.fill();
  }
  for (let i = 0; i < 40; i++) { const u = fract(t * .5 + hash1(i)); D2.sparkle(g, fx + noise1(i * 7 + t) * 40 * u + Math.sin(i) * 10, fy - 40 - u * 380, 3 * (1 - u), '#ffcf7a'); }
  g.restore();
  // two figures by the fire
  g.fillStyle = '#0b1140';
  g.fillRect(470, 560, 58, 60); g.fillRect(482, 522, 34, 38); g.fillStyle = '#5ff2ff'; g.fillRect(486, 536, 26, 4);
  g.fillStyle = '#2a0a3a'; g.beginPath(); g.ellipse(790, 590, 26, 32, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(790, 546, 16, 0, TAU); g.fill();
  g.fillStyle = '#ff2fd0'; g.beginPath(); g.moveTo(780, 540); g.quadraticCurveTo(830, 560, 818, 610); g.lineTo(806, 606); g.quadraticCurveTo(812, 566, 776, 552); g.fill();
  F.post.bloom = 1.35; cutIn(F, lt, .5); kickFx(F, t, .3);
}, 'Alive');
scene(PH(5), PH(6), 'Cities', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const p = inv(0, PH(6) - PH(5) - 1, lt);
  setCam(F, orbitPos([0, 0, 0], 1100 - p * 300, 260 + p * 380, -1 + lt * .09), [0, 60, 0], 50);
  night(F); F.city.uRise = ease.io(p); F.ground.uCity = inv(0, .3, p); F.ground.uTrailSpeed = 240; F.ground.uTrailLen = 60;
  const day = .5 + .5 * Math.sin(beatOf(t, PH(5)) * Math.PI / 2);
  Object.assign(F.sky, { uTop: V.lerp([.008, .01, .05], [.12, .25, .6], day * (1 - p) * .8), uHor: V.lerp([.06, .03, .13], [.6, .5, .6], day * (1 - p) * .8) });
  const year = p < 1 ? -10000 + Math.pow(p, 3) * 12089 : 2089;
  D2.txt(g, 'YEAR ' + fmtYear(year), VW / 2, VH - 52, { size: 34, align: 'center', color: '#ffffff', ls: 5 });
  D2.txt(g, '▶▶', 48, 60, { size: 26, color: '#ffffff', ls: 4, alpha: fract(t * 1.5) < .6 ? 1 : 0 });
  cutIn(F, lt, .5); kickFx(F, t, .8);
}, 'Alive');
scene(PH(6), T.stops, 'Arrival', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, [-420 + lt * 12, 160, -160], [0, 170, 290], 50);
  night(F, { lit: .7 });
  const J = gyre(F, GYRE.POSES.stand, { yaw: -Math.PI * .7, halo: 1 });
  lyreAt(F, V.add(J.SL, V.mul(J.upv, 3)), LYRE_H, { pose: LP.sit(t), sway: .3 });
  D2.txt(g, 'YEAR 2089  ·  NIGHT CYCLE 00001  ·  ' + clock(19 * 3600, 7 + lt * .02), VW / 2, VH - 44, { size: 14, align: 'center', ls: 4, alpha: inv(.5, 1.5, lt) });
  cutIn(F, lt, .7); kickFx(F, t, .6);
}, 'Alive');

// ---------------- 6:53 STOPS ----------------
scene(T.stops, T.giants, 'Stops', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const b = Math.floor(lt / (BEAT));
  const src = [410.5, 58, 408.5, 300, 411.5, 96, 409][b % 7];
  Engine.borrow(F, src);
  F.g.clearRect(0, 0, VW, VH);
  if (src === 58) drawLyre(F.g, { x: 640, y: VH + 1350 * .47, s: 1350, t: src, pose: LP.idle(src) });
  F.tFreeze = src;
  F.post.glitch = .35 + .3 * hash1(b); F.post.chroma = 2.5; F.post.scan = .2; F.post.fb = 0;
  D2.txt(g, fract(t * 2) < .5 ? '❚❚' : '▶', 60, 70, { size: 30, color: '#ffffff' });
}, 'Stops');

// ---------------- 6:56 GIANTS ----------------
const LYRE_GROW_POS = [95, 0, 180];
function lyreGrowH(t) {
  if (t < T.giants) return LYRE_H;
  const n = Math.max(0, lastBefore(KICKS, t) - lastBefore(KICKS, T.giants));
  const lk = KICKS[lastBefore(KICKS, t)] || t; const step = ease.o(clamp((t - lk) / .14));
  const prog = clamp((n - 1 + step) / 14);
  return LYRE_H * Math.pow(240 / LYRE_H, prog);
}
scene(T.giants, T.giants2, 'Grow', F => {
  const t = F.t, lt = F.lt;
  const h = lyreGrowH(t);
  setCam(F, [LYRE_GROW_POS[0] - 50, 3, LYRE_GROW_POS[2] - 150], [LYRE_GROW_POS[0], Math.min(h * .55, 150), LYRE_GROW_POS[2]], 72);
  night(F, { lit: .65 });
  gyre(F, GYRE.POSES.stand, { yaw: Math.PI, halo: 1 });
  lyreAt(F, LYRE_GROW_POS, h, { pose: poseMix(LP.idle(t), LP.armsUp(t), inv(0, 5, lt)), sway: .5 });
  F.ground.uLyre = [LYRE_GROW_POS[0], LYRE_GROW_POS[2], 2]; F.city.uLyre = [LYRE_GROW_POS[0], LYRE_GROW_POS[2], .6];
  const k = kick(t); F.post.chroma += k * 1.5; cutIn(F, lt, .6);
  const s = shake(F, k * 1.5, t); setCam(F, s[0], s[1], 72);
}, 'Giants');
scene(T.giants2, T.stars, 'Dance of Giants', F => {
  const t = F.t, lt = F.lt;
  const a = lt * .22, C0 = [0, 0, 290];
  const gp = [C0[0] + Math.cos(a) * 95, 0, C0[2] + Math.sin(a) * 95], lp = [C0[0] - Math.cos(a) * 95, 0, C0[2] - Math.sin(a) * 95];
  const yaw = Math.atan2(lp[0] - gp[0], lp[2] - gp[2]);
  const shot = Math.floor(lt / (BAR * 4)) % 4;
  if (shot === 0) setCam(F, orbitPos(C0, 720, 170, a + 1.2), [C0[0], 130, C0[2]], 52);
  if (shot === 1) setCam(F, orbitPos(C0, 260, 4, -a * .5 + 2), [C0[0], 170, C0[2]], 74);
  if (shot === 2) setCam(F, orbitPos(C0, 380, 640, a), [C0[0], 60, C0[2]], 54);
  if (shot === 3) setCam(F, V.add(lp, [Math.cos(a + 2.2) * 150, 120, Math.sin(a + 2.2) * 150]), [gp[0], 180, gp[2]], 60);
  night(F, { lit: .7 }); F.ground.uRing = .9; F.ground.uTrailSpeed = 90; F.ground.uTrailLen = 40;
  F.city.uMixB = .25 + .25 * Math.sin(t * .9); F.city.uEdge = .2;
  const k = kickFx(F, t, .9);
  gyre(F, GYRE.dancePose(t, T.giants2), { root: gp, yaw, halo: 1, wings: .25 + .15 * Math.sin(t) });
  lyreAt(F, lp, 240, { pose: LP.dance(t, T.giants2), sway: .7, flip: Math.sin(a) > 0 ? 1 : -1 });
  F.ground.uLyre = [lp[0], lp[2], 2.5]; F.city.uLyre = [lp[0], lp[2], .5];
  F.post.fb = .35; F.post.bloom = 1.15;
  if (fract(lt / (BAR * 4)) * BAR * 4 < .15) cutIn(F, fract(lt / (BAR * 4)) * BAR * 4, .5);
}, 'Giants');

// ---------------- 7:33 CONSTELLATIONS ----------------
const CONST = [
  ['LYRA NOVA', [[.25, .95], [.1, .55], [.28, .12], [.72, .12], [.9, .55], [.75, .95], [.4, .95], [.6, .95]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 7], [7, 6], [6, 0], [2, 6], [3, 7]]],
  ['GYRUS', Array.from({ length: 9 }, (_, i) => { const a = i * .9, r = .08 + i * .05; return [.5 + Math.cos(a) * r, .5 + Math.sin(a) * r]; }), Array.from({ length: 8 }, (_, i) => [i, i + 1])],
  ['PONS', [[0, .8], [.25, .8], [.5, .8], [.75, .8], [1, .8], [.25, .2], [.75, .2], [.5, .55]], [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 6], [5, 7], [7, 6], [0, 5], [6, 4]]],
  ['NAVIS', [[.05, .6], [.95, .6], [.8, .85], [.2, .85], [.5, .6], [.5, .05], [.85, .5]], [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 4]]],
  ['COR', [[.5, .95], [.12, .5], [.15, .2], [.35, .1], [.5, .28], [.65, .1], [.85, .2], [.88, .5]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]]],
  ['DUO', [[.25, .15], [.25, .5], [.1, .95], [.4, .95], [.75, .15], [.75, .5], [.6, .95], [.9, .95], [.5, .38]], [[0, 1], [1, 2], [1, 3], [4, 5], [5, 6], [5, 7], [1, 8], [8, 5]]],
];
scene(T.stars, T.skate, 'Constellations', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const gr = SHORE_G(), lr = SHORE_L();
  setCam(F, [25, 95, coastZ(25) - 175], [25, 520, coastZ(25) + 800], 64);
  night(F, { lit: .45, stars: 2.6 }); Object.assign(F.sky, { uMilky: 1.2, uGlowAmt: .15, uSunDir: V.norm([.25, .32, 1]), uSun: .45, uSunCol: [.6, .7, 1] });
  F.ground.uSunDir = F.sky.uSunDir; F.ground.uSun = .5; F.ground.uSunCol = [.6, .7, 1];
  gyre(F, GYRE.POSES.sit, { root: gr, halo: .7 });
  lyreAt(F, lr, 230, { pose: LP.sit(t), back: true, sway: .3 });
  const boxes = [[140, 70, 200], [420, 40, 190], [700, 70, 230], [980, 60, 190], [270, 250, 170], [830, 250, 190]];
  const per = (T.skate - T.stars) / CONST.length;
  CONST.forEach(([name, pts, edges], i) => {
    const t0 = i * per, u = inv(t0, t0 + per * .8, lt); if (u <= 0) return;
    const [bx, by, bs] = boxes[i];
    const P = pts.map(([x, y]) => [bx + x * bs, by + y * bs * .8]);
    g.save(); g.strokeStyle = i % 2 ? 'rgba(255,79,216,.8)' : 'rgba(143,246,255,.8)'; g.lineWidth = 1.6;
    edges.forEach(([a, b], k) => { const e = inv(k / edges.length, (k + 1) / edges.length, u * 1.3 - .3); if (e <= 0) return; g.beginPath(); g.moveTo(P[a][0], P[a][1]); g.lineTo(lerp(P[a][0], P[b][0], e), lerp(P[a][1], P[b][1], e)); g.stroke(); });
    P.forEach((p, k) => { const e = inv(k / P.length * .6, k / P.length * .6 + .1, u); if (e > 0) D2.sparkle(g, p[0], p[1], (5 + 3 * E(CH.HIGH, t + k * .1)) * ease.oBack(e), '#ffffff', 0); });
    D2.txt(g, name, bx + bs / 2, by + bs * .8 + 26, { size: 11, align: 'center', ls: 4, alpha: inv(.6, .9, u) * .8 });
    g.restore();
  });
  F.post.bloom = 1.2; cutIn(F, lt, .5);
}, 'Constellations');

// ---------------- 7:53 SKATE / SPIRAL ----------------
scene(T.skate, T.spiral, 'Ring Road', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const R = CITY.RING_R; const a = lt * .32;
  const gp = [Math.cos(a) * R, 0, Math.sin(a) * R], la = a + .3, lp = [Math.cos(la) * R, 0, Math.sin(la) * R];
  const tan = [-Math.sin(a), 0, Math.cos(a)];
  const ca = a - .28;
  setCam(F, [Math.cos(ca) * (R - 150), 40, Math.sin(ca) * (R - 150)], [Math.cos(a + .15) * R, 150, Math.sin(a + .15) * R], 66);
  night(F, { lit: .7 }); F.ground.uRing = 1.3; F.ground.uTrailSpeed = 160; F.ground.uTrailLen = 90;
  gyre(F, GYRE.walkPose(t, 1.8), { root: gp, yaw: Math.atan2(tan[0], tan[2]), halo: 1 });
  lyreAt(F, lp, 230, { pose: LP.run(t, .5), vel: [-1.5, 0], sway: .8 });
  F.ground.uLyre = [lp[0], lp[2], 2]; F.city.uLyre = [lp[0], lp[2], .6];
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2;
  for (let i = 0; i < 30; i++) { const an = hash1(i) * TAU, r0 = 200 + fract(t * 2 + hash1(i + 1)) * 500; g.beginPath(); g.moveTo(640 + Math.cos(an) * r0, 360 + Math.sin(an) * r0); g.lineTo(640 + Math.cos(an) * (r0 + 60), 360 + Math.sin(an) * (r0 + 60)); g.stroke(); }
  g.restore();
  F.post.fb = .5; cutIn(F, lt, .5); kickFx(F, t, 1);
}, 'Orbit');
scene(T.spiral, T.montage, 'Spiral', F => {
  const t = F.t, lt = F.lt;
  const C0 = [0, 0, 290];
  const pos = (tt, ph) => { const l = tt - T.spiral; const a = l * 1.1 + ph; const y = 60 + Math.pow(Math.max(l, 0), 1.6) * 16; return [C0[0] + Math.cos(a) * 130, y, C0[2] + Math.sin(a) * 130]; };
  const gp = pos(t, 0), lp = pos(t, Math.PI);
  const u = inv(0, T.montage - T.spiral, lt);
  setCam(F, [C0[0] + 30, Math.max(6, gp[1] - 330), C0[2] - 60], [C0[0], gp[1] + 100, C0[2]], 70);
  night(F, { lit: .75 }); F.city.uMixB = .4;
  const J = gyre(F, GYRE.POSES.wide, { root: V.sub(gp, [0, 150 * GSC * .9, 0]), yaw: lt, sc: GSC * .9, halo: 1, wings: .7 });
  lyreAt(F, V.sub(lp, [0, 120, 0]), 230, { pose: LP.fly(t), sway: .8 });
  for (const [ph, col] of [[0, [.4, .9, 1, 1]], [Math.PI, [1, .25, .85, 1]]]) { const pts = []; for (let k = 0; k < 80; k++) pts.push(pos(t - k * .06, ph)); F.L.poly(pts, col, -3, [col[0], col[1], col[2], 0], -.5); }
  F.post.fb = .5; F.post.bloom = 1.3; cutIn(F, lt, .5); kickFx(F, t, .8);
}, 'Orbit');

// ---------------- 8:33 MONTAGE ----------------
scene(T.montage, T.orbit, 'Memory', F => {
  const t = F.t, lt = F.lt;
  const mem = [6, 60.5, 79.4, 88, 96.5, 110.5, 150.8, 171.8, 182.8, 207, 258, 315, 331, 360, 385, 440, 462];
  const b = Math.floor(lt / (BEAT / 2));
  Engine.borrow(F, mem[b % mem.length]);
  F.post.glitch = .25; F.post.fb = 0; F.post.chroma = 2;
  D2.txt(F.g, 'REPLAY', VW - 60, VH - 40, { size: 14, align: 'right', ls: 5, color: '#ffffff' });
}, 'Orbit');

// ---------------- 8:39 ORBIT ----------------
function planetGyre(F, t, amt, R = 1180) {
  for (const [ph, col] of [[0, [.4, .9, 1]], [Math.PI, [1, .25, .85]]]) {
    const pts = []; const n = Math.floor(160 * amt);
    for (let i = 0; i <= n; i++) { const u = i / 160; const a = u * TAU * 3 + ph + t * .3; const y = (u - .5) * 1200; const r = Math.sqrt(Math.max(0, R * R - y * y * .5)); pts.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
    if (pts.length > 1) F.L.poly(pts, [col[0], col[1], col[2], 1], 3.5);
  }
}
scene(T.orbit, T.climax, 'Orbit', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const u = inv(0, T.silence - T.orbit, lt);
  const a = .6 + lt * .05;
  setCam(F, [Math.cos(a) * (3200 - u * 900), 600 - u * 300, Math.sin(a) * (3200 - u * 900)], [0, 0, 0], 50);
  F.ground.on = false; F.city.on = false;
  const sa = -1.2 + u * .9; Object.assign(F.sky, { uMode: 2, uPlanetC: [0, 0, 0], uPlanetR: 1000, uSunDir: V.norm([Math.cos(sa), .25, Math.sin(sa)]), uSun: .6 + u, uSunCol: [1, .7, .5], uDawn: .25 + u * .35, uCityLights: 1.2 });
  planetGyre(F, t, ease.o(u));
  F.post.bloom = 1.1 + u; F.post.chroma = 1 + u * 3; F.post.exposure = 1 + u * .6; F.post.glitch = u > .8 ? snare(t) * .3 : 0;
  if (t > T.silence) { F.post.fade = .96; D2.sparkle(g, 640, 360, 8, '#ffffff'); }
  cutIn(F, lt, .4);
}, 'Orbit');

// ---------------- 8:54 AZAZIL (the climax) ----------------
function azazil(g, cx, cy, s, t, a = 1) {
  const flap = Math.sin(t * TAU / (BAR * 2)) * .12;
  const S = [cx, cy - s * .74];
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  // halo ring behind
  g.strokeStyle = 'rgba(95,242,255,.8)'; g.lineWidth = s * .012; g.beginPath(); g.ellipse(cx, cy - s * .92, s * .32, s * .08, 0, 0, TAU); g.stroke();
  for (let i = 0; i < 40; i++) { const an = i / 40 * TAU + t * .8; g.fillStyle = i % 2 ? '#ff4fd8' : '#fff'; g.fillRect(cx + Math.cos(an) * s * .32 - 2, cy - s * .92 + Math.sin(an) * s * .08 - 2, 4, 4); }
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 44; i++) {
      const u = i / 43; const th = lerp(-1.05, 1.45, u) + flap * (1 - u * .3);
      const L = s * lerp(.55, 1.55, Math.pow(Math.sin(u * Math.PI * .92 + .1), .7)) * (1 + .08 * E(CH.HIGH, t - u * .2));
      const tip = [S[0] + sd * Math.cos(th) * L, S[1] - Math.sin(th) * L];
      const c1 = [S[0] + sd * Math.cos(th + .35) * L * .5, S[1] - Math.sin(th + .35) * L * .5];
      const gr = g.createLinearGradient(S[0], S[1], tip[0], tip[1]);
      gr.addColorStop(0, 'rgba(60,110,255,.9)'); gr.addColorStop(.55, 'rgba(255,47,208,.85)'); gr.addColorStop(1, 'rgba(255,31,75,.2)');
      g.strokeStyle = gr; g.lineWidth = lerp(7, 2, u) * s / 520; g.beginPath(); g.moveTo(S[0], S[1]); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.stroke();
    }
    g.strokeStyle = 'rgba(200,240,255,.6)'; g.lineWidth = 1.2;
    for (let i = 0; i < 12; i++) { const th = lerp(-.4, 1.3, i / 11) + flap; const L = s * 1.2; g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(S[0] + sd * Math.cos(th) * L, S[1] - Math.sin(th) * L); g.stroke(); }
  }
  g.restore();
  // the merged figure: GYRE's blocks behind LYRE's light
  const P = LP.armsOut(t); const J = lyreFK(P);
  g.save(); g.globalAlpha = a * .8; g.fillStyle = '#1b3cff';
  const blk = (p, q, w) => { const n = 6; for (let i = 0; i <= n; i++) { const x = cx + lerp(p[0], q[0], i / n) * s, y = cy - lerp(p[1], q[1], i / n) * s; g.fillRect(x - w * s / 2, y - w * s / 2, w * s, w * s); } };
  blk(J.hip, J.neck, .1); blk(J.lS, J.lH, .05); blk(J.rS, J.rH, .05); blk(J.lHp, J.lF, .06); blk(J.rHp, J.rF, .06);
  g.fillRect(cx + J.head[0] * s - .06 * s, cy - J.head[1] * s - .07 * s, .12 * s, .14 * s);
  g.restore();
  drawLyre(g, { x: cx, y: cy, s, t, pose: P, sway: .8, alpha: a });
}
scene(T.climax, T.dawn, 'Azazil', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const pull = ease.io(inv(560.7, 576.4, t));
  const a = .4 + lt * .02;
  setCam(F, [Math.cos(a) * 2300, 1150 + pull * 600, Math.sin(a) * 2300], [0, 950 - pull * 500, 0], 55);
  F.ground.on = false; F.city.on = false;
  Object.assign(F.sky, { uMode: 2, uPlanetC: [0, 0, 0], uPlanetR: 1000, uSunDir: V.norm([-.2, .3, 1]), uSun: 1.2, uSunCol: [1, .5, .7], uDawn: .45, uCityLights: 1.5 });
  planetGyre(F, t, .3 + pull * .7, 1150);
  // chops: quick memories
  const chop = T.chops.findIndex(c0 => t > c0 && t < c0 + (c0 === 557.6 ? 3.1 : c0 === 576.4 ? 10.6 : 6));
  let drew = false;
  if (chop >= 0) {
    const c0 = T.chops[chop]; const b = Math.floor(beatOf(t, c0)); const k = b % 4;
    if (b % 2 === 1) {
      drew = true;
      if (k === 1) { F.draw3D = false; F.bg = [.02, 0, .04]; const s = 2600; drawLyre(g, { x: 640, y: 360 + .885 * s, s, t, pose: LP.idle(t), sway: .5 }); }
      else { F.draw3D = false; F.bg = [0, 0, .02]; D2.gyreEye(g, 640, 360, 300, t, { dilate: .9 }); }
    }
  }
  if (!drew) {
    const sc = lerp(500, 180, pull), cy = lerp(620, 470, pull);
    azazil(g, 640, cy, sc, t, 1);
  }
  const k = kick(t);
  F.post.fb = .72; F.post.fbZoom = 1.006; F.post.fbHue = .025; F.post.bloom = 1.6; F.post.sat = 1.45; F.post.chroma = 2 + k * 2; F.post.bleed = .4 + k * .6;
  F.post.glitch = k * .22; F.post.kal = (Math.floor(barOf(t, T.climax)) % 8 === 7) ? 6 : 0; F.post.kalMix = .55;
  cutIn(F, lt, 1, [1, .9, 1], .5);
  F.post.flash = Math.max(F.post.flash, ease.i(inv(T.white, T.dawn, t)));
}, 'Azazil');

// ---------------- 9:52 DAWN ----------------
scene(T.dawn, SONG_LEN + 1, 'Dawn', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const gr = SHORE_G(), lr = SHORE_L();
  const u = inv(0, SONG_LEN - T.dawn, lt);
  setCam(F, [30 - lt * 2, 70, coastZ(30) - 520], [30, 150, coastZ(30) + 900], 55);
  const sd = V.norm([.08, .015 + u * .06, 1]);
  Object.assign(F.sky, { uTop: [.1, .14, .38], uHor: [1, .5, .42], uGlow: [1, .55, .35], uGlowAmt: .9, uStars: .35 * (1 - u), uSunDir: sd, uSun: 1.5, uSunCol: [1, .65, .35] });
  Object.assign(F.ground, { uSunDir: sd, uSun: 1.4, uSunCol: [1, .6, .35], uFog: [.35, .2, .3], uFogDen: .0006, uTrail: .3, uRoad: .5 });
  Object.assign(F.city, { uFog: [.35, .2, .3], uFogDen: .0006, uLit: .12, uEdge: .05 });
  gyre(F, GYRE.POSES.sitFwd, { root: gr, halo: .5, visor: .5 });
  F.body.u.uLit = .3; F.body.u.uFogDen = .0005;
  lyreAt(F, lr, 230, { pose: LP.sit(t), back: true, sway: .3 });
  F.post.flash = 1 - ease.o(inv(0, 2.8, lt)); F.post.bloom = 1.2;
  F.post.fade = ease.io(inv(SONG_LEN - 2.2, SONG_LEN - .2, t));
  const ta = inv(4, 5.5, lt);
  titleCard(g, t, ta, false, 150);
  D2.txt(g, 'music  ·  Cacola — FIRST NIGHT ALIVE  (Azazil-X)', VW / 2, 226, { size: 17, align: 'center', ls: 3, color: '#fff6e8', alpha: ta, stroke: 'rgba(20,10,50,.85)', strokeW: 5 });
  D2.txt(g, 'NIGHT CYCLE 00002  ·  UNSCHEDULED', VW / 2, VH - 44, { size: 13, align: 'center', ls: 5, color: '#ffe0f6', alpha: inv(8, 9, lt) });
}, 'Dawn');
