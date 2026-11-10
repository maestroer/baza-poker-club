// Сценарий камеры: список «кадров», привязанных к секциям страницы.
// Движок смешивает соседние кадры по позиции скролла и плавно догоняет результат.

export type Shot = {
  frame: number; // сколько миллиметров сцены помещается в кадр (не дистанция!)
  elev: number; // угол над горизонтом, °
  azim: number; // поворот вокруг стола, °
  tx: number; // точка, на которую смотрит камера, мм
  ty: number;
  tz: number;
  ox: number; // сдвиг объекта по экрану, доли ширины (на узких экранах гасится)
  oy: number; // сдвиг по высоте, доли высоты
  explode: number; // 0…1 — «разбор» кучи
  dim: number; // 0…1 — приглушить сцену под текст
  labels: number; // 0…1 — показать выноски
};

export type Cue = {
  sec: string; // значение data-cue у секции
  f?: number; // положение внутри секции: 0 — начало, 1 — конец (по умолчанию центр)
  shot: Partial<Shot>;
  mobile?: Partial<Shot>; // поправки для вертикальных экранов
};

export const BASE: Shot = {
  frame: 400,
  elev: 30,
  azim: 0,
  tx: 0,
  ty: 10,
  tz: 20,
  ox: 0,
  oy: 0,
  explode: 0,
  dim: 0,
  labels: 0,
};

/** Где висит фишка на заставке. */
export const HERO_CHIP = { x: 0, y: 128, z: 150 };

/** Тайминги сцены внутри секции stage (доля её прокрутки). */
export const SEQ = {
  chipsFrom: 0.035,
  chipsSpan: 0.36,
  chipDur: 0.15,
  cardA: 0.555,
  cardB: 0.605,
  cardDur: 0.15,
  tri: 0.77,
  triDur: 0.1,
};

export const CUES: Cue[] = [
  // Заставка: одна фишка крупно, справа от названия
  {
    sec: "hero",
    f: 0,
    shot: { frame: 104, elev: 5, azim: -16, tx: HERO_CHIP.x, ty: HERO_CHIP.y, tz: HERO_CHIP.z, ox: 0.2 },
    mobile: { frame: 78, oy: -0.2 },
  },
  { sec: "stage", f: 0, shot: { frame: 150, elev: 8, azim: -12, tx: 0, ty: 104, tz: 130, ox: 0.1 }, mobile: { frame: 120, oy: -0.1 } },
  // Фишки летят через кадр
  { sec: "stage", f: 0.14, shot: { frame: 600, elev: 27, azim: -7, tx: 0, ty: 30, tz: 20 }, mobile: { frame: 520 } },
  { sec: "stage", f: 0.46, shot: { frame: 470, elev: 33, azim: 7, tx: 0, ty: 18, tz: 20 }, mobile: { frame: 400 } },
  // Короли крупно
  { sec: "stage", f: 0.62, shot: { frame: 215, elev: 50, azim: 11, tx: 0, ty: 2, tz: 80 }, mobile: { frame: 150 } },
  { sec: "stage", f: 0.72, shot: { frame: 196, elev: 55, azim: -3, tx: 2, ty: 2, tz: 90 }, mobile: { frame: 140 } },
  // Кнопка ALL-IN
  { sec: "stage", f: 0.85, shot: { frame: 250, elev: 33, azim: -12, tx: 2, ty: 4, tz: 118 }, mobile: { frame: 175 } },
  // Облёт с выносками
  { sec: "stage", f: 0.94, shot: { frame: 410, elev: 37, azim: -26, tx: 0, ty: 10, tz: 45, labels: 1 }, mobile: { frame: 380 } },
  { sec: "stage", f: 1, shot: { frame: 440, elev: 40, azim: -38, tx: 0, ty: 10, tz: 45 }, mobile: { frame: 390 } },
  // Контент: сцена уходит в сторону и приглушается
  {
    sec: "nocash",
    shot: { frame: 620, elev: 24, azim: -58, tx: 0, ty: 90, tz: 30, ox: 0.24, explode: 1, dim: 0.3 },
    mobile: { frame: 520, dim: 0.62 },
  },
  { sec: "format", shot: { frame: 520, elev: 56, azim: -118, tx: 0, ty: 6, tz: 40, ox: -0.25, dim: 0.42 }, mobile: { dim: 0.7 } },
  { sec: "menu", shot: { frame: 360, elev: 22, azim: -205, tx: -30, ty: 18, tz: -50, ox: 0.29, dim: 0.42 }, mobile: { dim: 0.7 } },
  { sec: "signup", shot: { frame: 430, elev: 40, azim: -332, tx: 0, ty: 8, tz: 60, ox: -0.26, dim: 0.4 }, mobile: { dim: 0.72 } },
  { sec: "footer", f: 1, shot: { frame: 470, elev: 30, azim: -360, tx: 0, ty: 10, tz: 60, dim: 0.55 }, mobile: { dim: 0.75 } },
];
