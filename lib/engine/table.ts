import * as THREE from "three";

// Покерный стол: овальное сукно с линией ставок, деревянная дорожка
// с золотыми нитями и мягкий кожаный борт. Всё в миллиметрах.
// Стол намеренно компактный (1370 × 770 мм), чтобы борт попадал в кадр.

export const TABLE = {
  a: 300, // половина прямого участка овала
  felt: 270, // радиус сукна
  track: 316, // внешний радиус деревянной дорожки
  rail: 388, // внешний радиус борта
  z: 30, // стол сдвинут к камере: куча фишек лежит чуть дальше центра
};

/**
 * Боксы — места игроков, размеченные на сукне. Координаты в системе стола:
 * x, z — центр; along — true, если бокс вытянут вдоль оси X (длинные стороны стола).
 */
export const BOX = { w: 124, d: 62, r: 10, line: 100 }; // размер бокса и отступ линии ставок от края
const ring = TABLE.felt - 46; // на каком расстоянии от оси стола лежат центры боксов
export const BOXES: { x: number; z: number; along: boolean }[] = [
  { x: -215, z: -ring, along: true },
  { x: 0, z: -ring, along: true },
  { x: 215, z: -ring, along: true },
  { x: TABLE.a + ring, z: 0, along: false },
  { x: 215, z: ring, along: true },
  { x: 0, z: ring, along: true },
  { x: -215, z: ring, along: true },
  { x: -TABLE.a - ring, z: 0, along: false },
];

type PathPoint = { cx: number; nx: number; nz: number };

/** Осевая линия «стадиона»: два полукруга, прямые получаются между ними сами. */
function stadiumPath(a: number, arcSegments: number): PathPoint[] {
  const pts: PathPoint[] = [];
  for (let i = 0; i <= arcSegments; i++) {
    const t = -Math.PI / 2 + (Math.PI * i) / arcSegments;
    pts.push({ cx: a, nx: Math.cos(t), nz: Math.sin(t) });
  }
  for (let i = 0; i <= arcSegments; i++) {
    const t = Math.PI / 2 + (Math.PI * i) / arcSegments;
    pts.push({ cx: -a, nx: Math.cos(t), nz: Math.sin(t) });
  }
  pts.push({ ...pts[0] });
  return pts;
}

/**
 * Протягивает профиль (x — расстояние от осевой линии, y — высота) вдоль овала.
 * Так строятся и борт, и дорожка, и золотые нити.
 */
export function sweepStadium(profile: THREE.Vector2[], a: number, uRepeat = 8, arcSegments = 56) {
  const path = stadiumPath(a, arcSegments);
  const n = profile.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];

  // длина пути по среднему радиусу — для равномерной развёртки
  const ref = profile[Math.floor(n / 2)].x;
  const len: number[] = [0];
  for (let j = 1; j < path.length; j++) {
    const p = path[j - 1];
    const q = path[j];
    len.push(len[j - 1] + Math.hypot(q.cx + q.nx * ref - (p.cx + p.nx * ref), (q.nz - p.nz) * ref));
  }
  const total = len[len.length - 1];

  let run = 0;
  const vAt: number[] = [0];
  for (let i = 1; i < n; i++) vAt.push((run += profile[i].distanceTo(profile[i - 1])));

  for (let j = 0; j < path.length; j++) {
    const p = path[j];
    for (let i = 0; i < n; i++) {
      pos.push(p.cx + p.nx * profile[i].x, profile[i].y, p.nz * profile[i].x);
      uv.push((len[j] / total) * uRepeat, vAt[i] / run);
    }
  }
  for (let j = 0; j < path.length - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const A = j * n + i;
      const B = (j + 1) * n + i;
      idx.push(A, A + 1, B, B, A + 1, B + 1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Плоское сукно в форме овала. UV растянуты на габарит: (2a + 2r) × 2r. */
export function feltGeometry() {
  const { a, felt: r } = TABLE;
  const s = new THREE.Shape();
  s.moveTo(-a, -r);
  s.lineTo(a, -r);
  s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-a, r);
  s.absarc(-a, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  const g = new THREE.ShapeGeometry(s, 56);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const w = (a + r) * 2;
  const h = r * 2;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Острые изломы профиля: дублируем точки рядом с углом, чтобы блик не расплывался. */
function crisp(pts: [number, number][], eps = 0.05) {
  const v = pts.map(([x, y]) => new THREE.Vector2(x, y));
  const out: THREE.Vector2[] = [];
  v.forEach((p, i) => {
    if (i > 0) out.push(p.clone().add(v[i - 1].clone().sub(p).setLength(eps)));
    out.push(p);
    if (i < v.length - 1) out.push(p.clone().add(v[i + 1].clone().sub(p).setLength(eps)));
  });
  return out;
}

/** Деревянная дорожка: плоское кольцо чуть выше сукна. */
export function trackGeometry() {
  const { a, felt, track } = TABLE;
  return sweepStadium(crisp([[felt, -0.5], [felt, 1.6], [track, 1.6]]), a, 8);
}

/** Две золотые нити по краям дорожки. */
export function inlayGeometries() {
  const { a, felt, track } = TABLE;
  const strip = (d: number) => sweepStadium(crisp([[d, 1.5], [d, 1.85], [d + 2.4, 1.85], [d + 2.4, 1.5]], 0.02), a, 8);
  return [strip(felt + 4), strip(track - 7.5)];
}

/** Мягкий кожаный борт: полуовал в сечении, наружная стенка уходит вниз. */
export function railGeometry() {
  const { a, track, rail } = TABLE;
  const rx = (rail - track) / 2;
  const cx = track + rx;
  const cy = 9;
  const ry = 25;
  const pts: THREE.Vector2[] = [new THREE.Vector2(track - 0.5, 0)];
  for (let i = 0; i <= 18; i++) {
    const t = Math.PI - (Math.PI * i) / 18;
    pts.push(new THREE.Vector2(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry));
  }
  pts.push(new THREE.Vector2(rail, -90));
  return sweepStadium(pts, a, 40);
}
