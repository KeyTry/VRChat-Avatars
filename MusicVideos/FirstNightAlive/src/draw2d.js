// ============================================================
// draw2d.js — overlay drawing: HUD kit, LYRE (the song construct),
// GYRE's eye, Y2K sparkles and other 2D motifs
// Virtual canvas space is 1280 x 720.
// ============================================================
const VW = 1280, VH = 720;
const FONT_D = '"Dela Gothic One", "Arial Black", Impact, sans-serif';
const FONT_H = '"DotGothic16", "Courier New", monospace';

const D2 = {};
D2.txt = function (g, s, x, y, o = {}) {
  g.save();
  g.font = `${o.weight || ''} ${o.size || 14}px ${o.font || FONT_H}`;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = (o.ls || 0) + 'px';
  g.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.stroke) { g.lineWidth = o.strokeW || 4; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillStyle = o.color || '#5ff2ff'; g.fillText(s, x, y);
  g.restore();
};
D2.type = (s, p) => s.slice(0, Math.floor(clamp(p) * s.length));
D2.brackets = function (g, x, y, w, h, col, len = 12, lw = 1.5) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  g.moveTo(x, y + len); g.lineTo(x, y); g.lineTo(x + len, y);
  g.moveTo(x + w - len, y); g.lineTo(x + w, y); g.lineTo(x + w, y + len);
  g.moveTo(x + w, y + h - len); g.lineTo(x + w, y + h); g.lineTo(x + w - len, y + h);
  g.moveTo(x + len, y + h); g.lineTo(x, y + h); g.lineTo(x, y + h - len); g.stroke();
};
D2.reticle = function (g, x, y, r, col, t, label, a = 1) {
  g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 1.5;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  g.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) { const an = i * TAU / 4 + t * .8; g.beginPath(); g.arc(x, y, r * 1.18, an, an + .5); g.stroke(); }
  g.lineWidth = 1.2; g.beginPath();
  g.moveTo(x - r * 1.5, y); g.lineTo(x - r * .6, y); g.moveTo(x + r * .6, y); g.lineTo(x + r * 1.5, y);
  g.moveTo(x, y - r * 1.5); g.lineTo(x, y - r * .6); g.moveTo(x, y + r * .6); g.lineTo(x, y + r * 1.5); g.stroke();
  if (label) D2.txt(g, label, x + r * 1.3, y - r * 1.25, { size: 13, color: col, ls: 2 });
  g.restore();
};
// four-pointed Y2K sparkle
D2.sparkle = function (g, x, y, r, col, rot = 0, thin = .18) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    g.lineTo(Math.cos(a + Math.PI / 4) * r * thin, Math.sin(a + Math.PI / 4) * r * thin);
  }
  g.closePath(); g.fill(); g.restore();
};
// five-pointed star (album-cover style accents)
D2.star5 = function (g, x, y, r, col, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill(); g.restore();
};
D2.glowLine = function (g, pts, col, w, core = true) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  if (core) { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = Math.max(1, w * .3); g.stroke(); }
  g.restore();
};
D2.vignetteBox = function (g, col) { g.fillStyle = col; g.fillRect(0, 0, VW, VH); };

// ------------------------------------------------------------
// GYRE's eye: the ring road is the iris, the avenues are its fibres,
// the core tower is the pupil.
// ------------------------------------------------------------
D2.gyreEye = function (g, x, y, R, t, o = {}) {
  const dil = o.dilate === undefined ? .3 : o.dilate;
  const col = o.col || '#5ff2ff', col2 = o.col2 || '#2437ff';
  g.save(); g.translate(x, y);
  g.globalCompositeOperation = 'lighter';
  // outer ring road
  g.strokeStyle = col; g.lineWidth = R * .05; g.globalAlpha = .9;
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  g.lineWidth = 1.5; g.globalAlpha = .6; g.beginPath(); g.arc(0, 0, R * 1.08, 0, TAU); g.stroke();
  // traffic on the ring
  for (let i = 0; i < 90; i++) {
    const a = i / 90 * TAU + t * (.25 + (i % 3) * .07) * (i % 2 ? 1 : -1);
    g.fillStyle = i % 2 ? '#ff2fd0' : '#ffffff'; g.globalAlpha = .8;
    g.fillRect(Math.cos(a) * R - 1.5, Math.sin(a) * R - 1.5, 3, 3);
  }
  // iris fibres = avenues
  const pr = R * (.18 + .5 * dil);
  g.lineWidth = 1.2;
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU + Math.sin(t * .3 + i) * .01;
    const w = .35 + .65 * hash1(i * 3.1);
    g.strokeStyle = i % 9 === 0 ? '#ffffff' : col2; g.globalAlpha = .35 + .5 * w;
    g.beginPath(); g.moveTo(Math.cos(a) * pr, Math.sin(a) * pr); g.lineTo(Math.cos(a) * R * .95, Math.sin(a) * R * .95); g.stroke();
  }
  // concentric blocks
  for (let k = 1; k < 5; k++) { g.globalAlpha = .25; g.strokeStyle = col; g.beginPath(); g.arc(0, 0, lerp(pr, R, k / 5), 0, TAU); g.stroke(); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // pupil: the core tower from above
  g.fillStyle = '#02030f'; g.beginPath(); g.arc(0, 0, pr, 0, TAU); g.fill();
  g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  const s = pr * .42; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(-s / 2, -s / 2, s, s);
  if (o.reflect) { o.reflect(g, pr); }
  // specular glint
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(-pr * .45, -pr * .5, pr * .16, pr * .1, -.6, 0, TAU); g.fill();
  g.restore();
};

// ------------------------------------------------------------
// LYRE — an original character: a free-roaming song construct.
// Front-facing 2D rig (height = 1 unit, feet at y = 0).
// ------------------------------------------------------------
const LYRE_COL = { core: '#fff0fb', skin: '#ffd7f3', mag: '#ff2fd0', red: '#ff1f4b', vio: '#9d4dff', gold: '#ffd83a', dark: '#1a0730' };
const POSE0 = { x: 0, y: 0, lean: 0, head: 0, la1: -.18, la2: -.08, ra1: .18, ra2: .08, ll1: -.05, ll2: 0, rl1: .05, rl2: 0, skirt: 0 };
function poseMix(a, b, t) { const o = {}; for (const k in POSE0) o[k] = lerp(a[k] ?? POSE0[k], b[k] ?? POSE0[k], t); return o; }
function poseAdd(a, d) { const o = Object.assign({}, a); for (const k in d) o[k] = (o[k] || 0) + d[k]; return o; }

// procedural poses
const LP = {
  idle(t) { const s = Math.sin(t * 1.3); return { x: s * .01, lean: s * .03, head: Math.sin(t * .9) * .06, la1: -.2 + s * .04, la2: -.15, ra1: .22 - s * .04, ra2: .15, ll1: -.04, rl1: .06 }; },
  dance(t, anchor = 0, amp = 1) {
    const b = beatOf(t, anchor); const ph = b * Math.PI; const s = Math.sin(ph), c = Math.cos(ph);
    const bar = Math.floor(b / 4) % 4; const k = Math.pow(Math.abs(Math.sin(ph)), .6) * Math.sign(s);
    const up = bar % 2 === 0;
    return {
      x: k * .03 * amp, y: -Math.abs(c) * .018 * amp, lean: -k * .1 * amp, head: k * .12 * amp,
      la1: up ? -2.4 - s * .3 : -.6 - s * .5 * amp, la2: up ? -.4 : -1.2 + c * .4,
      ra1: up ? 2.4 - s * .3 : .6 - s * .5 * amp, ra2: up ? .4 : 1.2 + c * .4,
      ll1: -.08 + Math.max(0, s) * .35 * amp, ll2: -Math.max(0, s) * .6 * amp,
      rl1: .08 + Math.min(0, s) * .35 * amp, rl2: Math.max(0, -s) * .6 * amp, skirt: k * .3,
    };
  },
  groove(t, anchor = 0, amp = 1) { // arms low, hips and shoulders
    const b = beatOf(t, anchor); const s = Math.sin(b * Math.PI), c = Math.cos(b * Math.PI * .5);
    return { x: s * .025 * amp, y: -Math.abs(Math.cos(b * Math.PI)) * .012, lean: -s * .08 * amp, head: s * .1 + c * .05,
      la1: -.5 - c * .6, la2: -1.4, ra1: .5 - c * .6, ra2: 1.4, ll1: -.06 + Math.max(0, s) * .15, ll2: -Math.max(0, s) * .3, rl1: .06 + Math.min(0, s) * .15, rl2: Math.max(0, -s) * .3, skirt: s * .25 };
  },
  run(t, speed = 1) {
    const ph = t * 9 * speed; const s = Math.sin(ph), c = Math.cos(ph);
    return { y: -Math.abs(c) * .03, lean: .0, head: s * .03, la1: -.35 + s * .7, la2: -1.3, ra1: .35 + s * .7, ra2: 1.3,
      ll1: -.05 - Math.max(0, s) * .5, ll2: Math.max(0, s) * .9, rl1: .05 - Math.max(0, -s) * .5, rl2: Math.max(0, -s) * .9, skirt: s * .2 };
  },
  reach(t) { return { lean: .05, head: .1, la1: -.3, la2: -.2, ra1: 1.9, ra2: .15, ll1: -.05, rl1: .12, rl2: .05 }; },
  armsOut(t) { const s = Math.sin(t * 1.5) * .06; return { lean: 0, head: s, la1: -1.5 + s, la2: -.1, ra1: 1.5 - s, ra2: .1, ll1: -.06, rl1: .06 }; },
  armsUp(t) { const s = Math.sin(t * 2) * .08; return { y: .01, la1: -2.8 + s, la2: -.2, ra1: 2.8 - s, ra2: .2, ll1: -.05, rl1: .05, head: .05 }; },
  sit(t) { const s = Math.sin(t * 1.1) * .04; return { y: -.22, lean: -.05, head: .15 + s, la1: -.5, la2: -.6, ra1: .5, ra2: .6, ll1: -1.35, ll2: 1.3, rl1: 1.35, rl2: -1.3, skirt: .1 }; },
  lookUp(t) { const s = Math.sin(t * .9) * .03; return { lean: -.06, head: .35 + s, la1: -.25, la2: -.2, ra1: .3, ra2: .25, ll1: -.06, rl1: .07 }; },
  surf(t) { const s = Math.sin(t * 2.2); return { y: -.08 + s * .01, lean: .08 * s, head: -.05, la1: -1.3 + s * .2, la2: -.3, ra1: 1.2 + s * .2, ra2: .5, ll1: -.35, ll2: .5, rl1: .3, rl2: -.4, skirt: .2 }; },
  fly(t) { const s = Math.sin(t * 3); return { y: .02, lean: .15, head: -.1, la1: -2.5 + s * .1, la2: -.2, ra1: -.4 + s * .1, ra2: -.3, ll1: -.2, ll2: .3, rl1: .15, rl2: .6, skirt: .4 }; },
  spin(t, anchor = 0) { const b = beatOf(t, anchor); const s = Math.sin(b * Math.PI); return { lean: s * .06, head: -s * .1, la1: -1.9, la2: -.9, ra1: 1.6, ra2: .2, ll1: -.02, rl1: .25, rl2: -.35, skirt: .6 + .3 * Math.abs(s) }; },
  bow(t) { return { y: -.02, lean: .25, head: .25, la1: -.1, la2: -.3, ra1: .9, ra2: 1.2, ll1: -.05, rl1: .05 }; },
};

// forward kinematics in rig units (y up)
function lyreFK(p) {
  p = Object.assign({}, POSE0, p);
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const limb = (a, len) => [Math.sin(a) * len, -Math.cos(a) * len];
  const hip = [p.x, .5 + p.y];
  const chest = add(hip, rot(0, .26, p.lean));
  const neck = add(hip, rot(0, .31, p.lean));
  const head = add(neck, rot(0, .075, p.lean + p.head));
  const sh = rot(.075, 0, p.lean);
  const lS = add(chest, [-sh[0], -sh[1]]), rS = add(chest, sh);
  const lE = add(lS, limb(p.la1 + p.lean, .15)), lH = add(lE, limb(p.la1 + p.la2 + p.lean, .14));
  const rE = add(rS, limb(p.ra1 + p.lean, .15)), rH = add(rE, limb(p.ra1 + p.ra2 + p.lean, .14));
  const hp = rot(.048, 0, p.lean * .4);
  const lHp = add(hip, [-hp[0], -hp[1]]), rHp = add(hip, hp);
  const lK = add(lHp, limb(p.ll1, .25)), lF = add(lK, limb(p.ll1 + p.ll2, .24));
  const rK = add(rHp, limb(p.rl1, .25)), rF = add(rK, limb(p.rl1 + p.rl2, .24));
  return { hip, chest, neck, head, lS, rS, lE, lH, rE, rH, lHp, rHp, lK, lF, rK, rF, headAng: p.lean + p.head };
}

// Draw LYRE. o: {x, y (screen feet), s (px height), pose, t, flip, back, vel:[vx,vy] rig-units/s, alpha, lod, eq:[..], vox, scanned}
function drawLyre(g, o) {
  const s = o.s, t = o.t, p = Object.assign({}, POSE0, o.pose), flip = o.flip || 1;
  if (s < 10) { // far away: a bright mote with a tail
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = LYRE_COL.mag; g.beginPath(); g.arc(o.x, o.y - s * .5, Math.max(2.5, s * .35), 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(o.x, o.y - s * .5, Math.max(1.2, s * .15), 0, TAU); g.fill();
    g.restore(); return;
  }
  const J = lyreFK(p);
  const X = u => o.x + u[0] * s * flip, Y = u => o.y - u[1] * s;
  const P = u => [X(u), Y(u)];
  const vox = o.vox === undefined ? E(CH.VOX, t) : o.vox;
  g.save(); g.globalAlpha = o.alpha === undefined ? 1 : o.alpha; g.lineCap = 'round'; g.lineJoin = 'round';
  const lod = o.lod || (s < 60 ? 1 : 2);
  // ---------- hair (behind) ----------
  const vel = o.vel || [0, 0];
  const hairN = lod > 1 ? 7 : 4, segN = lod > 1 ? 13 : 7, segL = .66 / segN;
  const hA = J.head, ha = J.headAng;
  const hairCols = [LYRE_COL.mag, '#ff4fb8', LYRE_COL.red, LYRE_COL.vio, '#ff66e0', LYRE_COL.mag, '#ff3a8a'];
  const hairPts = [];
  for (let r = 0; r < hairN; r++) {
    const u = hairN > 1 ? r / (hairN - 1) - .5 : 0;
    let pt = [hA[0] + u * .085 * Math.cos(ha), hA[1] + .03 + u * .02];
    const pts = [pt];
    for (let j = 1; j <= segN; j++) {
      const k = j / segN;
      let dx = u * .9 * (1 - k * .4) - vel[0] * .5 * k + fbm1(t * .7 + r * 3.1 - j * .15) * .6 * k + (o.sway || 0) * Math.sin(t * 3 - j * .35) * k;
      let dy = -1 - vel[1] * .5 * k;
      const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      const wave = Math.sin(j * 1.1 - t * 9 + r) * vox * .012 * k;
      pt = [pt[0] + dx * segL - dy * wave, pt[1] + dy * segL + dx * wave];
      pts.push(pt);
    }
    hairPts.push(pts);
  }
  const drawRibbon = (pts, w0, w1, col, colTip) => {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const w = lerp(w0, w1, i / (pts.length - 1)) * .5;
      L.push([X([pts[i][0] + nx * w, 0]), Y([0, pts[i][1] + ny * w])]); R.push([X([pts[i][0] - nx * w, 0]), Y([0, pts[i][1] - ny * w])]);
    }
    const gr = g.createLinearGradient(X(pts[0]), Y(pts[0]), X(pts[pts.length - 1]), Y(pts[pts.length - 1]));
    gr.addColorStop(0, col); gr.addColorStop(.7, LYRE_COL.red); gr.addColorStop(1, colTip);
    g.fillStyle = gr; g.beginPath(); L.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]));
    for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
  };
  if (!o.back) for (let r = 0; r < hairN; r++) drawRibbon(hairPts[r], .05, .006, hairCols[r % hairCols.length], 'rgba(255,220,255,.9)');
  // ---------- lyre crest (behind the head) ----------
  if (lod > 1) {
    const hc = J.head; const c = Math.cos(ha), sn = Math.sin(ha);
    const R2 = (dx, dy) => [hc[0] + dx * c - dy * sn, hc[1] + dx * sn + dy * c];
    g.strokeStyle = LYRE_COL.gold; g.lineWidth = Math.max(1.5, s * .012);
    for (const side of [-1, 1]) {
      g.beginPath();
      const a = P(R2(side * .02, .045)), b = P(R2(side * .085, .09)), cc = P(R2(side * .07, .155)), d = P(R2(side * .045, .165));
      g.moveTo(a[0], a[1]); g.bezierCurveTo(b[0], b[1], cc[0], cc[1], d[0], d[1]); g.stroke();
    }
    const bl = P(R2(-.058, .15)), br = P(R2(.058, .15)); g.beginPath(); g.moveTo(bl[0], bl[1]); g.lineTo(br[0], br[1]); g.stroke();
    g.strokeStyle = 'rgba(255,240,255,.9)'; g.lineWidth = Math.max(.8, s * .004);
    for (let k = 0; k < 4; k++) {
      const xx = -.03 + k * .02; const top = P(R2(xx, .148)), bot = P(R2(xx, .075));
      const vib = Math.sin(t * 40 + k * 2) * vox * s * .006;
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo((top[0] + bot[0]) / 2 + vib, (top[1] + bot[1]) / 2, bot[0], bot[1]); g.stroke();
    }
  }
  // ---------- limbs ----------
  const limb = (a, b, w0, w1, col) => {
    const A = P(a), B = P(b); const dx = B[0] - A[0], dy = B[1] - A[1]; const L = Math.hypot(dx, dy) || 1; const nx = -dy / L, ny = dx / L;
    const r0 = w0 * s / 2, r1 = w1 * s / 2;
    g.fillStyle = col; g.beginPath();
    g.moveTo(A[0] + nx * r0, A[1] + ny * r0); g.lineTo(B[0] + nx * r1, B[1] + ny * r1);
    g.lineTo(B[0] - nx * r1, B[1] - ny * r1); g.lineTo(A[0] - nx * r0, A[1] - ny * r0); g.closePath(); g.fill();
    g.beginPath(); g.arc(A[0], A[1], r0, 0, TAU); g.fill();
    g.beginPath(); g.arc(B[0], B[1], r1, 0, TAU); g.fill();
    if (lod > 1) { g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = Math.max(1, s * .004); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }
  };
  const bodyGrad = (y0, y1) => { const gr = g.createLinearGradient(0, Y([0, y0]), 0, Y([0, y1])); gr.addColorStop(0, LYRE_COL.core); gr.addColorStop(1, LYRE_COL.mag); return gr; };
  const limbCol = bodyGrad(.95, .0);
  // legs
  limb(J.lHp, J.lK, .05, .038, limbCol); limb(J.lK, J.lF, .038, .026, limbCol);
  limb(J.rHp, J.rK, .05, .038, limbCol); limb(J.rK, J.rF, .038, .026, limbCol);
  // light boots
  for (const [k, f] of [[J.lK, J.lF], [J.rK, J.rF]]) { const F = P(f); g.fillStyle = LYRE_COL.dark; g.beginPath(); g.ellipse(F[0], F[1], s * .02, s * .012, 0, 0, TAU); g.fill(); g.fillStyle = LYRE_COL.mag; g.fillRect(F[0] - s * .018, F[1] - s * .06, s * .036, s * .012); }
  // back arm (sleeve + light forearm)
  limb(J.lS, J.lE, .04, .032, '#c01aa0'); limb(J.lE, J.lH, .028, .02, limbCol);
  // ---------- skirt / coat with the equaliser hem ----------
  {
    const waist = [J.hip[0] + (J.chest[0] - J.hip[0]) * .35, J.hip[1] + (J.chest[1] - J.hip[1]) * .35];
    const sk = p.skirt || 0, sw = Math.sin(t * 2.3) * .01;
    const hemY = waist[1] - .24;
    const hl = [waist[0] - .105 - sk * .06 + sw, hemY + sk * .05], hr = [waist[0] + .105 + sk * .06 + sw, hemY - sk * .05];
    const wl = [waist[0] - .045, waist[1]], wr = [waist[0] + .045, waist[1]];
    const gr = g.createLinearGradient(0, Y(waist), 0, Y(hl));
    gr.addColorStop(0, 'rgba(255,80,220,.95)'); gr.addColorStop(1, 'rgba(120,20,160,.85)');
    g.fillStyle = gr; g.beginPath();
    const A = P(wl), B = P(hl), Cc = P(hr), Dd = P(wr);
    g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]);
    g.quadraticCurveTo((B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2 + s * .03, Cc[0], Cc[1]); g.lineTo(Dd[0], Dd[1]); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,220,250,.8)'; g.lineWidth = Math.max(1, s * .005); g.stroke();
    // EQ bars along the hem
    const nb = lod > 1 ? 14 : 6;
    for (let i = 0; i < nb; i++) {
      const u = (i + .5) / nb; const hx = lerp(B[0], Cc[0], u), hy = lerp(B[1], Cc[1], u) + Math.sin(u * Math.PI) * s * .015;
      const ch = [CH.LOW, CH.BASS, CH.DRUMS, CH.SYN, CH.VOX, CH.HATS, CH.HIGH][i % 7];
      const e = o.eq ? o.eq[i % o.eq.length] : E(ch, t + i * .01);
      const hgt = s * (.012 + .07 * Math.pow(e, 1.8));
      g.fillStyle = i % 2 ? '#fff' : LYRE_COL.gold; g.globalAlpha *= 1;
      g.fillRect(hx - s * .004, hy, s * .008, hgt);
    }
  }
  // ---------- torso ----------
  {
    const c = J.chest, h = J.hip, n = J.neck;
    const perp = [Math.cos(p.lean), Math.sin(p.lean)];
    const q = (base, w) => [base[0] + perp[0] * w, base[1] + perp[1] * w];
    const pts = [q(n, -.03), q(c, -.075), q([lerp(h[0], c[0], .4), lerp(h[1], c[1], .4)], -.042), q(h, -.058), q(h, .058), q([lerp(h[0], c[0], .4), lerp(h[1], c[1], .4)], .042), q(c, .075), q(n, .03)];
    g.fillStyle = bodyGrad(.85, .45); g.beginPath(); pts.forEach((u, i) => { const pp = P(u); i ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1]); }); g.closePath(); g.fill();
    // collar light + chest core
    const cc = P([lerp(n[0], c[0], .5), lerp(n[1], c[1], .5)]);
    if (!o.back) {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(cc[0], cc[1], s * (.012 + vox * .01), 0, TAU); g.fill();
    g.strokeStyle = LYRE_COL.dark; g.lineWidth = Math.max(1, s * .006); g.beginPath(); const a1 = P(q(c, -.06)), a2 = P([lerp(n[0], c[0], .2), lerp(n[1], c[1], .2)]), a3 = P(q(c, .06)); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.lineTo(a3[0], a3[1]); g.stroke();
    }
  }
  // cropped jacket over the torso
  {
    const c = J.chest, n = J.neck; const perp = [Math.cos(p.lean), Math.sin(p.lean)];
    const q = (base, w, dy = 0) => [base[0] + perp[0] * w, base[1] + perp[1] * w + dy];
    for (const sd of [-1, 1]) {
      const pts = [q(n, sd * .028), q(c, sd * .085, .012), q(c, sd * .078, -.07), q(c, sd * .03, -.045)];
      g.fillStyle = sd < 0 ? '#c01aa0' : LYRE_COL.mag; g.beginPath(); pts.forEach((u, i) => { const pp = P(u); i ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1]); }); g.closePath(); g.fill();
      if (lod > 1) { g.strokeStyle = LYRE_COL.gold; g.lineWidth = Math.max(1, s * .004); g.stroke(); }
    }
  }
  // front arm (sleeve + light forearm)
  limb(J.rS, J.rE, .04, .032, LYRE_COL.mag); limb(J.rE, J.rH, .028, .02, limbCol);
  for (const hnd of [J.lH, J.rH]) { const H = P(hnd); g.fillStyle = '#fff'; g.beginPath(); g.arc(H[0], H[1], s * .016, 0, TAU); g.fill(); }
  // ---------- head ----------
  {
    const hc = P(J.head); const ang = -J.headAng * flip;
    g.save(); g.translate(hc[0], hc[1]); g.rotate(ang);
    if (!o.back) {
      g.fillStyle = LYRE_COL.skin; g.beginPath(); g.ellipse(0, 0, s * .052, s * .062, 0, 0, TAU); g.fill();
      // visor band
      g.fillStyle = LYRE_COL.dark; g.beginPath(); g.ellipse(0, -s * .004, s * .054, s * .016, 0, 0, TAU); g.fill();
      const vb = .7 + .3 * Math.sin(t * 6) + vox * .5;
      g.strokeStyle = `rgba(255,${Math.round(120 + 100 * vox)},240,${clamp(vb)})`; g.lineWidth = Math.max(1.2, s * .007);
      g.beginPath(); g.moveTo(-s * .042, -s * .004); g.quadraticCurveTo(0, s * .004, s * .042, -s * .004); g.stroke();
      // mouth reacts to the vocal
      g.fillStyle = LYRE_COL.red; g.beginPath(); g.ellipse(0, s * .03, s * .008, s * (.002 + vox * .009), 0, 0, TAU); g.fill();
      // earpieces
      for (const sd of [-1, 1]) { g.fillStyle = LYRE_COL.dark; g.beginPath(); g.arc(sd * s * .052, 0, s * .015, 0, TAU); g.fill(); g.strokeStyle = LYRE_COL.mag; g.lineWidth = Math.max(1, s * .004); g.beginPath(); g.arc(sd * s * .052, 0, s * .01, 0, TAU); g.stroke(); }
      // bangs: one solid fringe with a scalloped edge
      g.fillStyle = LYRE_COL.mag; g.beginPath();
      g.moveTo(-s * .058, -s * .005); g.quadraticCurveTo(-s * .064, -s * .07, 0, -s * .071); g.quadraticCurveTo(s * .064, -s * .07, s * .058, -s * .005);
      for (let k = 0; k <= 6; k++) { const bx = s * (.05 - k * .0167); g.quadraticCurveTo(bx + s * .004, -s * .03, bx - s * .0083, -s * (.022 + (k % 2) * .008)); }
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,220,250,.8)'; g.fillRect(-s * .03, -s * .062, s * .02, s * .006);
    } else {
      g.fillStyle = LYRE_COL.mag; g.beginPath(); g.ellipse(0, 0, s * .056, s * .064, 0, 0, TAU); g.fill();
      for (const sd of [-1, 1]) { g.fillStyle = LYRE_COL.dark; g.beginPath(); g.arc(sd * s * .053, 0, s * .014, 0, TAU); g.fill(); }
    }
    g.restore();
  }
  if (o.back) for (let r = 0; r < hairN; r++) drawRibbon(hairPts[r].map((q, i) => i === 0 ? q : [q[0], q[1] + .01]), .07, .01, hairCols[r % hairCols.length], 'rgba(255,220,255,.9)');
  // wireframe scan overlay (optional)
  if (o.scan !== undefined) {
    const sy = o.y - s * o.scan;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = '#5ff2ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(o.x - s * .5, sy); g.lineTo(o.x + s * .5, sy); g.stroke();
  }
  g.restore();
  return J;
}

// quick silhouettes for crowds / eras
D2.person = function (g, x, y, h, col, ph = 0) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y - h * .9, h * .08, 0, TAU); g.fill();
  const sw = Math.sin(ph) * h * .08;
  g.fillRect(x - h * .07, y - h * .8, h * .14, h * .38);
  g.strokeStyle = col; g.lineWidth = h * .06; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - h * .03, y - h * .43); g.lineTo(x - h * .03 + sw, y); g.moveTo(x + h * .03, y - h * .43); g.lineTo(x + h * .03 - sw, y); g.stroke();
};

// blocky profile of GYRE's head (used in the "shared song" shot)
D2.gyreProfile = function (g, x, y, s, col, t) {
  const rows = [[0, .1, .5], [.1, .2, .62], [.2, .32, .7], [.32, .44, .72], [.44, .55, .76], [.55, .66, .7], [.66, .76, .58], [.76, .86, .5], [.86, 1, .42]];
  g.save(); g.translate(x, y);
  for (const [a, b, w] of rows) {
    g.fillStyle = '#081040'; g.fillRect(-w * s, -b * s, w * s, (b - a) * s);
    g.strokeStyle = col; g.lineWidth = 1.5; g.strokeRect(-w * s, -b * s, w * s, (b - a) * s);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      if (hash2(a * 40 + i, j + Math.floor(t * 2)) > .5) { g.fillStyle = col; g.fillRect(-w * s + (i + .3) * w * s / 6, -b * s + (j + .3) * (b - a) * s / 2, w * s / 6 * .4, (b - a) * s / 2 * .4); }
    }
  }
  // nose/brow step & visor
  g.fillStyle = '#081040'; g.fillRect(0, -.62 * s, .08 * s, .1 * s); g.strokeRect(0, -.62 * s, .08 * s, .1 * s);
  g.fillStyle = '#ffffff'; g.fillRect(-.05 * s, -.7 * s, .12 * s, .025 * s);
  g.restore();
};
