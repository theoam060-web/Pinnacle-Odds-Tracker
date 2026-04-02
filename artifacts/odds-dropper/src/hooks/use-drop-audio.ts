import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "odds-dropper-muted";

function playChime(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  // --- Hit transient (cash-register "clack") ---
  const bufSize = audioCtx.sampleRate * 0.04;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 6);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  noise.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 0.04);

  // --- Rising tone sweep (classic "cha-ching" ring) ---
  const ring = audioCtx.createOscillator();
  const ringGain = audioCtx.createGain();
  ring.connect(ringGain);
  ringGain.connect(audioCtx.destination);
  ring.type = "triangle";
  ring.frequency.setValueAtTime(600, now + 0.03);
  ring.frequency.linearRampToValueAtTime(1400, now + 0.09);
  ring.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
  ringGain.gain.setValueAtTime(0, now + 0.03);
  ringGain.gain.linearRampToValueAtTime(0.22, now + 0.07);
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  ring.start(now + 0.03);
  ring.stop(now + 0.5);

  // --- Confirmation high ping ---
  const ping = audioCtx.createOscillator();
  const pingGain = audioCtx.createGain();
  ping.connect(pingGain);
  pingGain.connect(audioCtx.destination);
  ping.type = "sine";
  ping.frequency.setValueAtTime(1760, now + 0.12);
  pingGain.gain.setValueAtTime(0, now + 0.12);
  pingGain.gain.linearRampToValueAtTime(0.15, now + 0.14);
  pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  ping.start(now + 0.12);
  ping.stop(now + 0.55);
}

export function useDropAudio() {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback((): AudioContext | null => {
    if (typeof AudioContext === "undefined" && typeof (window as any).webkitAudioContext === "undefined") {
      return null;
    }
    if (!audioCtxRef.current) {
      const Ctx = AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const playDrop = useCallback(() => {
    if (muted) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      playChime(ctx);
    } catch {}
  }, [muted, getAudioCtx]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return { muted, toggleMute, playDrop };
}
