let _audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!_audio) {
    _audio = new Audio("/notification.mp3");
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
