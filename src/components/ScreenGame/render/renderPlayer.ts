import type { AttackState, Position } from "../../../types/game";
import {
  PLAYER_ATTACK_SPRITE,
  PLAYER_WALK_SPRITE,
} from "../../../entities/player/playerSprite";
import { DIRECTION_ROW } from "../../../entities/combat/directionRow";
import { PLAYER_CONFIG } from "../../../entities/player/player";
import { drawSpriteWithHitFlash } from "../utils/hitFlash";

// Desenha o player: escolhe o ARQUIVO certo (walk ou attack — são sheets
// separadas agora) conforme attack.active, e a LINHA certa dentro dele
// pela direção. Com flash vermelho ao levar dano (ou fallback em quadrado
// sem sprite).
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  camX: number,
  camY: number,
  direction: string,
  attack: AttackState,
  frameIndex: number,
  attackFrameIndex: number,
  sprites: Map<string, HTMLImageElement>,
  flashCanvas: HTMLCanvasElement | null,
  flashCtx: CanvasRenderingContext2D | null,
) {
  const screenX = pos.x - camX;
  const screenY = pos.y - camY;

  const sprite = sprites.get(attack.active ? "player_attack" : "player_walk") ?? null;

  if (!sprite) {
    ctx.fillStyle = attack.hitFlash > 0 ? "#ef4444" : "#fde68a";
    ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
    return;
  }

  const spriteMeta = attack.active ? PLAYER_ATTACK_SPRITE : PLAYER_WALK_SPRITE;
  const activeFrameIndex = attack.active ? attackFrameIndex : frameIndex;

  const srcX = activeFrameIndex * spriteMeta.frameW;
  const srcY = DIRECTION_ROW[direction as keyof typeof DIRECTION_ROW] * spriteMeta.frameH;

  const destX = screenX - spriteMeta.frameW / 2;
  const destY = screenY - spriteMeta.frameH / 2;

  if (attack.hitFlash > 0 && flashCanvas && flashCtx) {
    drawSpriteWithHitFlash(
      ctx,
      flashCanvas,
      flashCtx,
      sprite,
      srcX,
      srcY,
      spriteMeta.frameW,
      spriteMeta.frameH,
      destX,
      destY,
      (attack.hitFlash / PLAYER_CONFIG.hitFlashDuration) * 0.9,
    );
  } else {
    ctx.drawImage(
      sprite,
      srcX,
      srcY,
      spriteMeta.frameW,
      spriteMeta.frameH,
      destX,
      destY,
      spriteMeta.frameW,
      spriteMeta.frameH,
    );
  }
}
