// One-time piece-set search for Daily Grain.
// Finds a set of 7 pentominoes + 1 hexomino (41 cells) that can solve
// every real date of the year on the 43-cell board.
// Usage: node tools/search.js [samples]

const ROWS = 7, COLS = 7;
// Board: rows 0-1 cols 0-5 = months; rows 2-5 = days 1-28; row 6 cols 0-2 = days 29-31
const cellIndex = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
const cells = [];
for (let r = 0; r < ROWS; r++)
  for (let c = 0; c < COLS; c++) {
    const ok = r < 2 ? c < 6 : r < 6 ? true : c < 3;
    if (ok) { cellIndex[r][c] = cells.length; cells.push([r, c]); }
  }
const N = cells.length; // 43
const monthCell = m => cellIndex[Math.floor(m / 6)][m % 6]; // m 0..11
const dayCell = d => cellIndex[2 + Math.floor((d - 1) / 7)][(d - 1) % 7]; // d 1..31

// ---------- polyomino generation ----------
const norm = cs => {
  const mr = Math.min(...cs.map(p => p[0])), mc = Math.min(...cs.map(p => p[1]));
  return cs.map(([r, c]) => [r - mr, c - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const key = cs => cs.map(p => p.join(',')).join(';');
const orientations = cs => {
  const out = new Map();
  let cur = cs;
  for (let f = 0; f < 2; f++) {
    for (let k = 0; k < 4; k++) {
      cur = norm(cur.map(([r, c]) => [c, -r]));
      out.set(key(cur), cur);
    }
    cur = norm(cur.map(([r, c]) => [r, -c]));
  }
  return [...out.values()];
};
const canon = cs => orientations(cs).map(key).sort()[0];
function polys(n) {
  let set = new Map([[key([[0, 0]]), [[0, 0]]]]);
  for (let s = 1; s < n; s++) {
    const next = new Map();
    for (const p of set.values())
      for (const [r, c] of p)
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const q = [r + dr, c + dc];
          if (p.some(x => x[0] === q[0] && x[1] === q[1])) continue;
          const np = norm([...p, q]);
          const k = canon(np);
          if (!next.has(k)) next.set(k, np);
        }
    set = next;
  }
  return [...set.values()];
}
const pentos = polys(5);
const hexos = polys(6);

// ---------- placements ----------
function placementsFor(piece) {
  const list = [];
  for (const o of orientations(piece))
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const idx = [];
        let ok = true;
        for (const [dr, dc] of o) {
          const rr = r + dr, cc = c + dc;
          if (rr >= ROWS || cc >= COLS || cellIndex[rr][cc] < 0) { ok = false; break; }
          idx.push(cellIndex[rr][cc]);
        }
        if (ok) list.push(idx.sort((a, b) => a - b));
      }
  return list;
}

// byMin[piece][cell] = placements whose lowest cell is `cell`
function buildIndex(pieces) {
  return pieces.map(p => {
    const byMin = Array.from({ length: N }, () => []);
    for (const pl of placementsFor(p)) byMin[pl[0]].push(pl);
    return byMin;
  });
}

function countSolutions(index, holes, cap) {
  const covered = new Uint8Array(N);
  for (const h of holes) covered[h] = 1;
  const used = new Uint8Array(index.length);
  let count = 0;
  function rec(start) {
    let cell = start;
    while (cell < N && covered[cell]) cell++;
    if (cell === N) { count++; return; }
    for (let p = 0; p < index.length; p++) {
      if (used[p]) continue;
      for (const pl of index[p][cell]) {
        let fits = true;
        for (let i = 1; i < pl.length; i++) if (covered[pl[i]]) { fits = false; break; }
        if (!fits) continue;
        used[p] = 1; for (const x of pl) covered[x] = 1;
        rec(cell + 1);
        used[p] = 0; for (const x of pl) covered[x] = 0;
        if (count >= cap) return;
      }
    }
  }
  rec(0);
  return count;
}

const DIM = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dates = [];
for (let m = 0; m < 12; m++) for (let d = 1; d <= DIM[m]; d++) dates.push([m, d]);

// Avoid the plain 2x3 block (keeps our set distinct) and the 1x5 / 1x6 bars (boring).
const isRect = p => { const h = Math.max(...p.map(x => x[0])) + 1, w = Math.max(...p.map(x => x[1])) + 1; return h * w === p.length; };
const pentoPool = pentos.filter(p => !isRect(p));
const hexoPool = hexos.filter(p => !isRect(p));

function rnd(n) { return Math.floor(Math.random() * n); }
// MIX picks how many pentominoes / hexominoes per set; they must cover 41 cells.
// Default "7,1" = 7 pentominoes + 1 hexomino. "1,6" = 1 pentomino + 6 hexominoes (chunkier, harder).
const [NP, NH] = (process.env.MIX || '7,1').split(',').map(Number);
if (NP * 5 + NH * 6 !== 41) throw new Error('MIX must cover 41 cells');
function sample() {
  const pp = [...pentoPool], hp = [...hexoPool];
  const chosen = [];
  for (let i = 0; i < NP; i++) chosen.push(pp.splice(rnd(pp.length), 1)[0]);
  for (let i = 0; i < NH; i++) chosen.push(hp.splice(rnd(hp.length), 1)[0]);
  return chosen;
}

const samples = +process.argv[2] || 400;
const results = [];
const seen = new Set();
const t0 = Date.now();
for (let s = 0; s < samples; s++) {
  const pieces = sample();
  const k = pieces.map(canon).sort().join('|');
  if (seen.has(k)) continue;
  seen.add(k);
  const index = buildIndex(pieces);
  let ok = true;
  // quick fail: check dates in shuffled order for existence
  const order = [...dates].sort(() => Math.random() - 0.5);
  for (const [m, d] of order) {
    if (countSolutions(index, [monthCell(m), dayCell(d)], 1) === 0) { ok = false; break; }
  }
  if (!ok) continue;
  const counts = dates.map(([m, d]) => countSolutions(index, [monthCell(m), dayCell(d)], 5000));
  const sorted = [...counts].sort((a, b) => a - b);
  results.push({ pieces, min: sorted[0], median: sorted[183], max: sorted.at(-1), counts });
  process.stderr.write(`found #${results.length} min=${sorted[0]} median=${sorted[183]} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
console.error(`tried ${seen.size} sets, ${results.length} solve every date`);
// Prefer: every date has a few solutions (no brutal days), but low median (still a challenge).
results.sort((a, b) => (b.min >= 3) - (a.min >= 3) || a.median - b.median);
const draw = p => {
  const h = Math.max(...p.map(x => x[0])) + 1, w = Math.max(...p.map(x => x[1])) + 1;
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  for (const [r, c] of p) g[r][c] = '#';
  return g.map(r => r.join('')).join('\n');
};
const all = results.map(r => ({ min: r.min, median: r.median, max: r.max, pieces: r.pieces }));
const out = all.slice(0, 5);
const fs = require('fs');
if (!process.env.MIX) fs.writeFileSync(__dirname + '/candidates.json', JSON.stringify(out, null, 1));
fs.writeFileSync(__dirname + `/survivors-${NP}p${NH}h.json`, JSON.stringify(all, null, 1));
for (const r of out.slice(0, 3)) {
  console.log(`\n=== min ${r.min}, median ${r.median}, max ${r.max}`);
  console.log(r.pieces.map(draw).join('\n\n'));
}
