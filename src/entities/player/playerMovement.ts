import type { GameKeys, Position, AttackState, DamageNumber, HudState } from "../../types/game";
import { wouldCollide } from "../../utils/collision";
import { PLAYER_CONFIG } from "./player";
import type { Enemy } from "../enemies/enemyTypes";

// Contador global para IDs únicos dos números de dano
let dmgNumberId = 0;

// Frames que o número de dano fica visível
const DAMAGE_NUMBER_LIFETIME = 50;

// Pontos ganhos ao matar cada variante
const SCORE_WEAK = 10;
const SCORE_STRONG = 25;

// ── HITBOX ────────────────────────────────────────────────────────────────────
// Calcula o retângulo da hitbox baseado na posição e direção do player
function getHitbox(pos: Position, dir: string) {
  const { hitboxOffset, hitboxW, hitboxH } = PLAYER_CONFIG;
  const half = hitboxH / 2;

  switch (dir) {
    case "right":
      return {
        x: pos.x + hitboxOffset,
        y: pos.y - half,
        w: hitboxW,
        h: hitboxH,
      };
    case "left":
      return {
        x: pos.x - hitboxOffset - hitboxW,
        y: pos.y - half,
        w: hitboxW,
        h: hitboxH,
      };
    case "down":
      return {
        x: pos.x - half,
        y: pos.y + hitboxOffset,
        w: hitboxH,
        h: hitboxW,
      };
    case "up":
      return {
        x: pos.x - half,
        y: pos.y - hitboxOffset - hitboxW,
        w: hitboxH,
        h: hitboxW,
      };
    default:
      return { x: pos.x, y: pos.y, w: 0, h: 0 };
  }
}

// ── SEPARAÇÃO PLAYER × INIMIGO ────────────────────────────────────────────────
// Impede player e inimigo de ficarem no mesmo espaço
// Empurra o inimigo para fora quando há sobreposição
function separateFromPlayer(pos: Position, enemies: Enemy[]) {
  const SEPARATION_RADIUS = 14; // px — distância mínima entre centros

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const dx = enemy.x - pos.x;
    const dy = enemy.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < SEPARATION_RADIUS && dist > 0) {
      // Empurra o inimigo para fora proporcionalmente
      const push = (SEPARATION_RADIUS - dist) / dist;
      const nx = enemy.x + dx * push;
      const ny = enemy.y + dy * push;

      if (!wouldCollide(nx, enemy.y)) enemy.x = nx;
      if (!wouldCollide(enemy.x, ny)) enemy.y = ny;
    }
  }
}

// ── MOVIMENTO + ATAQUE ────────────────────────────────────────────────────────
export function updatePlayerMovement(
  pos: Position,
  keys: GameKeys,
  attack: AttackState,
  enemies: Enemy[],
  dirRef: { current: string }, // ref da direção vinda do ScreenGame
  hud: HudState,
  damageNumbers: DamageNumber[],
) {
  // ── MOVIMENTO ─────────────────────────────────────────────
  let dx = 0;
  let dy = 0;

  if (keys["ArrowUp"] || keys["w"]) dy -= 1;
  if (keys["ArrowDown"] || keys["s"]) dy += 1;
  if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
  if (keys["ArrowRight"] || keys["d"]) dx += 1;

  if (dx !== 0 && dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx = dx / len;
    dy = dy / len;
  }

  const nextX = pos.x + dx * PLAYER_CONFIG.speed;
  const nextY = pos.y + dy * PLAYER_CONFIG.speed;

  if (!wouldCollide(nextX, pos.y)) pos.x = nextX;
  if (!wouldCollide(pos.x, nextY)) pos.y = nextY;

  // ── ATAQUE ────────────────────────────────────────────────
  // Decrementa cooldown a cada frame
  if (attack.cooldown > 0) attack.cooldown--;

  // Inicia ataque ao pressionar Space ou x
  if ((keys[" "] || keys["x"]) && attack.cooldown <= 0 && !attack.active) {
    attack.active = true;
    attack.duration = PLAYER_CONFIG.attackDuration;
    attack.cooldown = PLAYER_CONFIG.attackCooldown;
    attack.direction = dirRef.current as AttackState["direction"];

    attack.hitEnemyIds = new Set();
  }

  // Hitbox ativa — checa colisão com inimigos
  if (attack.active && attack.duration > 0) {
    const hitbox = getHitbox(pos, attack.direction);

    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;

      // Checa se o centro do inimigo está dentro da hitbox
      if (attack.hitEnemyIds?.has(enemy.id)) continue;

      const hit =
        enemy.x >= hitbox.x &&
        enemy.x <= hitbox.x + hitbox.w &&
        enemy.y >= hitbox.y &&
        enemy.y <= hitbox.y + hitbox.h;

      if (hit) {
        const dmg = PLAYER_CONFIG.damage;

        // Causa dano
        enemy.hp = Math.max(0, enemy.hp - dmg);

        // Flash vermelho no inimigo
        enemy.hitFlashTimer = PLAYER_CONFIG.hitFlashDuration;
        attack.hitEnemyIds?.add(enemy.id);

        damageNumbers.push({
          id: dmgNumberId++,
          x: enemy.x + (Math.random() * 10 - 5),
          y: enemy.y - 20, // sobe um pouco acima do inimigo
          value: dmg,
          timer: DAMAGE_NUMBER_LIFETIME,
          maxTimer: DAMAGE_NUMBER_LIFETIME,
          isCrit: false,
        });

        // Knockback — empurra o inimigo na direção do ataque
        const { knockbackForce } = PLAYER_CONFIG;
        switch (attack.direction) {
          case "right":
            enemy.knockbackX = knockbackForce;
            enemy.knockbackY = 0;
            break;
          case "left":
            enemy.knockbackX = -knockbackForce;
            enemy.knockbackY = 0;
            break;
          case "down":
            enemy.knockbackX = 0;
            enemy.knockbackY = knockbackForce;
            break;
          case "up":
            enemy.knockbackX = 0;
            enemy.knockbackY = -knockbackForce;
            break;
        }

        if (enemy.hp <= 0) {
          enemy.animState = "death";
          enemy.frameIndex = 0;
          enemy.frameTimer = 0;

          hud.score += enemy.variant === "strong" ? SCORE_STRONG : SCORE_WEAK;
        }
      }
    }

    attack.duration--;
    if (attack.duration <= 0) attack.active = false;
  }

  // ── FLASH DO PLAYER ───────────────────────────────────────
  if (attack.hitFlash > 0) attack.hitFlash--;

  // ── SEPARAÇÃO FÍSICA ──────────────────────────────────────
  separateFromPlayer(pos, enemies);

  for (const dn of damageNumbers) {
    dn.timer--;
    dn.y -= 0.4;
  }
}
