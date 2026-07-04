import type { AttackState, Position } from "../../../types/game";
import {
  PLAYER_ATTACK_ROW,
  PLAYER_DIRECTION_ROW,
  PLAYER_SPRITE,
} from "../../../entities/player/playerSprite";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

// Desenha o player: sprite de walk ou punch conforme attack.active,
// com flash vermelho ao levar dano (ou fallback em quadrado sem sprite).
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  camX: number,
  camY: number,
  direction: string,
  attack: AttackState,
  frameIndex: number,
  attackFrameIndex: number,
  sprite: HTMLImageElement | null,
  flashCanvas: HTMLCanvasElement | null,
  flashCtx: CanvasRenderingContext2D | null,
) {
  const screenX = pos.x - camX;
  const screenY = pos.y - camY;

  if (!sprite) {
    ctx.fillStyle = attack.hitFlash > 0 ? "#ef4444" : "#fde68a";
    ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
    return;
  }

  const srcX = attack.active
    ? attackFrameIndex * PLAYER_SPRITE.frameW
    : frameIndex * PLAYER_SPRITE.frameW;

  const srcY = attack.active
    ? PLAYER_ATTACK_ROW[direction] * PLAYER_SPRITE.frameH
    : PLAYER_DIRECTION_ROW[direction] * PLAYER_SPRITE.frameH;

  const destX = screenX - PLAYER_SPRITE.frameW / 2;
  const destY = screenY - PLAYER_SPRITE.frameH / 2;

  if (attack.hitFlash > 0 && flashCanvas && flashCtx) {
    drawSpriteWithHitFlash(
      ctx,
      flashCanvas,
      flashCtx,
      sprite,
      srcX,
      srcY,
      PLAYER_SPRITE.frameW,
      PLAYER_SPRITE.frameH,
      destX,
      destY,
      (attack.hitFlash / PLAYER_CONFIG.hitFlashDuration) * 0.9,
    );
  } else {
    ctx.drawImage(
      sprite,
      srcX,
      srcY,
      PLAYER_SPRITE.frameW,
      PLAYER_SPRITE.frameH,
      destX,
      destY,
      PLAYER_SPRITE.frameW,
      PLAYER_SPRITE.frameH,
    );
  }
}
