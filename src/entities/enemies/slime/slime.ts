import type { EnemyRaceConfig } from "../enemyTypes";

// RAÇA: SLIME
export const SLIME_WEAK_CONFIG: EnemyRaceConfig = {
  race: "slime",
  hpRange: [15, 25],
  damageRange: [3, 6],
  speedRange: [0.8, 1.2],
  visionRadius: 90,
  contactRadius: 18,
  damageCooldown: 60,
  color: "#4ade80",
};

export const SLIME_STRONG_CONFIG: EnemyRaceConfig = {
  race: "slime",
  hpRange: [35, 50],
  damageRange: [8, 12],
  speedRange: [0.5, 0.9],
  visionRadius: 130,
  contactRadius: 22,
  damageCooldown: 50,
  color: "#16a34a",
};
