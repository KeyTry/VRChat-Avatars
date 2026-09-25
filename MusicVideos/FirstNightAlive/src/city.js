// ============================================================
// city.js — procedural city layout shared by JS and GLSL
// ============================================================
const CITY = { BLOCK: 48, STREET: 14, RING_R: 520, RING_W: 26, RIVER_W: 110, N: 46 };
const riverX = z => 700 + 140 * Math.sin(z / 380) + 40 * Math.sin(z / 150 + 1.3);
const coastZ = x => 980 + 40 * Math.sin(x / 260) + 20 * Math.sin(x / 97 + 2.0);
const inRiver = (x, z, m = 0) => Math.abs(x - riverX(z)) < CITY.RIVER_W / 2 + m;
const inSea = (x, z, m = 0) => z > coastZ(x) - m;
const inRing = (x, z, m = 0) => Math.abs(Math.hypot(x, z) - CITY.RING_R) < CITY.RING_W / 2 + m;
const BRIDGE_Z = 48 * 3 + 7;   // the grand bridge crosses on this street
const inPark = (x, z, m = 0) => x > -165 - m && x < 165 + m && z > 140 - m && z < 440 + m;

// GLSL twin of the layout helpers (kept in one place so both sides agree)
const GLSL_CITY = `
const float BLOCK=48., STREET=14., RING_R=520., RING_W=26., RIVER_W=110.;
float riverX(float z){ return 700. + 140.*sin(z/380.) + 40.*sin(z/150.+1.3); }
float coastZ(float x){ return 980. + 40.*sin(x/260.) + 20.*sin(x/97.+2.0); }
bool inPark(vec2 p){ return p.x>-165.&&p.x<165.&&p.y>140.&&p.y<440.; }
`;

function buildCity() {
  const rnd = mulberry(20260924);
  const out = [];   // [x, y, z, w, h, d, seed, newness, kind, schedOrder]
  const N = CITY.N, half = N / 2, B = CITY.BLOCK, S = CITY.STREET;
  const push = (x, y, z, w, h, d, seed, newness, kind, sched) => out.push([x, y, z, w, h, d, seed, newness, kind, sched]);
  for (let bz = 0; bz < N; bz++) for (let bx = 0; bx < N; bx++) {
    const x0 = (bx - half) * B + S, z0 = (bz - half) * B + S, L = B - S;   // lot square [x0, x0+L]
    const sched = (bz * N + bx) / (N * N);
    const split = rnd();
    const lots = split < .3 ? [[0, 0, 1, 1]] : split < .65 ? [[0, 0, .5, 1], [.5, 0, .5, 1]] :
      [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]];
    for (const [lx, lz, lw, ld] of lots) {
      const m = 2 + rnd() * 2;
      const w = lw * L - m * 2, d = ld * L - m * 2;
      const cx = x0 + (lx + lw / 2) * L, cz = z0 + (lz + ld / 2) * L;
      if (inRiver(cx, cz, 12 + w / 2) || inSea(cx, cz, 14 + d / 2) || inRing(cx, cz, 8 + Math.max(w, d) / 2) || inPark(cx, cz, Math.max(w, d) / 2)) continue;
      const dist = Math.hypot(cx, cz);
      if (dist < 78) continue;              // plaza around the core tower
      const f = Math.exp(-dist / 430);
      let h = 9 + 14 * rnd() + Math.pow(rnd(), 2.2) * (26 + 250 * f);
      if (rnd() < 0.035 * f + 0.004) h *= 1.55;
      if (inSea(cx, cz, 120)) h *= 0.45;     // low waterfront
      h = clamp(h, 7, 300);
      const newness = clamp(0.5 * h / 250 + 0.3 * dist / 1100 + 0.2 * rnd());
      push(cx, 0, cz, w, h, d, rnd(), newness, 0, sched);
    }
  }
  // the core tower (GYRE's pupil)
  push(0, 0, 0, 30, 340, 30, 0.777, 0.97, 3, 0.5);
  push(0, 340, 0, 8, 60, 8, 0.778, 0.99, 3, 0.5);
  // grand bridge: towers + deck
  const rx = riverX(BRIDGE_Z);
  push(rx, 9, BRIDGE_Z, 170, 3, 13, .31, .6, 2, .4);
  push(rx - 38, 0, BRIDGE_Z - 5, 5, 78, 4, .32, .6, 2, .4);
  push(rx - 38, 0, BRIDGE_Z + 5, 5, 78, 4, .33, .6, 2, .4);
  push(rx + 38, 0, BRIDGE_Z - 5, 5, 78, 4, .34, .6, 2, .4);
  push(rx + 38, 0, BRIDGE_Z + 5, 5, 78, 4, .35, .6, 2, .4);
  // small bridges
  for (const bz of [-9, -4, 8, 13]) { const z = bz * B + 7; push(riverX(z), 7, z, 150, 2, 11, .4 + bz * .01, .3, 2, .4); }
  // harbour cranes on the coast
  for (let i = 0; i < 6; i++) {
    const x = -380 + i * 95, z = coastZ(x) - 24;
    push(x, 0, z, 5, 64, 5, .5 + i * .01, .7, 2, .6);
    push(x, 58, z + 18, 4, 5, 64, .52 + i * .01, .7, 2, .6);
  }
  return out;
}

// cable lines of the grand bridge (world-space segments) — drawn with the line renderer
function bridgeCables() {
  const rx = riverX(BRIDGE_Z), segs = [];
  for (const side of [-5, 5]) {
    const z = BRIDGE_Z + side;
    // main catenary between towers and down to the ends
    const pts = [];
    for (let i = 0; i <= 24; i++) { const x = rx - 85 + i * 170 / 24; const u = (x - rx) / 38; const y = Math.abs(u) <= 1 ? 30 + 48 * u * u : 78 - (Math.abs(u) - 1) * 44; pts.push([x, Math.max(y, 12), z]); }
    for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]]);
    for (let i = 1; i < pts.length - 1; i += 1) segs.push([pts[i], [pts[i][0], 12, z]]);
  }
  return segs;
}
