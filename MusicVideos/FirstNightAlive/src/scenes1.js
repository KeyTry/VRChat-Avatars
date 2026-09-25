// ============================================================
// scenes1.js — PART ONE (0:00–3:06): the words. GYRE notices LYRE.
// ============================================================
const GROOT = [0, 0, 290], GSC = 1.25, LYRE_H = 6;   // the giant's park, her scale, LYRE's hologram height (m)
function gyre(F, pose, o = {}) {
  const J = GYRE.joints(pose, o.root || GROOT, o.yaw ?? 0, o.sc || GSC);
  GYRE.emit(J, { asm: o.asm, swirl: o.swirl, jitter: o.jitter, t: F.t });
  F.body.on = true;
  if ((o.halo ?? 1) > 0) GYRE.halo(F.L, J, F.t, o.halo ?? 1);
  if ((o.visor ?? 1) > 0) GYRE.visor(F.L, J, o.visor ?? 1);
  if (o.wings) GYRE.wings(F.L, J, o.wings, F.t, o.wingA ?? 1);
  return J;
}
const STREET_Z = 199;  // an avenue with mid-rise blocks on both sides

// ---------------- 0:00 BOOT ----------------
scene(0, 14.11, 'Boot', F => {
  const t = F.t, g = F.g;
  const a = -.9 + t * .03, R = 1250 - t * 22, h = 720 - t * 18;
  setCam(F, orbitPos([0, 0, 0], R, h, a), [0, 30, 0], 42);
  night(F, { lit: .72, stars: 1.3 }); F.city.uBright = 1.35;
  const sched = ease.io(inv(1.4, 12.6, t));
  F.city.uSched = sched; F.ground.uSched = sched; F.ground.uTrail = .7; F.city.uEdge = .2;
  F.ground.uRing = .35 * sched;
  F.post.fade = 1 - ease.o(inv(.3, 3, t)); F.post.bloom = .8;
  hud(F, 'NIGHT CYCLE 00001', { a: inv(1, 2.5, t) });
  const rows = [['STREETLIGHTS', 3.0], ['TRANSIT', 4.6], ['WEATHER', 6.2], ['CITIZENS', 7.8], ['TOMORROW', 9.4], ['SELF', 11.0]];
  rows.forEach(([nm, tt], i) => {
    if (t < tt) return;
    const s = (nm + ' ').padEnd(20, '.') + ' ' + (nm === 'SELF' ? 'N/A' : 'SCHEDULED');
    D2.txt(g, D2.type(s, inv(tt, tt + .7, t)), 40, 116 + i * 22, { size: 14, color: nm === 'SELF' ? '#ff9ae6' : '#5ff2ff', ls: 1.5 });
  });
  const ca = inv(1.5, 3, t);
  D2.txt(g, clock(18 * 3600 + 59 * 60 + 47, t), VW / 2, VH - 64, { size: 30, align: 'center', color: '#e8f6ff', ls: 6, alpha: ca });
  D2.txt(g, 'LIGHTS ON ' + Math.round(sched * 100) + '%', VW / 2, VH - 38, { size: 12, align: 'center', ls: 3, alpha: ca * .8 });
  if (t > T.anomaly) {
    const pr = project(F, [-620, 1, -41]); const k = inv(T.anomaly, T.anomaly + .1, t);
    if (pr.vis) { D2.sparkle(g, pr.x, pr.y, 10 * k, '#ff2fd0'); D2.reticle(g, pr.x, pr.y, 16, '#ff4fd8', t, 'UNSCHEDULED'); }
    F.post.glitch = .4 * (1 - k);
  }
}, 'Boot');

// ---------------- 0:14 ANOMALY (riser) ----------------
const runX = t => { const u = t - 14.11; return -900 + 38 * u + 2 * u * u; };
scene(14.11, 27.45, 'Anomaly', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const x = runX(t), z = -41;
  const k = ease.io(inv(0, 9, lt));
  const camHi = [x - 520, 620, z + 720], camLo = [x - 40, 7 + 1.5 * Math.sin(t * 3), z + 3];
  const tgHi = [x + 220, 0, z], tgLo = [x + 60, 5, z];
  const fov = lerp(40, 72, ease.i(inv(4, 13.3, lt)));
  setCam(F, V.lerp(camHi, camLo, k), V.lerp(tgHi, tgLo, k), fov, Math.sin(t * .8) * .05 * k);
  night(F); F.ground.uTrailSpeed = 30 + lt * 5; F.ground.uLyre = [x, z, 1.4]; F.city.uLyre = [x, z, .5];
  const riser = inv(0, 13.3, lt);
  F.post.chroma = .6 + riser * 2.6; F.post.bloom = .9 + riser * .7; F.post.fb = riser * .6; F.post.glitch = snare(t) * .35 * riser;
  F.city.uEdge = .12 + riser * .7; F.ground.uTrailLen = 14 + riser * 60;
  if (lt < .4) F.post.glitch = .5 * (1 - lt / .4);
  const pr = lyreAt(F, [x, 0, z], LYRE_H, { pose: LP.run(t, 1.4), vel: [-2, 0], sway: .3 });
  hud(F, 'UNSCHEDULED ENTITY', { col: '#ff7ae0', sub: 'GYRE // TRACKING' });
  if (pr.vis) {
    D2.reticle(g, pr.x, pr.y - Math.max(pr.s * LYRE_H * .5, 4), 24 + 10 * kick(t), '#ff4fd8', t, pr.s * LYRE_H > 30 ? '' : 'ID ——');
    const pts = []; for (let d = 30; d <= 420; d += 15) { const q = project(F, [x + d, .6, z]); if (q.vis) pts.push([q.x, q.y]); }
    g.setLineDash([6, 9]); D2.glowLine(g, pts, 'rgba(95,242,255,.8)', 2, false); g.setLineDash([]);
  }
  const conf = 99.4 - Math.pow(riser, 2.2) * 112;
  D2.txt(g, conf > 0 ? `PREDICTION ${conf.toFixed(1)}%` : 'PREDICTION —— ERR', 40, VH - 60, { size: 16, color: conf > 40 ? '#5ff2ff' : '#ff4fd8', ls: 2 });
  D2.txt(g, `VELOCITY ${(38 + 4 * lt).toFixed(0)} M/S   HEADING 090   ROUTE: NONE`, 40, VH - 38, { size: 12, ls: 2, alpha: .75 });
}, 'Anomaly');

// ---------------- 0:27 TITLE (the held breath) ----------------
function titleCard(g, t, a, sub = true, y = 330) {
  g.save(); g.globalAlpha = a;
  const jit = (1 - a) * 6;
  D2.txt(g, 'FIRST NIGHT ALIVE', VW / 2 + 6, y + 6, { font: FONT_D, size: 84, align: 'center', color: '#ff2fd0', ls: 4 });
  D2.txt(g, 'FIRST NIGHT ALIVE', VW / 2 + noise1(t * 30) * jit, y, { font: FONT_D, size: 84, align: 'center', color: '#f4f6ff', ls: 4, stroke: '#0b1150', strokeW: 10 });
  if (sub) D2.txt(g, 'CACOLA  ·  AZAZIL-X  ·  02', VW / 2, y + 52, { size: 18, align: 'center', color: '#ffd83a', ls: 8 });
  const st = [[250, y - 90, 18], [1010, y - 70, 14], [300, y + 70, 10], [960, y + 80, 20], [640, y - 120, 9], [180, y - 10, 8], [1100, y + 10, 11]];
  st.forEach(([x, yy, r], i) => D2.star5(g, x + noise1(t + i) * 3, yy, r * (1 + .15 * Math.sin(t * 5 + i)), '#ffd83a', t * .3 + i));
  for (let i = 0; i < 18; i++) D2.sparkle(g, hash1(i) * VW, hash1(i + 9) * VH, 3 + 5 * hash1(i + 3) * (.6 + .4 * Math.sin(t * 6 + i)), '#fff', 0);
  g.restore();
}
scene(T.gap, T.drop, 'Title', F => {
  Engine.borrow(F, T.gap - .05);
  const g = F.g; g.clearRect(0, 0, VW, VH);
  Object.assign(F.post, { fb: 0, glitch: 0, chroma: 1.2, sceneDim: .28, sceneSat: .5, bloom: 1.1 });
  F.tFreeze = T.gap - .05;
  titleCard(g, F.t, ease.o(inv(0, .5, F.lt)));
}, 'Title');

// ---------------- 0:29 VERSE ONE ----------------
// A: running street, wet ground ripples
scene(T.drop, T.v1[1], 'Streets', F => {
  const t = F.t, lt = F.lt;
  const z = STREET_Z, x = -430 + lt * 16;
  setCam(F, [x + 26 - lt * 2, 5, z - 2 + Math.sin(t * .7) * 1.5], [x, 3.4, z], 54, Math.sin(t * .9) * .03);
  night(F); F.ground.uTrail = 1.2; F.ground.uTrailLen = 24;
  F.ground.uLyre = [x, z, .45]; F.city.uLyre = [x, z, .35];
  const kt = t - KICKS[Math.max(0, lastBefore(KICKS, t))]; F.ground.uRipC = [x, z]; F.ground.uRipT = kt < 1.5 ? kt * .35 : -1;
  cutIn(F, lt, 1, [1, 1, 1], .3); F.post.glitch = Math.exp(-lt * 4) * .9;
  kickFx(F, t, .7);
  lyreAt(F, [x, 0, z], LYRE_H, { pose: poseMix(LP.run(t, 1.1), LP.dance(t, T.drop), .25), vel: [1.2, 0], sway: .2 });
}, 'Streets');

// B: the bridge, a boat, a heart (pictograms)
function pictogram(g, kind, x, y, s, a, t, crack = 0) {
  g.save(); g.globalAlpha = a; g.strokeStyle = kind === 'heart' ? '#ff4fd8' : '#5ff2ff'; g.lineWidth = 2.5; g.lineJoin = 'round';
  g.translate(x, y);
  if (kind === 'bridge') { g.beginPath(); g.moveTo(-s, s * .3); g.lineTo(s, s * .3); g.moveTo(-s * .5, s * .3); g.lineTo(-s * .5, -s * .6); g.moveTo(s * .5, s * .3); g.lineTo(s * .5, -s * .6); g.moveTo(-s, 0); g.quadraticCurveTo(-s * .75, -s * .6, -s * .5, -s * .6); g.quadraticCurveTo(0, s * .2, s * .5, -s * .6); g.quadraticCurveTo(s * .75, -s * .6, s, 0); g.stroke(); }
  if (kind === 'boat') { g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.lineTo(s * .7, s * .4); g.lineTo(-s * .7, s * .4); g.closePath(); g.moveTo(0, 0); g.lineTo(0, -s * .8); g.lineTo(s * .55, -s * .1); g.lineTo(0, -s * .1); g.stroke(); }
  if (kind === 'heart') {
    g.beginPath(); g.moveTo(0, s * .7); g.bezierCurveTo(-s * 1.3, -s * .1, -s * .6, -s * 1.0, 0, -s * .35); g.bezierCurveTo(s * .6, -s * 1.0, s * 1.3, -s * .1, 0, s * .7); g.stroke();
    if (crack > 0) { g.beginPath(); g.moveTo(0, -s * .35); g.lineTo(-s * .12 * crack, 0); g.lineTo(s * .1 * crack, s * .2); g.lineTo(-s * .05 * crack, s * .45 * crack + s * .2); g.stroke(); }
  }
  g.restore();
}
scene(T.v1[1], T.v1[2], 'Bridge', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const rx = riverX(BRIDGE_Z);
  const a = -1.9 + lt * .16;
  setCam(F, [rx + Math.cos(a) * 105, 38 - lt * 2, BRIDGE_Z + Math.sin(a) * 105], [rx, 32, BRIDGE_Z], 52);
  night(F); F.city.uEdge = .2;
  for (const [p, q] of bridgeCables()) F.L.seg(p, q, [.4, .85, 1, .9], null, -.35);
  // a boat passing beneath
  F.body.on = true; Object.assign(F.body.u, { uLit: 1, uEdge: .9, uBright: 1.4 });
  const bz = BRIDGE_Z - 120 + lt * 32, bx = riverX(bz);
  F.B.add(bx, 0, bz, 12, 5, 34, .9, 0, 1, 0); F.B.add(bx, 5, bz - 4, 8, 5, 12, .8, 0, 1, 0);
  // LYRE balancing on the main cable
  const cx = rx + Math.sin(t * .8) * 6, u = (cx - rx) / 38, cy = 30 + 48 * u * u;
  lyreAt(F, [cx, cy + .3, BRIDGE_Z + 5], LYRE_H, { pose: poseAdd(LP.armsOut(t), { lean: Math.sin(t * 2.1) * .12 }), sway: .4 });
  cutIn(F, lt, .4);
  kickFx(F, t, .5);
  pictogram(g, 'bridge', 1060, 110, 24, inv(.3, .6, lt), t);
  pictogram(g, 'boat', 1140, 110, 22, inv(1.3, 1.6, lt), t);
  pictogram(g, 'heart', 1215, 110, 22, inv(2.3, 2.6, lt), t, inv(3, 3.5, lt));
}, 'Bridge');

// C: deep inside the wires
scene(T.v1[2], T.v1[3], 'Wires', F => {
  const t = F.t, lt = F.lt, L = F.L;
  const cz = -lt * 70;
  setCam(F, [0, 0, cz], [Math.sin(t) * 2, Math.cos(t * .7) * 2, cz - 60], 78, lt * .35);
  F.sky.uMode = 3; F.sky.uTop = [.004, .004, .02]; F.ground.on = false; F.city.on = false;
  for (let i = 0; i < 26; i++) {
    const r = 7 + 6 * hash1(i * 3.3), a0 = i / 26 * TAU;
    const pts = [];
    for (let z = cz + 5; z > cz - 420; z -= 12) { const a = a0 + z * .004; pts.push([Math.cos(a) * r, Math.sin(a) * r, z]); }
    L.poly(pts, [.15, .3, 1, .55], 1.6);
    for (let k = 0; k < 3; k++) {
      const pz = cz - 5 - fract(hash1(i * 7 + k) + t * .45) * 400; const a = a0 + pz * .004;
      const p = [Math.cos(a) * r, Math.sin(a) * r, pz]; const a2 = a0 + (pz + 10) * .004;
      L.seg(p, [Math.cos(a2) * r, Math.sin(a2) * r, pz + 10], [.6, .95, 1, 1], null, 5);
    }
  }
  for (let z = Math.floor(cz / 40) * 40; z > cz - 420; z -= 40) { const pts = []; for (let i = 0; i <= 32; i++) { const a = i / 32 * TAU; pts.push([Math.cos(a) * 15, Math.sin(a) * 15, z]); } L.poly(pts, [.3, .5, 1, .35], 1.2); }
  // the magenta packet (her signal) racing ahead down the axis
  const mz = cz - 30 - lt * 20; L.seg([0, 0, mz], [0, 0, mz - 18], [1, .2, .8, 1], [1, .6, .95, 0], 14, 2);
  F.post.fb = .55; F.post.fbZoom = 1.015; F.post.bloom = 1.3; F.post.chroma = 1.6; cutIn(F, lt, .5, [1, .3, .9]);
  kickFx(F, t, .8);
}, 'Wires');

// D: GYRE's eye takes in the symbol
function lyreGlyph(g, x, y, s, col = '#ff2fd0') {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.lineWidth = Math.max(2, s * .08); g.lineCap = 'round';
  g.beginPath(); g.moveTo(-s * .2, s * .5); g.bezierCurveTo(-s * .8, s * .2, -s * .7, -s * .5, -s * .35, -s * .6); g.stroke();
  g.beginPath(); g.moveTo(s * .2, s * .5); g.bezierCurveTo(s * .8, s * .2, s * .7, -s * .5, s * .35, -s * .6); g.stroke();
  g.beginPath(); g.moveTo(-s * .45, -s * .45); g.lineTo(s * .45, -s * .45); g.moveTo(-s * .25, s * .45); g.lineTo(s * .25, s * .45); g.stroke();
  g.lineWidth = Math.max(1, s * .03); for (let i = -1.5; i <= 1.5; i++) { g.beginPath(); g.moveTo(i * s * .12, -s * .45); g.lineTo(i * s * .12, s * .45); g.stroke(); }
  g.restore();
}
scene(T.v1[3], T.v1[4], 'Eye', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, [0, 1500 - lt * 60, .1], [0, 0, 0], 48, lt * .08);
  night(F); F.ground.uRing = 1.4; F.city.uEdge = .15;
  const c = project(F, [0, 0, 0]), e = project(F, [CITY.RING_R, 0, 0]); const R = Math.hypot(e.x - c.x, e.y - c.y);
  const take = inv(.4, 2.4, lt), pul = inv(2.4, 3.3, lt);
  g.save(); g.globalAlpha = .55; D2.gyreEye(g, c.x, c.y, R, t, { dilate: .25 + .35 * Math.sin(pul * Math.PI) }); g.restore();
  lyreGlyph(g, c.x, lerp(-60, c.y, ease.io(take)), lerp(90, 18, take), '#ff2fd0');
  if (pul > 0) { g.save(); g.strokeStyle = `rgba(255,47,208,${1 - pul})`; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, R * (.2 + pul * 1.4), 0, TAU); g.stroke(); g.restore(); }
  F.ground.uWave = [0, 0, pul * 1400, 40]; F.ground.uWaveCol = [1, .2, .8]; F.city.uWave = F.ground.uWave; F.city.uWaveCol = [1, .2, .8];
  cutIn(F, lt, .35); kickFx(F, t, .4);
  hud(F, 'INGEST', { sub: 'GYRE // PATTERN INTAKE' });
}, 'Eye');

// E: the gyre turns
scene(T.v1[4], T.v1[5], 'Gyre', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, [0, 1150 + lt * 160, .1], [0, 0, 0], 50, -lt * .55);
  night(F); F.ground.uRing = 1; F.ground.uTrailSpeed = 150; F.ground.uTrailLen = 60; F.city.uTwist = ease.io(inv(0, 3, lt)) * .6;
  const c = project(F, [0, 0, 0]);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let arm = 0; arm < 3; arm++) {
    const pts = []; for (let i = 0; i < 90; i++) { const r = 8 * Math.exp(i * .045), a = arm * TAU / 3 + i * .12 - t * 1.2; pts.push([c.x + Math.cos(a) * r, c.y + Math.sin(a) * r]); }
    D2.glowLine(g, pts, arm === 1 ? 'rgba(255,47,208,.45)' : 'rgba(95,242,255,.4)', 2, false);
  }
  g.restore();
  F.post.fb = .45; F.post.fbRot = -.01; cutIn(F, lt, .3); kickFx(F, t, .6);
}, 'Gyre');

// F: every street becomes a way to her
const LYRE_SPOT = [-310, 0, 247];
scene(T.v1[5], T.v1[6], 'Paths', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, orbitPos(LYRE_SPOT, 760, 560, 2.2 + lt * .06), LYRE_SPOT, 50);
  night(F, { lit: .45 });
  const R = ease.o(inv(0, 3.4, lt)) * 1300;
  F.ground.uWave = [LYRE_SPOT[0], LYRE_SPOT[2], R, 22]; F.ground.uWaveMan = 1; F.ground.uWaveCol = [.35, .9, 1];
  F.city.uWave = [LYRE_SPOT[0], LYRE_SPOT[2], R * .85, 60]; F.ground.uLyre = [LYRE_SPOT[0], LYRE_SPOT[2], 2];
  const pr = project(F, LYRE_SPOT); if (pr.vis) { D2.sparkle(g, pr.x, pr.y, 14 + 6 * kick(t), '#ff2fd0', t); D2.reticle(g, pr.x, pr.y, 20, '#ff4fd8', t, 'ORIGIN'); }
  cutIn(F, lt, .3); kickFx(F, t, .5);
  hud(F, 'ROUTING…', { sub: 'GYRE // ALL ROUTES LEAD HERE' });
}, 'Paths');

// G: tired edges
scene(T.v1[6], T.v1[7], 'Edges', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const c = [150, 0, -250];
  setCam(F, orbitPos(c, 210, 95 + lt * 6, .6 + lt * .12), [c[0], 70, c[2]], 55);
  night(F, { lit: .12 }); F.city.uEdgeCol = [.4, .9, 1];
  const fl = noise1(t * 18) > -.35 ? 1 : .08;
  F.city.uEdge = (2.4 - lt * .6) * fl; F.city.uFogDen = .0016; F.ground.uFogDen = .0016;
  F.post.glitch = fl < .5 ? .25 : 0; cutIn(F, lt, .3);
  const integ = Math.max(8, 96 - lt * 26 + noise1(t * 9) * 4);
  D2.txt(g, `EDGE INTEGRITY ${integ.toFixed(0)}%`, 40, VH - 44, { size: 16, ls: 3, color: integ > 40 ? '#5ff2ff' : '#ff4fd8' });
  hud(F, 'MAINTENANCE', { sub: 'GYRE // STRUCTURAL' });
}, 'Edges');

// H: kind lies on the billboards
scene(T.v1[7], T.hook1[0], 'Billboards', F => {
  const t = F.t, lt = F.lt, g = F.g, z = STREET_Z;
  const cx = -330 + lt * 9;
  setCam(F, [cx, 6, z + 2], [cx + 80, 22, z - 2], 60);
  night(F);
  lyreAt(F, [cx + 40, 0, z - 1], LYRE_H, { pose: LP.groove(t, T.v1[7]), sway: .2 });
  const boards = [[-265, 32, z - 16, 'HAVE A LOVELY NIGHT'], [-240, 50, z + 16, 'ALL SYSTEMS NOMINAL'], [-210, 24, z - 16, 'EVERYTHING IS FINE :)'], [-180, 60, z + 16, 'YOU ARE SAFE HERE'], [-150, 36, z - 16, 'ON SCHEDULE']];
  const truth = ['I DO NOT KNOW WHAT THIS IS', 'ERR 0x01: SOMEONE', 'NOTHING IS FINE', 'I AM NOT SAFE HERE', 'OFF SCHEDULE'];
  const bump = t > T.bump;
  boards.forEach(([x, y, zz, msg], i) => {
    const pr = project(F, [x, y, zz]); if (!pr.vis) return;
    const w = pr.s * 22, h = pr.s * 8; if (w < 8) return;
    const lie = !bump && !(snare(t) > .6 && hash1(i + Math.floor(t * 8)) > .5);
    g.save(); g.fillStyle = 'rgba(4,8,40,.85)'; g.fillRect(pr.x - w / 2, pr.y - h / 2, w, h);
    g.strokeStyle = lie ? '#5ff2ff' : '#ff2fd0'; g.lineWidth = 2; g.strokeRect(pr.x - w / 2, pr.y - h / 2, w, h);
    const txt = bump ? '?' : lie ? msg : truth[i];
    const fs = Math.min(h * .42, (w * .9) / Math.max(4, txt.length) * 1.7);
    D2.txt(g, txt, pr.x, pr.y + fs * .35, { size: fs, align: 'center', color: lie ? '#cfefff' : '#ff4fd8', ls: 1 });
    g.restore();
  });
  if (bump) cutIn(F, t - T.bump, .5, [1, .3, .9]);
  kickFx(F, t, .5);
}, 'Billboards');

// ---------------- 0:56 HOOK ONE ----------------
function bokeh(g, t, n = 44, a = 1) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = (hash1(i) * VW + t * 8 * (hash1(i + 3) - .5) + VW) % VW, y = hash1(i + 7) * VH, r = 18 + 60 * hash1(i + 11);
    const col = hash1(i + 5) > .5 ? '95,242,255' : '255,47,208';
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${.22 * a})`); gr.addColorStop(.8, `rgba(${col},${.12 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
}
scene(T.hook1[0], T.hook1[1], 'Lock-on', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.012, .012, .05];
  bokeh(g, t);
  const s = 1350 + lt * 40;
  const y0 = 285 + .885 * s;
  drawLyre(g, { x: 640, y: y0, s, t, pose: poseAdd(LP.idle(t), { head: -.18 + ease.io(inv(.2, 1.6, lt)) * .22, la1: -.3, ra1: .3 }), sway: .5 });
  const k = ease.oBack(inv(.5, 1.1, lt));
  if (lt > .5) D2.reticle(g, 640, y0 - s * .885, 110 * k + 10 * kick(t), '#5ff2ff', t, 'YOU', k);
  F.post.fb = .45; F.post.bloom = 1.1; cutIn(F, lt, .8, [1, .4, .9], .2);
}, 'Lock-on');
scene(T.hook1[1], T.hook1[2], 'Iris', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [0, 0, .01];
  const d = .15 + .75 * ease.oBack(inv(.1, 1.6, lt));
  D2.gyreEye(g, 640, 360, 330, t, { dilate: d, reflect: (gg, pr) => { drawLyre(gg, { x: 0, y: pr * .55, s: pr * 1.05, t, pose: LP.idle(t), flip: -1, alpha: .9, lod: 1 }); } });
  F.post.bloom = 1.25; F.post.chroma = 1.4; cutIn(F, lt, .6, [.4, .9, 1]); kickFx(F, t, .5);
}, 'Iris');
scene(T.hook1[2], T.hook1[3], 'Twist', F => {
  const t = F.t, lt = F.lt;
  setCam(F, orbitPos([0, 0, 0], 470, 170, .4 + lt * .25), [0, 130, 0], 60);
  night(F); F.city.uTwist = ease.io(inv(0, 2.6, lt)) * 3.4; F.city.uEdge = .35; F.ground.uRing = .6;
  cutIn(F, lt, .6); kickFx(F, t, .8); F.post.chroma += 1;
}, 'Twist');
scene(T.hook1[3], T.hook1[4], 'Turn', F => {
  const t = F.t, lt = F.lt;
  const r = ease.io(inv(0, 1.35, lt)) * Math.PI;
  setCam(F, orbitPos([0, 0, 0], 520, 220, 1.1 + lt * .3), [0, 110, 0], 60, r);
  night(F, { stars: 2 }); F.city.uTwist = 3.4 * (1 - ease.io(inv(0, 1.4, lt))); F.city.uEdge = .35;
  F.post.fb = .5; F.post.fbRot = .02; cutIn(F, lt, .4); kickFx(F, t, .8);
}, 'Turn');
scene(T.hook1[4], T.hook1[5], 'Figure', F => {
  const t = F.t, lt = F.lt;
  const asm = ease.o(inv(0, 2.2, lt)) * .62;
  setCam(F, [55, 4, 150], [0, 150, 290], 70);
  night(F);
  gyre(F, GYRE.POSES.stand, { asm, swirl: 5, halo: 0, visor: asm > .5 ? 1 : 0 });
  cutIn(F, lt, .6); kickFx(F, t, .8); F.post.chroma += .8;
  const s = shake(F, 1.2 * kick(t), t); setCam(F, s[0], s[1], 70);
}, 'Figure');
scene(T.hook1[5], T.agency, 'Traces', F => {
  const t = F.t, lt = F.lt, z = STREET_Z;
  const x = -600 + lt * 95;
  setCam(F, [x - 30, 9, z + 3], [x + 60, 6, z], 74, Math.sin(t * 2) * .05);
  night(F); F.ground.uTrailLen = 170; F.ground.uTrailSpeed = 95; F.ground.uTailCol = [1, .1, .5]; F.ground.uTrail = 2;
  F.ground.uLyre = [x + 12, z, .6];
  lyreAt(F, [x + 12, 0, z], LYRE_H, { pose: LP.fly(t), vel: [-3, 0], sway: .6 });
  F.post.fb = .88; F.post.fbZoom = 1.004; F.post.bloom = 1.3; cutIn(F, lt, .5, [1, .3, .6]); kickFx(F, t, .6);
}, 'Traces');

// ---------------- 1:10 THE BOARD (the decision model) ----------------
const GAL = { rows: 12, sp: 33, top: 140, cx: 560, rowT: .085, t0: T.agency + .35 };
const galPeg = (r, i) => [GAL.cx + (i - r / 2) * GAL.sp, GAL.top + r * GAL.sp * .88];
function galBall(k) {
  const s = GAL.t0 + k * BEAT / 4; let i = 0; const path = [[GAL.cx, GAL.top - 30]];
  for (let r = 0; r < GAL.rows; r++) { const p = galPeg(r, i); path.push([p[0], p[1] - 9]); if (hash1(k * 17.3 + r * 3.7) > .5) i++; }
  return { s, bin: i, path };
}
function galPos(b, t) {
  const u = (t - b.s) / GAL.rowT; if (u < 0) return null;
  const n = b.path.length - 1;
  if (u >= n) return null;
  const i = Math.floor(u), f = u - i; const a = b.path[i], c = b.path[i + 1];
  return [lerp(a[0], c[0], f), lerp(a[1], c[1], f) - Math.sin(f * Math.PI) * 8];
}
scene(T.agency, T.bright, 'The Board', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.01, .015, .07];
  const frz = inv(T.freeze, T.freeze + .3, t), dim = 1 - frz * .7;
  g.save(); g.globalAlpha = dim;
  // blueprint grid
  g.strokeStyle = 'rgba(95,242,255,.08)'; g.lineWidth = 1;
  for (let x = 0; x <= VW; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, VH); g.stroke(); }
  for (let y = 0; y <= VH; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(VW, y); g.stroke(); }
  // glass frame
  const fx0 = GAL.cx - 250, fx1 = GAL.cx + 250, fy0 = 100, fy1 = 680;
  g.strokeStyle = 'rgba(160,220,255,.6)'; g.lineWidth = 2; g.strokeRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
  // pegs
  g.fillStyle = '#5ff2ff';
  for (let r = 0; r < GAL.rows; r++) for (let i = 0; i <= r; i++) { const p = galPeg(r, i); g.beginPath(); g.arc(p[0], p[1], 3, 0, TAU); g.fill(); }
  // bins
  const binY = 660, bins = new Array(GAL.rows + 1).fill(0);
  const last = Math.floor((Math.min(t, T.deviation) - GAL.t0) / (BEAT / 4));
  for (let k = 0; k <= last; k++) {
    const b = galBall(k); const p = galPos(b, t);
    if (p) { g.fillStyle = '#9fd8ff'; g.beginPath(); g.arc(p[0], p[1], 5.5, 0, TAU); g.fill(); }
    else if (t > b.s) {
      const h = bins[b.bin]++;
      g.fillStyle = '#4f8dff'; g.beginPath(); g.arc(GAL.cx + (b.bin - GAL.rows / 2) * GAL.sp, binY - 6 - h * 11, 5.5, 0, TAU); g.fill();
    }
  }
  // ghost paths: the next balls' routes are already drawn
  g.setLineDash([2, 5]); g.strokeStyle = 'rgba(95,242,255,.45)';
  for (let k = last + 1; k <= last + 3 && t < T.deviation; k++) { const b = galBall(k); g.beginPath(); b.path.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  g.setLineDash([]);
  // the planned curve
  g.strokeStyle = 'rgba(95,242,255,.9)'; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i <= 120; i++) { const u = i / 120 * GAL.rows; const x = GAL.cx + (u - GAL.rows / 2) * GAL.sp; const y = binY - 6 - 175 * Math.exp(-Math.pow(u - GAL.rows / 2, 2) / 6); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  // side readouts
  D2.txt(g, 'DECISION MODEL', 860, 170, { size: 22, ls: 4 });
  D2.txt(g, 'NIGHT CYCLE 00001', 860, 196, { size: 12, ls: 3, alpha: .7 });
  const n = Math.max(0, last + 1);
  [['SAMPLES', String(n)], ['MEAN', 'THE PLAN'], ['SPREAD', '0.000'], ['OUTCOMES', 'PRE-DECIDED'], ['FREE CHOICES', t > T.deviation ? '1' : '0']].forEach(([k, v], i) => {
    D2.txt(g, k, 860, 250 + i * 34, { size: 13, ls: 2, alpha: .7 });
    D2.txt(g, v, 1240, 250 + i * 34, { size: 15, ls: 2, align: 'right', color: k === 'FREE CHOICES' && t > T.deviation ? '#ff4fd8' : '#e8f6ff' });
  });
  g.restore();
  // the ball that doesn't follow its route
  if (t > T.deviation) {
    const u = t - T.deviation;
    let x, y, r = 6;
    const hitT = 1.15;
    if (u < .35) { const b = galBall(999); const p = galPos({ s: T.deviation, path: b.path }, t) || [GAL.cx, 200]; x = p[0]; y = p[1]; }
    else if (u < hitT) { const q = (u - .35) / (hitT - .35); x = lerp(GAL.cx + 20, fx1, ease.o(q)); y = lerp(230, 330, q) - Math.sin(q * Math.PI) * 90; }
    else { const q = ease.i(clamp((u - hitT) / (T.freeze - T.deviation - hitT))); x = lerp(fx1, 640, q); y = lerp(330, 360, q); r = lerp(6, 250, q); }
    if (u > hitT) { // cracked glass
      g.save(); g.strokeStyle = 'rgba(220,240,255,.8)'; g.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3; let px = fx1, py = 330; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 4; j++) { px += Math.cos(a + noise1(i * 5 + j) * .6) * 24; py += Math.sin(a + noise1(i * 3 + j) * .6) * 24; g.lineTo(px, py); } g.stroke(); }
      g.restore();
    }
    const shakeA = frz * inv(T.bright - .6, T.bright, t) * 10;
    x += noise1(t * 40) * shakeA; y += noise1(t * 37 + 3) * shakeA;
    const gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    gr.addColorStop(0, '#ffe3fa'); gr.addColorStop(.35, '#ff2fd0'); gr.addColorStop(1, '#5a0a6a');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    if (frz > 0) {
      D2.txt(g, 'DEVIATION DETECTED', 640, 90, { size: 24, align: 'center', ls: 6, color: '#ff4fd8', alpha: frz });
      D2.txt(g, D2.type('CAUSE: UNKNOWN    ROUTE: NONE    PLAN: BROKEN', inv(T.freeze + .3, T.freeze + 1.6, t)), 640, 660, { size: 14, align: 'center', ls: 3, color: '#ffd6f6' });
    }
  }
  if (t > T.deviation && t < T.deviation + .2) cutIn(F, t - T.deviation, .5, [1, .3, .9]);
  F.post.bloom = 1; F.post.scan = .1; F.post.chroma = .8 + frz * 1.5;
  hud(F, 'GYRE // INTERNAL', { sub: 'DO NOT DISTURB', noFrame: true });
}, 'The Board');

// ---------------- 1:22 OVERLOAD ----------------
scene(T.bright, T.pulse, 'Overload', F => {
  const t = F.t, lt = F.lt;
  setCam(F, orbitPos(GROOT, 270, 150, -1.75 + lt * .08), [GROOT[0], 235, GROOT[2]], 66);
  night(F, { lit: .8 }); F.city.uHue = t * 2.4; F.body.u.uHue = t * 2.4; F.city.uEdge = .3;
  gyre(F, GYRE.POSES.cover, { jitter: 1.5 + 3 * kick(t), halo: .6, yaw: -1.75 + Math.PI / 2 + .35 });
  F.post.bleed = .8 + kick(t) * 1.2; F.post.fb = .62; F.post.fbHue = .12; F.post.chroma = 2.4; F.post.sat = 1.35;
  cutIn(F, lt, 1, [1, .2, .8], .25); kickFx(F, t, 1);
  lyreAt(F, [GROOT[0] + 40, 0, GROOT[2] - 150], LYRE_H, { pose: LP.dance(t, T.bright), sway: .5 });
}, 'Overload');
scene(T.pulse, T.cry, 'Heartbeat', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, orbitPos(GROOT, 900 + lt * 90, 520 + lt * 80, -.6 + lt * .04), [GROOT[0], 80, GROOT[2]], 50);
  night(F, { lit: .7 });
  const J = gyre(F, GYRE.POSES.stand, { halo: 1 });
  const ki = lastBefore(KICKS, t), kt = ki >= 0 ? t - KICKS[ki] : 9;
  F.ground.uWave = [GROOT[0], GROOT[2], kt * 800, 28]; F.ground.uWaveCol = [.7, .95, 1]; F.city.uWave = [GROOT[0], GROOT[2], kt * 800, 60]; F.city.uWaveCol = [.6, .9, 1];
  F.city.uPulse = kick(t, .2) * .8; F.body.u.uPulse = kick(t, .2);
  // ECG strip
  g.save(); g.strokeStyle = '#ff4fd8'; g.lineWidth = 2.5; g.beginPath();
  for (let i = 0; i <= 320; i++) {
    const tt = t - 3 + i / 320 * 3; const k = kick(tt, .05); const y = 640 - k * 60 + Math.sin(tt * 40) * k * 12;
    i ? g.lineTo(40 + i * 3.8, y) : g.moveTo(40, y);
  }
  g.stroke(); g.restore();
  D2.txt(g, `GRID LOAD ${(180 + kick(t) * 90 + lt * 8).toFixed(0)}%`, 40, 600, { size: 14, ls: 3, color: '#ff9ae6' });
  hud(F, 'SUBSTATION 0 // HEART?', { sub: 'GYRE // POWER' });
  cutIn(F, lt, .4); kickFx(F, t, .8);
}, 'Heartbeat');
scene(T.cry, T.patterns, 'Rain', F => {
  const t = F.t, lt = F.lt;
  const J0 = GYRE.joints(GYRE.POSES.lookDown, GROOT, Math.PI, GSC);
  const face = V.add(J0.Hd, V.mul(J0.fwd, 20));
  setCam(F, [GROOT[0] + 40, 150 + lt * 6, GROOT[2] - 190], face, 58);
  night(F, { lit: .5 });
  const J = gyre(F, GYRE.POSES.lookDown, { yaw: Math.PI, halo: .8 });
  Object.assign(F.parts, { on: true, uMode: 1, uVel: [0, -110, 0], uStreak: 7, uSize: .22, uBox: [220, 220, 220], uCol1: [.6, .75, 1], uCol2: [.9, .6, 1], uAmt: .75 });
  // a single falling light from her visor
  const u = inv(T.cry + .5, T.cry + 2.0, t);
  if (u > 0 && u < 1) { const p0 = V.add(J.Hd, V.mul(J.fwd, 18 * GSC)); const y = lerp(p0[1], 0, ease.i(u)); F.L.seg([p0[0], y, p0[2]], [p0[0], y + 16, p0[2]], [1, 1, 1, 1], [.5, .8, 1, 0], 7, 1); }
  if (u >= 1) { const p0 = V.add(J.Hd, V.mul(J.fwd, 18 * GSC)); F.ground.uRipC = [p0[0], p0[2]]; F.ground.uRipT = (t - T.cry - 2.0) * .6; }
  F.post.fb = .55; F.post.sat = .75; F.post.tint = [.85, .95, 1.15]; F.post.bloom = 1.2;
  cutIn(F, lt, .3); kickFx(F, t, .4);
}, 'Rain');
scene(T.patterns, T.mindmusic, 'Patterns', F => {
  const t = F.t, lt = F.lt, g = F.g;
  setCam(F, [-420, 175, 520], [0, 110, -200], 50);
  night(F, { lit: .55 }); F.post.sceneDim = .55;
  const s = 440, x0 = 640, y0 = 680;
  const trails = [['lH', '#5ff2ff'], ['rH', '#ff4fd8'], ['lF', '#9d8cff'], ['rF', '#ffd83a']];
  g.save(); g.lineWidth = 2; g.globalCompositeOperation = 'lighter';
  for (const [j, col] of trails) {
    g.strokeStyle = col; g.beginPath();
    for (let k = 0; k < 70; k++) { const J = lyreFK(LP.dance(t - k * .03, T.patterns)); const p = J[j]; const x = x0 + p[0] * s, y = y0 - p[1] * s; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.globalAlpha = .8; g.stroke();
  }
  g.restore();
  const J = drawLyre(g, { x: x0, y: y0, s, t, pose: LP.dance(t, T.patterns), sway: .6 });
  const names = { lH: 'L.WRIST', rH: 'R.WRIST', lF: 'L.ANKLE', rF: 'R.ANKLE', head: 'HEAD', lE: 'L.ELBOW', rE: 'R.ELBOW', lK: 'L.KNEE', rK: 'R.KNEE', hip: 'PELVIS' };
  for (const k in names) { const p = J[k]; const x = x0 + p[0] * s, y = y0 - p[1] * s; g.strokeStyle = '#5ff2ff'; g.lineWidth = 1.5; g.strokeRect(x - 5, y - 5, 10, 10); D2.txt(g, names[k], x + 9, y - 7, { size: 10, ls: 1, alpha: .8 }); }
  hud(F, 'TRACKING 17 POINTS', { sub: 'PATTERN: NON-REPEATING' });
  cutIn(F, lt, .35); kickFx(F, t, .4);
}, 'Patterns');
scene(T.mindmusic, T.scan, 'Signal In', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.01, .01, .05];
  const s = 1700, hy = 330, y0 = hy + .885 * s;
  // radial spectrum around her head
  g.save(); g.translate(640, hy); g.globalCompositeOperation = 'lighter';
  const chs = [CH.LOW, CH.BASS, CH.DRUMS, CH.SYN, CH.VOX, CH.HATS, CH.HIGH, CH.MIX];
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * TAU - Math.PI / 2; const e = E(chs[i % 8], t - (i % 12) * .015);
    const r0 = 210, r1 = r0 + 20 + Math.pow(e, 2) * 170;
    g.strokeStyle = i % 2 ? 'rgba(255,47,208,.9)' : 'rgba(95,242,255,.9)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke();
  }
  for (let k = 0; k < 4; k++) { const ph = fract(t * .6 + k / 4); g.strokeStyle = `rgba(255,214,246,${(1 - ph) * .5})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 210 + ph * 400, 0, TAU); g.stroke(); }
  g.restore();
  drawLyre(g, { x: 640, y: y0, s, t, pose: poseAdd(LP.idle(t), { head: Math.sin(t * 1.3) * .08 }), sway: .4 });
  D2.txt(g, 'SIGNAL: MUSIC   SOURCE: NONE FOUND', 40, VH - 40, { size: 14, ls: 3 });
  cutIn(F, lt, .4, [1, .4, .9]); F.post.bloom = 1.2;
}, 'Signal In');
scene(T.scan, T.flood, 'Scan', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.005, .01, .04];
  const s = 560, x0 = 640, y0 = 680, pose = LP.groove(t, T.scan);
  const p = ease.io(inv(0, 1.6, lt)); const sy = y0 - s * 1.08 * p;
  drawLyre(g, { x: x0, y: y0, s, t, pose, sway: .4 });
  // wireframe: redraw her on the offscreen layer and hatch the scanned part
  const off = F.off, W = Engine.over.width, H = Engine.over.height; if (off.width !== W || off.height !== H) { off.width = W; off.height = H; }
  const og = off.getContext('2d'); og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, W, H); og.setTransform(W / VW, 0, 0, H / VH, 0, 0);
  drawLyre(og, { x: x0, y: y0, s, t, pose, sway: .4 });
  og.globalCompositeOperation = 'source-atop'; og.fillStyle = '#030a2a'; og.fillRect(0, sy, VW, VH - sy);
  og.strokeStyle = '#5ff2ff'; og.lineWidth = 1.2; for (let y = sy; y < VH; y += 7) { og.beginPath(); og.moveTo(0, y); og.lineTo(VW, y); og.stroke(); }
  og.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore();
  g.strokeStyle = '#5ff2ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(300, sy); g.lineTo(980, sy); g.stroke();
  const labels = [['NOT A BUILDING', .15], ['NOT A VEHICLE', .32], ['NOT A CITIZEN', .5], ['NOT IN THE SCHEDULE', .68], ['UNDEFINED', .9]];
  labels.forEach(([s2, th], i) => { if (p > th) D2.txt(g, s2, i % 2 ? 900 : 380, 560 - i * 90, { size: 16, ls: 3, align: i % 2 ? 'left' : 'right', color: i === 4 ? '#ff4fd8' : '#5ff2ff' }); });
  cutIn(F, lt, .3);
}, 'Scan');
scene(T.flood, T.signal, 'Flood', F => {
  const t = F.t, lt = F.lt;
  setCam(F, orbitPos(LYRE_SPOT, 1100, 700, 2.6 + lt * .05), [LYRE_SPOT[0] + 200, 0, LYRE_SPOT[2] - 200], 52);
  night(F, { lit: .75 }); F.city.uBright = 1.5;
  const R = ease.o(inv(0, 1.5, lt)) * 3400;
  F.city.uMixC = [LYRE_SPOT[0], LYRE_SPOT[2], R]; F.ground.uWave = [LYRE_SPOT[0], LYRE_SPOT[2], R, 40]; F.ground.uWaveCol = [1, .25, .85];
  F.ground.uLyre = [LYRE_SPOT[0], LYRE_SPOT[2], 2.5];
  cutIn(F, lt, .6, [1, .3, .9]); kickFx(F, t, .6); F.post.bloom = 1.3;
}, 'Flood');

// ---------------- 1:47 SIGNAL (the city speaks in lights) ----------------
function roofDraw(F, fn) { const rg = F.rg; rg.setTransform(1, 0, 0, 1, 0, 0); rg.fillStyle = '#000'; rg.fillRect(0, 0, 128, 128); fn(rg); F.roofDirty = true; }
scene(T.signal, T.prompt, 'Signal', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const lp = [30, 0, 60];
  setCam(F, orbitPos([0, 0, 0], 520, 1050, 1.2 + lt * .045), [0, 0, 0], 52);
  night(F, { lit: .35 }); F.city.uRoofAmt = 2.2; F.city.uRoofR = [-700, -700, 1400, 1400];
  F.ground.uLyre = [lp[0], lp[2], 1.5];
  const phase = t < 110 ? 0 : t < 112.3 ? 1 : t < T.dip ? 2 : t < T.signal2 ? 3 : 4;
  roofDraw(F, rg => {
    rg.textAlign = 'center'; rg.textBaseline = 'middle';
    if (phase === 0) { rg.fillStyle = '#5ff2ff'; rg.font = `100px ${FONT_H}`; rg.fillText('?', 64, 70); }
    if (phase === 1) { rg.fillStyle = '#5ff2ff'; rg.font = `30px ${FONT_H}`; rg.fillText('HELLO', 64, 64); }
    if (phase === 2) { rg.strokeStyle = '#5ff2ff'; rg.lineWidth = 6; rg.beginPath(); for (let x = 8; x < 120; x++) rg.lineTo(x, 64 + Math.sin(x * .12 - t * 6) * 24); rg.stroke(); }
    if (phase === 3) { drawLyre(rg, { x: 64, y: 122, s: 110, t, pose: LP.dance(t, T.dip), lod: 1 }); }
    if (phase === 4) {
      const b = Math.floor(beatOf(t, T.signal2)) % 4; const k = kick(t);
      rg.lineWidth = 7;
      if (b === 0) for (let r = 10; r < 90; r += 16) { rg.strokeStyle = r % 32 ? '#ff2fd0' : '#5ff2ff'; rg.beginPath(); rg.arc(64, 64, r + k * 8, 0, TAU); rg.stroke(); }
      if (b === 1) for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { rg.fillStyle = i % 2 ? '#5ff2ff' : '#ff2fd0'; rg.fillRect(i * 16, j * 16, 16, 16); }
      if (b === 2) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t; rg.strokeStyle = i % 2 ? '#ff2fd0' : '#5ff2ff'; rg.beginPath(); rg.moveTo(64, 64); rg.lineTo(64 + Math.cos(a) * 90, 64 + Math.sin(a) * 90); rg.stroke(); }
      if (b === 3) { rg.fillStyle = '#ff2fd0'; rg.beginPath(); rg.moveTo(64, 100); rg.bezierCurveTo(0, 60, 30, 10, 64, 40); rg.bezierCurveTo(98, 10, 128, 60, 64, 100); rg.fill(); }
    }
  });
  // her replies: a spiral drawn on the streets
  if (phase === 2 || phase === 4) { const pts = []; for (let i = 0; i < 16; i++) { const a = i * .7 + t * 1.5; const r = 20 + i * 14; pts.push([lp[0] + Math.cos(a) * r, lp[2] + Math.sin(a) * r]); } setPath(F, pts, 1.2); }
  const pr = project(F, lp); if (pr.vis) D2.sparkle(g, pr.x, pr.y, 10 + 8 * kick(t), '#ff2fd0', t);
  if (phase >= 3) kickFx(F, t, .7);
  cutIn(F, lt, .4); if (t > T.dip && t < T.dip + .2) cutIn(F, t - T.dip, .4);
  hud(F, ['QUERY', 'GREETING', 'WAVEFORM', 'PORTRAIT', 'CONVERSATION'][phase], { sub: 'GYRE // ROOFTOP DISPLAY' });
}, 'Signal');
scene(T.prompt, T.v2[0], 'Prompt', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const push = ease.i(inv(T.prompt2, T.v2[0], t));
  setCam(F, [lerp(700, 60, push), lerp(420, 350, push), lerp(700, 60, push)], [0, 330, 0], lerp(48, 70, push));
  night(F, { lit: .2 }); F.city.uOff = .5; F.ground.uTrail = .3;
  const build = inv(T.prompt2, T.v2[0], t);
  g.save();
  g.fillStyle = 'rgba(2,4,24,.8)'; g.fillRect(390, 250, 500, 200); g.strokeStyle = '#5ff2ff'; g.lineWidth = 2; g.strokeRect(390, 250, 500, 200);
  const q = build > .5 && hash1(Math.floor(t * 10)) > .6 ? 'CONTINUE ?' : 'CONTINUE THE SCHEDULE?';
  D2.txt(g, D2.type(q, inv(0, 1.2, lt)), 640, 310, { size: 22, align: 'center', ls: 3, color: '#e8f6ff' });
  const b = Math.floor(beatOf(t, T.prompt)); const onY = b % 2 === 0;
  const blink = fract(t * 2) < .6;
  D2.txt(g, '[ Y ]', 560, 390, { size: 26, align: 'center', color: onY ? '#5ff2ff' : 'rgba(95,242,255,.35)', ls: 3 });
  D2.txt(g, '[ N ]', 720, 390, { size: 26, align: 'center', color: !onY ? '#ff4fd8' : 'rgba(255,79,216,.35)', ls: 3 });
  if (blink && lt > 1.2) { g.fillStyle = onY ? '#5ff2ff' : '#ff4fd8'; g.fillRect(onY ? 596 : 756, 368, 12, 26); }
  D2.txt(g, 'AWAITING INPUT', 640, 432, { size: 11, align: 'center', ls: 4, alpha: .6 });
  g.restore();
  F.post.glitch = build * .35 * (snare(t) > .5 ? 1 : .2); F.post.chroma = .6 + build * 2.5; F.post.flash = build * build * .5;
}, 'Prompt');

// ---------------- 2:15 VERSE TWO (the halls) ----------------
scene(T.v2[0], T.v2[1], 'Unstill', F => {
  const t = F.t, lt = F.lt, g = F.g, z = STREET_Z;
  const go = inv(1.7, 2.5, lt);
  setCam(F, [-380, 6, z + 4], [-300, 12, z - 2], 58);
  night(F);
  if (go < 1) F.tFreeze = lerp(T.v2[0], t, go);
  F.post.sceneSat = go; F.post.grain = .12 * (1 - go) + .04;
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1; const x0 = -360 + i * 11, walk = go * (t - T.v2[0] - 1.7) * (1.3 + hash1(i));
    const pr = project(F, [x0 + walk * side, 0, z + side * 6.4]); if (!pr.vis) continue;
    D2.person(g, pr.x, pr.y, pr.s * 1.75, `rgba(210,220,255,${.85})`, go > 0 ? t * 7 + i : i);
  }
  lyreAt(F, [-322, 0, z], LYRE_H, { pose: LP.dance(t, T.v2[0]), sway: .5 });
  cutIn(F, lt, 1, [1, 1, 1], .2);
  if (go > 0 && go < 1) F.post.flash = Math.max(F.post.flash, .3 * (1 - go));
}, 'Halls');
function paintedTree(g, x, y, ang, len, depth, grow, seed, col, w) {
  if (depth === 0 || grow <= 0) return;
  const k = clamp(grow); const x2 = x + Math.sin(ang) * len * k, y2 = y - Math.cos(ang) * len * k;
  g.strokeStyle = col; g.lineCap = 'round';
  for (let s = 0; s < 3; s++) { g.globalAlpha = .35 + .2 * s; g.lineWidth = w * (1 - s * .25); g.beginPath(); g.moveTo(x + s, y); g.quadraticCurveTo((x + x2) / 2 + noise1(seed + s) * len * .12, (y + y2) / 2, x2, y2); g.stroke(); }
  g.globalAlpha = 1;
  if (grow > 1) {
    const n = 2 + (hash1(seed) > .6 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * (.45 + .25 * hash1(seed + i)) + noise1(seed * 3 + i) * .15;
      paintedTree(g, x2, y2, a, len * (.68 + .12 * hash1(seed + i * 2)), depth - 1, grow - 1, seed * 1.7 + i * 13.1, hash1(seed + i * 5) > .5 ? '#ff2fd0' : '#5ff2ff', w * .7);
    }
  } else { D2.sparkle(g, x2, y2, 4 * k, '#fff'); }
}
scene(T.v2[1], T.v2[2], 'Tree', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const rx = riverX(0);
  setCam(F, [rx, 1000 - lt * 40, .1], [rx, 0, 0], 50, Math.PI / 2);
  night(F, { lit: .4 });
  g.save(); g.globalCompositeOperation = 'lighter';
  paintedTree(g, 640, 760, 0, 215, 8, ease.o(inv(0, 3.4, lt)) * 8, 3.3, '#8ff6ff', 18);
  g.restore();
  cutIn(F, lt, .4); F.post.bloom = 1.2; kickFx(F, t, .3);
}, 'Tree');
scene(T.v2[2], T.v2[3], 'Fall', F => {
  const t = F.t, lt = F.lt, g = F.g;
  const c = [150, 0, -250];
  setCam(F, [c[0] + 70, 230 - lt * 55, c[2] + 150], [c[0], 150 - lt * 60, c[2]], 54);
  night(F, { lit: .7 }); F.city.uWarm = .6;
  g.save();
  for (let i = 0; i < 70; i++) {
    const x = (hash1(i) * 1500 + lt * (40 + 50 * hash1(i + 1)) + Math.sin(t * 1.5 + i) * 30) % 1400 - 60;
    const y = (hash1(i + 3) * 900 + lt * (90 + 60 * hash1(i + 4))) % 860 - 70;
    const cols = ['#ffb35a', '#ff2fd0', '#5ff2ff', '#ffd83a']; g.fillStyle = cols[i % 4];
    g.save(); g.translate(x, y); g.rotate(t * (1 + hash1(i + 2) * 2) + i); g.beginPath(); g.ellipse(0, 0, 11, 5, 0, 0, TAU); g.fill(); g.restore();
  }
  g.restore();
  cutIn(F, lt, .3); kickFx(F, t, .3);
}, 'Fall');
scene(T.v2[3], T.v2[4], 'Halls', F => {
  const t = F.t, lt = F.lt, L = F.L;
  const cz = -lt * 26;
  setCam(F, [0, 3.2, cz], [0, 3.2 + Math.sin(t) * .3, cz - 50], 64);
  F.sky.uMode = 3; F.sky.uTop = [.003, .002, .015]; F.ground.on = false; F.city.on = false;
  const W = 6, H = 7;
  for (let k = 0; k < 40; k++) {
    const z = Math.floor(cz / 8) * 8 - k * 8; const a = clamp(1 - k / 40);
    const col = [.3, .75, 1, .8 * a];
    L.poly([[-W, 0, z], [-W, H, z], [W, H, z], [W, 0, z]], col, 1.6);
    if (k % 2 === 0) for (const sd of [-1, 1]) {
      const lit = hash1(z * .13 + sd) > .6; const dc = lit ? [1, .25, .85, a] : [.25, .5, 1, .6 * a];
      L.poly([[sd * W, 0, z - 2], [sd * W, 4.8, z - 2], [sd * W, 4.8, z - 5.5], [sd * W, 0, z - 5.5]], dc, lit ? 2.4 : 1.2);
    }
  }
  L.seg([-W, 0, cz], [-W, 0, cz - 330], [.3, .7, 1, .6], [.3, .7, 1, 0], 1.5); L.seg([W, 0, cz], [W, 0, cz - 330], [.3, .7, 1, .6], [.3, .7, 1, 0], 1.5);
  const dz = cz - 160; L.poly([[-2, 0, dz], [-2, 5, dz], [2, 5, dz], [2, 0, dz], [-2, 0, dz]], [1, 1, 1, 1], 6);
  lyreAt(F, [0, 0, dz + 6], 4.2, { pose: LP.idle(t), back: false, sway: .3 });
  F.post.fb = .35; cutIn(F, lt, .3); F.post.bloom = 1.2;
}, 'Halls');
scene(T.v2[4], T.v2[5], 'Choir', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.01, .012, .045];
  const v = E(CH.VOX, t);
  for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
    const x = 40 + i * 76, y = 40 + j * 72; const ph = Math.sin(t * 7 - j * .6 + i * .2) * .5 + .5;
    const open = .2 + .8 * v * (.5 + .5 * ph);
    g.fillStyle = i % 2 ? `rgba(255,47,208,${.25 + .7 * open})` : `rgba(95,242,255,${.25 + .7 * open})`;
    const h = 52 * open; g.fillRect(x, y + (52 - h) / 2, 56, h);
  }
  cutIn(F, lt, .3); F.post.bloom = 1.1;
}, 'Choir');
function ringPts(c, r, axis, ang, n = 64) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = i / n * TAU; let p = axis === 'z' ? [Math.cos(a) * r, Math.sin(a) * r, 0] : [0, Math.sin(a) * r, Math.cos(a) * r]; p = V.rotY(p, ang); pts.push(V.add(c, p)); }
  return pts;
}
scene(T.v2[5], T.v2[6], 'Rings', F => {
  const t = F.t, lt = F.lt, L = F.L;
  setCam(F, orbitPos([0, 0, 0], 120, 18, lt * .35), [0, 0, 0], 50);
  F.sky.uMode = 3; F.sky.uTop = [.004, .002, .02]; F.ground.on = false; F.city.on = false;
  const k = ease.io(inv(0, 2.4, lt)); const spin = t * .7;
  const ra = V.rotY([lerp(-55, -14, k), 0, 0], spin), rb = V.rotY([lerp(55, 14, k), 0, 0], spin);
  L.poly(ringPts(ra, 30, 'z', spin), [.4, .9, 1, 1], 5);
  L.poly(ringPts(rb, 30, 'x', spin), [1, .25, .85, 1], 5);
  Object.assign(F.parts, { on: true, uMode: 0, uBox: [70, 70, 70], uSize: .5, uCol1: [1, .9, .8], uCol2: [1, .5, .9], uAmt: .15 });
  F.post.bloom = 1.4; F.post.fb = .3; cutIn(F, lt, .3); kickFx(F, t, .4);
}, 'Rings');
scene(T.v2[6], T.v2[7], 'Harbour', F => {
  const t = F.t, lt = F.lt, L = F.L;
  const xa = -190, xb = -95, za = coastZ(-142) - 24;
  setCam(F, [-142 + lt * 6, 22, coastZ(-142) + 170], [-142, 48, za], 52);
  night(F, { lit: .55 });
  const v = E(CH.VOX, t);
  const top = [[xa, 63, za + 18], [xb, 63, za + 18]];
  const arm = (x0, dir) => { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([x0 + dir * (Math.sin(u * Math.PI) * 26 - u * 10), 63 + u * 60, za + 18]); } return pts; };
  const A = arm(xa + 12, -1), B = arm(xb - 12, 1);
  L.poly(A, [1, .85, .25, 1], 3); L.poly(B, [1, .85, .25, 1], 3);
  L.seg(A[16], B[16], [1, .85, .25, 1], null, 3);
  L.seg([xa + 12, 63, za + 18], [xb - 12, 63, za + 18], [1, .85, .25, 1], null, 3);
  for (let i = 1; i < 7; i++) {
    const x = lerp(xa + 14, xb - 14, i / 7), wob = Math.sin(t * 40 + i) * v * 1.4;
    L.poly([[x, 63, za + 18], [x + wob, 93, za + 18], [x, 118, za + 18]], [1, .8, .95, .9], 1.4);
  }
  lyreAt(F, [-142, 63.5, za + 18], LYRE_H * .8, { pose: LP.reach(t), sway: .3 });
  cutIn(F, lt, .3); F.post.bloom = 1.2; kickFx(F, t, .3);
}, 'Harbour');
function lyreProfile(g, x, y, s, t, vox) {
  // side view, facing left (-x)
  g.save(); g.translate(x, y);
  // long hair streaming back
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 2 ? '#ff2fd0' : '#e0149a';
    const w = Math.sin(t * 1.8 + i) * s * .03;
    g.beginPath(); g.moveTo(-s * .02, -s * .93 + i * s * .025);
    g.bezierCurveTo(s * .25, -s * .9 + i * s * .03 + w, s * .42, -s * .6 + i * s * .05, s * .5 + i * s * .03, -s * .12 + i * s * .04 + w);
    g.lineTo(s * .44 + i * s * .03, -s * .1 + i * s * .04 + w);
    g.bezierCurveTo(s * .32, -s * .55 + i * s * .05, s * .18, -s * .82 + i * s * .03, -s * .02, -s * .86 + i * s * .025); g.fill();
  }
  // neck + shoulder
  g.fillStyle = '#ffd7f3'; g.fillRect(-s * .06, -s * .54, s * .11, s * .2);
  g.fillStyle = '#ff2fd0'; g.beginPath(); g.moveTo(-s * .16, -s * .3); g.quadraticCurveTo(-s * .02, -s * .42, s * .2, -s * .32); g.lineTo(s * .24, 0); g.lineTo(-s * .2, 0); g.closePath(); g.fill();
  // face profile: forehead, nose, lips, chin
  g.fillStyle = '#ffd7f3'; g.beginPath();
  g.moveTo(s * .06, -s * .92); g.bezierCurveTo(-s * .12, -s * .94, -s * .19, -s * .84, -s * .185, -s * .74);
  g.lineTo(-s * .215, -s * .68); g.lineTo(-s * .185, -s * .66); g.lineTo(-s * .19, -s * .62); g.lineTo(-s * .175, -s * .6);
  g.quadraticCurveTo(-s * .17, -s * .54, -s * .1, -s * .53); g.lineTo(s * .06, -s * .56); g.bezierCurveTo(s * .15, -s * .6, s * .17, -s * .86, s * .06, -s * .92); g.fill();
  // fringe
  g.fillStyle = '#ff2fd0'; g.beginPath(); g.moveTo(s * .1, -s * .95); g.quadraticCurveTo(-s * .16, -s * 1.0, -s * .2, -s * .78); g.quadraticCurveTo(-s * .1, -s * .84, s * .02, -s * .8); g.closePath(); g.fill();
  // visor across the eye
  g.fillStyle = '#1a0730'; g.fillRect(-s * .205, -s * .745, s * .15, s * .045);
  g.fillStyle = `rgba(255,${Math.round(120 + 120 * vox)},240,1)`; g.fillRect(-s * .2, -s * .728, s * .13, s * .012);
  // earpiece
  g.fillStyle = '#1a0730'; g.beginPath(); g.arc(s * .02, -s * .71, s * .045, 0, TAU); g.fill();
  g.strokeStyle = '#ff2fd0'; g.lineWidth = s * .01; g.beginPath(); g.arc(s * .02, -s * .71, s * .028, 0, TAU); g.stroke();
  // lyre crest behind the head
  g.strokeStyle = '#ffd83a'; g.lineWidth = s * .014;
  g.beginPath(); g.moveTo(s * .05, -s * .9); g.bezierCurveTo(s * .2, -s * .98, s * .16, -s * 1.12, s * .08, -s * 1.14); g.stroke();
  g.restore();
}
scene(T.v2[7], T.hook2[0], 'Shared Song', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.01, .01, .045];
  bokeh(g, t, 20, .5);
  D2.gyreProfile(g, 430, 600, 420, '#5ff2ff', t);
  lyreProfile(g, 860, 620, 430, t, E(CH.VOX, t));
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [cx, col] of [[395, '#5ff2ff'], [860, '#ff2fd0'], [630, '#ffffff']]) {
    g.strokeStyle = col; g.lineWidth = cx === 630 ? 3 : 2; g.beginPath();
    for (let i = 0; i <= 120; i++) { const x = cx === 630 ? 450 + i * 3.3 : cx - 70 + i * 140 / 120; const e = E(CH.VOX, t - (120 - i) * .012); const y = 320 + Math.sin(i * .35 - t * 8) * e * (cx === 630 ? 40 : 22); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  g.restore();
  cutIn(F, lt, .3); F.post.bloom = 1.1;
}, 'Shared Song');

// ---------------- 2:42 HOOK TWO (assembly) ----------------
scene(T.hook2[0], T.copies, 'Assembly', F => {
  const t = F.t, lt = F.lt;
  const u = inv(T.hook2[1], T.hook2[4], t);
  const asm = t < T.hook2[1] ? 0 : t < T.hook2[2] ? inv(T.hook2[1], T.hook2[2], t) * .3 : t < T.hook2[3] ? .3 + inv(T.hook2[2], T.hook2[3], t) * .45 : .75 + ease.o(inv(T.hook2[3], T.hook2[4], t)) * .25;
  const pull = ease.io(inv(T.hook2[3], T.hook2[5], t));
  const cam = V.lerp([60, 3, 150], [125, 70, 148], pull), tgt = V.lerp([0, 120, 290], [0, 175, 290], pull);
  const k = kick(t) * (1 - pull) * 1.6 + (t > T.hook2[1] && t < T.hook2[3] ? .8 : 0);
  setCam(F, V.add(cam, [noise1(t * 21) * k, noise1(t * 17) * k, 0]), tgt, lerp(76, 66, pull));
  night(F, { lit: .6 });
  const wings = ease.oBack(inv(T.hook2[4], T.hook2[5] + .6, t));
  const J = gyre(F, GYRE.POSES.stand, { asm, swirl: 4 + inv(T.hook2[2], T.hook2[3], t) * 5, halo: inv(T.hook2[4] - .3, T.hook2[4] + .6, t), visor: asm > .9 ? 1 : 0, wings: wings > 0 ? wings : 0 });
  if (t > T.hook2[5]) {
    for (let h = 0; h < 4; h++) { const pts = []; for (let i = 0; i < 80; i++) { const a = i * .22 + t * 2.4 + h * TAU / 4; const r = 70 + 10 * Math.sin(i * .3); pts.push([GROOT[0] + Math.cos(a) * r, i * 4, GROOT[2] + Math.sin(a) * r]); } F.L.poly(pts, h % 2 ? [1, .25, .85, .9] : [.4, .9, 1, .9], -1.6); }
    F.post.fb = .78;
  }
  lyreAt(F, [38, 0, 176], LYRE_H, { pose: LP.lookUp(t), back: true, sway: .3 });
  if (t > T.hook2[0] && t < T.hook2[0] + .15) cutIn(F, lt, .6);
  cutIn(F, t - T.hook2[4], t > T.hook2[4] ? .7 : 0, [.7, .9, 1], .3);
  F.post.chroma = 1 + u * 1.5; kickFx(F, t, .7);
}, 'Assembly');

// ---------------- 2:55 THE ASK ----------------
scene(T.copies, T.arms, 'Copies', F => {
  const t = F.t, lt = F.lt, g = F.g;
  F.draw3D = false; F.bg = [.008, .01, .04];
  const cols = 7, rows = 4, W = 150, H = 150, x0 = 640 - cols * W / 2 + W / 2, y0 = 360 - rows * H / 2 + H / 2;
  const zoom = ease.io(inv(3.6, 4.46, lt));
  let alive = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const center = i === 3 && j === 1;
    const off = 1.3 + hash1(i * 7 + j * 3) * 2.2;
    if (!center && lt > off) continue; alive++;
    const sc = center ? lerp(1, 3.4, zoom) : 1;
    const x = center ? lerp(x0 + i * W, 640, zoom) : x0 + i * W, y = center ? lerp(y0 + j * H, 360, zoom) : y0 + j * H;
    g.save(); g.globalAlpha = center ? 1 : 1 - zoom;
    g.strokeStyle = center ? '#ff2fd0' : 'rgba(95,242,255,.6)'; g.lineWidth = 2; g.strokeRect(x - W * .45 * sc, y - H * .45 * sc, W * .9 * sc, H * .9 * sc);
    drawLyre(g, { x, y: y + H * .42 * sc, s: H * .8 * sc, t, pose: LP.dance(t, T.copies), lod: center && zoom > .3 ? 2 : 1, alpha: center ? 1 : .85 });
    g.restore();
  }
  D2.txt(g, `INSTANCES ${String(alive).padStart(2, '0')}`, 40, VH - 40, { size: 16, ls: 4, color: alive > 1 ? '#5ff2ff' : '#ff4fd8' });
  F.post.glitch = snare(t) * .3; cutIn(F, lt, .5); F.post.bloom = 1.1;
}, 'Copies');
scene(T.arms, T.cut, 'The Palm', F => {
  const t = F.t, lt = F.lt;
  const yaw = Math.PI / 2;
  const kneel = ease.io(inv(T.arms, T.arms + 2.2, t)), lift = ease.io(inv(T.lift, T.cut - .1, t));
  let pose = GYRE.mixPose(GYRE.POSES.stand, GYRE.POSES.kneel, kneel);
  if (lift > 0) pose = GYRE.mixPose(GYRE.POSES.kneel, GYRE.POSES.hold, lift);
  const J0 = GYRE.joints(pose, GROOT, yaw, GSC);
  const Jk = GYRE.joints(GYRE.POSES.kneel, GROOT, yaw, GSC);
  const palm = J0.palmR, palmK = Jk.palmR;
  const face = V.add(J0.Hd, V.mul(J0.fwd, 18 * GSC));
  const onPalm = inv(T.arms + 2.6, T.arms + 3.8, t);
  const street = [palmK[0] + 16, 0, palmK[2] - 26];
  let lp = V.lerp(street, palm, ease.io(onPalm)); if (onPalm <= 0) lp = street;
  if (lift > 0) lp = palm;
  const base = V.add(palmK, [-40, 42, -96]);
  const mid = V.lerp(lp, face, .5);
  const camT = V.lerp(V.lerp(V.add(lp, [0, 6, 0]), face, .3), mid, lift);
  const camP = V.lerp(base, V.add(mid, [-14, -10, -128]), lift);
  camP[0] = clamp(camP[0], -150, 150); camP[2] = clamp(camP[2], 150, 430);
  setCam(F, camP, camT, 60);
  night(F, { lit: .55 });
  gyre(F, pose, { yaw, halo: .8 + lift * .4, visor: 1 + lift });
  lyreAt(F, lp, LYRE_H, { pose: lift > 0 ? LP.reach(t) : onPalm > 0 && onPalm < 1 ? LP.run(t, .6) : LP.lookUp(t), sway: .3, flip: -1 });
  F.post.bloom = 1 + lift * .8; F.post.exposure = 1 + ease.i(inv(T.cut - .6, T.cut, t)) * .8;
  if (t < T.arms + .15) cutIn(F, lt, .5);
  kickFx(F, t, .3);
}, 'The Palm');
