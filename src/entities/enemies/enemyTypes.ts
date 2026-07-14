import type { Direction, Position } from "../../types/game";
import type { EnemyAttributes, EnemyAttributeRanges } from "./enemyAttributes";

export type EnemyVariant = "weak" | "strong";

export type EnemyBehavior = "patrol" | "wander" | "chase";

export type EnemyAnimState = "idle" | "move" | "attack" | "death";

// "omni" = uma visão só, igual pra qualquer direção (caso do slime — é um
// blob, não tem "lado"). "directional" = sprite com frente/costas/lados
// de verdade, como o goblin (e o player).
export type EnemySpriteStyle = "omni" | "directional";

export type EnemyRaceConfig = {
  race: string;
  spriteStyle: EnemySpriteStyle;
  attributeRanges: EnemyAttributeRanges; // FOR/DES/CON/RES/Precisão — hp/dano/velocidade vêm daqui
  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  color: string;
  xpReward: number; // XP concedido ao player quando esse inimigo morre
};

export type Enemy = {
  id: number;
  race: string;
  variant: EnemyVariant;

  x: number;
  y: number;

  hp: number;
  hpMax: number;
  damage: number;
  speed: number;
  defense: number; // reduz o dano recebido do player (vem de RES)
  critChance: number; // 0 a 1 — chance de crítico ao atacar o player
  critDamageMultiplier: number;

  // Atributos que geraram os stats acima — guardado pra referência/debug
  attributes: EnemyAttributes;

  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  damageCooldownTimer: number;

  behavior: EnemyBehavior;
  color: string;
  xpReward: number;

  // ANIMAÇÂO
  animState: EnemyAnimState;
  frameIndex: number;
  frameTimer: number;

  // Direção que o inimigo está encarando — só importa pra raças com
  // spriteStyle "directional" (slime ignora, ele é "omni")
  direction: Direction;

  // Flash vermelho ao receber dano
  hitFlashTimer: number;

  //Knockback - velocidade residual após ser empurrado
  knockbackX: number;
  knockbackY: number;

  deathAnimDone: boolean;

  // Patrulha (strong)
  patrolA?: Position;
  patrolB?: Position;
  patrolTarget?: "A" | "B";

  // Wander (weak)
  wanderDx?: number;
  wanderDy?: number;
  wanderTimer?: number;

  // Covil de spawn — se esse inimigo nasceu de um covil (TILE.SPAWN_CAVE),
  // guarda o id do covil pra ele saber quando pode nascer outro no lugar.
  denId?: number;
};
