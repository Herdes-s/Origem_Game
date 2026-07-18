import type { EnemyRaceConfig } from "./enemyTypes";
import type { EnemyRace } from "../../data/maps/types";
import { SLIME_WEAK_CONFIG, SLIME_STRONG_CONFIG } from "./slime/slime";
import { GOBLIN_WEAK_CONFIG, GOBLIN_STRONG_CONFIG } from "./goblin/goblin";

// Lookup central raça → config fraco/forte. O spawner (enemySpawner.ts)
// usa isso pra resolver o EnemyRaceConfig de verdade a partir só do nome
// da raça guardado no MapDefinition — adicionar uma raça nova é só
// adicionar uma entrada aqui.
export const RACE_CONFIGS: Record<EnemyRace, { weak: EnemyRaceConfig; strong: EnemyRaceConfig }> = {
  slime: { weak: SLIME_WEAK_CONFIG, strong: SLIME_STRONG_CONFIG },
  goblin: { weak: GOBLIN_WEAK_CONFIG, strong: GOBLIN_STRONG_CONFIG },
};
