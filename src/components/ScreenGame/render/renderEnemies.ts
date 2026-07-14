import type { Enemy } from "../../../entities/enemies/enemyTypes";
import {
  SLIME_ANIMATION_ROW,
  SLIME_SPRITE,
} from "../../../entities/enemies/slime/slimeSprite";
import {
  GOBLIN_SPRITE,
  GOBLIN_DIRECTION_ROW,
  GOBLIN_ATTACK_ROW,
} from "../../../entities/enemies/goblin/goblinSprite";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { getHpColor } from "../utils/canvasHelpers";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

type EnemySprites = {
  slimeWeak: HTMLImageElement | null;
  slimeStrong: HTMLImageElement | null;
  goblin: HTMLImageElement | null;
};

type SpriteFrame = {
  img: HTMLImageElement | null;
  frameW: number;
  frameH: number;
  srcX: number;
  srcY: number;
};

// Resolve qual spritesheet/frame usar pra um inimigo — depende do
// spriteStyle da raça: "omni" (slime, uma visão só, linha por animState)
// ou "directional" (goblin, frente/costas/lados de verdade, linha por
// direção + animState, igual ao player).
function resolveSpriteFrame(enemy: Enemy, sprites: EnemySprites): SpriteFrame {
  if (enemy.race === "goblin") {
    const row =
      enemy.animState === "attack"
        ? GOBLIN_ATTACK_ROW[enemy.direction]
        : GOBLIN_DIRECTION_ROW[enemy.direction];

    return {
      img: sprites.goblin,
      frameW: GOBLIN_SPRITE.frameW,
      frameH: GOBLIN_SPRITE.frameH,
      srcX: enemy.frameIndex * GOBLIN_SPRITE.frameW,
      srcY: row * GOBLIN_SPRITE.frameH,
    };
  }

  // slime — e qualquer raça "omni" futura que ainda não tenha um caso
  // próprio aqui cai nesse fallback (spritesheet do slime fraco)
  const spriteConfig = enemy.variant === "strong" ? SLIME_SPRITE.strong : SLIME_SPRITE.weak;
  const img = enemy.variant === "strong" ? sprites.slimeStrong : sprites.slimeWeak;

  return {
    img,
    frameW: spriteConfig.frameW,
    frameH: spriteConfig.frameH,
    srcX: enemy.frameIndex * spriteConfig.frameW,
    srcY: SLIME_ANIMATION_ROW[enemy.animState] * spriteConfig.frameH,
  };
}

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

    const { img: spriteImg, frameW, frameH, srcX, srcY } = resolveSpriteFrame(enemy, sprites);

    if (spriteImg) {
      if (enemy.hp <= 0) {
        // Morte: fade de alpha no frame atual. O slime tem uma linha de
        // morte própria (já embutida no srcY acima); o goblin não tem
        // arte de morte dedicada — o frame de walk atual só continua
        // ciclando enquanto esvai, sem precisar de arte extra.
        const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          spriteImg,
          srcX,
          srcY,
          frameW,
          frameH,
          ex - frameW / 2,
          ey - frameH / 2,
          frameW,
          frameH,
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
          frameW,
          frameH,
          ex - frameW / 2,
          ey - frameH / 2,
          (enemy.hitFlashTimer / PLAYER_CONFIG.hitFlashDuration) * 0.9,
        );
      } else {
        ctx.drawImage(
          spriteImg,
          srcX,
          srcY,
          frameW,
          frameH,
          ex - frameW / 2,
          ey - frameH / 2,
          frameW,
          frameH,
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
    const barY = ey - frameH / 2 - 8;
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
