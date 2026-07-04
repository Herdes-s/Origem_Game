import type { AttackState, Position } from "../../../types/game";
import { getHitbox } from "../utils/hitbox";

// Retângulo amarelo semitransparente mostrando a hitbox do ataque —
// só desenhado quando DEBUG_HITBOX (em utils/hitbox.ts) está true.
export function renderDebugHitbox(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  attack: AttackState,
  camX: number,
  camY: number,
) {
  const hb = getHitbox(pos, attack.direction);

  ctx.fillStyle = "rgba(255, 200, 0, 0.25)";
  ctx.fillRect(hb.x - camX, hb.y - camY, hb.w, hb.h);

  ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(hb.x - camX, hb.y - camY, hb.w, hb.h);
}
