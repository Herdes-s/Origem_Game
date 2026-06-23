import type { Position } from "../../types/game";

export type EnemyVariant = "weak" | "strong";

export type EnemyBehavior = "patrol" | "wander" | "chase";

export type EnemyAnimState = "idle" | "move" | "attack" | "death";

export type EnemyRaceConfig = {
  race: string;
  hpRange: [number, number];
  damageRange: [number, number];
  speedRange: [number, number];
  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  color: string;
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

  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  damageCooldownTimer: number;

  behavior: EnemyBehavior;
  color: string;

  // ANIMAÇÂO
  animState: EnemyAnimState;
  frameIndex: number;
  frameTimer: number;

  // Patrulha (strong)
  patrolA?: Position;
  patrolB?: Position;
  patrolTarget?: "A" | "B";

  // Wander (weak)
  wanderDx?: number;
  wanderDy?: number;
  wanderTimer?: number;
};
