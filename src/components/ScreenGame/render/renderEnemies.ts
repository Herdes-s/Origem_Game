import type { Enemy } from "../../../entities/enemies/enemyTypes";
import {
  SLIME_ANIMATION_ROW,
  SLIME_SPRITE,
} from "../../../entities/enemies/slime/slimeSprite";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { getHpColor } from "../utils/canvasHelpers";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

type EnemySprites = {
  weak: HTMLImageElement | null;
  strong: HTMLImageElement | null;
};

// Desenha todos os inimigos: sprite (ou fallback em círculo), flash de dano,
// fade na morte, barra de HP e label com o nome da raça.
export function renderEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  sprites: EnemySprites,
  flashCanvas: HTMLCanvasElement | null,
  flashCtx: CanvasRenderingContext2D | null,
) {
  for (const enemy of enemies) {
    const ex = enemy.x - camX;
    const ey = enemy.y - camY;

    // Culling — pula inimigos fora da tela
    if (ex < -64 || ex > screenW + 64 || ey < -64 || ey > screenH + 64) continue;

    const spriteConfig =
      enemy.variant === "strong" ? SLIME_SPRITE.strong : SLIME_SPRITE.weak;
    const spriteImg =
      enemy.variant === "strong" ? sprites.strong : sprites.weak;

    const srcX = enemy.frameIndex * spriteConfig.frameW;
    const srcY = SLIME_ANIMATION_ROW[enemy.animState] * spriteConfig.frameH;

    if (spriteImg) {
      if (enemy.hp <= 0) {
        const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          spriteImg,
          srcX,
          srcY,
          spriteConfig.frameW,
          spriteConfig.frameH,
          ex - spriteConfig.frameW / 2,
          ey - spriteConfig.frameH / 2,
          spriteConfig.frameW,
          spriteConfig.frameH,
        );
        ctx.restore();
        continue;
      }

      if (enemy.hitFlashTimer > 0 && flashCanvas && flashCtx) {
        drawSpriteWithHitFlash(
          ctx,
          flashCanvas,
          flashCtx,
          spriteImg,
          srcX,
          srcY,
          spriteConfig.frameW,
          spriteConfig.frameH,
          ex - spriteConfig.frameW / 2,
          ey - spriteConfig.frameH / 2,
          (enemy.hitFlashTimer / PLAYER_CONFIG.hitFlashDuration) * 0.9,
        );
      } else {
        ctx.drawImage(
          spriteImg,
          srcX,
          srcY,
          spriteConfig.frameW,
          spriteConfig.frameH,
          ex - spriteConfig.frameW / 2,
          ey - spriteConfig.frameH / 2,
          spriteConfig.frameW,
          spriteConfig.frameH,
        );
      }
    } else {
      // Fallback sem sprite carregado — desenha um círculo
      if (enemy.hp <= 0) {
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
    const barY = ey - spriteConfig.frameH / 2 - 8;
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
      ex,
      barY - 2,
    );
    ctx.textAlign = "left";
  }
}
