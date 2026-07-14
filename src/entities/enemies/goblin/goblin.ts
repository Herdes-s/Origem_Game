import type { EnemyRaceConfig } from "../enemyTypes";

// RAÇA: GOBLIN
// Diferente do slime: sprite direcional (frente/costas/lados de verdade,
// spriteStyle "directional"), e um perfil de combate diferente — mais
// ágil (DES alto) e mais frágil (CON baixo) que o slime, que é mais lento
// e tanque. Isso já emerge naturalmente dos ranges de atributo, sem
// precisar de nenhuma lógica de comportamento nova.
export const GOBLIN_WEAK_CONFIG: EnemyRaceConfig = {
  race: "goblin",
  spriteStyle: "directional",
  attributeRanges: {
    for: { min: 2, max: 4 },        // dano ~3-6, parecido com o slime fraco
    des: { min: 8, max: 12 },       // bem mais ágil que o slime (5-8)
    con: { min: 1, max: 3 },        // mais frágil que o slime (2-4)
    res: { min: 0, max: 1 },        // quase sem defesa
    precisao: { min: 1, max: 4 },   // crítico 2-8%
  },
  visionRadius: 200,
  contactRadius: 32,
  damageCooldown: 45, // ataca um pouco mais rápido que o slime fraco (60)
  color: "#65a30d",
  xpReward: 10,
};

export const GOBLIN_STRONG_CONFIG: EnemyRaceConfig = {
  race: "goblin",
  spriteStyle: "directional",
  attributeRanges: {
    for: { min: 6, max: 9 },        // dano ~9-13.5, mais que o slime forte
    des: { min: 6, max: 10 },       // ainda mais ágil que o slime forte (3-6)
    con: { min: 3, max: 5 },        // mais frágil que o slime forte (4-6)
    res: { min: 1, max: 3 },
    precisao: { min: 3, max: 7 },   // crítico 6-14%
  },
  visionRadius: 280,
  contactRadius: 38,
  damageCooldown: 38,
  color: "#3f6212",
  xpReward: 24,
};
