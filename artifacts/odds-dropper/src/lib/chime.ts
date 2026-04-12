export function playChime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    function playNote(freq: number, startTime: number, duration: number, volume: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);

      return osc;
    }

    // Classic "ding-dong" notification: two ascending bell tones
    // First tone: E5 (659 Hz) — familiar alert pitch
    playNote(659, now, 0.5, 0.22);
    // Harmonic overtone on first note
    playNote(1319, now, 0.35, 0.06);

    // Second tone: B5 (988 Hz) — higher, resolving note
    const last = playNote(988, now + 0.22, 0.7, 0.22);
    // Harmonic overtone on second note
    playNote(1976, now + 0.22, 0.45, 0.05);

    last.onended = () => ctx.close();
  } catch {}
}
