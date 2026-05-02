let _audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!_audio) {
    const base = import.meta.env.BASE_URL ?? "/app/";
    _audio = new Audio(`${base}notification.mp3`);
    _audio.preload = "auto";
  }
  return _audio;
}

export function playChime() {
  try {
    const audio = getAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}
