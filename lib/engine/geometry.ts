import * as THREE from "three";

// Вся геометрия строится кодом в реальных миллиметрах.

export const CHIP_R = 19.5; // фишка 39 мм
export const CHIP_T = 3.3;
export const CARD_W = 63;
export const CARD_H = 88;
export const CARD_T = 0.32;
export const TRI_SIDE = 86;
export const TRI_T = 6;

/**
 * Добавляет «опорные» точки рядом с каждым изломом профиля, чтобы сглаженные
 * нормали не расплывались по плоским граням: блик остаётся на фаске.
 */
function withSupport(pts: THREE.Vector2[], eps = 0.03) {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[i - 1];
    const next = pts[i + 1];
    if (prev) {
      const d = prev.clone().sub(p);
      if (d.length() > eps * 3) out.push(p.clone().add(d.setLength(eps)));
    }
    out.push(p.clone());
    if (next) {
      const d = next.clone().sub(p);
      if (d.length() > eps * 3) out.push(p.clone().add(d.setLength(eps)));
    }
  }
  return out;
}

/** Фишка: тело вращения с фасками и утопленной вклейкой. */
export function chipGeometry(segments = 56) {
  const R = CHIP_R;
  const h = CHIP_T / 2;
  const b = 0.38; // фаска
  const rIn = R * 0.6; // радиус вклейки
  const dip = 0.14; // глубина вклейки

  // Профиль обходится против часовой стрелки (снизу вверх по внешней стороне),
  // иначе деталь вывернется наизнанку.
  const profile = withSupport([
    new THREE.Vector2(0, -h + dip),
    new THREE.Vector2(rIn, -h + dip),
    new THREE.Vector2(rIn + 0.25, -h),
    new THREE.Vector2(R - b, -h),
    new THREE.Vector2(R, -h + b),
    new THREE.Vector2(R, h - b),
    new THREE.Vector2(R - b, h),
    new THREE.Vector2(rIn + 0.25, h),
    new THREE.Vector2(rIn, h - dip),
    new THREE.Vector2(0, h - dip),
  ]);

  const g = new THREE.LatheGeometry(profile, segments);

  // Планарная развёртка сверху: рисунок лица ложится на обе стороны,
  // а ребро берёт цвет с края текстуры (полосы вставок).
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const bottom = nor.getY(i) < -0.5;
    const u = 0.5 + (pos.getX(i) / R) * 0.49 * (bottom ? -1 : 1);
    const v = 0.5 + (pos.getZ(i) / R) * 0.49 * (bottom ? 1 : -1); // ни одна сторона не зеркальна
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
  return g;
}

/** Делит крышки экструзии на «лицо» и «оборот» и раскладывает UV по габаритам. */
function splitCaps(g: THREE.ExtrudeGeometry, depth: number, uvOf: (x: number, y: number) => [number, number]) {
  const caps = g.groups[0];
  const sides = g.groups[1];
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const half = caps.count / 2;
  const firstIsFront = pos.getZ(caps.start) > depth / 2;

  for (let i = caps.start; i < caps.start + caps.count; i++) {
    const front = pos.getZ(i) > depth / 2;
    const [u, v] = uvOf(pos.getX(i), pos.getY(i));
    uv.setXY(i, front ? u : 1 - u, v);
  }
  uv.needsUpdate = true;

  g.clearGroups();
  // материалы: 0 — лицо, 1 — оборот, 2 — ребро и фаска
  g.addGroup(caps.start, half, firstIsFront ? 0 : 1);
  g.addGroup(caps.start + half, half, firstIsFront ? 1 : 0);
  g.addGroup(sides.start, sides.count, 2);

  // Кладём деталь на стол: лицо смотрит вверх (+Y), низ на y = 0.
  g.rotateX(-Math.PI / 2);
  g.computeBoundingBox();
  g.translate(0, -g.boundingBox!.min.y, 0);
  g.computeBoundingBox();
  g.computeBoundingSphere();
}

/** Карта: скруглённый прямоугольник 63 × 88 мм с тонкой фаской. */
export function cardGeometry() {
  const w = CARD_W / 2;
  const h = CARD_H / 2;
  const r = 3.2;
  const s = new THREE.Shape();
  s.moveTo(-w + r, -h);
  s.lineTo(w - r, -h);
  s.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w, h - r);
  s.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w + r, h);
  s.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w, -h + r);
  s.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);

  const bevel = 0.05;
  const depth = CARD_T - bevel * 2;
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelOffset: -bevel,
    bevelSegments: 1,
    curveSegments: 10,
  });
  splitCaps(g, depth, (x, y) => [(x + w) / CARD_W, (y + h) / CARD_H]);
  return g;
}

/** Кнопка ALL-IN: равносторонний треугольник со скруглёнными углами и полированной фаской. */
export function allInGeometry() {
  const S = TRI_SIDE;
  const H = (S * Math.sqrt(3)) / 2;
  const verts = [new THREE.Vector2(0, (2 * H) / 3), new THREE.Vector2(-S / 2, -H / 3), new THREE.Vector2(S / 2, -H / 3)];
  const cut = 9; // сколько срезаем с каждого угла под скругление

  const s = new THREE.Shape();
  for (let i = 0; i < 3; i++) {
    const p = verts[i];
    const prev = verts[(i + 2) % 3];
    const next = verts[(i + 1) % 3];
    const a = p.clone().add(prev.clone().sub(p).setLength(cut));
    const b = p.clone().add(next.clone().sub(p).setLength(cut));
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p.x, p.y, b.x, b.y);
  }
  s.closePath();

  const bevel = 0.9;
  const depth = TRI_T - bevel * 2;
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelOffset: -bevel,
    bevelSegments: 4,
    curveSegments: 14,
  });
  splitCaps(g, depth, (x, y) => [x / S + 0.5, (y + H / 3) / S]);
  return g;
}
