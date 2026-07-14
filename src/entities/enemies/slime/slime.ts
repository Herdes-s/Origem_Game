import type { EnemyRaceConfig } from "../enemyTypes";

// RAÇA: SLIME
// Atributos (FOR/DES/CON/RES/Precisão) substituem os antigos hpRange/
// damageRange/speedRange — hp, dano e velocidade agora são DERIVADOS dos
// atributos sorteados (mesma fórmula do player, entities/combat/
// attributeFormulas.ts). Os ranges abaixo foram calibrados pra ficar perto
// do balanceamento antigo (weak: hp 15-25, dano 3-6, vel 1.6-2.4 |
// strong: hp 35-50, dano 8-12, vel 1.0-1.8), com RES e Precisão como
// dimensões novas.
export const SLIME_WEAK_CONFIG: EnemyRaceConfig = {
  race: "slime",
  spriteStyle: "omni",
  attributeRanges: {
    for: { min: 2, max: 4 },       // dano ~3-6
    des: { min: 5, max: 8 },       // velocidade ~1.5-2.4
    con: { min: 2, max: 4 },       // hp ~16-32
    res: { min: 0, max: 2 },       // defesa ~0-1.2
    precisao: { min: 0, max: 3 },  // crítico 0-6%
  },
  visionRadius: 180,
  contactRadius: 36,
  damageCooldown: 60,
  color: "#4ade80",
  xpReward: 8,
};

export const SLIME_STRONG_CONFIG: EnemyRaceConfig = {
  race: "slime",
  spriteStyle: "omni",
  attributeRanges: {
    for: { min: 5, max: 8 },       // dano ~7.5-12
    des: { min: 3, max: 6 },       // velocidade ~0.9-1.8 (mais lento que o fraco)
    con: { min: 4, max: 6 },       // hp ~32-48
    res: { min: 2, max: 5 },       // defesa ~1.2-3
    precisao: { min: 2, max: 6 },  // crítico 4-12%
  },
  visionRadius: 260,
  contactRadius: 44,
  damageCooldown: 50,
  color: "#16a34a",
  xpReward: 20,
};
