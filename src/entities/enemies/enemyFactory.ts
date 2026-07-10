import type { Enemy, EnemyRaceConfig, EnemyVariant } from "./enemyTypes";
import type { Position } from "../../types/game";
import { rollEnemyAttributes, computeEnemyStats } from "./enemyAttributes";

let nextId = 1;

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createEnemy(
  config:   EnemyRaceConfig,
  variant:  EnemyVariant,
  x:        number,
  y:        number,
  patrolA?: Position,
  patrolB?: Position,
): Enemy {
  // Sorteia os atributos (FOR/DES/CON/RES/Precisão) dentro dos ranges da
  // raça/variante, e converte pra stats de combate com a mesma fórmula do
  // player — dois inimigos da mesma variante não saem idênticos.
  const attributes = rollEnemyAttributes(config.attributeRanges);
  const stats = computeEnemyStats(attributes);

  const hp = Math.max(1, Math.round(stats.hpMax));
  const damage = stats.damage;
  const speed = parseFloat(stats.speed.toFixed(2));

  const isStrong = variant === "strong" && patrolA && patrolB;
  const behavior = isStrong ? "patrol" : "wander";

  return {
    id:      nextId++,
    race:    config.race,
    variant,
    x,
    y,
    hp,
    hpMax:  hp,
    damage,
    speed,
    defense: stats.defense,
    critChance: stats.critChance,
    critDamageMultiplier: stats.critDamageMultiplier,
    attributes,
    visionRadius:        config.visionRadius,
    contactRadius:       config.contactRadius,
    damageCooldown:      config.damageCooldown,
    damageCooldownTimer: 0,
    behavior,
    color: config.color,
    xpReward: config.xpReward,

    // Animação começa em idle, frame 0
    animState:  "idle",
    frameIndex: 0,
    frameTimer: 0,

    hitFlashTimer: 0,
    knockbackX: 0,
    knockbackY: 0,

    deathAnimDone: false,

    patrolA:      isStrong ? patrolA : undefined,
    patrolB:      isStrong ? patrolB : undefined,
    patrolTarget: isStrong ? "B"     : undefined,

    wanderDx:    behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
    wanderDy:    behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
    wanderTimer: behavior === "wander" ? Math.round(randBetween(60, 180)) : undefined,
  };
}
