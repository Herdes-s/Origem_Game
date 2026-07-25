import type { Enemy } from "../../../entities/enemies/enemyTypes";
import { DIRECTION_ROW } from "../../../entities/combat/directionRow";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { getHpColor } from "../utils/canvasHelpers";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

const FRAME_SIZE = 64; // todo personagem/inimigo usa frames 64x64 na SHEET

type SpriteState = "walk" | "attack" | "death";

// A chave do registro de sprites (useGameSprites.ts) já vem PRONTA do
// tier do inimigo (definida em createEnemy) — cada tier escolhe qual
// sheet reaproveitar (ver slime.ts/goblin.ts), então não precisa mais
// remontar a chave aqui a partir de raça+variante.
function enemySpriteKey(enemy: Enemy, state: SpriteState): string {
  return `${enemy.spriteKey}_${state}`; // ex: slime_weak_walk
}

// Desenha todos os inimigos: sprite (ou fallback em círculo), flash de
// dano, animação de morte de verdade (por direção, igual walk/attack), e
// barra de HP + label com o tier e o level. `enemy.sizeScale` (vem do
// tier, ver enemyTypes.ts) escala o tamanho de DESENHO — a sheet em si
// continua sendo lida em frames 64x64 fixos, só o retângulo de destino no
// canvas cresce, então dá pra fazer um bossSlime parecer maior sem
// precisar de uma sheet própria em resolução diferente.
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
    const drawSize = FRAME_SIZE * enemy.sizeScale;

    // Culling — pula inimigos fora da tela
    if (ex < -drawSize || ex > screenW + drawSize || ey < -drawSize || ey > screenH + drawSize) continue;

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
          ex - drawSize / 2, ey - drawSize / 2, drawSize, drawSize,
        );
        ctx.restore();
        continue;
      }

      if (enemy.hitFlashTimer > 0 && flashCanvas && flashCtx) {
        drawSpriteWithHitFlash(
          ctx, flashCanvas, flashCtx, spriteImg,
          srcX, srcY, FRAME_SIZE, FRAME_SIZE,
          ex - drawSize / 2, ey - drawSize / 2,
          (enemy.hitFlashTimer / PLAYER_CONFIG.hitFlashDuration) * 0.9,
          drawSize, drawSize,
        );
      } else {
        ctx.drawImage(
          spriteImg,
          srcX, srcY, FRAME_SIZE, FRAME_SIZE,
          ex - drawSize / 2, ey - drawSize / 2, drawSize, drawSize,
        );
      }
    } else {
      // Fallback sem sprite carregado — desenha um círculo (raio também
      // escala com o tier, mesma ideia do sprite)
      const radius = 12 * enemy.sizeScale;
      if (isDead) {
        const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }
      ctx.fillStyle = enemy.hitFlashTimer > 0 ? "#ef4444" : enemy.color;
      ctx.beginPath();
      ctx.arc(ex, ey, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Barra de HP acima do inimigo
    const barW = 40;
    const barH = 4;
    const barX = ex - barW / 2;
    const barY = ey - drawSize / 2 - 8;
    const hpPct = enemy.hp / enemy.hpMax;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = getHpColor(hpPct);
    ctx.fillRect(barX, barY, barW * hpPct, barH);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(barX, barY, barW, barH);

    // Label com o nome do tier (já vem com "★" pros tiers de chefão, ver
    // slime.ts/goblin.ts) + o level sorteado dessa instância
    ctx.font = "8px monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "center";
    ctx.fillText(`${enemy.tierLabel} Lv.${enemy.level}`, ex, barY - 2);
    ctx.textAlign = "left";
  }
}
