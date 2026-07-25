import type { EnemyTierConfig } from "../enemyTypes";
import type { AttributeWeights } from "../enemyLeveling";

// RAÇA: GOBLIN — "personalidade" ágil e frágil: peso bem mais alto em DES
// do que em CON/RES, então tende a sair rápido e fraco na defesa (ver
// enemyLeveling.ts pra como o peso vira atributo de verdade).
export const GOBLIN_ATTRIBUTE_WEIGHTS: AttributeWeights = {
  for: 1,
  des: 1.7,
  con: 0.5,
  res: 0.6,
};

// Hierarquia da raça: goblin (vaga solto) → goblinHeroi (patrulha) →
// bossGoblin (patrulha, maior e mais raro). O MAPA decide quem nasce e em
// que level (data/maps/*.ts) — aqui só ficam as características fixas do
// "cargo". Sprite reaproveitado: as 3 tiers usam a mesma sheet (o goblin
// já era compartilhado entre fraco/forte antes) — só o tamanho de desenho
// muda, até ter arte própria pro chefão.
export const GOBLIN_TIERS: Record<string, EnemyTierConfig> = {
  goblin: {
    tier: "goblin",
    race: "goblin",
    label: "Goblin",
    spriteStyle: "directional",
    spriteKey: "goblin",
    sizeScale: 1,
    behavior: "wander",
    visionRadius: 200,
    contactRadius: 32,
    damageCooldown: 45,
    color: "#65a30d",
    xpReward: 10,
    scoreReward: 12,
  },
  goblinHeroi: {
    tier: "goblinHeroi",
    race: "goblin",
    label: "Goblin Herói",
    spriteStyle: "directional",
    spriteKey: "goblin",
    sizeScale: 1.2,
    behavior: "patrol",
    visionRadius: 280,
    contactRadius: 38,
    damageCooldown: 38,
    color: "#3f6212",
    xpReward: 24,
    scoreReward: 28,
  },
  bossGoblin: {
    tier: "bossGoblin",
    race: "goblin",
    label: "★ Goblin Chefão",
    spriteStyle: "directional",
    spriteKey: "goblin", // placeholder — reaproveita a mesma sheet, maior
    sizeScale: 1.6,
    behavior: "patrol",
    visionRadius: 340,
    contactRadius: 48,
    damageCooldown: 30,
    color: "#1a2e05",
    xpReward: 50,
    scoreReward: 65,
  },
};
