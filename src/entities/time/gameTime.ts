// Escala de tempo: 24h de jogo passam em 6h reais — TIME_SCALE é quantas
// "horas de jogo" acontecem por hora real (24/6 = 4). useGameClock.ts
// multiplica o tempo real decorrido por isso antes de somar ao total.
// Mudar só esse número reajusta a duração do dia inteiro, sem mexer em
// mais nada (DAY_MS continua sendo 24h de jogo, sempre).
export const TIME_SCALE = 4;

// Tempo REAL: 1 hora de jogo = 1 hora real (ver useGameClock.ts pra como
// isso é acumulado). Dia 1 começa em totalPlayedMs = 0 — a primeira vez
// que o jogo roda, não a cada carregamento.
export const DAY_MS = 24 * 60 * 60 * 1000;

export type GameTime = {
  day: number;
  hours: number;
  minutes: number;
};

export function computeGameTime(totalPlayedMs: number): GameTime {
  const day = Math.floor(totalPlayedMs / DAY_MS) + 1;
  const msIntoDay = totalPlayedMs % DAY_MS;
  const hours = Math.floor(msIntoDay / (60 * 60 * 1000));
  const minutes = Math.floor((msIntoDay % (60 * 60 * 1000)) / (60 * 1000));

  return { day, hours, minutes };
}

export function formatGameTime(time: GameTime): string {
  const hh = String(time.hours).padStart(2, "0");
  const mm = String(time.minutes).padStart(2, "0");
  return `Dia ${time.day} · ${hh}:${mm}`;
}
