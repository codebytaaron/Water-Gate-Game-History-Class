class GameAudio {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new window.AudioContext();
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() { return this.enabled; }

  private play(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch { /* silent fail */ }
  }

  step() { this.play(200 + Math.random() * 100, 0.08, 'square', 0.06); }
  collect() {
    this.play(523, 0.1, 'square', 0.12);
    setTimeout(() => this.play(659, 0.1, 'square', 0.12), 80);
    setTimeout(() => this.play(784, 0.15, 'square', 0.12), 160);
  }
  talk() { this.play(300 + Math.random() * 200, 0.06, 'square', 0.08); }
  menuSelect() { this.play(440, 0.1, 'square', 0.1); }
  menuConfirm() {
    this.play(440, 0.08, 'square', 0.12);
    setTimeout(() => this.play(660, 0.15, 'square', 0.12), 100);
  }
  error() { this.play(150, 0.2, 'sawtooth', 0.1); }
  puzzleCorrect() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.play(f, 0.15, 'square', 0.1), i * 100)
    );
  }
  puzzleWrong() {
    this.play(200, 0.15, 'sawtooth', 0.1);
    setTimeout(() => this.play(150, 0.2, 'sawtooth', 0.1), 120);
  }
  transition() {
    [262, 330, 392, 523].forEach((f, i) =>
      setTimeout(() => this.play(f, 0.25, 'triangle', 0.08), i * 150)
    );
  }
  victory() {
    const notes = [523, 659, 784, 880, 1047, 1175, 1319, 1568];
    notes.forEach((f, i) =>
      setTimeout(() => this.play(f, 0.3, 'square', 0.08), i * 120)
    );
  }
}

export const audio = new GameAudio();
