import type { EnemyRaceConfig } from "../enemyTypes";

// RAÇA: SLIME
export const SLIME_WEAK_CONFIG: EnemyRaceConfig = {
  race: "slime",
  hpRange: [15, 25],
  damageRange: [3, 6],
  speedRange: [1.6, 2.4],
  visionRadius: 180,
  contactRadius: 36,
  damageCooldown: 60,
  color: "#4ade80",
  xpReward: 8,
};

export const SLIME_STRONG_CONFIG: EnemyRaceConfig = {
  race: "slime",
  hpRange: [35, 50],
  damageRange: [8, 12],
  speedRange: [1.0, 1.8],
  visionRadius: 260,
  contactRadius: 44,
  damageCooldown: 50,
  color: "#16a34a",
  xpReward: 20,
};
