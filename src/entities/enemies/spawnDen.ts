import type { Position } from "../../types/game";
import type { Enemy, EnemyVariant } from "./enemyTypes";
import { createEnemy } from "./enemyFactory";
import { SLIME_WEAK_CONFIG, SLIME_STRONG_CONFIG } from "./slime/slime";

// Um covil é um ponto fixo no mapa (marcado com TILE.SPAWN_CAVE) que
// mantém sempre um inimigo vivo: quando o inimigo dele morre, o covil
// espera `respawnDelay` frames e nasce outro no mesmo lugar.
export type SpawnDen = {
  id: number;
  x: number;
  y: number;
  variant: EnemyVariant;
  respawnDelay: number; // frames de espera após a morte do inimigo do covil
  cooldownTimer: number; // contagem regressiva até poder nascer outro
  currentEnemyId: number | null; // id do inimigo vivo desse covil, ou null
};

let nextDenId = 1;

export function createSpawnDen(
  pos: Position,
  variant: EnemyVariant = "weak",
  respawnDelay = 180, // ~3s a 60fps
): SpawnDen {
  return {
    id: nextDenId++,
    x: pos.x,
    y: pos.y,
    variant,
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

    const config = den.variant === "strong" ? SLIME_STRONG_CONFIG : SLIME_WEAK_CONFIG;
    const enemy = createEnemy(config, den.variant, den.x, den.y);
    enemy.denId = den.id;

    enemies.push(enemy);
    den.currentEnemyId = enemy.id;
    den.cooldownTimer = den.respawnDelay;
  }
}
