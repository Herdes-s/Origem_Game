import type { PrimaryAttributes } from "../combat/attributeFormulas";

// Pesos relativos de cada atributo primário no sorteio de pontos por
// level (usado abaixo) — não somam 1, só a PROPORÇÃO entre eles importa.
// É isso que dá "personalidade" pra cada raça (goblin ágil e frágil,
// slime tanque) mesmo com pontos 100% aleatórios — ver slime.ts/goblin.ts
// pros valores concretos de cada raça.
export type AttributeWeights = {
  for: number;
  des: number;
  con: number;
  res: number;
};

export type LevelRange = { min: number; max: number };

// Sorteia um level inteiro dentro do range que o MAPA define pra aquele
// grupo de spawn (ver data/maps/types.ts) — cada instância que nasce rola
// o próprio level, então nem todo mundo do mesmo grupo sai igual.
export function rollLevelInRange(range: LevelRange): number {
  return Math.round(range.min + Math.random() * (range.max - range.min));
}

const BASE_PRIMARY = 5; // mesmo valor inicial do player (playerAttributes.ts)
const POINTS_PER_LEVEL = 2; // mesmo ganho do player por level

// Base 5 em cada atributo primário (igual ao player no level 1), mais 2
// pontos por level acima do 1 — mas diferente do player (alocação manual
// do jogador), aqui cada ponto individual sorteia sozinho um dos 4
// primários, com peso (AttributeWeights da raça). Resultado: dois
// inimigos do mesmo level/raça nunca saem idênticos, mas a raça ainda tem
// uma tendência clara (goblin com DES muito mais pesado tende a sair
// ágil; slime com CON/RES mais pesados tende a sair tanque).
export function rollPrimaryAttributesForLevel(
  weights: AttributeWeights,
  level: number,
): PrimaryAttributes {
  const primary: PrimaryAttributes = {
    for: BASE_PRIMARY,
    des: BASE_PRIMARY,
    con: BASE_PRIMARY,
    res: BASE_PRIMARY,
  };

  const totalPoints = Math.max(0, level - 1) * POINTS_PER_LEVEL;
  const totalWeight = weights.for + weights.des + weights.con + weights.res;

  for (let i = 0; i < totalPoints; i++) {
    let roll = Math.random() * totalWeight;

    if ((roll -= weights.for) < 0) primary.for += 1;
    else if ((roll -= weights.des) < 0) primary.des += 1;
    else if (roll - weights.con < 0) primary.con += 1;
    else primary.res += 1;
  }

  return primary;
}
