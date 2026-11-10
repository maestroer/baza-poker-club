import * as THREE from "three";
import { CHIP_R as R, CHIP_T as T } from "./geometry";
import { BOXES, TABLE } from "./table";

// Раскладка фишек на столе: ровные стопки, «рассыпанные» ряды и отдельные
// фишки, часть которых опирается краем на соседей. Генерируется из одного
// зерна, поэтому куча у всех посетителей одинаковая.

export type ChipRest = {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  style: number; // индекс цвета
  order: number; // 0…1 — очерёдность вылета (нижние первыми)
  // параметры полёта
  start: THREE.Vector3; // место в стопке внутри бокса
  startQuat: THREE.Quaternion;
  ctrl: THREE.Vector3;
  axis: THREE.Vector3;
  turns: number;
  bounce: number;
  lift: THREE.Vector3; // куда уходит при «разборе»
  phase: number;
};

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placed = { x: number; z: number; top: number; flat: boolean };

const UP = new THREE.Vector3(0, 1, 0);

/** Зона перед кучей, где лягут карты и кнопка ALL-IN: фишки туда не падают. */
const KEEP_OUT = { x0: -78, x1: 82, z0: 30, z1: 215 };

export function buildPile(seed = 7): { chips: ChipRest[]; stackTop: THREE.Vector3 } {
  const rnd = mulberry(seed);
  const rr = (a: number, b: number) => a + rnd() * (b - a);
  const raw: { pos: THREE.Vector3; quat: THREE.Quaternion; style: number }[] = [];
  const placed: Placed[] = [];

  const spin = () => new THREE.Quaternion().setFromAxisAngle(UP, rnd() * Math.PI * 2);
  const leanQuat = (dx: number, dz: number, theta: number) => {
    const n = new THREE.Vector3(Math.sin(theta) * dx, Math.cos(theta), Math.sin(theta) * dz);
    return new THREE.Quaternion().setFromUnitVectors(UP, n).multiply(spin());
  };

  // 1. Ровные стопки на заднем плане
  const stacks: [number, number, number, number][] = [
    [-112, -58, 9, 0],
    [-70, -78, 12, 1],
    [-26, -92, 7, 2],
    [58, -84, 11, 0],
    [100, -56, 8, 3],
    [20, -52, 5, 1],
  ];
  let stackTop = new THREE.Vector3();
  for (const [x, z, n, style] of stacks) {
    for (let i = 0; i < n; i++) {
      const odd = rnd() < 0.12;
      raw.push({
        pos: new THREE.Vector3(x + rr(-0.7, 0.7), T / 2 + i * T, z + rr(-0.7, 0.7)),
        quat: spin(),
        style: odd ? Math.floor(rnd() * 4) : style,
      });
    }
    placed.push({ x, z, top: n * T, flat: false });
    if (style === 1 && n === 12) stackTop = new THREE.Vector3(x, n * T, z);
  }

  // 2. Рассыпанные ряды: первая фишка лежит, остальные опираются друг на друга
  const rows: [number, number, number, number, number][] = [
    [-66, -18, 0.5, 7, 2],
    [44, -28, 2.5, 6, 3],
    [112, 6, 1.5, 5, 0],
  ];
  for (const [x, z, ang, n, style] of rows) {
    const dx = Math.cos(ang);
    const dz = Math.sin(ang);
    const theta = rr(0.3, 0.4);
    raw.push({ pos: new THREE.Vector3(x, T / 2, z), quat: spin(), style });
    placed.push({ x, z, top: T, flat: false });
    for (let k = 1; k < n; k++) {
      const a = R + T / Math.tan(theta) + (k - 1) * (T / Math.sin(theta));
      const r = a - R * Math.cos(theta) + (T / 2) * Math.sin(theta);
      const y = R * Math.sin(theta) + (T / 2) * Math.cos(theta);
      const px = x + dx * r;
      const pz = z + dz * r;
      raw.push({ pos: new THREE.Vector3(px, y, pz), quat: leanQuat(dx, dz, theta), style: rnd() < 0.2 ? 1 : style });
      placed.push({ x: px, z: pz, top: y + R, flat: false });
    }
  }

  // 3. Россыпь: одиночные фишки, мини-стопки и фишки, опёртые краем на соседа
  const inKeepOut = (x: number, z: number) =>
    x > KEEP_OUT.x0 - R && x < KEEP_OUT.x1 + R && z > KEEP_OUT.z0 - R && z < KEEP_OUT.z1 + R;

  let made = 0;
  let guard = 0;
  while (made < 46 && guard++ < 4000) {
    // эллипс 170 × 95 мм, плотнее к центру
    const a = rnd() * Math.PI * 2;
    const d = Math.pow(rnd(), 0.7);
    const x = Math.cos(a) * d * 172;
    const z = -12 + Math.sin(a) * d * 96;
    if (inKeepOut(x, z)) continue;

    const near = placed.filter((p) => Math.hypot(p.x - x, p.z - z) < R * 2 + 1.2);
    const style = Math.floor(rnd() * 4);

    if (near.length === 0) {
      raw.push({ pos: new THREE.Vector3(x, T / 2, z), quat: spin(), style });
      placed.push({ x, z, top: T, flat: true });
      made++;
      continue;
    }
    if (near.length > 1) continue;

    const h = near[0];
    if (!h.flat || h.top > T * 3.1) continue;
    const dist = Math.hypot(h.x - x, h.z - z);

    if (dist < R * 0.45) {
      // ложится сверху со сдвигом
      const px = h.x + rr(-2.5, 2.5);
      const pz = h.z + rr(-2.5, 2.5);
      raw.push({ pos: new THREE.Vector3(px, h.top + T / 2, pz), quat: spin(), style });
      h.top += T;
      made++;
      continue;
    }

    // опирается: один край на сукне, другой на ободе соседа
    const dx = (x - h.x) / dist;
    const dz = (z - h.z) / dist;
    const gap = rr(0.55, 1.2) * R;
    const theta = Math.atan2(h.top, gap);
    const low = R + gap;
    const r = low - R * Math.cos(theta) + (T / 2) * Math.sin(theta);
    const y = R * Math.sin(theta) + (T / 2) * Math.cos(theta);
    const px = h.x + dx * r;
    const pz = h.z + dz * r;
    if (inKeepOut(px, pz)) continue;
    const clash = placed.some((p) => p !== h && Math.hypot(p.x - px, p.z - pz) < R * 2 + 1.5);
    if (clash) continue;
    raw.push({ pos: new THREE.Vector3(px, y, pz), quat: leanQuat(dx, dz, theta), style });
    placed.push({ x: px, z: pz, top: y + R, flat: false });
    h.flat = false; // на неё больше ничего не кладём
    made++;
  }

  // Очерёдность вылета: сначала то, что лежит ниже
  const sorted = raw
    .map((c) => ({ c, key: c.pos.y + rnd() * 2.2 }))
    .sort((a, b) => a.key - b.key)
    .map((e) => e.c);

  // Каждая фишка до броска стоит в стопке в одном из боксов. Раньше всех
  // улетают верхние: самым ранним достаются самые высокие места в стопках.
  const perBox: number[][] = BOXES.map(() => []);
  sorted.forEach((_, i) => perBox[Math.floor(rnd() * BOXES.length * 0.999)].push(i));
  const startOf: THREE.Vector3[] = [];
  perBox.forEach((list, b) => {
    const box = BOXES[b];
    const cols = [-40, 0, 40];
    const slots: THREE.Vector3[] = [];
    for (let k = 0; k < list.length; k++) {
      const off = cols[k % cols.length];
      const level = Math.floor(k / cols.length);
      slots.push(
        new THREE.Vector3(
          box.x + (box.along ? off : 0) + rr(-0.6, 0.6),
          T / 2 + level * T,
          box.z + TABLE.z + (box.along ? 0 : off) + rr(-0.6, 0.6),
        ),
      );
    }
    slots.sort((p, q) => q.y - p.y); // сверху вниз
    list.forEach((chipIndex, k) => (startOf[chipIndex] = slots[k])); // list уже по порядку вылета
  });

  const chips: ChipRest[] = sorted.map((c, i) => {
    const order = i / (sorted.length - 1);
    const start = startOf[i];
    const ctrl = start.clone().lerp(c.pos, 0.5);
    ctrl.y = Math.max(start.y, c.pos.y) + rr(70, 150);
    const axis = new THREE.Vector3(rr(-1, 1), 0, rr(-1, 1)).normalize();
    return {
      ...c,
      order,
      start,
      startQuat: spin(),
      ctrl,
      axis,
      turns: (rnd() < 0.5 ? 1 : 2) * (rnd() < 0.5 ? -1 : 1), // целое число оборотов: взлёт и посадка плашмя
      bounce: rr(2.5, 6) * (c.pos.y < T ? 1 : 0.45),
      lift: new THREE.Vector3(c.pos.x * 0.28, 46 + order * 150 + rr(0, 34), c.pos.z * 0.2),
      phase: rnd() * Math.PI * 2,
    };
  });

  return { chips, stackTop };
}
