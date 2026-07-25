import type { EnemyTierConfig } from "../enemyTypes";
import type { AttributeWeights } from "../enemyLeveling";

// RAÇA: SLIME — "personalidade" tanque: peso bem mais alto em CON/RES do
// que em DES, então tende a sair lento e resistente (ver enemyLeveling.ts
// pra como o peso vira atributo de verdade).
export const SLIME_ATTRIBUTE_WEIGHTS: AttributeWeights = {
  for: 1,
  des: 0.6,
  con: 1.5,
  res: 1.3,
};

// Hierarquia da raça: slime (vaga solto) → slimeHeroi (patrulha) →
// bossSlime (patrulha, maior e mais raro). O MAPA decide quem nasce e em
// que level (data/maps/*.ts) — aqui só ficam as características fixas do
// "cargo". Sprite reaproveitado: ainda não existe arte própria pro tier
// de chefão, então bossSlime usa a mesma sheet "forte" só que maior — até
// ter sprite dedicado (mesmo espírito de placeholder do resto do jogo).
export const SLIME_TIERS: Record<string, EnemyTierConfig> = {
  slime: {
    tier: "slime",
    race: "slime",
    label: "Slime",
    spriteStyle: "directional",
    spriteKey: "slime_weak",
    sizeScale: 1,
    behavior: "wander",
    visionRadius: 180,
    contactRadius: 36,
    damageCooldown: 60,
    color: "#4ade80",
    xpReward: 8,
    scoreReward: 10,
  },
  slimeHeroi: {
    tier: "slimeHeroi",
    race: "slime",
    label: "Slime Herói",
    spriteStyle: "directional",
    spriteKey: "slime_strong",
    sizeScale: 1.25,
    behavior: "patrol",
    visionRadius: 260,
    contactRadius: 44,
    damageCooldown: 50,
    color: "#16a34a",
    xpReward: 20,
    scoreReward: 25,
  },
  bossSlime: {
    tier: "bossSlime",
    race: "slime",
    label: "★ Slime Chefão",
    spriteStyle: "directional",
    spriteKey: "slime_strong", // placeholder — reaproveita a sheet "forte", maior
    sizeScale: 1.7,
    behavior: "patrol",
    visionRadius: 320,
    contactRadius: 56,
    damageCooldown: 40,
    color: "#0f5132",
    xpReward: 45,
    scoreReward: 60,
  },
};
