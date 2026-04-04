export function playChime() {
  try {
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.35);
    osc2.start(ctx.currentTime + 0.05); osc2.stop(ctx.currentTime + 0.35);
    osc1.onended = () => ctx.close();
  } catch {}
}
