import * as THREE from "three";

// Маленькая фотостудия внутри сцены: тёмная комната, один софтбокс не по оси
// и полосы света. Запекается в окружение через PMREM — именно её отражают
// золото, лак и фольга.

export function buildStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const studio = new THREE.Scene();

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(120, 120, 120),
    new THREE.MeshBasicMaterial({ color: 0x030303, side: THREE.BackSide }),
  );
  studio.add(room);

  const panel = (w: number, h: number, power: number, at: [number, number, number], tint = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...at);
    m.lookAt(0, 0, 0);
    studio.add(m);
  };

  panel(26, 16, 3.4, [-24, 22, 20], 0xfff3e2); // ключевой софтбокс
  panel(2.6, 36, 7, [30, 6, 12]); // полоса — рисует линию на фасках
  panel(2.6, 36, 5, [-30, 4, -16], 0xdfe9ff); // холодная полоса сзади
  panel(30, 8, 1.3, [6, 10, -34], 0xffd9a0); // тёплое свечение фона
  panel(44, 44, 0.32, [0, 44, 0]); // слабое заполнение сверху

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio, 0.035).texture;
  pmrem.dispose();
  studio.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });
  return env;
}
