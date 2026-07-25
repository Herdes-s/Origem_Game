import type { EnemyTierConfig } from "./enemyTypes";
import type { AttributeWeights } from "./enemyLeveling";
import type { EnemyRace } from "../../data/maps/types";
import { SLIME_ATTRIBUTE_WEIGHTS, SLIME_TIERS } from "./slime/slime";
import { GOBLIN_ATTRIBUTE_WEIGHTS, GOBLIN_TIERS } from "./goblin/goblin";

// Lookup central raça → { tier → config }. O spawner (enemySpawner.ts) e o
// covil (spawnDen.ts) usam isso pra resolver o EnemyTierConfig de verdade
// a partir só do par (raça, tier) guardado no MapDefinition — adicionar
// uma raça nova é só adicionar uma entrada aqui.
export const RACE_TIERS: Record<EnemyRace, Record<string, EnemyTierConfig>> = {
  slime: SLIME_TIERS,
  goblin: GOBLIN_TIERS,
};

// "Personalidade" de atributo de cada raça (ver enemyLeveling.ts) — é
// RAÇA, não tier: um slimeHeroi tem a mesma tendência de um slime comum,
// só que com mais pontos (level mais alto) pra distribuir.
export const RACE_ATTRIBUTE_WEIGHTS: Record<EnemyRace, AttributeWeights> = {
  slime: SLIME_ATTRIBUTE_WEIGHTS,
  goblin: GOBLIN_ATTRIBUTE_WEIGHTS,
};

export function getTierConfig(race: EnemyRace, tier: string): EnemyTierConfig | undefined {
  return RACE_TIERS[race]?.[tier];
}
