// ============================================================
// core.js — math, noise, easing, audio-envelope access, timing
// ============================================================
const TAU = Math.PI * 2;
const SONG_LEN = 605.26;
const BPM = 145, BEAT = 60 / BPM, BAR = BEAT * 4;

const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
const fract = x => x - Math.floor(x);
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const ease = {
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  o: t => 1 - Math.pow(1 - t, 3),
  i: t => t * t * t,
  oExp: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  iExp: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  oBack: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  sine: t => .5 - .5 * Math.cos(Math.PI * t),
};

// ---------- hashing / noise (deterministic) ----------
function hash1(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return n - Math.floor(n); }
function hash2(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123; return n - Math.floor(n); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u) * 2 - 1; }
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), ux), lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy) * 2 - 1;
}
function fbm1(x, o = 3) { let s = 0, a = .5; for (let i = 0; i < o; i++) { s += a * noise1(x); x = x * 2.03 + 11.7; a *= .5; } return s; }
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- vec3 helpers ----------
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: a => Math.hypot(a[0], a[1], a[2]),
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
  rotY: (a, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [a[0] * c + a[2] * s, a[1], -a[0] * s + a[2] * c]; },
  rotX: (a, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [a[0], a[1] * c - a[2] * s, a[1] * s + a[2] * c]; },
  rotZ: (a, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c, a[2]]; },
};

// ---------- mat4 (column-major, WebGL convention) ----------
const M4 = {
  persp(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  },
  lookAt(eye, target, up) {
    let z = V.norm(V.sub(eye, target)); let x = V.norm(V.cross(up, z)); const y = V.cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -V.dot(x, eye), -V.dot(y, eye), -V.dot(z, eye), 1]);
  },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  },
  invert(m) {
    const o = new Float32Array(16);
    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
      a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
    const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return o; det = 1 / det;
    o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return o;
  },
};

// ---------- colours ----------
const C = {
  ink: [0.027, 0.039, 0.18],      // #070a2e
  blue: [0.14, 0.22, 1.0],        // #2437ff
  cyan: [0.37, 0.95, 1.0],        // #5ff2ff
  mag: [1.0, 0.18, 0.82],         // #ff2fd0
  red: [1.0, 0.12, 0.29],         // #ff1f4b
  gold: [1.0, 0.85, 0.23],        // #ffd83a
  white: [0.96, 0.97, 1.0],
  violet: [0.62, 0.3, 1.0],
  amber: [1.0, 0.62, 0.25],
};
const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
function hsl2rgb(h, s, l) {
  const k = n => (n + h * 12) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

// ---------- baked audio analysis ----------
// channels: 0 mix, 1 bass stem, 2 drum stem, 3 drum highs, 4 vocal stem, 5 synth stem, 6 mix highs, 7 mix lows
const CH = { MIX: 0, BASS: 1, DRUMS: 2, HATS: 3, VOX: 4, SYN: 5, HIGH: 6, LOW: 7 };
const ENV = (() => {
  const bin = atob(ENV_B64); const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
})();
function E(ch, t) {
  const f = clamp(t, 0, SONG_LEN) * ENV_FPS; let i = Math.floor(f); const u = f - i;
  if (i >= ENV_N - 1) i = ENV_N - 2;
  return lerp(ENV[i * ENV_CH + ch], ENV[(i + 1) * ENV_CH + ch], u) / 255;
}
// smoothed envelope (average of a small window)
function Es(ch, t, w = 0.25) { let s = 0; for (let k = -2; k <= 2; k++) s += E(ch, t + k * w / 4); return s / 5; }
const undelta = d => { const o = []; let acc = 0; for (const x of d) { acc += x; o.push(acc / 1000); } return o; };
const KICKS = undelta(KICK_D), SNARES = undelta(SNARE_D);
function lastBefore(arr, t) { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
function pulse(arr, t, decay = 0.14) { const i = lastBefore(arr, t); if (i < 0) return 0; const d = t - arr[i]; return d > decay * 8 ? 0 : Math.exp(-d / decay); }
const kick = (t, d = .14) => pulse(KICKS, t, d);
const snare = (t, d = .12) => pulse(SNARES, t, d);
function countBefore(arr, t, since) { const a = lastBefore(arr, since), b = lastBefore(arr, t); return b - a; }
// beat phase relative to a downbeat anchor
const beatOf = (t, anchor) => (t - anchor) / BEAT;
const barOf = (t, anchor) => (t - anchor) / BAR;

// ---------- cue sheet (seconds) — measured from the track ----------
const T = {
  intro: 1.01, anomaly: 13.98, riser: 14.11, gap: 27.45, drop: 28.95,
  v1: [29.5, 32.8, 36.5, 39.7, 43.0, 46.1, 49.5, 52.5],
  bump: 55.58,
  hook1: [56.36, 59.52, 61.6, 64.74, 66.16, 68.44],
  agency: 70.48, deviation: 78.24, freeze: 80.24, bright: 82.48,
  bleed: 82.68, pulse: 87.76, cry: 91.36, patterns: 94.42, mindmusic: 99.78, scan: 104.12, flood: 105.9,
  signal: 107.5, dip: 114.78, signal2: 117.08, prompt: 121.39, prompt2: 128.01,
  v2: [134.96, 138.7, 142.2, 145.3, 148.9, 150.3, 155.3, 158.42],
  hook2: [162.62, 163.6, 166.02, 168.0, 170.52, 172.6],
  copies: 174.92, arms: 179.38, lift: 184.3, cut: 186.14,
  night: 186.14, firstLight: 207.0,
  run: 214.04, surf: 217.91, rise: 231.15, sky: 250.0,
  rewind: 268.25, deep: 280.7, gyre: 293.95, cells: 305.74, hush1: 318.91, hush2: 321.27,
  alive: 326.89, stops: 412.6, giants: 416.2, giants2: 422.52,
  stars: 453.0, skate: 472.9, spiral: 492.74, montage: 513.2, orbit: 519.5, silence: 533.2,
  climax: 534.06, chops: [546.8, 557.6, 576.4], white: 588.0, dawn: 592.0, end: SONG_LEN,
};
