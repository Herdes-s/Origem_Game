// Progresso do player: level, XP acumulado e pontos de atributo esperando
// alocação. Separado de playerAttributes.ts de propósito — atributos são

import { removeRandomAttributePoints, type PlayerAttributes } from "./playerAttributes";

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

// ── PENALIDADE DE MORTE ────────────────────────────────────────────────────
// Morrer tira 20% do XP TOTAL que o level atual pede (xpToNextLevel — o
// requisito cheio, não só o que já foi acumulado). É essa diferença que
// faz a penalidade ter "risco" de verdade: se você acabou de subir de
// level (xp baixo), perder 20% do requisito cheio quase certamente fura
// pro negativo; se você já tinha bancado bastante xp naquele level, a
// perda pode não chegar a zerar. Se isso deixar o XP negativo, regride 1
// level — e só nesse caso perde os 2 pontos daquele level: primeiro do
// que ainda está "não alocado" (mais barato — nunca tinha virado atributo
// de verdade), e só mexe em atributo já gasto se precisar completar os 2.
// Não muta nada — devolve progress/attributes novos.
const DEATH_XP_LOSS_PERCENT = 0.2;

export function applyDeathPenalty(
  progress: PlayerProgress,
  attributes: PlayerAttributes,
): { progress: PlayerProgress; attributes: PlayerAttributes } {
  const xpLoss = Math.round(progress.xpToNextLevel * DEATH_XP_LOSS_PERCENT);
  let xp = progress.xp - xpLoss;
  let level = progress.level;
  let unallocatedPoints = progress.unallocatedPoints;
  let newAttributes = attributes;

  if (xp < 0) {
    if (level > 1) {
      // Regride 1 level — o "buraco" de xp negativo vira débito sobre o
      // requisito do level anterior (nunca fica negativo de verdade)
      level -= 1;
      xp = Math.max(0, xpRequiredForLevel(level) + xp);

      let pointsToRemove = POINTS_PER_LEVEL;
      const fromPool = Math.min(unallocatedPoints, pointsToRemove);
      unallocatedPoints -= fromPool;
      pointsToRemove -= fromPool;

      if (pointsToRemove > 0) {
        newAttributes = removeRandomAttributePoints(attributes, pointsToRemove);
      }
    } else {
      // Já no level 1 — não regride mais, só zera o xp
      xp = 0;
    }
  }

  return {
    progress: {level, xp, xpToNextLevel: xpRequiredForLevel(level), unallocatedPoints },
    attributes: newAttributes,
  }
}