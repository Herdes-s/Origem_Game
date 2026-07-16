import type { Enemy } from "../../../entities/enemies/enemyTypes";
import { DIRECTION_ROW } from "../../../entities/combat/directionRow";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { getHpColor } from "../utils/canvasHelpers";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

const FRAME_SIZE = 64; // todo personagem/inimigo usa frames 64x64

type SpriteState = "walk" | "attack" | "death";

// Monta a chave do registro de sprites (useGameSprites.ts) pra esse
// inimigo — goblin compartilha uma sheet só entre fraco/forte, slime tem
// uma por variante (cor/tamanho diferentes). Adicionar uma raça nova é só
// adicionar um caso aqui.
function enemySpriteKey(enemy: Enemy, state: SpriteState): string {
  if (enemy.race === "goblin") return `goblin_${state}`;
  return `${enemy.race}_${enemy.variant}_${state}`; // ex: slime_weak_walk
}

// Desenha todos os inimigos: sprite (ou fallback em círculo), flash de
// dano, animação de morte de verdade (por direção, igual walk/attack), e
// barra de HP + label com o nome da raça.
export function renderEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  sprites: Map<string, HTMLImageElement>,
  flashCanvas: HTMLCanvasElement | null,
  flashCtx: CanvasRenderingContext2D | null,
) {
  for (const enemy of enemies) {
    const ex = enemy.x - camX;
    const ey = enemy.y - camY;

    // Culling — pula inimigos fora da tela
    if (ex < -64 || ex > screenW + 64 || ey < -64 || ey > screenH + 64) continue;

    const isDead = enemy.hp <= 0;
    const state: SpriteState = isDead ? "death" : enemy.animState === "attack" ? "attack" : "walk";

    const spriteImg = sprites.get(enemySpriteKey(enemy, state)) ?? null;
    const srcX = enemy.frameIndex * FRAME_SIZE;
    const srcY = DIRECTION_ROW[enemy.direction] * FRAME_SIZE;

    if (spriteImg) {
      if (isDead) {
        // Morte: animação de verdade (por direção) + fade de alpha
        // conforme os frames avançam, pra sumir suave no fim
        const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          spriteImg,
          srcX, srcY, FRAME_SIZE, FRAME_SIZE,
          ex - FRAME_SIZE / 2, ey - FRAME_SIZE / 2, FRAME_SIZE, FRAME_SIZE,
        );
        ctx.restore();
        continue;
      }

      if (enemy.hitFlashTimer > 0 && flashCanvas && flashCtx) {
        drawSpriteWithHitFlash(
          ctx, flashCanvas, flashCtx, spriteImg,
          srcX, srcY, FRAME_SIZE, FRAME_SIZE,
          ex - FRAME_SIZE / 2, ey - FRAME_SIZE / 2,
          (enemy.hitFlashTimer / PLAYER_CONFIG.hitFlashDuration) * 0.9,
        );
      } else {
        ctx.drawImage(
          spriteImg,
          srcX, srcY, FRAME_SIZE, FRAME_SIZE,
          ex - FRAME_SIZE / 2, ey - FRAME_SIZE / 2, FRAME_SIZE, FRAME_SIZE,
        );
      }
    } else {
      // Fallback sem sprite carregado — desenha um círculo
      if (isDead) {
        const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }
      ctx.fillStyle = enemy.hitFlashTimer > 0 ? "#ef4444" : enemy.color;
      ctx.beginPath();
      ctx.arc(ex, ey, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Barra de HP acima do inimigo
    const barW = 40;
    const barH = 4;
    const barX = ex - barW / 2;
    const barY = ey - FRAME_SIZE / 2 - 8;
    const hpPct = enemy.hp / enemy.hpMax;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = getHpColor(hpPct);
    ctx.fillRect(barX, barY, barW * hpPct, barH);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(barX, barY, barW, barH);

    // Label com nome da raça (★ marca a variante forte)
    ctx.font = "8px monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "center";
    ctx.fillText(
      enemy.variant === "strong" ? `★ ${enemy.race}` : enemy.race,
      ex, barY - 2,
    );
    ctx.textAlign = "left";
  }
}
