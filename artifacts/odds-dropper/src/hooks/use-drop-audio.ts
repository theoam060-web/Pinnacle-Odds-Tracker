import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "odds-dropper-muted";

function playChime(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now);
  osc1.frequency.exponentialRampToValueAtTime(660, now + 0.15);

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1100, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(880, now + 0.2);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.start(now);
  osc1.stop(now + 0.35);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.35);
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
