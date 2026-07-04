import type { Position } from "../../../types/game";
import { PLAYER_CONFIG } from "../../../entities/player/player";

// FLAG DE DEBUG — true mostra o quadrado da hitbox, false esconde
// Mude para true sempre que quiser calibrar visualmente o alcance do ataque
export const DEBUG_HITBOX = false;

// Calcula a hitbox do ataque para desenhar no canvas
export function getHitbox(pos: Position, dir: string) {
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
