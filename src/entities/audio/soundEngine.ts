// Motor de som sintetizado via Web Audio API — nenhum arquivo de áudio,
// tudo gerado na hora com osciladores + envelope de volume. Ver a função
// playTone() pra entender a base; as funções no fim são só combinações
// de frequência/duração/forma de onda em cima dela.

const MUTE_KEY = "origem-audio-muted";

let audioCtx: AudioContext | null = null;
let muted = loadMutePreference();

function loadMutePreference(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveMutePreference(value: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // ignora — perder a preferência não deve quebrar o jogo
  }
}

// Contexto de áudio é criado só na primeira vez que algum som toca (lazy)
// — navegadores bloqueiam áudio antes de um gesto do usuário, e como o
// jogo já exige apertar um botão pra mover, isso nunca vira problema.
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  saveMutePreference(muted);
  return muted;
}

type ToneOptions = {
  type?: OscillatorType;
  freq: number;
  freqTo?: number; // se definido, a frequência desliza de freq até freqTo
  duration: number; // segundos
  volume?: number;
};

// Toca um único tom sintetizado — a base de todos os efeitos daqui.
function playTone({ type = "square", freq, freqTo, duration, volume = 0.25 }: ToneOptions) {
  if (muted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqTo, ctx.currentTime + duration);
  }

  // Envelope de volume — sobe instantâneo, desce suave (evita "estalo")
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// ── AJUSTE POR RAÇA (preparado pro futuro) ────────────────────────────────
// Hoje só existe o slime, então é a única entrada. Quando uma raça nova
// existir (goblin etc.), é só adicionar aqui — as funções abaixo já
// aceitam `race` e aplicam esse multiplicador de pitch automaticamente.
const RACE_PITCH: Record<string, number> = {
  slime: 1,
};

function pitchFor(race?: string): number {
  if (!race) return 1;
  return RACE_PITCH[race] ?? 1;
}

// ── EFEITOS ────────────────────────────────────────────────────────────────

export function playHit(race?: string) {
  playTone({ type: "square", freq: 220 * pitchFor(race), duration: 0.08, volume: 0.22 });
}

export function playCrit(race?: string) {
  playTone({
    type: "square",
    freq: 330 * pitchFor(race),
    freqTo: 520 * pitchFor(race),
    duration: 0.12,
    volume: 0.3,
  });
}

export function playHurt() {
  playTone({ type: "sawtooth", freq: 140, freqTo: 90, duration: 0.15, volume: 0.25 });
}

export function playEnemyDeath(race?: string) {
  playTone({
    type: "sine",
    freq: 400 * pitchFor(race),
    freqTo: 90,
    duration: 0.3,
    volume: 0.22,
  });
}

export function playLevelUp() {
  if (muted) return;
  // Arpejo simples subindo — 3 notas curtas em sequência
  const notes = [440, 550, 660];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone({ type: "sine", freq, duration: 0.15, volume: 0.25 }), i * 90);
  });
}

export function playPlayerDeath() {
  playTone({ type: "sawtooth", freq: 200, freqTo: 50, duration: 0.6, volume: 0.28 });
}
