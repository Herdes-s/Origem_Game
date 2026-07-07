// Progresso do player: level, XP acumulado e pontos de atributo esperando
// alocação. Separado de playerAttributes.ts de propósito — atributos são
// "o que o player tem agora", progresso é "como ele chegou lá".
export type PlayerProgress = {
  level: number;
  xp: number; // xp acumulado dentro do level atual
  xpToNextLevel: number; // quanto falta pra subir pro próximo level
  unallocatedPoints: number; // pontos de atributo esperando o player escolher onde ir
};

// Quantos pontos de atributo cada level concede
export const POINTS_PER_LEVEL = 2;

// ── CURVA DE XP ───────────────────────────────────────────────────────────
// Crescimento suave: cada level pede um pouco mais de XP que o anterior,
// sem disparar (ex: lvl1→2 precisa de 20xp, lvl9→10 precisa de ~156xp).
// Pra recalibrar a dificuldade, é só mexer em BASE_XP ou XP_GROWTH.
const BASE_XP = 20;
const XP_GROWTH = 1.35;

export function xpRequiredForLevel(level: number): number {
  return Math.round(BASE_XP * Math.pow(level, XP_GROWTH));
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: xpRequiredForLevel(1),
  unallocatedPoints: 0,
};

// Concede XP e processa quantos level ups forem necessários de uma vez
// (ex: se ganhar XP suficiente pra subir 2 levels de um golpe só). Não
// muta o progress recebido — devolve um novo, pra combinar direto com
// setProgress(prev => gainXp(prev, valor)).
export function gainXp(progress: PlayerProgress, amount: number): PlayerProgress {
  let { level, xp, xpToNextLevel, unallocatedPoints } = progress;
  xp += amount;

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    unallocatedPoints += POINTS_PER_LEVEL;
    xpToNextLevel = xpRequiredForLevel(level);
  }

  return { level, xp, xpToNextLevel, unallocatedPoints };
}
