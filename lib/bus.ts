// Крошечная шина событий между интерфейсом и 3D-движком.
export type BusEvents = {
  sound: boolean; // включить / выключить звук
  blueprint: boolean; // режим чертежа
  burst: void; // подбросить фишки (после удержания кнопки)
  gesture: void; // первый жест пользователя: можно включать аудио и наклон
};

const PREFIX = "poker:";

export function emit<K extends keyof BusEvents>(name: K, detail?: BusEvents[K]) {
  window.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
}

export function on<K extends keyof BusEvents>(name: K, fn: (detail: BusEvents[K]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent).detail);
  window.addEventListener(PREFIX + name, handler);
  return () => window.removeEventListener(PREFIX + name, handler);
}
