// ============================================================
// giant.js — GYRE's body: a giant assembled from city blocks.
// Poses are direction vectors per bone in body space
// (x = her right, y = up, z = forward).
// ============================================================
const GYRE = (() => {
  const nrm = V.norm;
  const LEN = { spine: 62, neck: 20, head: 17, shW: 28, up: 52, lo: 48, hipW: 15, th: 60, sh: 58 };
  const POSES = {
    stand: { py: 118, spine: [0, 1, 0], neck: [0, 1, .05], lUp: [-.25, -1, 0], lLo: [-.15, -1, .12], rUp: [.25, -1, 0], rLo: [.15, -1, .12], lTh: [-.05, -1, 0], lSh: [0, -1, -.02], rTh: [.05, -1, 0], rSh: [0, -1, -.02] },
    cover: { py: 116, spine: [0, 1, .14], neck: [0, 1, .3], lUp: [.22, -.11, .97], lLo: [.155, .876, -.457], rUp: [-.22, -.11, .97], rLo: [-.155, .876, -.457], lTh: [-.07, -1, .04], lSh: [0, -1, -.05], rTh: [.07, -1, .04], rSh: [0, -1, -.05] },
    kneel: { py: 64, spine: [0, .6, .8], neck: [0, .55, .85], lUp: [-.3, -.9, .2], lLo: [-.1, -1, .2], rUp: [.1, -.9, .42], rLo: [0, -.95, .3], lTh: [-.08, 0, 1], lSh: [0, -1, 0], rTh: [.06, -.98, .1], rSh: [0, 0, -1] },
    hold: { py: 118, spine: [0, 1, .1], neck: [.05, 1, .22], lUp: [-.3, -1, .05], lLo: [-.15, -1, .2], rUp: [.1, -.35, .93], rLo: [-.39, .915, .1], lTh: [-.05, -1, 0], lSh: [0, -1, -.02], rTh: [.05, -1, 0], rSh: [0, -1, -.02] },
    sit: { py: 30, spine: [0, 1, -.12], neck: [0, .9, -.35], lUp: [-.35, -.8, -.55], lLo: [-.1, -.9, -.3], rUp: [.35, -.8, -.55], rLo: [.1, -.9, -.3], lTh: [-.12, -.05, 1], lSh: [0, -1, .15], rTh: [.12, -.05, 1], rSh: [0, -1, .15] },
    sitFwd: { py: 30, spine: [0, 1, .05], neck: [0, 1, .1], lUp: [-.25, -.9, .4], lLo: [.2, -.4, .9], rUp: [.25, -.9, .4], rLo: [-.2, -.4, .9], lTh: [-.12, -.05, 1], lSh: [0, -1, .15], rTh: [.12, -.05, 1], rSh: [0, -1, .15] },
    wide: { py: 118, spine: [0, 1, 0], neck: [0, 1, 0], lUp: [-1, .15, 0], lLo: [-1, .25, 0], rUp: [1, .15, 0], rLo: [1, .25, 0], lTh: [-.12, -1, 0], lSh: [-.05, -1, 0], rTh: [.12, -1, 0], rSh: [.05, -1, 0] },
    lookDown: { py: 118, spine: [0, 1, .12], neck: [0, .8, .6], lUp: [-.3, -1, .1], lLo: [-.2, -1, .3], rUp: [.3, -1, .1], rLo: [.2, -1, .3], lTh: [-.05, -1, 0], lSh: [0, -1, -.02], rTh: [.05, -1, 0], rSh: [0, -1, -.02] },
    reach: { py: 116, spine: [0, 1, .2], neck: [0, 1, .35], lUp: [-.3, -1, .05], lLo: [-.2, -1, .2], rUp: [.35, -.4, .85], rLo: [.25, -.3, .95], lTh: [-.06, -1, 0], lSh: [0, -1, -.02], rTh: [.06, -1, .05], rSh: [0, -1, -.02] },
  };
  function mixPose(a, b, t) {
    const o = { py: lerp(a.py, b.py, t) };
    for (const k in a) if (k !== 'py') o[k] = nrm(V.lerp(a[k], b[k], t));
    return o;
  }
  function dancePose(t, anchor, amp = 1) {
    const b = beatOf(t, anchor), ph = b * Math.PI, s = Math.sin(ph), c = Math.cos(ph * .5);
    const up = Math.floor(b / 8) % 2 === 0;
    const p = JSON.parse(JSON.stringify(POSES.stand));
    p.spine = nrm([s * .12 * amp, 1, .05]); p.neck = nrm([s * .18 * amp, 1, .1]);
    if (up) { p.lUp = nrm([-.7, .7 + c * .3, .1]); p.lLo = nrm([-.2 + s * .3, 1, .2]); p.rUp = nrm([.7, .7 - c * .3, .1]); p.rLo = nrm([.2 + s * .3, 1, .2]); }
    else { p.lUp = nrm([-.6, -.5 + s * .4, .5]); p.lLo = nrm([.2, .6, .8]); p.rUp = nrm([.6, -.5 - s * .4, .5]); p.rLo = nrm([-.2, .6, .8]); }
    p.lTh = nrm([-.08, -1, Math.max(0, s) * .5 * amp]); p.lSh = nrm([0, -1, -Math.max(0, s) * .6 * amp]);
    p.rTh = nrm([.08, -1, Math.max(0, -s) * .5 * amp]); p.rSh = nrm([0, -1, -Math.max(0, -s) * .6 * amp]);
    p.py = 116 - Math.abs(Math.cos(ph)) * 4;
    return p;
  }
  function walkPose(t, speed = 1) {
    const ph = t * 2.2 * speed, s = Math.sin(ph);
    const p = JSON.parse(JSON.stringify(POSES.stand));
    p.lTh = nrm([-.06, -1, s * .45]); p.rTh = nrm([.06, -1, -s * .45]);
    p.lSh = nrm([0, -1, s * .2 - Math.max(0, -s) * .4]); p.rSh = nrm([0, -1, -s * .2 - Math.max(0, s) * .4]);
    p.lUp = nrm([-.25, -1, -s * .35]); p.rUp = nrm([.25, -1, s * .35]);
    p.spine = nrm([0, 1, .06]); p.py = 116 - Math.abs(Math.cos(ph)) * 3;
    return p;
  }

  // ---- voxel list (built once) ----
  const vox = [];
  (function build() {
    const r = mulberry(4242);
    const add = (bone, n, r0, r1, rMin = .55, szMin = 5, szMax = 11, extra = {}) => {
      for (let i = 0; i < n; i++) vox.push(Object.assign({ bone, t: r(), th: r() * TAU, rf: lerp(Math.max(rMin, .7), 1, Math.sqrt(r())), r0, r1, sz: lerp(szMin, szMax * .85, r() * r()), el: .85 + r() * .5, seed: r(), delay: r() }, extra));
    };
    add('torso', 280, 22, 27); add('hips', 70, 20, 20); add('neck', 22, 8, 8, .3);
    add('head', 120, 17, 17, .45, 4, 9);
    add('lUp', 50, 10, 8); add('rUp', 50, 10, 8); add('lLo', 46, 8, 6); add('rLo', 46, 8, 6);
    add('lHand', 16, 7, 6, .2, 3, 6); add('rHand', 16, 7, 6, .2, 3, 6);
    add('lTh', 72, 13, 10); add('rTh', 72, 13, 10); add('lSh', 60, 10, 7); add('rSh', 60, 10, 7);
    add('lFoot', 14, 7, 7, .3, 4, 8); add('rFoot', 14, 7, 7, .3, 4, 8);
    add('skirt', 190, 24, 44, .85, 5, 10);
    add('hair', 150, 14, 10, .2, 4, 8);
  })();

  function joints(pose, root, yaw, sc) {
    const R = v => V.rotY(v, yaw);
    const W = v => V.add(root, V.mul(R(v), sc));
    const P = [0, pose.py, 0];
    const Cc = V.add(P, V.mul(pose.spine, LEN.spine));
    const N = V.add(Cc, V.mul(pose.neck, LEN.neck));
    const Hd = V.add(N, V.mul(pose.neck, LEN.head));
    const up = pose.spine;
    const side = nrm(V.cross(up, [0, 0, 1])); // body right
    const SL = V.add(V.add(Cc, V.mul(side, -LEN.shW)), [0, -6, 0]), SR = V.add(V.add(Cc, V.mul(side, LEN.shW)), [0, -6, 0]);
    const EL = V.add(SL, V.mul(pose.lUp, LEN.up)), HL = V.add(EL, V.mul(pose.lLo, LEN.lo));
    const ER = V.add(SR, V.mul(pose.rUp, LEN.up)), HR = V.add(ER, V.mul(pose.rLo, LEN.lo));
    const HPL = V.add(P, [-LEN.hipW, 0, 0]), HPR = V.add(P, [LEN.hipW, 0, 0]);
    const KL = V.add(HPL, V.mul(pose.lTh, LEN.th)), FL = V.add(KL, V.mul(pose.lSh, LEN.sh));
    const KR = V.add(HPR, V.mul(pose.rTh, LEN.th)), FR = V.add(KR, V.mul(pose.rSh, LEN.sh));
    const local = { P, Cc, N, Hd, SL, SR, EL, HL, ER, HR, HPL, HPR, KL, FL, KR, FR, up, side };
    const w = {}; for (const k in local) if (k !== 'up' && k !== 'side') w[k] = W(local[k]);
    w.fwd = R([0, 0, 1]); w.right = R(side); w.upv = R(up); w.local = local; w.sc = sc; w.yaw = yaw; w.root = root;
    w.palmR = V.add(w.HR, [0, 5 * sc, 0]); w.palmL = V.add(w.HL, [0, 5 * sc, 0]);
    return w;
  }
  function boneEnds(J, bone) {
    const L = J.local;
    switch (bone) {
      case 'torso': return [L.P, L.Cc];
      case 'hips': return [L.HPL, L.HPR];
      case 'neck': return [L.Cc, L.N];
      case 'head': return [L.Hd, L.Hd];
      case 'lUp': return [L.SL, L.EL]; case 'rUp': return [L.SR, L.ER];
      case 'lLo': return [L.EL, L.HL]; case 'rLo': return [L.ER, L.HR];
      case 'lHand': return [L.HL, L.HL]; case 'rHand': return [L.HR, L.HR];
      case 'lTh': return [L.HPL, L.KL]; case 'rTh': return [L.HPR, L.KR];
      case 'lSh': return [L.KL, L.FL]; case 'rSh': return [L.KR, L.FR];
      case 'lFoot': return [L.FL, L.FL]; case 'rFoot': return [L.FR, L.FR];
      case 'skirt': { const a = V.add(L.P, V.mul(L.up, 16)); return [a, V.add(a, V.mul(L.up, -64))]; }
      case 'hair': { const a = V.add(L.Hd, [0, 6, -10]); return [a, V.add(V.add(L.Cc, [0, -40, -26]), V.mul(L.up, -10))]; }
    }
  }

  // emit voxels into GLR.body. opts: {asm (0..1), swirl, jitter, t}
  function emit(J, o = {}) {
    const B = GLR.body, sc = J.sc, t = o.t || 0;
    const asm = o.asm === undefined ? 1 : o.asm;
    const city = GLR.city;
    for (let i = 0; i < vox.length; i++) {
      const v = vox[i];
      const [A, Bp] = boneEnds(J, v.bone);
      let ax = V.sub(Bp, A); const len = V.len(ax);
      let axn = len > 1e-3 ? V.mul(ax, 1 / len) : [0, 1, 0];
      let u = V.cross(axn, [0, 0, 1]); if (V.len(u) < .2) u = V.cross(axn, [1, 0, 0]); u = nrm(u);
      const w2 = V.cross(axn, u);
      let rr = lerp(v.r0, v.r1, v.t) * v.rf;
      if (v.bone === 'torso') { const k = v.t; rr *= 1 - .25 * Math.exp(-Math.pow((k - .35) / .18, 2)); }
      if (v.bone === 'skirt') rr *= .55 + .45 * v.t;
      let c;
      if (v.bone === 'head' || v.bone.endsWith('Hand') || v.bone.endsWith('Foot')) {
        const ph = Math.acos(1 - 2 * v.seed);
        c = V.add(A, [Math.sin(ph) * Math.cos(v.th) * rr, Math.cos(ph) * rr * 1.15, Math.sin(ph) * Math.sin(v.th) * rr]);
      } else {
        c = V.add(V.add(A, V.mul(ax, v.t)), V.add(V.mul(u, Math.cos(v.th) * rr), V.mul(w2, Math.sin(v.th) * rr)));
      }
      if (o.jitter) c = V.add(c, [noise1(t * 7 + i) * o.jitter, noise1(t * 6 + i * 1.3) * o.jitter, noise1(t * 5 + i * .7) * o.jitter]);
      // to world
      let wc = V.add(J.root, V.mul(V.rotY(c, J.yaw), sc));
      const vertical = Math.abs(axn[1]) > .7 && v.bone !== 'head';
      let sx = v.sz * sc, sy = v.sz * sc * (vertical ? v.el * 1.5 : v.el * .8), sz = v.sz * sc;
      if (v.bone === 'skirt' || v.bone === 'hair') sy *= 2.2;
      // assembly: rise from a building and twist into place
      if (asm < 1) {
        const k = clamp((asm * 1.6 - v.delay * .6) / 1.0);
        const e = ease.io(k);
        const b = city[Math.floor(hash1(i * 7.13) * city.length)];
        const src = [J.root[0] + (b[0] % 400), 0, J.root[2] + (b[2] % 400)];
        const ang = (1 - e) * (o.swirl === undefined ? 4 : o.swirl);
        const rel = V.sub(V.lerp(src, wc, e), J.root);
        const rot = V.rotY(rel, ang);
        wc = V.add(V.add(J.root, rot), [0, Math.sin(e * Math.PI) * 90 * sc, 0]);
        const bw = lerp(b[3] * .6, sx, e), bh = lerp(b[4] * .7, sy, e);
        sx = bw; sz = lerp(b[5] * .6, sz, e); sy = bh;
        if (k <= 0) { sy = sy * .02; }
      }
      B.add(wc[0], wc[1] - sy / 2, wc[2], sx, sy, sz, v.seed, 0, 1, 0);
    }
  }

  // halo ring, visor and bridge-cable wings (glow lines)
  function halo(L, J, t, a = 1, col = [.4, .9, 1]) {
    if (a <= 0) return;
    const sc = J.sc, c = V.add(J.Hd, V.mul(J.upv, 34 * sc)), r = 32 * sc;
    const pts = [];
    for (let i = 0; i <= 64; i++) { const an = i / 64 * TAU; pts.push(V.add(c, V.add(V.mul(J.right, Math.cos(an) * r), V.mul(J.fwd, Math.sin(an) * r * .9)))); }
    L.poly(pts, [col[0], col[1], col[2], a], -2.2 * sc);
    for (let i = 0; i < 24; i++) {
      const an = i / 24 * TAU + t * (i % 2 ? .6 : -.45); const an2 = an + .08;
      const p1 = V.add(c, V.add(V.mul(J.right, Math.cos(an) * r), V.mul(J.fwd, Math.sin(an) * r * .9)));
      const p2 = V.add(c, V.add(V.mul(J.right, Math.cos(an2) * r), V.mul(J.fwd, Math.sin(an2) * r * .9)));
      L.seg(p1, p2, i % 2 ? [1, .3, .85, a] : [1, 1, 1, a], null, -3.2 * sc);
    }
  }
  function visor(L, J, a = 1, col = [.6, .95, 1]) {
    const sc = J.sc, c = V.add(J.Hd, V.add(V.mul(J.fwd, 30 * sc), V.mul(J.upv, 2 * sc)));
    const p1 = V.add(V.add(c, V.mul(J.right, -15 * sc)), V.mul(J.fwd, -5 * sc)), p2 = V.add(V.add(c, V.mul(J.right, 15 * sc)), V.mul(J.fwd, -5 * sc)), m = V.add(c, V.mul(J.fwd, 1 * sc));
    L.poly([p1, m, p2], [col[0], col[1], col[2], a], -3.2 * sc);
  }
  function wings(L, J, spread, t, a = 1, colA = [.35, .85, 1], colB = [1, .25, .8]) {
    if (spread <= 0 || a <= 0) return;
    const sc = J.sc;
    for (const sd of [-1, 1]) {
      const anchor = V.add(J.Cc, V.add(V.mul(J.right, sd * 14 * sc), V.add(V.mul(J.fwd, -16 * sc), V.mul(J.upv, 4 * sc))));
      const flap = Math.sin(t * 1.2) * .08;
      const spar = [];
      for (let k = 0; k <= 16; k++) {
        const u = k / 16; const phi = lerp(.15, 1.35, u) * spread + flap;
        const R = lerp(40, 250, Math.pow(u, .8)) * sc * (.3 + .7 * spread);
        spar.push(V.add(anchor, V.add(V.mul(J.right, sd * Math.cos(phi) * R), V.add(V.mul(J.upv, Math.sin(phi) * R * .9 - 20 * sc * u), V.mul(J.fwd, -30 * sc * u)))));
      }
      L.poly(spar, [colA[0], colA[1], colA[2], a], -2.2 * sc, [1, 1, 1, a], -1 * sc);
      for (let k = 1; k <= 16; k++) {
        const col = V.lerp(colA, colB, k / 16);
        L.seg(anchor, spar[k], [col[0], col[1], col[2], a * .8], null, -.8 * sc);
        const drop = V.add(spar[k], V.mul(J.upv, -lerp(30, 120, k / 16) * sc * spread));
        L.seg(spar[k], drop, [col[0], col[1], col[2], a * .6], [1, .2, .5, 0], -.7 * sc, -.3 * sc);
      }
    }
  }
  return { POSES, mixPose, dancePose, walkPose, joints, emit, halo, visor, wings, vox };
})();
