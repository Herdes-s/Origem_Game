import type { Enemy, EnemyTierConfig } from "./enemyTypes";
import type { Position } from "../../types/game";
import { rollEnemyAttributesForLevel, computeEnemyStats } from "./enemyAttributes";
import { RACE_ATTRIBUTE_WEIGHTS } from "./raceConfigs";

let nextId = 1;

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createEnemy(
  tierConfig: EnemyTierConfig,
  level:      number,
  x:          number,
  y:          number,
  patrolA?:   Position,
  patrolB?:   Position,
): Enemy {
  // Sorteia os atributos (FOR/DES/CON/RES/Precisão) pro level dado, com a
  // personalidade (pesos) da raça, e converte pra stats de combate com a
  // mesma fórmula do player — dois inimigos do mesmo tier/level não saem
  // idênticos.
  const weights = RACE_ATTRIBUTE_WEIGHTS[tierConfig.race];
  const attributes = rollEnemyAttributesForLevel(weights, level);
  const stats = computeEnemyStats(attributes);

  const hp = Math.max(1, Math.round(stats.hpMax));
  const damage = stats.damage;
  const speed = parseFloat(stats.speed.toFixed(2));

  // Comportamento vem do TIER (não é mais calculado de fraco/forte) —
  // tiers "patrol" exigem os dois pontos de patrulha pra valer, senão cai
  // pra "wander" (mesma rede de segurança que já existia).
  const isPatrol = tierConfig.behavior === "patrol" && patrolA && patrolB;
  const behavior = isPatrol ? "patrol" : "wander";

  return {
    id:    nextId++,
    race:  tierConfig.race,
    tier:  tierConfig.tier,
    tierLabel: tierConfig.label,
    level,

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

    sizeScale:           tierConfig.sizeScale,
    spriteKey:           tierConfig.spriteKey,
    visionRadius:        tierConfig.visionRadius,
    contactRadius:       tierConfig.contactRadius,
    damageCooldown:      tierConfig.damageCooldown,
    damageCooldownTimer: 0,

    behavior,
    baseBehavior: behavior,

    color: tierConfig.color,
    xpReward: tierConfig.xpReward,
    scoreReward: tierConfig.scoreReward,

    // Animação começa em idle, frame 0
    animState:  "idle",
    frameIndex: 0,
    frameTimer: 0,
    direction: "down",

    hitFlashTimer: 0,
    knockbackX: 0,
    knockbackY: 0,

    deathAnimDone: false,

    patrolA:      isPatrol ? patrolA : undefined,
    patrolB:      isPatrol ? patrolB : undefined,
    patrolTarget: isPatrol ? "B"     : undefined,

    wanderDx:    behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
    wanderDy:    behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
    wanderTimer: behavior === "wander" ? Math.round(randBetween(60, 180)) : undefined,
  };
}
