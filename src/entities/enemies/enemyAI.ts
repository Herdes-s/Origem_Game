import type { AttackState, HudState, Position } from "../../types/game";
import { wouldCollide } from "../../utils/collision";
import { PLAYER_CONFIG } from "../player/player";
import type { Enemy } from "./enemyTypes";
import { SLIME_FRAME_SPEED } from "./slime/slimeSprite";

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function normalize(dx: number, dy: number): [number, number] {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [0, 0];
  return [dx / len, dy / len];
}

function moveEnemy(enemy: Enemy, dx: number, dy: number) {
  const [ndx, ndy] = normalize(dx, dy);
  const nextX = enemy.x + ndx * enemy.speed;
  const nextY = enemy.y + ndy * enemy.speed;

  if (!wouldCollide(nextX, enemy.y)) enemy.x = nextX;
  if (!wouldCollide(enemy.x, nextY)) enemy.y = nextY;
}

// KNOCKBACK
function apllyKnockback(enemy: Enemy) {
  if (Math.abs(enemy.knockbackX) < 0.1) enemy.knockbackX = 0;
  if (Math.abs(enemy.knockbackY) < 0.1) enemy.knockbackY = 0;
  if (enemy.knockbackX === 0 && enemy.knockbackY === 0) return;

  const nextX = enemy.x + enemy.knockbackX;
  const nextY = enemy.y + enemy.knockbackY;

  if (!wouldCollide(nextX, enemy.y)) enemy.x = nextX;
  else enemy.knockbackX = 0;

  if (!wouldCollide(enemy.x, nextY)) enemy.y = nextY;
  else enemy.knockbackY = 0;

  enemy.knockbackX *= PLAYER_CONFIG.knockbackDecay;
  enemy.knockbackY *= PLAYER_CONFIG.knockbackDecay;
}

// ANIMAÇÂO
function updateAnimation(enemy: Enemy) {
  const speed = SLIME_FRAME_SPEED[enemy.animState] ?? 12;
  const count = 4;

  enemy.frameTimer++;
  if (enemy.frameTimer >= speed) {
    enemy.frameTimer = 0;
    enemy.frameIndex = (enemy.frameIndex + 1) % count;

    if (enemy.frameIndex === 0) return true;
  }
  return false;
}

// COMPORTAMENTOS
function chase(enemy: Enemy, player: Position) {
  enemy.animState = "move";
  moveEnemy(enemy, player.x - enemy.x, player.y - enemy.y);
}

function patrol(enemy: Enemy) {
  if (!enemy.patrolA || !enemy.patrolB || !enemy.patrolTarget) return;

  const target = enemy.patrolTarget === "A" ? enemy.patrolA : enemy.patrolB;
  const d = dist(enemy.x, enemy.y, target.x, target.y);

  if (d < 4) {
    enemy.patrolTarget = enemy.patrolTarget === "A" ? "B" : "A";
    enemy.animState = "idle";
    return;
  }

  enemy.animState = "move";
  moveEnemy(enemy, target.x - enemy.x, target.y - enemy.y);
}

function wander(enemy: Enemy) {
  if (
    enemy.wanderDx === undefined ||
    enemy.wanderDy === undefined ||
    enemy.wanderTimer === undefined
  )
    return;

  if (enemy.wanderTimer <= 0) {
    enemy.wanderDx = Math.random() * 2 - 1;
    enemy.wanderDy = Math.random() * 2 - 1;
    enemy.wanderTimer = 60 + Math.round(Math.random() * 120);
    enemy.animState = "idle";
  } else {
    enemy.animState = "move";
  }

  enemy.wanderTimer--;
  moveEnemy(enemy, enemy.wanderDx, enemy.wanderDy);
}

function tryDamagePlayer(
  enemy: Enemy,
  player: Position,
  hud: HudState,
  attackRef: React.RefObject<AttackState>,
) {
  if (enemy.damageCooldownTimer > 0) {
    enemy.damageCooldownTimer--;
    return;
  }

  if (dist(enemy.x, enemy.y, player.x, player.y) <= enemy.contactRadius) {
    hud.hp = Math.max(0, hud.hp - enemy.damage);
    enemy.damageCooldownTimer = enemy.damageCooldown;

    if (attackRef.current) {
      attackRef.current.hitFlash = PLAYER_CONFIG.hitFlashDuration;
    }

    if (enemy.knockbackX === 0 && enemy.knockbackY === 0) {
      enemy.animState = "attack";
      enemy.frameIndex = 0;
      enemy.frameTimer = 0;
    }
  }
}

// FUNÇÂO PRINCIPAL
export function updateEnemies(
  enemies: Enemy[],
  player: Position,
  hud: HudState,
  attackRef: React.RefObject<AttackState>,
) {
  for (const enemy of enemies) {
    if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer--;

    apllyKnockback(enemy);

    if (enemy.hp <= 0) {
      if (enemy.animState !== "death") {
        enemy.animState = "death";
        enemy.frameIndex = 0;
        enemy.frameTimer = 0;
      }

      const cycleDone = updateAnimation(enemy);
      if (cycleDone) {
        enemy.deathAnimDone = true;
      }

      continue;
    }

    if (enemy.animState === "attack") {
      const done = updateAnimation(enemy);
      if (done) {
        enemy.animState = enemy.behavior === "chase" ? "move" : "idle";
      }
      tryDamagePlayer(enemy, player, hud, attackRef);
      continue;
    }

    const d = dist(enemy.x, enemy.y, player.x, player.y);

    if (d <= enemy.visionRadius) {
      enemy.behavior = "chase";
    } else {
      enemy.behavior = enemy.variant === "strong" ? "patrol" : "wander";
    }

    switch (enemy.behavior) {
      case "chase":
        chase(enemy, player);
        break;
      case "patrol":
        patrol(enemy);
        break;
      case "wander":
        wander(enemy);
        break;
    }

    tryDamagePlayer(enemy, player, hud, attackRef);
    updateAnimation(enemy);
  }
}
