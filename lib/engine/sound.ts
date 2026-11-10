// Звук синтезируется через Web Audio: короткие отфильтрованные всплески шума.
// Ни одного аудиофайла. Контекст создаётся только после жеста пользователя.

export class Sound {
  enabled = false;
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private master: GainNode | null = null;
  private lastClick = 0;

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.ensure();
    if (this.ctx && on && this.ctx.state === "suspended") this.ctx.resume();
  }

  private ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, len);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  private burst(freq: number, q: number, dur: number, gain: number, sweepTo?: number) {
    if (!this.enabled || !this.ctx || !this.noise || !this.master) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loopStart = Math.random() * 0.5;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 0.5, dur + 0.05);
  }

  private tone(freq: number, dur: number, gain: number, to?: number) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Щелчок фишки. Не чаще одного раза в 28 мс, чтобы не слиться в шум. */
  click(strength = 1) {
    const now = performance.now();
    if (now - this.lastClick < 28) return;
    this.lastClick = now;
    const f = 3200 + Math.random() * 2600;
    this.burst(f, 7, 0.035, 0.5 * strength);
    this.tone(f * 0.62, 0.03, 0.05 * strength);
  }

  /** Шелест карты. */
  swish() {
    this.burst(900, 0.9, 0.16, 0.22, 3800);
  }

  /** Глухой удар кнопки ALL-IN о стол. */
  thud() {
    this.tone(120, 0.22, 0.6, 46);
    this.burst(1800, 1.2, 0.05, 0.35);
  }
}
