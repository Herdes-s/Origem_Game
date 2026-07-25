import type { Position } from "../../types/game";
import type { Enemy } from "./enemyTypes";
import { createEnemy } from "./enemyFactory";
import { SLIME_TIERS } from "./slime/slime";
import { rollLevelInRange, type LevelRange } from "./enemyLeveling";

// Um covil é um ponto fixo no mapa (marcado com TILE.SPAWN_CAVE) que
// mantém sempre um inimigo vivo: quando o inimigo dele morre, o covil
// espera `respawnDelay` frames e nasce outro no mesmo lugar. Hoje sempre
// spawna slime no tier base ("slime") — cada respawn sorteia um level
// novo dentro de `levelRange` (definido pelo mapa, ver enemySpawner.ts).
export type SpawnDen = {
  id: number;
  x: number;
  y: number;
  levelRange: LevelRange;
  respawnDelay: number; // frames de espera após a morte do inimigo do covil
  cooldownTimer: number; // contagem regressiva até poder nascer outro
  currentEnemyId: number | null; // id do inimigo vivo desse covil, ou null
};

let nextDenId = 1;

export function createSpawnDen(
  pos: Position,
  levelRange: LevelRange = { min: 1, max: 3 },
  respawnDelay = 180, // ~3s a 60fps
): SpawnDen {
  return {
    id: nextDenId++,
    x: pos.x,
    y: pos.y,
    levelRange,
    respawnDelay,
    cooldownTimer: 0,
    currentEnemyId: null,
  };
}

// Chamado a cada frame do game loop. Pra cada covil: se o inimigo dele
// ainda está na lista de inimigos, não faz nada. Se não está (morreu e já
// foi removido), conta o cooldown e spawna um novo quando ele zera.
export function updateSpawnDens(dens: SpawnDen[], enemies: Enemy[], dt: number) {
  for (const den of dens) {
    const alive =
      den.currentEnemyId !== null &&
      enemies.some((e) => e.id === den.currentEnemyId);

    if (alive) continue;

    if (den.cooldownTimer > 0) {
      den.cooldownTimer -= dt;
      continue;
    }

    const level = rollLevelInRange(den.levelRange);
    const enemy = createEnemy(SLIME_TIERS.slime, level, den.x, den.y);
    enemy.denId = den.id;

    enemies.push(enemy);
    den.currentEnemyId = enemy.id;
    den.cooldownTimer = den.respawnDelay;
  }
}
